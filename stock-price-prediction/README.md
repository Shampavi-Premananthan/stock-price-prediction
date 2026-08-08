# Quantis — AI Stock Price Prediction & Analysis Platform

A full-stack application that predicts stock prices using **LSTM** and **Simple RNN**
deep learning models, compares their performance, and visualizes everything
through an interactive dashboard.

> ⚠️ Educational project. Nothing here is investment advice.

---

## Features

- **Home page** — project overview and entry point into the tool.
- **Prediction page** — enter a ticker (AAPL, TSLA, NVDA, MSFT, …), choose a
  7/15/30-day horizon, and pick a model (LSTM or Simple RNN).
- **Backend pipeline** — downloads data from Yahoo Finance, handles invalid
  tickers, cleans missing values, engineers RSI/MACD/Bollinger Bands, scales
  with `MinMaxScaler`, and builds sliding-window sequences.
- **Two models, one comparison** — LSTM and Simple RNN are trained on the same
  data and evaluated with **MAE**, **RMSE**, and **MAPE**.
- **Dashboard** — historical prices, actual-vs-predicted backtest overlay,
  training/validation loss curves, and forecast table.
- **CSV export** — download the forecast for any run.
- **Cached models** — a ticker/model/lookback combination is only trained
  once; subsequent requests reuse the saved `.keras` model.

## Tech stack

| Layer | Tools |
|---|---|
| Frontend | React 18 (Vite), Tailwind CSS, Chart.js |
| Backend | FastAPI, Pydantic |
| ML | TensorFlow/Keras (LSTM, SimpleRNN), scikit-learn |
| Data | yfinance, pandas, numpy |
| Deployment | Docker, docker-compose |

## Project structure

```
stock-price-prediction/
├── backend/
│   ├── app/
│   │   ├── main.py                # FastAPI entrypoint
│   │   ├── config.py              # env-driven settings
│   │   ├── logger.py              # loguru setup
│   │   ├── schemas.py             # Pydantic request/response models
│   │   ├── models/
│   │   │   ├── base_model.py      # shared forecaster interface
│   │   │   ├── lstm_model.py
│   │   │   └── rnn_model.py
│   │   ├── services/
│   │   │   ├── data_service.py    # fetch/clean/indicators/sequences
│   │   │   └── model_service.py   # train/evaluate/forecast/cache
│   │   └── routers/
│   │       ├── health.py
│   │       └── prediction.py
│   ├── saved_models/              # cached trained models (gitignored)
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/ (Home.jsx, Predict.jsx)
│   │   ├── components/ (Navbar, Footer, PredictionForm, StockChart, MetricsCard, TickerTape)
│   │   ├── api/client.js
│   │   └── App.jsx / main.jsx / index.css
│   ├── package.json
│   └── Dockerfile
├── data/                          # forecast CSV exports (gitignored)
├── notebooks/                     # exploratory notebooks
├── docker-compose.yml
├── GIT_COMMIT_PLAN.md
└── README.md
```

## Running locally (without Docker)

### 1. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

The API is now live at `http://localhost:8000`, with interactive docs at
`http://localhost:8000/docs`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app is now live at `http://localhost:5173` and proxies `/api` calls to
the backend.

## Running with Docker

```bash
docker-compose up --build
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`

## Running the backend with ngrok

If you want to expose the backend publicly without moving files off your PC, use the ngrok service in `docker-compose.yml`.

1. Create a free ngrok account and copy your authtoken.
2. Set it before starting compose:

```bash
set NGROK_AUTHTOKEN=your_token_here
```

3. Start the stack:

```bash
docker compose up --build
```

4. In another terminal, get the public URL from the ngrok logs:

```bash
docker compose logs -f ngrok
```

5. Put the printed `https://...ngrok-free.app` URL into `frontend/.env.local` as `VITE_API_BASE_URL`.

Example:

```bash
VITE_API_BASE_URL=https://abcd-1234.ngrok-free.app
```

## API documentation

### `POST /api/v1/predict`

```json
{
  "ticker": "AAPL",
  "period_days": 7,
  "model_type": "LSTM",
  "lookback_window": 60,
  "epochs": 15,
  "force_retrain": false
}
```

Returns historical prices, a backtest overlay (`actual_vs_predicted`), a
future `forecast`, `metrics` (MAE/RMSE/MAPE), `training_history`
(loss/val_loss), and a `csv_download_url`.

### `GET /api/v1/download/{filename}`

Streams a previously generated forecast CSV.

### `GET /health`

Basic liveness check.

## Future improvements

- News sentiment analysis (FinBERT) blended into the feature set
- GRU as a third model for comparison
- Prediction confidence intervals (Monte Carlo dropout)
- GitHub Actions CI (lint + test on push)
- Persistent database for run history instead of ad-hoc CSVs
- Auth + per-user saved watchlists

## Screenshots

_Add screenshots of the Home page and Predict dashboard here once you run the app locally._

`docs/screenshot-home.png`
`docs/screenshot-predict.png`
