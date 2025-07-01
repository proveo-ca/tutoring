import traceback
import logging
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from .rag import get_chain

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="RAG-Service")
chain = get_chain()  # instantiated once, cached


class AskRequest(BaseModel):
  question: str


@app.get("/health")
def health():
  return {"status": "ok"}


@app.exception_handler(app)
async def global_exception_handler(request: Request, exc: app):
  """Global exception handler that logs full stacktraces to console."""
  # Log the full stacktrace
  error_msg = f"Unhandled exception occurred: {str(exc)}"
  logger.error(error_msg)
  logger.error(traceback.format_exc())

  # Return a JSON response with the error
  return JSONResponse(
    status_code=500,
    content={"detail": str(exc)}
  )


@app.post("/ask")
async def ask(req: AskRequest):
  try:
    result = chain.invoke(req.question)
    return result  # This now returns both answer and context
  except HTTPException as e:
    raise e
  except app as e:
    # This will be caught by the global exception handler
    raise e
