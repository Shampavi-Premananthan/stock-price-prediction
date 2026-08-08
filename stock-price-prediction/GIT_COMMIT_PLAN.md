# 5-Day Build & Commit Plan

Suggested way to split this project into a realistic commit history for
your portfolio/GitHub. Each day = one focused milestone with 2-4 commits.

---

## Day 1 — Project scaffolding & backend foundation

```
git init
git add README.md .gitignore docker-compose.yml
git commit -m "chore: initial project scaffold and docs"

git add backend/requirements.txt backend/Dockerfile backend/.env.example
git commit -m "chore(backend): add dependencies, Dockerfile, env template"

git add backend/app/config.py backend/app/logger.py backend/app/schemas.py
git commit -m "feat(backend): add config, logging, and API schemas"

git add backend/app/main.py backend/app/routers/health.py
git commit -m "feat(backend): bootstrap FastAPI app with health check"
```

## Day 2 — Data pipeline & technical indicators

```
git add backend/app/services/data_service.py
git commit -m "feat(data): add Yahoo Finance ingestion, cleaning, and MinMax scaling"

git add backend/app/services/data_service.py
git commit -m "feat(data): add RSI, MACD, and Bollinger Band indicators"

git add backend/app/services/data_service.py
git commit -m "feat(data): build sliding-window sequence generator with train/test split"
```

## Day 3 — Models & training pipeline

```
git add backend/app/models/base_model.py
git commit -m "feat(ml): add shared forecaster interface with early stopping"

git add backend/app/models/lstm_model.py
git commit -m "feat(ml): implement LSTM forecaster"

git add backend/app/models/rnn_model.py
git commit -m "feat(ml): implement Simple RNN forecaster"

git add backend/app/services/model_service.py backend/app/routers/prediction.py
git commit -m "feat(api): add /predict endpoint with caching, MAE/RMSE/MAPE evaluation, and CSV export"
```

## Day 4 — Frontend

```
git add frontend/package.json frontend/vite.config.js frontend/tailwind.config.js frontend/postcss.config.js
git commit -m "chore(frontend): scaffold Vite + React + Tailwind project"

git add frontend/src/index.css frontend/src/main.jsx frontend/src/App.jsx frontend/src/components/Navbar.jsx frontend/src/components/Footer.jsx
git commit -m "feat(frontend): add app shell, routing, navbar, footer, and design tokens"

git add frontend/src/pages/Home.jsx frontend/src/components/TickerTape.jsx
git commit -m "feat(frontend): build landing page with feature overview"

git add frontend/src/pages/Predict.jsx frontend/src/components/PredictionForm.jsx frontend/src/components/StockChart.jsx frontend/src/components/MetricsCard.jsx frontend/src/api/client.js
git commit -m "feat(frontend): build prediction dashboard with charts, metrics, and CSV download"
```

## Day 5 — Dockerization, polish, and docs

```
git add frontend/Dockerfile frontend/nginx.conf docker-compose.yml
git commit -m "chore(deploy): dockerize frontend and wire up docker-compose"

git add README.md
git commit -m "docs: finalize README with setup, API reference, and future work"

# Optional: add real screenshots once you've run the app
git add docs/
git commit -m "docs: add dashboard screenshots"

git tag v1.0.0
git push origin main --tags
```

---

### Tips for the actual GitHub history

- Commit as you actually build each piece — don't fake timestamps.
- Keep commits scoped to one concern each; it makes the history readable
  during an interview walkthrough.
- Write PR-style descriptions if you open a repo with branches
  (e.g. `feat/ml-models`, `feat/frontend-dashboard`) before merging to `main`.
