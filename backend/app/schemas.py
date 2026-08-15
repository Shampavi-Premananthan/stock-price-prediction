"""
Pydantic models describing the REST API contract.
"""
from __future__ import annotations

from datetime import date
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator


class ModelType(str, Enum):
    LSTM = "LSTM"
    RNN = "RNN"


class PredictionPeriod(int, Enum):
    SEVEN_DAYS = 7
    FIFTEEN_DAYS = 15
    THIRTY_DAYS = 30


class PredictionRequest(BaseModel):
    ticker: str = Field(..., examples=["AAPL"], description="Stock ticker symbol")
    period_days: PredictionPeriod = Field(
        default=PredictionPeriod.SEVEN_DAYS,
        description="How many future trading days to forecast",
    )
    model_type: ModelType = Field(default=ModelType.LSTM)
    lookback_window: int = Field(
        default=60, ge=10, le=180, description="Days of history used per training sample"
    )
    epochs: int = Field(default=15, ge=1, le=100)
    force_retrain: bool = Field(
        default=False, description="Retrain even if a cached model exists"
    )

    @field_validator("ticker")
    @classmethod
    def normalize_ticker(cls, value: str) -> str:
        cleaned = value.strip().upper()
        if not cleaned or not cleaned.replace(".", "").replace("-", "").isalnum():
            raise ValueError("Invalid ticker symbol")
        return cleaned


class HistoricalPoint(BaseModel):
    date: date
    close: float


class PredictedPoint(BaseModel):
    date: date
    predicted_close: float


class EvaluationMetrics(BaseModel):
    mae: float
    rmse: float
    mape: float


class TrainingHistory(BaseModel):
    loss: List[float]
    val_loss: List[float]


class PredictionResponse(BaseModel):
    ticker: str
    model_type: ModelType
    period_days: int
    generated_at: str
    historical: List[HistoricalPoint]
    actual_vs_predicted: List[dict] = Field(
        description="Backtest overlay: [{date, actual, predicted}] on held-out test data"
    )
    forecast: List[PredictedPoint]
    metrics: EvaluationMetrics
    training_history: TrainingHistory
    csv_download_url: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    app_env: str


class RealtimeQuoteResponse(BaseModel):
    ticker: str
    price: float
    change: float
    percent_change: float
    day_high: float
    day_low: float
    open_price: float
    previous_close: float
    volume: int
    timestamp: str


class NewsArticle(BaseModel):
    title: str
    source: str
    url: str
    published_at: str
    description: Optional[str] = None
    sentiment_score: float = Field(description="Score between -1.0 (Bearish) and 1.0 (Bullish)")
    sentiment_label: str = Field(description="Bullish, Bearish, or Neutral")


class NewsSentimentResponse(BaseModel):
    ticker: str
    overall_sentiment: str = Field(description="Bullish, Bearish, or Neutral")
    sentiment_score: float = Field(description="Aggregate sentiment score between -1.0 and 1.0")
    bullish_percentage: float
    bearish_percentage: float
    neutral_percentage: float
    total_articles: int
    articles: List[NewsArticle]


