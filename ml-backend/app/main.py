"""FastAPI entrypoint."""

from __future__ import annotations

from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 레포 루트 .env (AWS Bedrock 등)
load_dotenv(Path(__file__).resolve().parents[2] / ".env")
load_dotenv()  # ml-backend/.env 도 허용

from app.api.routes import router  # noqa: E402

app = FastAPI(title="Donor Retain ML API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
