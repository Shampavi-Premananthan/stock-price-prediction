"""
FastAPI application entrypoint.

Run locally with:
    uvicorn app.main:app --reload
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.logger import logger
from app.routers import health, news, prediction, realtime

app = FastAPI(
    title="AI Stock Price Prediction and Analysis Platform",
    description=(
        "REST API for training LSTM/RNN models on historical stock data "
        "and returning price forecasts, backtests, and evaluation metrics."
    ),
    version="1.0.0",
    redirect_slashes=False,
)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(prediction.router)
app.include_router(realtime.router)
app.include_router(news.router)




@app.on_event("startup")
def on_startup() -> None:
    logger.info(f"Starting API in '{settings.app_env}' mode")


@app.get("/", tags=["health"])
def root() -> dict:
    return {
        "message": "AI Stock Price Prediction API",
        "docs": "/docs",
        "health": "/health",
    }
