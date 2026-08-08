"""
Simple RNN-based stock price forecaster.

Kept intentionally shallower than the LSTM so the dashboard's
model-comparison feature demonstrates a real capacity/performance
trade-off rather than two near-identical architectures.
"""
from __future__ import annotations

from tensorflow import keras
from tensorflow.keras import layers

from app.models.base_model import BaseForecaster


class RNNForecaster(BaseForecaster):
    name = "rnn"

    def _build_model(self) -> keras.Model:
        model = keras.Sequential(
            [
                layers.Input(shape=(self.lookback, 1)),
                layers.SimpleRNN(64, return_sequences=True),
                layers.Dropout(0.2),
                layers.SimpleRNN(32, return_sequences=False),
                layers.Dense(16, activation="relu"),
                layers.Dense(1),
            ]
        )
        model.compile(optimizer="adam", loss="mean_squared_error")
        return model
