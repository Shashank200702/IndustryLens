"""
startup.py — Run this on Render.
Trains models from CSVs if .joblib files don't exist, then starts uvicorn.
"""

import os
import sys
import subprocess
from pathlib import Path

# On Render, repo root is at /opt/render/project/src/
REPO_ROOT = Path(__file__).parent.parent.parent
MODELS = Path(__file__).parent / "models"
MODELS.mkdir(exist_ok=True)

TASK1_CSV = REPO_ROOT / "task1_gecs_classification_final.csv"
TASK2_CSV = REPO_ROOT / "task2_subindustry_classification_final.csv"

print(f"Looking for CSVs at: {TASK1_CSV}")
print(f"CSV exists: {TASK1_CSV.exists()}")

def models_exist():
    needed = ["tfidf1.joblib", "lr1.joblib", "le1.joblib",
              "tfidf2.joblib", "lr2.joblib", "le2.joblib", "metrics.json"]
    return all((MODELS / f).exists() for f in needed)

if not models_exist():
    print("Models not found — training from CSVs...")
    train_script = Path(__file__).parent / "train.py"
    result = subprocess.run([
        sys.executable, str(train_script),
        "--task1", str(TASK1_CSV),
        "--task2", str(TASK2_CSV)
    ], check=True)
    print("Training complete.")
else:
    print("Models found — skipping training.")

print("Starting uvicorn...")
os.execv(sys.executable, [
    sys.executable, "-m", "uvicorn", "main:app",
    "--host", "0.0.0.0",
    "--port", str(os.environ.get("PORT", "8000"))
])
