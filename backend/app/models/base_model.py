"""
Shared interface for the deep-learning forecasters.

Both LSTMForecaster and RNNForecaster implement this so the service
layer can treat them interchangeably (Liskov substitution).
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from pathlib import Path
from typing import Tuple

import numpy as np
from tensorflow import keras


class BaseForecaster(ABC):
    """Abstract base class for time-series forecasting models."""

    name: str = "base"

    def __init__(self, lookback: int, epochs: int, batch_size: int = 32) -> None:
        self.lookback = lookback
        self.epochs = epochs
        self.batch_size = batch_size
        self.model: keras.Model | None = None
        self.history_: dict | None = None

    @abstractmethod
    def _build_model(self) -> keras.Model:
        """Construct and compile the keras model."""
        raise NotImplementedError

    def fit(self, X_train: np.ndarray, y_train: np.ndarray) -> "BaseForecaster":
        self.model = self._build_model()
        early_stop = keras.callbacks.EarlyStopping(
            monitor="val_loss", patience=5, restore_best_weights=True
        )
        history = self.model.fit(
            X_train,
            y_train,
            epochs=self.epochs,
            batch_size=self.batch_size,
            validation_split=0.1,
            callbacks=[early_stop],
            verbose=0,
        )
        self.history_ = {
            "loss": [float(v) for v in history.history.get("loss", [])],
            "val_loss": [float(v) for v in history.history.get("val_loss", [])],
        }
        return self

    def predict(self, X: np.ndarray) -> np.ndarray:
        if self.model is None:
            raise RuntimeError("Model has not been trained or loaded yet")
        return self.model.predict(X, verbose=0)

    def forecast_future(self, last_window: np.ndarray, steps: int) -> np.ndarray:
        """
        Recursively forecast `steps` future scaled values given the last
        known `lookback`-length scaled window.
        """
        if self.model is None:
            raise RuntimeError("Model has not been trained or loaded yet")

        window = last_window.copy().reshape(1, self.lookback, 1)
        predictions = []
        for _ in range(steps):
            next_val = self.model.predict(window, verbose=0)[0, 0]
            predictions.append(next_val)
            window = np.append(window[:, 1:, :], [[[next_val]]], axis=1)
        return np.array(predictions).reshape(-1, 1)

    def save(self, directory: Path) -> Path:
        directory.mkdir(parents=True, exist_ok=True)
        path = directory / f"{self.name}.keras"
        self.model.save(path)
        return path

    def load(self, path: Path) -> "BaseForecaster":
        self.model = keras.models.load_model(path)
        return self
