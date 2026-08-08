"""
Application configuration.

Centralizes environment-driven settings so the rest of the codebase
never reads os.environ directly. Uses pydantic-settings style plain
class for zero extra dependency footprint.
"""
from __future__ import annotations

import os
from dataclasses import dataclass, field
from typing import List


def _split_csv(value: str) -> List[str]:
    return [v.strip() for v in value.split(",") if v.strip()]


@dataclass(frozen=True)
class Settings:
    app_env: str = os.getenv("APP_ENV", "development")
    log_level: str = os.getenv("LOG_LEVEL", "INFO")
    cors_origins: List[str] = field(
        default_factory=lambda: _split_csv(
            os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000")
        )
    )
    model_dir: str = os.getenv("MODEL_DIR", "saved_models")
    data_cache_dir: str = os.getenv("DATA_CACHE_DIR", "../data")

    # Training defaults - kept conservative so a demo request on a laptop
    # CPU finishes in a reasonable time.
    default_lookback_window: int = int(os.getenv("LOOKBACK_WINDOW", "60"))
    default_epochs: int = int(os.getenv("EPOCHS", "15"))
    default_batch_size: int = int(os.getenv("BATCH_SIZE", "32"))
    max_forecast_days: int = int(os.getenv("MAX_FORECAST_DAYS", "30"))
    history_period: str = os.getenv("HISTORY_PERIOD", "5y")


settings = Settings()
