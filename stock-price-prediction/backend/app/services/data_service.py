"""
Data acquisition and preprocessing.

Responsible for:
- Downloading OHLCV data from Yahoo Finance
- Cleaning missing values
- Adding technical indicators (RSI, MACD, Bollinger Bands)
- Scaling and windowing data into supervised-learning sequences
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Tuple

import numpy as np
import pandas as pd
import yfinance as yf
from sklearn.preprocessing import MinMaxScaler

from app.config import settings
from app.logger import logger


class TickerNotFoundError(Exception):
    """Raised when Yahoo Finance returns no data for a ticker."""


@dataclass
class PreparedDataset:
    raw: pd.DataFrame              # cleaned OHLCV + indicators, indexed by date
    scaled_close: np.ndarray       # scaled close column, shape (n, 1)
    scaler: MinMaxScaler
    X_train: np.ndarray
    y_train: np.ndarray
    X_test: np.ndarray
    y_test: np.ndarray
    test_dates: pd.DatetimeIndex


def fetch_history(ticker: str, period: str = settings.history_period) -> pd.DataFrame:
    """Download historical OHLCV data for a ticker and validate it."""
    logger.info(f"Fetching {period} of history for {ticker}")
    df = yf.download(ticker, period=period, progress=False, auto_adjust=True)

    if df is None or df.empty:
        raise TickerNotFoundError(f"No data returned for ticker '{ticker}'")

    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)

    df = df.rename(columns=str.lower)
    required = {"open", "high", "low", "close", "volume"}
    missing = required - set(df.columns)
    if missing:
        raise TickerNotFoundError(f"Incomplete data for '{ticker}', missing columns: {missing}")

    return df[list(required)]


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """Forward/backward-fill gaps and drop any fully empty rows."""
    df = df.copy()
    df = df.sort_index()
    df = df.ffill().bfill()
    df = df.dropna(how="any")
    return df


def add_technical_indicators(df: pd.DataFrame) -> pd.DataFrame:
    """Add RSI(14), MACD, and Bollinger Bands to the dataframe."""
    df = df.copy()

    # RSI (14)
    delta = df["close"].diff()
    gain = delta.clip(lower=0).rolling(window=14).mean()
    loss = (-delta.clip(upper=0)).rolling(window=14).mean()
    rs = gain / loss.replace(0, np.nan)
    df["rsi_14"] = 100 - (100 / (1 + rs))

    # MACD (12, 26, 9)
    ema_12 = df["close"].ewm(span=12, adjust=False).mean()
    ema_26 = df["close"].ewm(span=26, adjust=False).mean()
    df["macd"] = ema_12 - ema_26
    df["macd_signal"] = df["macd"].ewm(span=9, adjust=False).mean()

    # Bollinger Bands (20, 2 std)
    sma_20 = df["close"].rolling(window=20).mean()
    std_20 = df["close"].rolling(window=20).std()
    df["bb_upper"] = sma_20 + 2 * std_20
    df["bb_lower"] = sma_20 - 2 * std_20

    df = df.bfill().ffill()
    return df


def build_sequences(
    values: np.ndarray, lookback: int
) -> Tuple[np.ndarray, np.ndarray]:
    """Turn a 1D array of scaled closes into (X, y) supervised sequences."""
    X, y = [], []
    for i in range(lookback, len(values)):
        X.append(values[i - lookback : i, 0])
        y.append(values[i, 0])
    X = np.array(X)
    y = np.array(y)
    X = X.reshape((X.shape[0], X.shape[1], 1))
    return X, y


def prepare_dataset(
    ticker: str,
    lookback: int = settings.default_lookback_window,
    test_size: float = 0.15,
) -> PreparedDataset:
    """Full pipeline: fetch -> clean -> indicators -> scale -> window -> split."""
    raw = fetch_history(ticker)
    raw = clean_data(raw)
    raw = add_technical_indicators(raw)

    if len(raw) < lookback + 30:
        raise ValueError(
            f"Not enough history ({len(raw)} rows) for a lookback window of {lookback}. "
            "Try a smaller lookback or a longer-listed ticker."
        )

    close_values = raw[["close"]].values
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_close = scaler.fit_transform(close_values)

    X, y = build_sequences(scaled_close, lookback)
    dates = raw.index[lookback:]

    split_idx = int(len(X) * (1 - test_size))
    X_train, X_test = X[:split_idx], X[split_idx:]
    y_train, y_test = y[:split_idx], y[split_idx:]
    test_dates = dates[split_idx:]

    return PreparedDataset(
        raw=raw,
        scaled_close=scaled_close,
        scaler=scaler,
        X_train=X_train,
        y_train=y_train,
        X_test=X_test,
        y_test=y_test,
        test_dates=test_dates,
    )
