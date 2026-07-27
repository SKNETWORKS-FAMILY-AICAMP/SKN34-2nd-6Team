"""응답 스키마 (BatchScoringPanel 계약)."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class ChannelCount(BaseModel):
    channel: str
    count: int


class BatchResultRow(BaseModel):
    row_index: int
    probability: float
    probability_pct: float
    risk_level: str
    recommended_channel: str
    next_step: str


class BatchPredictResponse(BaseModel):
    model_name: str
    threshold: float
    n_total: int
    n_scored: int
    n_high_risk: int
    channel_distribution: list[ChannelCount] = Field(default_factory=list)
    results: list[BatchResultRow] = Field(default_factory=list)


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    detail: dict[str, Any] = Field(default_factory=dict)
