"""
train.py — Rebuild all GECS model artifacts from raw CSVs.

Usage:
    python train.py --task1 path/to/task1.csv --task2 path/to/task2.csv

Outputs saved to ./models/
"""

import argparse
import json
import os
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import f1_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

MODELS = Path(__file__).parent / "models"
MODELS.mkdir(exist_ok=True)


def build_text(row: pd.Series, cols: list[str]) -> str:
    parts = [str(row.get(c, "") or "") for c in cols]
    return " ".join(p.strip() for p in parts if p.strip())


def train_and_evaluate(
    df: pd.DataFrame,
    text_cols: list[str],
    label_col: str,
    tag: str,
    max_features: int = 50_000,
    min_df: int = 2,
    C: float = 5.0,
    max_iter: int = 500,
    test_size: float = 0.15,
):
    print(f"\n[{tag}] Building input texts…")
    df = df.copy()
    df["input_text"] = df.apply(lambda r: build_text(r, text_cols), axis=1)

    # Drop classes with too few samples to stratify on
    counts = df[label_col].value_counts()
    valid = counts[counts >= 2].index
    dropped = len(counts) - len(valid)
    if dropped:
        print(f"[{tag}] Dropping {dropped} classes with < 2 samples.")
    df = df[df[label_col].isin(valid)]

    X = df["input_text"]
    y = df[label_col].astype(str)

    le = LabelEncoder()
    y_enc = le.fit_transform(y)

    X_tr, X_te, y_tr, y_te = train_test_split(
        X, y_enc, test_size=test_size, random_state=42, stratify=y_enc
    )

    print(f"[{tag}] Fitting TF-IDF (max_features={max_features})…")
    tfidf = TfidfVectorizer(
        ngram_range=(1, 2),
        max_features=max_features,
        sublinear_tf=True,
        min_df=min_df,
    )
    X_tr_vec = tfidf.fit_transform(X_tr)
    X_te_vec = tfidf.transform(X_te)

    print(f"[{tag}] Training Logistic Regression (C={C})…")
    lr = LogisticRegression(max_iter=max_iter, C=C, solver="saga")
    lr.fit(X_tr_vec, y_tr)

    pred = lr.predict(X_te_vec)
    macro_f1 = f1_score(y_te, pred, average="macro")
    accuracy = (pred == y_te).mean()

    print(f"[{tag}] Macro F1: {macro_f1:.4f} | Accuracy: {accuracy:.4f} | Classes: {len(le.classes_)}")

    return tfidf, lr, le, round(macro_f1, 4), round(float(accuracy), 4)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--task1", required=True, help="Path to task1 CSV")
    parser.add_argument("--task2", required=True, help="Path to task2 CSV")
    args = parser.parse_args()

    # ── Task 1 ──────────────────────────────────────────────────────────────
    print("=" * 60)
    print("TASK 1 — Industry classification (145 classes)")
    df1 = pd.read_csv(args.task1)
    tfidf1, lr1, le1, f1_1, acc1 = train_and_evaluate(
        df1,
        text_cols=["LongProfile", "SegmentName", "SegmentDescription"],
        label_col="MstarGlobal",
        tag="Task1",
        max_features=50_000,
    )
    joblib.dump(tfidf1, MODELS / "tfidf1.joblib")
    joblib.dump(lr1,    MODELS / "lr1.joblib")
    joblib.dump(le1,    MODELS / "le1.joblib")

    ind_counts = df1.groupby("MstarGlobal")["CompanyId"].nunique().to_dict()
    with open(MODELS / "industry_meta.json", "w") as f:
        json.dump({str(k): int(v) for k, v in ind_counts.items()}, f)

    # ── Task 2 ──────────────────────────────────────────────────────────────
    print("=" * 60)
    print("TASK 2 — Sub-industry classification (407 classes)")
    df2 = pd.read_csv(args.task2)
    tfidf2, lr2, le2, f1_2, acc2 = train_and_evaluate(
        df2,
        text_cols=["SegmentName", "SegmentDescription"],
        label_col="SubIndustry",
        tag="Task2",
        max_features=40_000,
    )
    joblib.dump(tfidf2, MODELS / "tfidf2.joblib")
    joblib.dump(lr2,    MODELS / "lr2.joblib")
    joblib.dump(le2,    MODELS / "le2.joblib")

    sub_counts = df2.groupby("SubIndustry")["CompanyId"].nunique().to_dict()
    with open(MODELS / "subindustry_meta.json", "w") as f:
        json.dump({str(k): int(v) for k, v in sub_counts.items()}, f)

    # ── Metrics ─────────────────────────────────────────────────────────────
    metrics = {
        "task1": {"macro_f1": f1_1, "accuracy": acc1, "n_classes": int(len(le1.classes_))},
        "task2": {"macro_f1": f1_2, "accuracy": acc2, "n_classes": int(len(le2.classes_))},
    }
    with open(MODELS / "metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)

    print("\n" + "=" * 60)
    print("Training complete. Final metrics:")
    print(json.dumps(metrics, indent=2))
    print(f"Artifacts saved to: {MODELS.resolve()}")


if __name__ == "__main__":
    main()
