from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from hindsight_client import Hindsight

from .config import settings
from .models import Incident, NewIncident, Resolution


class IncidentMemory:
    """Thin wrapper around Hindsight's RETAIN and RECALL operations."""

    def __init__(self) -> None:
        self.client = Hindsight(base_url=settings.hindsight_url, timeout=60.0)
        self.bank_id = settings.hindsight_bank_id

    def ensure_bank(self) -> None:
        """Create the memory bank once. Ignore the already-exists case."""
        try:
            self.client.create_bank(
                bank_id=self.bank_id,
                name="Incident Memory",
                mission=(
                    "Remember production incidents, root causes, failed attempts, "
                    "successful fixes, deployment versions, and lessons so future "
                    "incident investigations can reuse previous experience."
                ),
            )
        except Exception:
            # Hindsight returns an error if the bank already exists.
            # We do not want that to stop the agent from using the existing bank.
            pass

    @staticmethod
    def _incident_text(incident: Incident | Resolution) -> str:
        failed = ", ".join(incident.failed_attempts) or "None recorded"
        return f"""
Production incident record
Incident ID: {incident.incident_id}
Service: {incident.service}
Error: {incident.error}
Root cause: {incident.root_cause or 'Not known yet'}
Previous failed attempts: {failed}
Successful fix: {incident.successful_fix or 'Not known yet'}
Deployment/version: {incident.deployment_version or 'Not specified'}
Lessons learned: {incident.lessons or 'None recorded'}
""".strip()

    def retain_resolution(self, incident: Resolution) -> dict[str, Any]:
        """RETAIN a completed incident after the engineer resolves it."""
        response = self.client.retain(
            bank_id=self.bank_id,
            content=self._incident_text(incident),
            context="production incident / postmortem",
            timestamp=datetime.now(timezone.utc),
            document_id=incident.incident_id,
            metadata={
                "type": "incident",
                "service": incident.service,
                "error": incident.error,
            },
            tags=["incident", incident.service],
            retain_async=False,
        )
        return response.model_dump() if hasattr(response, "model_dump") else {"status": "retained"}

    def recall_similar(self, incident: NewIncident, limit: int = 5) -> list[dict[str, Any]]:
        """RECALL memories relevant to the current incident."""
        query = (
            f"Production incident: service={incident.service}; error={incident.error}; "
            f"version={incident.deployment_version or 'unknown'}. "
            "Find similar incidents, their root causes, failed attempts, successful fixes, "
            "and lessons learned."
        )

        response = self.client.recall(
            bank_id=self.bank_id,
            query=query,
            types=["world", "experience", "observation"],
            budget="mid",
            max_tokens=3000,
        )

        results = getattr(response, "results", [])
        memories: list[dict[str, Any]] = []
        for item in results[:limit]:
            memories.append(
                {
                    "text": getattr(item, "text", str(item)),
                    "type": getattr(item, "type", None),
                    "score": getattr(item, "score", None),
                    "memory_id": getattr(item, "id", None),
                }
            )
        return memories
