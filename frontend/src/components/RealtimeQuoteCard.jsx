import React, { useEffect, useState } from "react";
import { getRealtimeQuote, createQuoteWebSocket } from "../api/client";

export default function RealtimeQuoteCard({ ticker }) {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (!ticker) return;

    setLoading(true);
    setError(null);
    setIsLive(false);

    // Initial REST fetch
    getRealtimeQuote(ticker)
      .then((data) => {
        setQuote(data);
        setLoading(false);
      })
      .catch((err) => {
        console.warn("REST quote fetch error:", err);
        setError("Could not load initial quote");
        setLoading(false);
      });

    // Setup WebSocket stream
    const ws = createQuoteWebSocket(
      ticker,
      (data) => {
        if (!data.error) {
          setQuote(data);
          setIsLive(true);
          setError(null);
        }
      },
      (err) => {
        console.warn("WebSocket error:", err);
        setIsLive(false);
      }
    );

    return () => {
      ws.close();
    };
  }, [ticker]);

  if (loading) {
    return (
      <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 animate-pulse">
        <div className="h-4 bg-slate-700 rounded w-1/3 mb-2"></div>
        <div className="h-8 bg-slate-700 rounded w-1/2"></div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 text-slate-400 text-sm">
        Live data feed currently unavailable for <span className="font-semibold text-white">{ticker}</span>
      </div>
    );
  }

  const isPositive = quote.change >= 0;

  return (
    <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-5 shadow-lg backdrop-blur-md transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold text-white tracking-wide">{quote.ticker}</span>
          <span className="text-xs bg-slate-700/80 text-slate-300 px-2 py-0.5 rounded font-mono">
            LIVE QUOTE
          </span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span
            className={`inline-block w-2.5 h-2.5 rounded-full ${
              isLive ? "bg-emerald-400 animate-ping" : "bg-amber-400"
            }`}
          ></span>
          <span className="text-xs text-slate-400">
            {isLive ? "Live Stream" : "Polling"}
          </span>
        </div>
      </div>

      <div className="flex items-baseline space-x-3 mb-4">
        <span className="text-3xl font-extrabold text-white font-mono">
          ${quote.price.toFixed(2)}
        </span>
        <span
          className={`inline-flex items-center text-sm font-semibold px-2.5 py-1 rounded-md ${
            isPositive
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
          }`}
        >
          {isPositive ? "+" : ""}
          {quote.change.toFixed(2)} ({isPositive ? "+" : ""}
          {quote.percent_change.toFixed(2)}%)
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs border-t border-slate-700/60 pt-3 text-slate-300">
        <div>
          <span className="text-slate-400 block mb-0.5">Day High</span>
          <span className="font-semibold text-white">${quote.day_high.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-slate-400 block mb-0.5">Day Low</span>
          <span className="font-semibold text-white">${quote.day_low.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-slate-400 block mb-0.5">Open</span>
          <span className="font-semibold text-white">${quote.open_price.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-slate-400 block mb-0.5">Volume</span>
          <span className="font-semibold text-white">{quote.volume.toLocaleString()}</span>
        </div>
      </div>

      <div className="mt-3 text-[10px] text-slate-500 text-right font-mono">
        Updated: {quote.timestamp}
      </div>
    </div>
  );
}
