# GECS Company Intelligence Platform — Backend API

FastAPI service that classifies company descriptions into:
- **Task 1**: 145 Morningstar GECS industry codes
- **Task 2**: 407 GECS business sub-industry codes

Trained on 53,585 segment-level records from Morningstar's GECS dataset.

---

## Quickstart (local)

```bash
# 1. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. (Optional) Retrain models from raw CSVs
python train.py \
  --task1 data/task1_gecs_classification_final.csv \
  --task2 data/task2_subindustry_classification_final.csv

# 4. Start the API
uvicorn main:app --reload --port 8000
```

Open **http://localhost:8000/docs** for the interactive Swagger UI.

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Root health ping |
| GET | `/health` | Model metrics and status |
| GET | `/stats` | Industry distribution stats |
| POST | `/predict` | Single prediction |
| POST | `/predict/batch` | Batch predictions (max 50) |

### Example request

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "long_profile": "The company is a global semiconductor manufacturer specialising in logic chips for mobile devices and data centres.",
    "segment_name": "Mobile Solutions",
    "segment_description": "Designs and sells application processors for smartphones.",
    "top_k": 3
  }'
```

### Example response

```json
{
  "industry": {
    "code": "31130010",
    "confidence": 72.4,
    "company_count": 38
  },
  "industry_top_k": [...],
  "subindustry": {
    "code": "3113001001",
    "confidence": 55.1,
    "company_count": 22
  },
  "subindustry_top_k": [...],
  "input_text_preview": "The company is a global semiconductor…",
  "latency_ms": 18.3
}
```

---

## Docker deployment

```bash
docker build -t gecs-api .
docker run -p 8000:8000 gecs-api
```

## Deploy to Hugging Face Spaces (free)

1. Create a new Space → type: **Docker**
2. Push this entire folder as the repo
3. Space auto-builds and runs on a public URL

---

## Model Performance

| Task | Macro F1 | Accuracy | Classes |
|------|----------|----------|---------|
| Industry (Task 1) | 0.6163 | 0.6482 | 145 |
| Sub-industry (Task 2) | 0.3329 | 0.4973 | 407 |

Baseline model: TF-IDF (bigrams, 50K features) + Logistic Regression.  
Next steps: sentence-transformers embeddings, XGBoost, or fine-tuned DistilBERT.
