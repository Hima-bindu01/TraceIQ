"""Two-round demo of RETAIN -> RECALL -> LLM response."""

from app.agent import IncidentAgent
from app.models import NewIncident, Resolution


def main() -> None:
    agent = IncidentAgent()

    print("\n=== ROUND 1: FIRST INCIDENT ===")
    first = Resolution(
        incident_id="INC-001",
        service="Payment API",
        error="HTTP 503 Service Unavailable",
        root_cause="Database connection pool exhausted",
        failed_attempts=["Restarted Payment API"],
        successful_fix="Increased database connection pool size",
        deployment_version="payment-api:v1.4.2",
        lessons="Check DB pool utilization before repeatedly restarting the API.",
    )
    agent.remember_resolution(first)
    print("Incident retained in Hindsight.")

    print("\n=== ROUND 2: SAME KIND OF PROBLEM ===")
    second = NewIncident(
        incident_id="INC-002",
        service="Payment API",
        error="HTTP 503 Service Unavailable",
        deployment_version="payment-api:v1.5.0",
    )
    result = agent.analyze(second)

    print(f"\nRecalled memories: {len(result['similar_incidents'])}")
    for i, memory in enumerate(result["similar_incidents"], start=1):
        print(f"\nMemory {i}: {memory['text']}")

    print("\n=== AGENT RESPONSE ===")
    print(result["recommendation"])


if __name__ == "__main__":
    main()
