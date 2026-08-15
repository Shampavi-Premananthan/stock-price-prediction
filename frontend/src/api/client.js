import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.DEV ? "" : (import.meta.env.VITE_API_BASE_URL || "/"),
  timeout: 5 * 60 * 1000, // training can take a while on first run
  headers: {
    "ngrok-skip-browser-warning": "true",
  },
});

export async function runPrediction({
  ticker,
  periodDays,
  modelType,
  lookbackWindow = 60,
  epochs = 15,
  forceRetrain = false,
}) {
  const { data } = await api.post("/api/v1/predict", {
    ticker,
    period_days: periodDays,
    model_type: modelType,
    lookback_window: lookbackWindow,
    epochs,
    force_retrain: forceRetrain,
  });
  return data;
}

export async function getRealtimeQuote(ticker) {
  const { data } = await api.get(`/api/v1/quote/${ticker}`);
  return data;
}

export async function getNewsSentiment(ticker) {
  const { data } = await api.get(`/api/v1/news/${ticker}`);
  return data;
}

export function downloadUrl(path) {
  return path;
}

export function createQuoteWebSocket(ticker, onMessage, onError) {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = window.location.host;
  const wsUrl = `${protocol}//${host}/api/v1/ws/quote/${ticker}`;
  const ws = new WebSocket(wsUrl);

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (err) {
      if (onError) onError(err);
    }
  };

  if (onError) {
    ws.onerror = (err) => onError(err);
  }

  return ws;
}

export default api;

