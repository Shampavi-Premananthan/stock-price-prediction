import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

const PERIODS = [7, 15, 30];
const MODELS = [
  { id: "LSTM", label: "LSTM", blurb: "Long Short-Term Memory — captures longer trends" },
  { id: "RNN", label: "Simple RNN", blurb: "Lightweight recurrent baseline, faster to train" },
];

export default function PredictionForm({ onSubmit, loading }) {
  const [ticker, setTicker] = useState("AAPL");
  const [periodDays, setPeriodDays] = useState(7);
  const [modelType, setModelType] = useState("LSTM");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!ticker.trim()) return;
    onSubmit({ ticker: ticker.trim().toUpperCase(), periodDays, modelType });
  };

  return (
    <form onSubmit={handleSubmit} className="panel p-6">
      <div className="grid gap-6 sm:grid-cols-[1.2fr_1fr]">
        <div>
          <label className="mb-2 block font-mono text-xs uppercase tracking-wider text-muted">
            Ticker symbol
          </label>
          <input
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            placeholder="AAPL, TSLA, NVDA…"
            className="w-full rounded-lg border border-line bg-surface px-4 py-3 font-mono text-lg uppercase tracking-wide text-white placeholder:text-muted/60 focus:border-accent focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block font-mono text-xs uppercase tracking-wider text-muted">
            Forecast horizon
          </label>
          <div className="flex gap-2">
            {PERIODS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriodDays(p)}
                className={`flex-1 rounded-lg border px-3 py-3 font-mono text-sm transition-colors ${
                  periodDays === p
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-line text-muted hover:text-white"
                }`}
              >
                {p}d
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <label className="mb-2 block font-mono text-xs uppercase tracking-wider text-muted">
          Model
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          {MODELS.map((m) => (
            <button
              type="button"
              key={m.id}
              onClick={() => setModelType(m.id)}
              className={`rounded-lg border p-4 text-left transition-colors ${
                modelType === m.id
                  ? "border-accent bg-accent-soft"
                  : "border-line hover:border-muted"
              }`}
            >
              <p className="font-display font-semibold text-white">{m.label}</p>
              <p className="mt-1 text-xs text-muted">{m.blurb}</p>
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3.5 font-display font-semibold text-ink transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={18} /> Training model…
          </>
        ) : (
          <>
            <Sparkles size={18} /> Run prediction
          </>
        )}
      </button>
      {loading && (
        <p className="mt-3 text-center text-xs text-muted">
          First run for a ticker trains fresh models and can take a minute or two.
        </p>
      )}
    </form>
  );
}
