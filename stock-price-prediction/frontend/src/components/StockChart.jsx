import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: "index", intersect: false },
  plugins: {
    legend: {
      labels: { color: "#7C8AA8", font: { family: "Inter", size: 11 } },
    },
    tooltip: {
      backgroundColor: "#141F38",
      borderColor: "#22314F",
      borderWidth: 1,
      titleColor: "#E7ECF7",
      bodyColor: "#7C8AA8",
      padding: 10,
    },
  },
  scales: {
    x: {
      grid: { color: "#1B2740" },
      ticks: { color: "#7C8AA8", maxTicksLimit: 8, font: { size: 10 } },
    },
    y: {
      grid: { color: "#1B2740" },
      ticks: { color: "#7C8AA8", font: { size: 10 } },
    },
  },
};

export function HistoricalForecastChart({ historical, forecast }) {
  const data = {
    labels: [...historical.map((h) => h.date), ...forecast.map((f) => f.date)],
    datasets: [
      {
        label: "Historical Close",
        data: historical.map((h) => h.close),
        borderColor: "#22D3A8",
        backgroundColor: "rgba(34,211,168,0.08)",
        fill: true,
        pointRadius: 0,
        borderWidth: 2,
        tension: 0.25,
      },
      {
        label: "Forecast",
        data: [
          ...Array(historical.length - 1).fill(null),
          historical[historical.length - 1]?.close,
          ...forecast.map((f) => f.predicted_close),
        ],
        borderColor: "#F2B84B",
        borderDash: [6, 4],
        pointRadius: 0,
        borderWidth: 2,
        tension: 0.25,
      },
    ],
  };
  return (
    <div className="h-72 w-full">
      <Line data={data} options={baseOptions} />
    </div>
  );
}

export function ActualVsPredictedChart({ rows }) {
  const data = {
    labels: rows.map((r) => r.date),
    datasets: [
      {
        label: "Actual",
        data: rows.map((r) => r.actual),
        borderColor: "#E7ECF7",
        pointRadius: 0,
        borderWidth: 2,
        tension: 0.2,
      },
      {
        label: "Predicted",
        data: rows.map((r) => r.predicted),
        borderColor: "#22D3A8",
        pointRadius: 0,
        borderWidth: 2,
        tension: 0.2,
      },
    ],
  };
  return (
    <div className="h-64 w-full">
      <Line data={data} options={baseOptions} />
    </div>
  );
}

export function TrainingLossChart({ history }) {
  const loss = history?.loss || [];
  const valLoss = history?.val_loss || [];
  const data = {
    labels: loss.map((_, i) => `Epoch ${i + 1}`),
    datasets: [
      {
        label: "Training Loss",
        data: loss,
        borderColor: "#22D3A8",
        pointRadius: 0,
        borderWidth: 2,
      },
      {
        label: "Validation Loss",
        data: valLoss,
        borderColor: "#F16565",
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  };
  return (
    <div className="h-64 w-full">
      <Line data={data} options={baseOptions} />
    </div>
  );
}
