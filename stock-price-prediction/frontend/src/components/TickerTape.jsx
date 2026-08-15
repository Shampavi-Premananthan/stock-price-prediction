const SYMBOLS = [
  { s: "AAPL", d: "+1.24%", up: true },
  { s: "TSLA", d: "-0.87%", up: false },
  { s: "NVDA", d: "+2.63%", up: true },
  { s: "MSFT", d: "+0.41%", up: true },
  { s: "AMZN", d: "-0.35%", up: false },
  { s: "GOOGL", d: "+0.92%", up: true },
  { s: "META", d: "-1.10%", up: false },
];

export default function TickerTape() {
  const row = [...SYMBOLS, ...SYMBOLS];
  return (
    <div className="ticker-tape border-y border-line/70 bg-panel/60 py-2.5">
      <div className="ticker-tape__inner font-mono text-xs text-muted">
        {row.map((item, i) => (
          <span key={i} className="mx-6 inline-flex items-center gap-2">
            <span className="text-white/80">{item.s}</span>
            <span className={item.up ? "text-accent" : "text-danger"}>{item.d}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
