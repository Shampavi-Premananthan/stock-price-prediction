"""
Orchestration layer that ties data preparation, model training,
evaluation, and forecasting together for the API routers.
"""
from __future__ import annotations

import hashlib
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, Type

import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error

from app.config import settings
from app.logger import logger
from app.models.base_model import BaseForecaster
from app.models.lstm_model import LSTMForecaster
from app.models.rnn_model import RNNForecaster
from app.schemas import ModelType, PredictionRequest
from app.services.data_service import PreparedDataset, prepare_dataset

MODEL_REGISTRY: Dict[ModelType, Type[BaseForecaster]] = {
    ModelType.LSTM: LSTMForecaster,
    ModelType.RNN: RNNForecaster,
}

MODEL_DIR = Path(settings.model_dir)
DATA_DIR = Path(settings.data_cache_dir)


def _cache_key(ticker: str, model_type: ModelType, lookback: int) -> str:
    raw = f"{ticker}-{model_type.value}-{lookback}"
    return hashlib.md5(raw.encode()).hexdigest()[:12]


def _cache_path(ticker: str, model_type: ModelType, lookback: int) -> Path:
    key = _cache_key(ticker, model_type, lookback)
    return MODEL_DIR / ticker.upper() / key


def mean_absolute_percentage_error(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    y_true, y_pred = np.asarray(y_true), np.asarray(y_pred)
    nonzero = y_true != 0
    if not nonzero.any():
        return float("nan")
    return float(np.mean(np.abs((y_true[nonzero] - y_pred[nonzero]) / y_true[nonzero])) * 100)


def get_or_train_model(
    dataset: PreparedDataset, request: PredictionRequest
) -> BaseForecaster:
    """Load a cached model if available, otherwise train and cache a new one."""
    forecaster_cls = MODEL_REGISTRY[request.model_type]
    cache_dir = _cache_path(request.ticker, request.model_type, request.lookback_window)
    model_path = cache_dir / f"{forecaster_cls.name}.keras"

    forecaster = forecaster_cls(
        lookback=request.lookback_window,
        epochs=request.epochs,
        batch_size=settings.default_batch_size,
    )

    if model_path.exists() and not request.force_retrain:
        logger.info(f"Loading cached {request.model_type.value} model from {model_path}")
        forecaster.load(model_path)
        forecaster.history_ = {"loss": [], "val_loss": []}
        return forecaster

    logger.info(
        f"Training {request.model_type.value} for {request.ticker} "
        f"(lookback={request.lookback_window}, epochs={request.epochs})"
    )
    forecaster.fit(dataset.X_train, dataset.y_train)
    forecaster.save(cache_dir)
    return forecaster


def evaluate(dataset: PreparedDataset, forecaster: BaseForecaster) -> dict:
    """Run the model on the held-out test split and compute error metrics."""
    scaled_preds = forecaster.predict(dataset.X_test)
    preds = dataset.scaler.inverse_transform(scaled_preds)
    actual = dataset.scaler.inverse_transform(dataset.y_test.reshape(-1, 1))

    mae = float(mean_absolute_error(actual, preds))
    rmse = float(np.sqrt(mean_squared_error(actual, preds)))
    mape = mean_absolute_percentage_error(actual, preds)

    overlay = [
        {
            "date": d.strftime("%Y-%m-%d"),
            "actual": round(float(a[0]), 2),
            "predicted": round(float(p[0]), 2),
        }
        for d, a, p in zip(dataset.test_dates, actual, preds)
    ]
    return {
        "metrics": {"mae": round(mae, 4), "rmse": round(rmse, 4), "mape": round(mape, 4)},
        "actual_vs_predicted": overlay,
    }


def forecast_future_prices(
    dataset: PreparedDataset, forecaster: BaseForecaster, steps: int
) -> list[dict]:
    last_window = dataset.scaled_close[-forecaster.lookback :]
    scaled_forecast = forecaster.forecast_future(last_window, steps)
    forecast_values = dataset.scaler.inverse_transform(scaled_forecast)

    last_date = dataset.raw.index[-1]
    future_dates = _future_business_days(last_date, steps)

    return [
        {"date": d.strftime("%Y-%m-%d"), "predicted_close": round(float(v[0]), 2)}
        for d, v in zip(future_dates, forecast_values)
    ]


def _future_business_days(start: pd.Timestamp, steps: int) -> list[pd.Timestamp]:
    dates = []
    current = pd.Timestamp(start)
    while len(dates) < steps:
        current += timedelta(days=1)
        if current.weekday() < 5:  # Mon-Fri
            dates.append(current)
    return dates


def export_forecast_csv(ticker: str, model_type: ModelType, forecast: list[dict]) -> Path:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    filename = f"{ticker}_{model_type.value}_forecast_{datetime.utcnow():%Y%m%d%H%M%S}.csv"
    path = DATA_DIR / filename
    pd.DataFrame(forecast).to_csv(path, index=False)
    return path


def run_prediction_pipeline(request: PredictionRequest) -> dict:
    """Full end-to-end pipeline used by the /predict endpoint."""
    dataset = prepare_dataset(request.ticker, lookback=request.lookback_window)
    forecaster = get_or_train_model(dataset, request)
    eval_result = evaluate(dataset, forecaster)
    forecast = forecast_future_prices(dataset, forecaster, steps=int(request.period_days))
    csv_path = export_forecast_csv(request.ticker, request.model_type, forecast)

    historical = [
        {"date": idx.strftime("%Y-%m-%d"), "close": round(float(row["close"]), 2)}
        for idx, row in dataset.raw.tail(180).iterrows()
    ]

    return {
        "ticker": request.ticker,
        "model_type": request.model_type,
        "period_days": int(request.period_days),
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "historical": historical,
        "actual_vs_predicted": eval_result["actual_vs_predicted"],
        "forecast": forecast,
        "metrics": eval_result["metrics"],
        "training_history": forecaster.history_ or {"loss": [], "val_loss": []},
        "csv_download_url": f"/api/v1/download/{csv_path.name}",
    }
