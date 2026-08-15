import asyncio
from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect

from app.logger import logger
from app.schemas import RealtimeQuoteResponse
from app.services.data_service import TickerNotFoundError, fetch_realtime_quote

router = APIRouter(prefix="/api/v1", tags=["realtime"])


@router.get("/quote/{ticker}", response_model=RealtimeQuoteResponse)
@router.get("/quote/{ticker}/", response_model=RealtimeQuoteResponse, include_in_schema=False)
def get_quote(ticker: str) -> RealtimeQuoteResponse:
    """REST endpoint to fetch the latest real-time quote for a stock ticker."""
    try:
        quote = fetch_realtime_quote(ticker)
        return RealtimeQuoteResponse(**quote)
    except TickerNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception(f"Error fetching quote for {ticker}")
        raise HTTPException(status_code=500, detail="Failed to fetch real-time quote") from exc


@router.websocket("/ws/quote/{ticker}")
async def websocket_quote(websocket: WebSocket, ticker: str):
    """
    WebSocket endpoint streaming live quote updates every 15 seconds.
    """
    await websocket.accept()
    logger.info(f"WebSocket client connected for ticker: {ticker}")

    try:
        while True:
            try:
                quote = fetch_realtime_quote(ticker)
                await websocket.send_json(quote)
            except Exception as exc:
                logger.warning(f"Error fetching live quote in WS stream: {exc}")
                await websocket.send_json({"error": f"Could not update quote for {ticker}"})
            
            # Wait 15 seconds before pushing next update
            await asyncio.sleep(15)
    except WebSocketDisconnect:
        logger.info(f"WebSocket client disconnected for ticker: {ticker}")
