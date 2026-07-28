"""
업로드 DF → 학습 컬럼명 rename → get_data 스타일 전처리 → MODEL_FEATURES.

동기화: 루트 src/util/data_process_script.py 의 문3 / 배문4 / 배문6_정리 / 문7 로직.
추론용: 원본 전체 307컬럼이 없어도, 학습에 필요한 RAW_REQUIRED_SURVEY 만으로 동작.
"""

from __future__ import annotations

from io import BytesIO

import numpy as np
import pandas as pd

from . import column_map
from .column_map import (
    CONTACT_LABELS,
    PROFILE_USER_KEYS,
    RAW_REQUIRED_SURVEY,
    REQUIRED_USER_KEYS,
    USER_LABELS,
    USER_TO_SURVEY,
    resolve_contact_key,
    resolve_user_key,
    survey_label,
)

SEED = 88  # data_process_script.SEED 와 동기화


class ColumnMappingError(ValueError):
    """필수 컬럼 부족 / 매핑 실패."""


def load_upload_file(filename: str, content: bytes) -> pd.DataFrame:
    name = (filename or "").lower()
    bio = BytesIO(content)
    if name.endswith((".xlsx", ".xls")):
        return pd.read_excel(bio)
    try:
        return pd.read_csv(bio, encoding="utf-8-sig")
    except UnicodeDecodeError:
        bio.seek(0)
        return pd.read_csv(bio, encoding="cp949")


def rename_to_survey(df: pd.DataFrame) -> pd.DataFrame:
    mapping: dict[str, str] = {}
    seen_user: set[str] = set()

    for col in df.columns:
        user_key = resolve_user_key(col)
        if user_key is None:
            # 이미 설문 코드인 경우 통과
            if str(col) in RAW_REQUIRED_SURVEY:
                mapping[col] = str(col)
            continue
        if user_key in seen_user:
            continue
        mapping[col] = USER_TO_SURVEY[user_key]
        seen_user.add(user_key)

    out = df.rename(columns=mapping)
    return out


def apply_get_data_transforms(df: pd.DataFrame) -> pd.DataFrame:
    """
    data_process_script.get_data 핵심 변환 (동기화).
    입력은 RAW_REQUIRED_SURVEY 컬럼을 가진 DF.
    """
    out = df.copy()

    for col in out.columns:
        out[col] = pd.to_numeric(out[col], errors="coerce")

    # 문3_1~문3_12 멀티핫
    m3 = [c for c in out.columns if c.startswith("문3_") and c[3:].isdigit()]
    if m3:
        out[m3] = (out[m3] >= 1).astype(int)

    if "배문4" in out.columns:
        out["배문4"] = np.where(out["배문4"] < 5, out["배문4"], 0)

    if "배문6" in out.columns:
        income = out["배문6"].astype(float)
        cleaned = np.where(income >= 100_000, income / 10000, income)
        out["배문6_정리"] = np.log1p(cleaned)
        out = out.drop(columns=["배문6"])

    if "문7" in out.columns:
        mask = out["문7"] == 9997
        if mask.any():
            valid = out.loc[out["문7"].between(1, 5), "문7"]
            if len(valid):
                probabilities = valid.value_counts(normalize=True).sort_index()
                rng = np.random.default_rng(SEED)
                out.loc[mask, "문7"] = rng.choice(
                    probabilities.index.to_numpy(),
                    size=int(mask.sum()),
                    p=probabilities.values,
                )
            else:
                out.loc[mask, "문7"] = 3

    out = out.fillna(0)
    return out


def to_model_matrix(df_survey: pd.DataFrame) -> pd.DataFrame:
    missing = [c for c in RAW_REQUIRED_SURVEY if c not in df_survey.columns]
    if missing:
        labeled = [f"{c}({survey_label(c)})" for c in missing]
        raise ColumnMappingError("필수 컬럼이 없습니다: " + ", ".join(labeled))

    subset = df_survey.loc[:, RAW_REQUIRED_SURVEY].copy()
    processed = apply_get_data_transforms(subset)

    model_features = list(column_map.MODEL_FEATURES)
    missing_feat = [c for c in model_features if c not in processed.columns]
    if missing_feat:
        raise ColumnMappingError(
            "전처리 후 모델 피처가 없습니다: " + ", ".join(missing_feat)
        )
    return processed.reindex(columns=model_features)


def prepare_for_predict(df_raw: pd.DataFrame) -> tuple[pd.DataFrame, pd.Series]:
    renamed = rename_to_survey(df_raw)
    # user_key 기준 누락도 메시지에 포함
    present_survey = set(renamed.columns.astype(str))
    missing_user = [
        k
        for k in REQUIRED_USER_KEYS
        if USER_TO_SURVEY[k] not in present_survey
    ]
    if missing_user:
        # rename 후에도 RAW 검사에서 잡히지만, 사용자 친화 메시지 우선
        pass

    X = to_model_matrix(renamed)
    info_raw = (
        renamed["문7"].copy()
        if "문7" in renamed.columns
        else pd.Series([7] * len(renamed), index=renamed.index)
    )
    return X, pd.to_numeric(info_raw, errors="coerce").fillna(7)


def _cell_str(value: object) -> str:
    if value is None or (isinstance(value, float) and np.isnan(value)):
        return ""
    if pd.isna(value):
        return ""
    text = str(value).strip()
    if text.lower() in {"nan", "none", "null"}:
        return ""
    return text


