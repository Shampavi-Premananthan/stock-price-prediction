from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from app.logger import logger
from app.schemas import PredictionRequest, PredictionResponse
from app.services.data_service import TickerNotFoundError
from app.services.model_service import DATA_DIR, run_prediction_pipeline

router = APIRouter(prefix="/api/v1", tags=["prediction"])


@router.post("/predict", response_model=PredictionResponse)
@router.post("/predict/", response_model=PredictionResponse, include_in_schema=False)
def predict(request: PredictionRequest) -> PredictionResponse:
    """
    Train (or reuse a cached) model and return historical prices,
    a backtest overlay, a future forecast, and evaluation metrics.
    """
    try:
        result = run_prediction_pipeline(request)
        return PredictionResponse(**result)
    except TickerNotFoundError as exc:
        logger.warning(f"Invalid ticker requested: {request.ticker} - {exc}")
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        logger.warning(f"Bad request for {request.ticker}: {exc}")
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001 - convert unexpected errors to 500
        logger.exception(f"Prediction pipeline failed for {request.ticker}")
        raise HTTPException(status_code=500, detail="Internal error during prediction") from exc


@router.get("/download/{filename}")
def download_csv(filename: str) -> FileResponse:
    """Serve a previously generated forecast CSV for download."""
    safe_name = Path(filename).name  # prevent path traversal
    file_path = DATA_DIR / safe_name
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path, media_type="text/csv", filename=safe_name)
