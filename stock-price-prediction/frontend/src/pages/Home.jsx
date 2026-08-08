import { Link } from "react-router-dom";
import { ArrowRight, Brain, Gauge, LineChart, ShieldCheck } from "lucide-react";
import TickerTape from "../components/TickerTape.jsx";

const FEATURES = [
  {
    icon: Brain,
    title: "Dual-model engine",
    text: "Train and compare an LSTM and a Simple RNN on the same window of history to see how architecture affects forecast quality.",
  },
  {
    icon: Gauge,
    title: "Real evaluation metrics",
    text: "Every run reports MAE, RMSE, and MAPE on a held-out test split — not just a chart that looks convincing.",
  },
  {
    icon: LineChart,
    title: "Technical indicators",
    text: "RSI, MACD, and Bollinger Bands are computed server-side and feed the same pipeline your model trains on.",
  },
  {
    icon: ShieldCheck,
    title: "Production shape",
    text: "FastAPI backend, typed schemas, cached models, Dockerized services — built the way a real forecasting service would be.",
  },
];

export default function Home() {
  return (
    <div>
      <TickerTape />

      <section className="mx-auto max-w-6xl px-6 pb-20 pt-20">
        <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-panel px-3 py-1 font-mono text-xs text-accent">
              LSTM · RNN · LIVE MARKET DATA
            </span>
            <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.1] text-white sm:text-5xl">
              Forecast tomorrow's close from{" "}
              <span className="text-accent">today's pattern.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted">
              Quantis trains recurrent neural networks on real Yahoo Finance
              history, backtests them against held-out days, and shows you
              exactly where the model was right — and where it wasn't.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/predict"
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3.5 font-display font-semibold text-ink transition-opacity hover:opacity-90"
              >
                Start prediction <ArrowRight size={18} />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-lg border border-line px-6 py-3.5 font-display font-semibold text-white transition-colors hover:border-accent"
              >
                How it works
              </a>
            </div>
          </div>

          <div className="panel relative overflow-hidden p-6">
            <p className="font-mono text-xs uppercase tracking-wider text-muted">
              Sample forecast · NVDA · LSTM
            </p>
            <svg viewBox="0 0 400 180" className="mt-4 w-full">
              <polyline
                points="0,120 40,110 80,118 120,95 160,100 200,78 240,85 280,60 320,66 360,40 400,48"
                fill="none"
                stroke="#22D3A8"
                strokeWidth="2.5"
              />
              <polyline
                points="280,60 320,50 360,44 400,30"
                fill="none"
                stroke="#F2B84B"
                strokeDasharray="6 4"
                strokeWidth="2.5"
              />
              <line x1="280" y1="0" x2="280" y2="180" stroke="#22314F" strokeDasharray="3 3" />
            </svg>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-muted">
                <span className="h-2 w-2 rounded-full bg-accent" /> Historical
              </span>
              <span className="flex items-center gap-1.5 text-muted">
                <span className="h-2 w-2 rounded-full bg-warn" /> Forecast
              </span>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-6 pb-24">
        <h2 className="font-display text-2xl font-semibold text-white">
          What's under the hood
        </h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="panel p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-accent">
                <Icon size={20} />
              </span>
              <h3 className="mt-4 font-display font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
