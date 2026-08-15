import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/",
  timeout: 5 * 60 * 1000, // training can take a while on first run
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

export function downloadUrl(path) {
  return path;
}

export default api;
