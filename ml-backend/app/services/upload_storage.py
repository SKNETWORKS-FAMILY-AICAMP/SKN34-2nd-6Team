"""검증을 통과한 업로드 원본을 추적 가능한 경로에 저장한다."""

from __future__ import annotations

import os
import re
from pathlib import Path
from uuid import uuid4

BACKEND_ROOT = Path(__file__).resolve().parents[2]
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", str(BACKEND_ROOT / "uploads"))).resolve()
ALLOWED_SUFFIXES = {".csv", ".xlsx", ".xls"}


def _safe_name(filename: str) -> str:
    source = Path(filename or "upload.csv").name
    stem = re.sub(r"[^0-9A-Za-z가-힣._-]+", "_", Path(source).stem).strip("._")
    suffix = Path(source).suffix.lower()
    if suffix not in ALLOWED_SUFFIXES:
        raise ValueError("지원하지 않는 파일 확장자입니다. CSV 또는 Excel 파일을 사용하세요.")
    return f"{uuid4().hex}_{stem or 'upload'}{suffix}"


def save_upload_file(original_filename: str, content: bytes) -> dict[str, object]:
    """바이트를 저장하고 API 응답에 포함할 저장 메타데이터를 반환한다."""
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    stored_filename = _safe_name(original_filename)
    target = (UPLOAD_DIR / stored_filename).resolve()

    if target.parent != UPLOAD_DIR:
        raise ValueError("안전하지 않은 업로드 경로입니다.")

    target.write_bytes(content)
    return {
        "original_filename": Path(original_filename).name,
        "stored_filename": stored_filename,
        "storage_path": str(target),
        "size_bytes": len(content),
    }
