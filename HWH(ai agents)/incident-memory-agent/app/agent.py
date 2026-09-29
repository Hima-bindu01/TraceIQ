from .hindsight_memory import IncidentMemory
from .llm import IncidentLLM
from .models import NewIncident, Resolution


class IncidentAgent:
    """Main workflow: RECALL -> LLM analysis -> RETAIN after resolution."""

    def __init__(self) -> None:
        self.memory = IncidentMemory()
        self.memory.ensure_bank()
        self.llm = IncidentLLM()

    def analyze(self, incident: NewIncident) -> dict:
        memories = self.memory.recall_similar(incident)
        incident_text = (
            f"Service: {incident.service}\n"
            f"Error: {incident.error}\n"
            f"Deployment/version: {incident.deployment_version or 'unknown'}"
        )
        recommendation = self.llm.analyze(incident_text, memories)
        return {
            "incident": incident.model_dump(),
            "similar_incidents": memories,
            "recommendation": recommendation,
        }

    def remember_resolution(self, resolution: Resolution) -> dict:
        return self.memory.retain_resolution(resolution)
