"""
사용자용(영문 키 / 한글 라벨) ↔ 모델용(학습 설문 코드) 단일 매핑 소스.

기준: ML/XGBoost_model_v1.joblib (get_data_v2, 27 features)
전략 A: 템플릿을 학습 원본 입력 컬럼에 맞게 확장 (부족 피처 0-fill 재학습 없음)
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

CHANNEL_OPTIONS: list[dict[str, Any]] = [
    {"value": 1, "label": "방송(TV/라디오)"},
    {"value": 2, "label": "신문/잡지"},
    {"value": 3, "label": "온라인 기사/광고"},
    {"value": 4, "label": "거리모금"},
    {"value": 5, "label": "포털 기부플랫폼"},
    {"value": 6, "label": "지인 추천"},
    {"value": 7, "label": "단체 직접 제공(메일/전화)"},
    {"value": 8, "label": "단체 행사"},
    {"value": 9, "label": "SNS/유튜브"},
    {"value": 10, "label": "인터넷 검색"},
    {"value": 11, "label": "블록체인 모금앱"},
    {"value": 12, "label": "직장 사회공헌"},
]

# 전처리 전 원본 입력 (배문6 → 이후 배문6_정리)
# user_key → 설문 코드
USER_TO_SURVEY: dict[str, str] = {
    "has_children": "선문1",
    "age": "H선문2_01",
    "marital": "H선문3",
    "gender": "배문1",
    "region_group": "배문2",
    "household_size": "배문3",
    "religion": "배문4",
    "employment": "배문5",
    "income": "배문6",
    "income_change": "배문7",
    "education": "배문8",
    "channel_1": "문3_1",
    "channel_2": "문3_2",
    "channel_3": "문3_3",
    "channel_4": "문3_4",
    "channel_5": "문3_5",
    "channel_6": "문3_6",
    "channel_7": "문3_7",
    "channel_8": "문3_8",
    "channel_9": "문3_9",
    "channel_10": "문3_10",
    "channel_11": "문3_11",
    "channel_12": "문3_12",
    "org_criteria": "문6_01",
    "info_channel": "문7",
    "donate_intent": "문40",
    "know_hometown_giving": "문42",
}

USER_LABELS: dict[str, str] = {
    "has_children": "자녀 유무",
    "age": "연령",
    "marital": "혼인 상태",
    "gender": "성별",
    "region_group": "거주 지역",
    "household_size": "가구원 수 (본인 포함)",
    "religion": "종교",
    "employment": "고용 상태",
    "income": "월평균 가구소득 (원, 세전)",
    "income_change": "전년 대비 소득 변화",
    "education": "최종 학력",
    "channel_1": "습득경로_방송",
    "channel_2": "습득경로_신문잡지",
    "channel_3": "습득경로_온라인기사",
    "channel_4": "습득경로_거리모금",
    "channel_5": "습득경로_포털",
    "channel_6": "습득경로_지인추천",
    "channel_7": "습득경로_단체직접",
    "channel_8": "습득경로_단체행사",
    "channel_9": "습득경로_SNS",
    "channel_10": "습득경로_인터넷검색",
    "channel_11": "습득경로_블록체인",
    "channel_12": "습득경로_직장공헌",
    "org_criteria": "단체 선택 시 가장 중요한 기준",
    "info_channel": "기부정보 습득경로(주경로)",
    "donate_intent": "올해 금전 기부 의향",
    "know_hometown_giving": "고향사랑기부제 인지 여부",
}

# 학습 모델 feature_names_in_ (artifacts/feature_names.json 과 동기화)
_FEATURE_FILE = Path(__file__).resolve().parents[2] / "artifacts" / "feature_names.json"


def load_model_features() -> list[str]:
    if _FEATURE_FILE.exists():
        return list(json.loads(_FEATURE_FILE.read_text(encoding="utf-8")))
    # fallback: get_data_v2 학습 순서
    return [
        "선문1",
        "H선문2_01",
        "H선문3",
        "배문1",
        "배문2",
        "배문3",
        "배문4",
        "배문5",
        "배문7",
        "배문8",
        "문3_1",
        "문3_2",
        "문3_3",
        "문3_4",
        "문3_5",
        "문3_6",
        "문3_7",
        "문3_8",
        "문3_9",
        "문3_10",
        "문3_11",
        "문3_12",
        "문6_01",
        "문7",
        "문40",
        "문42",
        "배문6_정리",
    ]


MODEL_FEATURES: list[str] = load_model_features()

# 업로드에 있어야 하는 원본 설문 컬럼 (배문6 포함)
RAW_REQUIRED_SURVEY: list[str] = [
    "선문1",
    "H선문2_01",
    "H선문3",
    "배문1",
    "배문2",
    "배문3",
    "배문4",
    "배문5",
    "배문6",
    "배문7",
    "배문8",
    *[f"문3_{i}" for i in range(1, 13)],
    "문6_01",
    "문7",
    "문40",
    "문42",
]

ALIAS_TO_USER: dict[str, str] = {}
for _key, _label in USER_LABELS.items():
    ALIAS_TO_USER[_key] = _key
    ALIAS_TO_USER[_key.lower()] = _key
    ALIAS_TO_USER[_label] = _key
    ALIAS_TO_USER[_label.replace(" ", "")] = _key
for _key, _survey in USER_TO_SURVEY.items():
    ALIAS_TO_USER[_survey] = _key

CHANNEL_LABEL_BY_VALUE: dict[int, str] = {
    int(o["value"]): str(o["label"]) for o in CHANNEL_OPTIONS
}

REQUIRED_USER_KEYS: list[str] = list(USER_TO_SURVEY.keys())


def resolve_user_key(column_name: str) -> str | None:
    raw = str(column_name).strip()
    if raw in ALIAS_TO_USER:
        return ALIAS_TO_USER[raw]
    collapsed = raw.replace(" ", "")
    if collapsed in ALIAS_TO_USER:
        return ALIAS_TO_USER[collapsed]
    lower = raw.lower()
    if lower in ALIAS_TO_USER:
        return ALIAS_TO_USER[lower]
    return None


def survey_label(survey_col: str) -> str:
    for uk, sc in USER_TO_SURVEY.items():
        if sc == survey_col:
            return USER_LABELS[uk]
    return survey_col
