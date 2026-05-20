"""
GECS Company Intelligence Platform — FastAPI Backend
Predicts GECS industry (Task 1, 145 classes) and business sub-industry
(Task 2, 407 classes) from free-text company descriptions.
"""

from __future__ import annotations

import json
import os
import time
from pathlib import Path
from typing import Optional

import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# ── Paths ──────────────────────────────────────────────────────────────────
BASE = Path(__file__).parent
MODELS = BASE / "models"

# ── Boot: load models once at startup ─────────────────────────────────────
print("Loading models…")
tfidf1 = joblib.load(MODELS / "tfidf1.joblib")
lr1    = joblib.load(MODELS / "lr1.joblib")
le1    = joblib.load(MODELS / "le1.joblib")

tfidf2 = joblib.load(MODELS / "tfidf2.joblib")
lr2    = joblib.load(MODELS / "lr2.joblib")
le2    = joblib.load(MODELS / "le2.joblib")

with open(MODELS / "metrics.json") as f:
    MODEL_METRICS = json.load(f)

with open(MODELS / "industry_meta.json") as f:
    INDUSTRY_META = json.load(f)

with open(MODELS / "subindustry_meta.json") as f:
    SUBINDUSTRY_META = json.load(f)

print("Models ready.")

# ── App ────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="GECS Company Intelligence API",
    description=(
        "Classify a company into Morningstar GECS industries and "
        "business sub-industries using ML models trained on 53 K+ segments."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Schemas ────────────────────────────────────────────────────────────────
class PredictRequest(BaseModel):
    long_profile: str = Field(
        ...,
        description="Company long description / business profile.",
        example="The company is a global semiconductor manufacturer specialising in "
                "logic chips for mobile devices and data centres.",
    )
    segment_name: Optional[str] = Field(
        None,
        description="Business segment name (optional).",
        example="Mobile Solutions",
    )
    segment_description: Optional[str] = Field(
        None,
        description="Business segment description (optional).",
        example="Designs and sells application processors for smartphones.",
    )
    top_k: int = Field(
        3,
        ge=1,
        le=10,
        description="Number of top predictions to return per task.",
    )


class TopPrediction(BaseModel):
    code: str
    confidence: float
    company_count: int


class PredictResponse(BaseModel):
    industry: TopPrediction
    industry_top_k: list[TopPrediction]
    subindustry: TopPrediction
    subindustry_top_k: list[TopPrediction]
    input_text_preview: str
    latency_ms: float


class HealthResponse(BaseModel):
    status: str
    task1_macro_f1: float
    task2_macro_f1: float
    task1_classes: int
    task2_classes: int


class StatsResponse(BaseModel):
    total_industries: int
    total_subindustries: int
    top_industries_by_company_count: list[dict]
    top_subindustries_by_company_count: list[dict]
    model_metrics: dict


# ── Helpers ────────────────────────────────────────────────────────────────
def build_input_text(
    long_profile: Optional[str],
    segment_name: Optional[str],
    segment_description: Optional[str],
) -> str:
    parts = [
        (long_profile or "").strip(),
        (segment_name or "").strip(),
        (segment_description or "").strip(),
    ]
    return " ".join(p for p in parts if p)


def top_k_predictions(
    model,
    vectorizer,
    label_encoder,
    text: str,
    meta: dict,
    k: int,
) -> tuple[TopPrediction, list[TopPrediction]]:
    X = vectorizer.transform([text])
    proba = model.predict_proba(X)[0]
    top_idx = np.argsort(proba)[::-1][:k]

    results = []
    for idx in top_idx:
        code = label_encoder.classes_[idx]
        conf = round(float(proba[idx]) * 100, 2)
        count = meta.get(str(code), 0)
        results.append(TopPrediction(code=str(code), confidence=conf, company_count=count))

    return results[0], results


# ── Routes ─────────────────────────────────────────────────────────────────
@app.get("/", tags=["root"])
def root():
    return {
        "message": "GECS Company Intelligence API is running.",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health", response_model=HealthResponse, tags=["meta"])
def health():
    return HealthResponse(
        status="ok",
        task1_macro_f1=MODEL_METRICS["task1"]["macro_f1"],
        task2_macro_f1=MODEL_METRICS["task2"]["macro_f1"],
        task1_classes=MODEL_METRICS["task1"]["n_classes"],
        task2_classes=MODEL_METRICS["task2"]["n_classes"],
    )


@app.get("/stats", response_model=StatsResponse, tags=["meta"])
def stats():
    top_ind = sorted(INDUSTRY_META.items(), key=lambda x: x[1], reverse=True)[:10]
    top_sub = sorted(SUBINDUSTRY_META.items(), key=lambda x: x[1], reverse=True)[:10]
    return StatsResponse(
        total_industries=len(INDUSTRY_META),
        total_subindustries=len(SUBINDUSTRY_META),
        top_industries_by_company_count=[
            {"code": k, "company_count": v} for k, v in top_ind
        ],
        top_subindustries_by_company_count=[
            {"code": k, "company_count": v} for k, v in top_sub
        ],
        model_metrics=MODEL_METRICS,
    )


@app.post("/predict", response_model=PredictResponse, tags=["prediction"])
def predict(req: PredictRequest):
    if not req.long_profile.strip():
        raise HTTPException(status_code=422, detail="long_profile must not be empty.")

    t0 = time.perf_counter()

    # Task 1 — industry (145 classes): uses all three fields
    text1 = build_input_text(req.long_profile, req.segment_name, req.segment_description)
    best_ind, top_ind = top_k_predictions(
        lr1, tfidf1, le1, text1, INDUSTRY_META, req.top_k
    )

    # Task 2 — sub-industry (407 classes): uses segment fields only
    text2 = build_input_text(None, req.segment_name, req.segment_description) or text1
    best_sub, top_sub = top_k_predictions(
        lr2, tfidf2, le2, text2, SUBINDUSTRY_META, req.top_k
    )

    latency = round((time.perf_counter() - t0) * 1000, 1)

    return PredictResponse(
        industry=best_ind,
        industry_top_k=top_ind,
        subindustry=best_sub,
        subindustry_top_k=top_sub,
        input_text_preview=text1[:200] + ("…" if len(text1) > 200 else ""),
        latency_ms=latency,
    )


@app.post("/predict/batch", tags=["prediction"])
def predict_batch(requests: list[PredictRequest]):
    """Run up to 50 predictions at once."""
    if len(requests) > 50:
        raise HTTPException(status_code=400, detail="Batch size limit is 50.")
    return [predict(r) for r in requests]
