export default function MetricsCard({ metrics }) {
  if (!metrics) return null;
  const items = [
    { label: "MAE", value: metrics.mae, hint: "Mean Absolute Error ($)" },
    { label: "RMSE", value: metrics.rmse, hint: "Root Mean Squared Error ($)" },
    { label: "MAPE", value: `${metrics.mape}%`, hint: "Mean Absolute % Error" },
  ];
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="panel p-4">
          <p className="font-mono text-xs uppercase tracking-wider text-muted">
            {item.label}
          </p>
          <p className="mt-2 font-display text-2xl font-semibold text-white">
            {item.value}
          </p>
          <p className="mt-1 text-xs text-muted">{item.hint}</p>
        </div>
      ))}
    </div>
  );
}
