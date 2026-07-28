"""팀 학습 모델(ML/XGBoost_model_v1.joblib) 로드 + 배치 스코어링."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import joblib

from .column_map import CHANNEL_LABEL_BY_VALUE, MODEL_FEATURES, load_model_features
from .preprocess import (
    ColumnMappingError,
    extract_contacts,
    extract_profiles,
    load_upload_file,
    prepare_for_predict,
)

# ml-backend/app/services/predict.py → repo root = parents[3]
REPO_ROOT = Path(__file__).resolve().parents[3]
MODEL_CANDIDATES = [
    REPO_ROOT / "ML" / "XGBoost_model_v1.joblib",
    Path(__file__).resolve().parents[2] / "artifacts" / "XGBoost_model_v1.joblib",
]
ARTIFACTS_DIR = Path(__file__).resolve().parents[2] / "artifacts"
FEATURE_NAMES_PATH = ARTIFACTS_DIR / "feature_names.json"

THRESHOLD_HIGH = 0.55
THRESHOLD_MEDIUM = 0.35

_model = None
_meta: dict[str, Any] = {}
_model_path: Path | None = None


def resolve_model_path() -> Path:
    for p in MODEL_CANDIDATES:
        if p.exists():
            return p
    tried = ", ".join(str(p) for p in MODEL_CANDIDATES)
    raise FileNotFoundError(
        "팀 학습 모델이 없습니다. 다음 경로에 ML/XGBoost_model_v1.joblib 을 두세요: "
        + tried
        + " (합성/template 모델은 사용하지 않습니다)"
    )


def get_model():
    global _model, _meta, _model_path
    if _model is None:
        path = resolve_model_path()
        _model = joblib.load(path)
        _model_path = path
        names_attr = getattr(_model, "feature_names_in_", None)
        if names_attr is not None:
            names = list(names_attr)
        else:
            try:
                names = list(_model.get_booster().feature_names or [])
            except Exception:  # noqa: BLE001
                names = list(MODEL_FEATURES)
        ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
        FEATURE_NAMES_PATH.write_text(
            json.dumps(names, ensure_ascii=False, indent=2), encoding="utf-8"
        )
        # runtime sync
        import app.services.column_map as cm

        cm.MODEL_FEATURES = names
        _meta = {
            "model_name": "XGBoost_model_v1",
            "path": str(path),
            "n_features": len(names),
            "feature_names": names,
            "threshold_high": THRESHOLD_HIGH,
            "threshold_medium": THRESHOLD_MEDIUM,
            "strategy": "A: template expanded to training raw inputs; no retrain",
        }
    return _model, _meta


def risk_level(prob: float, high: float, medium: float) -> str:
    if prob >= high:
        return "High"
    if prob >= medium:
        return "Medium"
    return "Low"


def next_step_text(level: str, channel_label: str) -> str:
    if level == "High":
        return (
            f"고위험: '{channel_label}' 채널로 맞춤 리텐션 캠페인을 우선 발송하고, "
            "최근 기부 이력·선호 테마를 확인하세요."
        )
    if level == "Medium":
        return (
            f"주의: 정기 소식과 함께 '{channel_label}' 경로로 참여 유도 콘텐츠를 보내세요."
        )
    return "안정: 기존 감사 커뮤니케이션을 유지하며 분기별 참여 현황만 모니터링하세요."


def channel_label_from_value(value: Any) -> str:
    try:
        v = int(float(value))
    except (TypeError, ValueError):
        return CHANNEL_LABEL_BY_VALUE.get(7, "단체 직접 제공(메일/전화)")
    return CHANNEL_LABEL_BY_VALUE.get(v, CHANNEL_LABEL_BY_VALUE.get(7, str(v)))


def score_batch(filename: str, content: bytes) -> dict[str, Any]:
    model, meta = get_model()
    high = float(meta.get("threshold_high", THRESHOLD_HIGH))
    medium = float(meta.get("threshold_medium", THRESHOLD_MEDIUM))
    feature_names = list(meta.get("feature_names") or load_model_features())

    try:
        raw = load_upload_file(filename, content)
    except Exception as exc:  # noqa: BLE001
        raise ColumnMappingError(f"파일을 읽을 수 없습니다: {exc}") from exc

    if raw.empty:
        raise ColumnMappingError("업로드 파일에 행이 없습니다.")

    X, info_raw = prepare_for_predict(raw)
    contacts = extract_contacts(raw)
    profiles = extract_profiles(raw)

    # 학습 feature_names 와 일치
    extra = [c for c in X.columns if c not in feature_names]
    missing = [c for c in feature_names if c not in X.columns]
    if missing or extra:
        parts = []
        if missing:
            parts.append("부족: " + ", ".join(missing))
        if extra:
            parts.append("여분: " + ", ".join(extra))
        raise ColumnMappingError("피처 불일치 — " + " / ".join(parts))

    X = X.reindex(columns=feature_names)
    proba = model.predict_proba(X)[:, 1]

    results: list[dict[str, Any]] = []
    channel_counter: dict[str, int] = {}

    for i, p in enumerate(proba):
        p = float(p)
        level = risk_level(p, high, medium)
        ch_val = info_raw.iloc[i] if i < len(info_raw) else 7
        ch_label = channel_label_from_value(ch_val)
        if level == "High":
            channel_counter[ch_label] = channel_counter.get(ch_label, 0) + 1
        contact = contacts[i] if i < len(contacts) else {"email": "", "phone": ""}
        profile = profiles[i] if i < len(profiles) else {}
        results.append(
            {
                "row_index": int(i + 1),
                "probability": round(p, 6),
                "probability_pct": round(p * 100, 2),
                "risk_level": level,
                "recommended_channel": ch_label,
                "next_step": next_step_text(level, ch_label),
                "email": contact.get("email", ""),
                "phone": contact.get("phone", ""),
                "profile": profile,
            }
        )

    results.sort(key=lambda r: r["probability"], reverse=True)
    channel_distribution = [
        {"channel": k, "count": v}
        for k, v in sorted(channel_counter.items(), key=lambda x: -x[1])
    ]

    return {
        "model_name": meta.get("model_name", "XGBoost_model_v1"),
        "threshold": high,
        "n_total": int(len(raw)),
        "n_scored": int(len(results)),
        "n_high_risk": int(sum(1 for r in results if r["risk_level"] == "High")),
        "channel_distribution": channel_distribution,
        "results": results,
    }
