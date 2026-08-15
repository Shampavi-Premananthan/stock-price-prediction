import React, { useState, useEffect } from "react";
import { getNewsSentiment } from "../api/client";

export default function NewsSentimentCard({ ticker }) {
  const [newsData, setNewsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ticker) return;
    let isMounted = true;
    setLoading(true);
    setError(null);

    getNewsSentiment(ticker)
      .then((data) => {
        if (isMounted) {
          setNewsData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          logger_error(err);
          setError("Failed to fetch news sentiment");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [ticker]);

  function logger_error(err) {
    console.error("Error loading news sentiment:", err);
  }

  const getSentimentBadgeClass = (label) => {
    switch (label?.toLowerCase()) {
      case "bullish":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "bearish":
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
      default:
        return "bg-sky-500/10 text-sky-400 border-sky-500/30";
    }
  };

  const getSentimentIcon = (label) => {
    switch (label?.toLowerCase()) {
      case "bullish":
        return "▲";
      case "bearish":
        return "▼";
      default:
        return "●";
    }
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl transition-all duration-300 hover:border-slate-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <span className="text-indigo-400">⚡</span> Real-Time News & Sentiment
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-mono">
              NewsAPI Live
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Analyzing breaking market coverage for <span className="font-semibold text-indigo-300">{ticker}</span>
          </p>
        </div>

        {newsData && !loading && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-slate-400 font-medium">Market Consensus</div>
              <div
                className={`text-sm font-bold uppercase tracking-wide flex items-center justify-end gap-1 ${
                  newsData.overall_sentiment === "Bullish"
                    ? "text-emerald-400"
                    : newsData.overall_sentiment === "Bearish"
                    ? "text-rose-400"
                    : "text-sky-400"
                }`}
              >
                <span>{getSentimentIcon(newsData.overall_sentiment)}</span>
                {newsData.overall_sentiment} ({newsData.sentiment_score > 0 ? `+${newsData.sentiment_score}` : newsData.sentiment_score})
              </div>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <div className="inline-block w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm text-slate-400 animate-pulse">Fetching live news & scoring sentiment for {ticker}...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-sm text-center">
          {error}
        </div>
      ) : newsData ? (
        <div className="space-y-6">
          {/* Sentiment Gauge & Meters */}
          <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80">
            <div className="flex justify-between items-center text-xs text-slate-300 mb-2 font-medium">
              <span className="text-emerald-400 font-semibold">Bullish: {newsData.bullish_percentage}%</span>
              <span className="text-sky-400 font-semibold">Neutral: {newsData.neutral_percentage}%</span>
              <span className="text-rose-400 font-semibold">Bearish: {newsData.bearish_percentage}%</span>
            </div>

            {/* Visual Sentiment Multi-Color Bar */}
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex gap-0.5">
              <div
                style={{ width: `${newsData.bullish_percentage}%` }}
                className="h-full bg-emerald-500 transition-all duration-500"
                title={`Bullish ${newsData.bullish_percentage}%`}
              ></div>
              <div
                style={{ width: `${newsData.neutral_percentage}%` }}
                className="h-full bg-sky-500 transition-all duration-500"
                title={`Neutral ${newsData.neutral_percentage}%`}
              ></div>
              <div
                style={{ width: `${newsData.bearish_percentage}%` }}
                className="h-full bg-rose-500 transition-all duration-500"
                title={`Bearish ${newsData.bearish_percentage}%`}
              ></div>
            </div>
          </div>

          {/* News Feed List */}
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
            {newsData.articles.map((article, idx) => (
              <a
                key={idx}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block group bg-slate-950/40 hover:bg-slate-800/50 border border-slate-800/60 hover:border-indigo-500/40 rounded-xl p-4 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <span className="text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
                    {article.source}
                  </span>
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-md border flex items-center gap-1 ${getSentimentBadgeClass(
                      article.sentiment_label
                    )}`}
                  >
                    <span>{getSentimentIcon(article.sentiment_label)}</span>
                    {article.sentiment_label}
                  </span>
                </div>

                <h4 className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors line-clamp-2">
                  {article.title}
                </h4>

                {article.description && (
                  <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {article.description}
                  </p>
                )}

                <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    {article.published_at ? new Date(article.published_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                  </span>
                  <span className="group-hover:translate-x-1 transition-transform text-indigo-400 flex items-center gap-1">
                    Read article <span>→</span>
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
