"""
LSTM-based stock price forecaster.
"""
from __future__ import annotations

from tensorflow import keras
from tensorflow.keras import layers

from app.models.base_model import BaseForecaster


class LSTMForecaster(BaseForecaster):
    name = "lstm"

    def _build_model(self) -> keras.Model:
        model = keras.Sequential(
            [
                layers.Input(shape=(self.lookback, 1)),
                layers.LSTM(64, return_sequences=True),
                layers.Dropout(0.2),
                layers.LSTM(32, return_sequences=False),
                layers.Dropout(0.2),
                layers.Dense(16, activation="relu"),
                layers.Dense(1),
            ]
        )
        model.compile(optimizer="adam", loss="mean_squared_error")
        return model
