"""
startup.py — Run this on Render.
"""

import os
import sys
import subprocess
from pathlib import Path

# __file__ = /opt/render/project/src/gecs_platform/gecs_platform/startup.py
# .parent = gecs_platform/gecs_platform/
# .parent.parent = gecs_platform/
# .parent.parent.parent = src/ (repo root) ← CSVs are here
REPO_ROOT = Path(__file__).parent.parent.parent
MODELS = Path(__file__).parent / "models"
MODELS.mkdir(exist_ok=True)

TASK1_CSV = REPO_ROOT / "task1_gecs_classification_final.csv"
TASK2_CSV = REPO_ROOT / "task2_subindustry_classification_final.csv"

print(f"Repo root: {REPO_ROOT}")
print(f"Task1 CSV path: {TASK1_CSV}")
print(f"Task1 CSV exists: {TASK1_CSV.exists()}")

# List files in repo root to debug
print("Files in repo root:")
for f in REPO_ROOT.iterdir():
    print(f"  {f.name}")

def models_exist():
    needed = ["tfidf1.joblib", "lr1.joblib", "le1.joblib",
              "tfidf2.joblib", "lr2.joblib", "le2.joblib", "metrics.json"]
    return all((MODELS / f).exists() for f in needed)

if not models_exist():
    print("Models not found — training from CSVs...")
    train_script = Path(__file__).parent / "train.py"
    subprocess.run([
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
