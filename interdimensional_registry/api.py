import os
import db_manager
from fastapi import FastAPI, Response

app = FastAPI()

SERVER_ID = os.getenv("SERVER_ID", "backend-1")


@app.get("/api")
@app.get("/api/health")
def api_health(response: Response):
  # Добавляем ID сервера в заголовок и в body ответа
  response.headers["X-Server-ID"] = SERVER_ID
  return {
      "status": "ok",
      "server_id": SERVER_ID,
      "message": "Glitch Registry API is active",
  }


@app.get("/api/glitches")
def get_glitches():
  records = db_manager.get_all_registry()
  return {"server_id": SERVER_ID, "count": len(records), "data": records}