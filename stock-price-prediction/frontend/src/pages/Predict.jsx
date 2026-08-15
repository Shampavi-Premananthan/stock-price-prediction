import { useState } from "react";
import { AlertTriangle, Download } from "lucide-react";
import PredictionForm from "../components/PredictionForm.jsx";
import MetricsCard from "../components/MetricsCard.jsx";
import {
  HistoricalForecastChart,
  ActualVsPredictedChart,
  TrainingLossChart,
} from "../components/StockChart.jsx";
import { runPrediction } from "../api/client.js";

export default function Predict() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async ({ ticker, periodDays, modelType }) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await runPrediction({ ticker, periodDays, modelType });
      setResult(data);
    } catch (err) {
      const message =
        err?.response?.data?.detail || "Something went wrong while running the prediction.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <div className="mb-10">
        <h1 className="font-display text-3xl font-semibold text-white">
          Run a prediction
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Pick a ticker, a horizon, and a model. We'll pull recent history,
          train (or reuse a cached) model, and show you the forecast.
        </p>
      </div>

      <PredictionForm onSubmit={handleSubmit} loading={loading} />

      {error && (
        <div className="mt-6 flex items-start gap-3 rounded-lg border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-12 space-y-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-semibold text-white">
                {result.ticker} · {result.model_type} · {result.period_days}-day forecast
              </h2>
              <p className="mt-1 text-xs text-muted">
                Generated {new Date(result.generated_at).toLocaleString()}
              </p>
            </div>
            {result.csv_download_url && (
              <a
                href={result.csv_download_url}
                className="inline-flex items-center gap-2 rounded-lg border border-line px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-accent"
              >
                <Download size={16} /> Download CSV
              </a>
            )}
          </div>

          <MetricsCard metrics={result.metrics} />

          <section className="panel p-6">
            <h3 className="font-display font-semibold text-white">
              Historical price &amp; forecast
            </h3>
            <div className="mt-4">
              <HistoricalForecastChart
                historical={result.historical}
                forecast={result.forecast}
              />
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="panel p-6">
              <h3 className="font-display font-semibold text-white">
                Actual vs predicted (backtest)
              </h3>
              <div className="mt-4">
                <ActualVsPredictedChart rows={result.actual_vs_predicted} />
              </div>
            </section>
            <section className="panel p-6">
              <h3 className="font-display font-semibold text-white">
                Training vs validation loss
              </h3>
              <div className="mt-4">
                <TrainingLossChart history={result.training_history} />
              </div>
              {result.training_history?.loss?.length === 0 && (
                <p className="mt-2 text-xs text-muted">
                  Loaded from cache — no new training occurred this run.
                </p>
              )}
            </section>
          </div>

          <section className="panel overflow-hidden">
            <h3 className="border-b border-line p-6 font-display font-semibold text-white">
              Forecast table
            </h3>
            <div className="scrollbar-thin max-h-72 overflow-y-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-panel font-mono text-xs uppercase tracking-wider text-muted">
                  <tr>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Predicted close</th>
                  </tr>
                </thead>
                <tbody>
                  {result.forecast.map((row) => (
                    <tr key={row.date} className="border-t border-line/60">
                      <td className="px-6 py-3 font-mono text-muted">{row.date}</td>
                      <td className="px-6 py-3 font-mono text-white">
                        ${row.predicted_close.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
