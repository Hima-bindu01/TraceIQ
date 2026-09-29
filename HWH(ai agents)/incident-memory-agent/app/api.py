from fastapi import FastAPI, HTTPException

from .agent import IncidentAgent
from .models import AnalyzeResponse, NewIncident, Resolution

app = FastAPI(
    title="Incident Memory & Response Agent",
    version="1.0.0",
    description="AI incident analysis backed by Hindsight long-term memory.",
)

agent: IncidentAgent | None = None


@app.on_event("startup")
def startup() -> None:
    global agent
    agent = IncidentAgent()


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "incident-memory-agent"}


@app.post("/incidents/analyze", response_model=AnalyzeResponse)
def analyze(incident: NewIncident) -> dict:
    if agent is None:
        raise HTTPException(status_code=503, detail="Agent is not initialized")
    return agent.analyze(incident)


@app.post("/incidents/resolve")
def resolve(resolution: Resolution) -> dict:
    if agent is None:
        raise HTTPException(status_code=503, detail="Agent is not initialized")
    return agent.remember_resolution(resolution)
