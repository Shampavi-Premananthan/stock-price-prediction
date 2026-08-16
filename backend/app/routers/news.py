"""
Router exposing real-time news and sentiment endpoints for stock tickers.
"""
from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.logger import logger
from app.schemas import NewsSentimentResponse
from app.services.news_service import fetch_ticker_news_sentiment

router = APIRouter(prefix="/api/v1", tags=["news"])


@router.get("/news/{ticker}", response_model=NewsSentimentResponse)
@router.get("/news/{ticker}/", response_model=NewsSentimentResponse, include_in_schema=False)
def get_ticker_news(ticker: str) -> NewsSentimentResponse:
    """
    Fetch real-time financial news and sentiment analysis for a given stock ticker.
    """
    try:
        sentiment_data = fetch_ticker_news_sentiment(ticker)
        return sentiment_data
    except Exception as exc:
        logger.exception(f"Error serving news endpoint for ticker '{ticker}'")
        from app.services.news_service import _build_fallback_news
        return _build_fallback_news(ticker)
