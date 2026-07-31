"""API routes."""

from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import Response

from app.schemas import BatchPredictResponse, HealthResponse
from app.services.column_map import USER_LABELS
from app.services.preprocess import ColumnMappingError, build_template_dataframe
from app.services.predict import get_model, resolve_model_path, score_batch
from app.services.upload_storage import save_upload_file

router = APIRouter()
ALLOWED_UPLOAD_SUFFIXES = {".csv", ".xlsx", ".xls"}
MAX_UPLOAD_BYTES = 10 * 1024 * 1024


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    try:
        _, meta = get_model()
        return HealthResponse(
            status="ok",
            model_loaded=True,
            detail={
                "model_name": meta.get("model_name"),
                "path": meta.get("path", str(resolve_model_path())),
                "n_features": meta.get("n_features"),
                "strategy": meta.get("strategy"),
            },
        )
    except FileNotFoundError as exc:
        return HealthResponse(status="degraded", model_loaded=False, detail={"error": str(exc)})


@router.get("/api/v1/template/csv")
def download_template() -> Response:
    df = build_template_dataframe(5)
    csv_bytes = df.to_csv(index=False).encode("utf-8-sig")
    return Response(
        content=csv_bytes,
        media_type="text/csv; charset=utf-8",
        headers={
            "Content-Disposition": 'attachment; filename="donor_batch_template.csv"'
        },
    )


@router.post("/api/v1/predict/batch", response_model=BatchPredictResponse)
async def predict_batch(file: UploadFile = File(...)) -> BatchPredictResponse:
    if not file.filename:
        raise HTTPException(status_code=400, detail="파일명이 없습니다.")
    if Path(file.filename).suffix.lower() not in ALLOWED_UPLOAD_SUFFIXES:
        raise HTTPException(
            status_code=400,
            detail="지원하지 않는 파일 확장자입니다. CSV 또는 Excel 파일을 사용하세요.",
        )
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="빈 파일입니다.")
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="파일은 최대 10MB까지 업로드할 수 있습니다.")
    try:
        payload = score_batch(file.filename, content)
        payload["upload"] = save_upload_file(file.filename, content)
        return BatchPredictResponse(**payload)
    except ColumnMappingError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=500, detail=f"예측 중 오류: {exc}"
        ) from exc


@router.get("/api/v1/fields")
def list_fields() -> dict:
    """디버그용: 사용자 라벨 ↔ 설문 코드."""
    from app.services.column_map import MODEL_FEATURES, USER_TO_SURVEY

    return {
        "user_labels": USER_LABELS,
        "user_to_survey": USER_TO_SURVEY,
        "model_features": MODEL_FEATURES,
    }
