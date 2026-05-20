from __future__ import annotations

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:8765", "http://localhost:8765", "null"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class QueryRequest(BaseModel):
    message: str


SYSTEM_PROMPT = """
You are OctoLawyer, a legal research support assistant.
You provide general legal information, source-aware summaries, and draft support.
You do not provide binding legal advice, representation, filing, settlement, or final legal opinions.
When the matter is jurisdiction-specific, uncertain, high-impact, or rights-affecting, tell the user to consult a licensed lawyer.
Always end with: "This is general legal information, not legal advice. Consult a licensed lawyer for official action."
"""


@app.post("/ask")
async def ask_octolawyer(request: QueryRequest):
    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "qwen2.5-coder",
                "prompt": f"{SYSTEM_PROMPT}\n\nUser: {request.message}\n\nOctoLawyer:",
                "stream": False,
            },
            timeout=30,
        )
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Ollama server is not reachable.")
        return {"answer": response.json().get("response", "")}
    except requests.RequestException as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)