def extract_contacts(df_raw: pd.DataFrame) -> list[dict[str, str]]:
    """원본 DF에서 행별 email/phone 추출 (없으면 빈 문자열)."""
    email_col = None
    phone_col = None
    for col in df_raw.columns:
        key = resolve_contact_key(col)
        if key == "email" and email_col is None:
            email_col = col
        elif key == "phone" and phone_col is None:
            phone_col = col

    rows: list[dict[str, str]] = []
    for i in range(len(df_raw)):
        email = _cell_str(df_raw.iloc[i][email_col]) if email_col is not None else ""
        phone = _cell_str(df_raw.iloc[i][phone_col]) if phone_col is not None else ""
        rows.append({"email": email, "phone": phone})
    return rows


def extract_profiles(df_raw: pd.DataFrame) -> list[dict[str, object]]:
    """상세 패널용 주요 원본 필드 (한글 라벨 키)."""
    col_to_user: dict[object, str] = {}
    for col in df_raw.columns:
        if resolve_contact_key(col):
            continue
        uk = resolve_user_key(col)
        if uk and uk in PROFILE_USER_KEYS and uk not in col_to_user.values():
            col_to_user[col] = uk

    profiles: list[dict[str, object]] = []
    for i in range(len(df_raw)):
        profile: dict[str, object] = {}
        for col, uk in col_to_user.items():
            label = USER_LABELS.get(uk, uk)
            val = df_raw.iloc[i][col]
            if pd.isna(val):
                continue
            # numpy 타입 → JSON 직렬화 가능한 값
            if isinstance(val, (np.integer,)):
                profile[label] = int(val)
            elif isinstance(val, (np.floating,)):
                profile[label] = float(val)
            else:
                profile[label] = val.item() if hasattr(val, "item") else val
        # PROFILE_USER_KEYS 순서 유지
        ordered: dict[str, object] = {}
        for uk in PROFILE_USER_KEYS:
            label = USER_LABELS.get(uk, uk)
            if label in profile:
                ordered[label] = profile[label]
        profiles.append(ordered)
    return profiles


def build_template_dataframe(n_examples: int = 5) -> pd.DataFrame:
    """전략 A: 학습 원본 입력 전체 — 헤더는 사용자용 한글 라벨 + 연락처."""
    base = {
        "has_children": 1,
        "age": 45,
        "marital": 2,
        "gender": 1,
        "region_group": 2,
        "household_size": 3,
        "religion": 9998,
        "employment": 1,
        "income": 4_000_000,
        "income_change": 2,
        "education": 4,
        "org_criteria": 2,
        "info_channel": 7,
        "donate_intent": 1,
        "know_hometown_giving": 1,
    }
    # 문3 multi-hot: 주경로만 1
    for i in range(1, 13):
        base[f"channel_{i}"] = 1 if i == 7 else 0

    variants: list[dict] = [
        {
            **base,
            "email": "donor1@example.com",
            "phone": "010-1234-5678",
        },
        {
            **base,
            "has_children": 2,
            "age": 32,
            "marital": 1,
            "gender": 2,
            "region_group": 1,
            "household_size": 1,
            "religion": 1,
            "employment": 5,
            "income": 2_500_000,
            "income_change": 1,
            "info_channel": 9,
            "donate_intent": 2,
            "know_hometown_giving": 2,
            "email": "donor2@example.com",
            "phone": "010-2345-6789",
            **{f"channel_{i}": (1 if i == 9 else 0) for i in range(1, 13)},
        },
        {
            **base,
            "age": 58,
            "marital": 3,
            "gender": 1,
            "region_group": 6,
            "household_size": 2,
            "employment": 3,
            "income": 5_500_000,
            "income_change": 3,
            "education": 5,
            "info_channel": 1,
            "donate_intent": 1,
            "email": "donor3@example.com",
            "phone": "010-3456-7890",
            **{f"channel_{i}": (1 if i == 1 else 0) for i in range(1, 13)},
        },
        {
            **base,
            "has_children": 1,
            "age": 27,
            "marital": 1,
            "gender": 2,
            "region_group": 3,
            "household_size": 4,
            "religion": 2,
            "employment": 2,
            "income": 3_200_000,
            "info_channel": 5,
            "donate_intent": 2,
            "know_hometown_giving": 1,
            "email": "donor4@example.com",
            "phone": "010-4567-8901",
            **{f"channel_{i}": (1 if i == 5 else 0) for i in range(1, 13)},
        },
        {
            **base,
            "age": 41,
            "marital": 2,
            "gender": 1,
            "region_group": 4,
            "household_size": 5,
            "religion": 3,
            "employment": 1,
            "income": 6_800_000,
            "income_change": 2,
            "education": 6,
            "info_channel": 6,
            "donate_intent": 1,
            "know_hometown_giving": 2,
            "email": "donor5@example.com",
            "phone": "010-5678-9012",
            **{f"channel_{i}": (1 if i == 6 else 0) for i in range(1, 13)},
        },
    ]

    rows = variants[: max(1, n_examples)]
    df = pd.DataFrame(rows)
    feature_cols = list(REQUIRED_USER_KEYS)
    contact_cols = list(CONTACT_LABELS.keys())
    df = df[feature_cols + contact_cols]
    rename = {**USER_LABELS, **CONTACT_LABELS}
    return df.rename(columns=rename)
