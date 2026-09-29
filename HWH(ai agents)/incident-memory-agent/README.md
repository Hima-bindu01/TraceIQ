# Incident Memory & Response Agent — Member 1–2

This is the AI + Hindsight part of the team project.

## Your exact responsibility

The component proves one core capability:

**RETAIN a resolved incident -> later RECALL a similar incident -> use an LLM to turn that memory into an investigation recommendation.**

It is intentionally separate from the Java/Spring Boot backend and React dashboard. The other team members can call this service through HTTP later.

## Architecture

```text
                Member 1–2 component

New Incident
     |
     v
FastAPI /incidents/analyze
     |
     +----> Hindsight RECALL ----> similar old incidents
     |                                  |
     |                                  v
     +------------------------------> Groq LLM
                                        |
                                        v
                              investigation recommendation

Resolved Incident
     |
     v
FastAPI /incidents/resolve
     |
     v
Hindsight RETAIN
     |
     v
Long-term incident memory
```

## What is Hindsight doing?

Hindsight is the long-term memory layer. The Python client exposes `retain()` to store information and `recall()` to retrieve relevant memories later.

The agent does **not** simply paste the old incident into a prompt every time. Hindsight processes retained incident text and makes it searchable as structured memory.

## Setup on Windows

### 1. Requirements

- Python 3.11 or newer
- Docker Desktop
- A Groq API key

### 2. Create the virtual environment

PowerShell:

```powershell
cd incident-memory-agent
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

If PowerShell blocks activation, run the Python executable directly instead:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

### 3. Create `.env`

Copy `.env.example` to `.env` and put your real Groq key in `GROQ_API_KEY`.

Do **not** commit `.env` to GitHub.

### 4. Start Hindsight

From the project folder:

```powershell
docker compose --env-file .env up -d
```

Check:

```powershell
docker ps
```

The Hindsight API should be available at `http://localhost:8888` and its UI at `http://localhost:9999`.

### 5. Run the two-round demo

Keep Hindsight running and open a second terminal:

```powershell
.\.venv\Scripts\Activate.ps1
python -m scripts.demo
```

Expected behavior:

```text
ROUND 1
Payment API -> 503
Root cause -> DB connection pool exhausted
Failed attempt -> restart API
Successful fix -> increase pool size
                         |
                         v
                    Hindsight RETAIN

ROUND 2
Payment API -> 503
                         |
                         v
                    Hindsight RECALL
                         |
                         v
          previous incident is found
                         |
                         v
                     Groq LLM
                         |
                         v
Check DB pool utilization first; the previous restart did not solve it.
```

## Run as an API for the other team members

Start the Python service:

```powershell
uvicorn app.api:app --host 127.0.0.1 --port 8000 --reload
```

Health check:

```text
GET http://127.0.0.1:8000/health
```

### Save a resolved incident — RETAIN

`POST /incidents/resolve`

Example JSON:

```json
{
  "incident_id": "INC-001",
  "service": "Payment API",
  "error": "HTTP 503 Service Unavailable",
  "root_cause": "Database connection pool exhausted",
  "failed_attempts": ["Restarted Payment API"],
  "successful_fix": "Increased database connection pool size",
  "deployment_version": "payment-api:v1.4.2",
  "lessons": "Check DB pool utilization before repeatedly restarting the API."
}
```

### Analyze a new incident — RECALL + LLM

`POST /incidents/analyze`

Example JSON:

```json
{
  "incident_id": "INC-002",
  "service": "Payment API",
  "error": "HTTP 503 Service Unavailable",
  "deployment_version": "payment-api:v1.5.0"
}
```

The response contains:

- `similar_incidents`: memories returned by Hindsight
- `recommendation`: LLM analysis using the recalled memories

## Why we retain after resolution

Do not retain every raw error repeatedly. The important memory is the **outcome** of the incident:

```text
symptom -> root cause -> failed attempts -> successful fix -> lesson
```

That is what gives the agent institutional memory.

## Important boundary for the team

This component is not responsible for:

- Spring Boot business logic
- PostgreSQL incident storage used by the main application
- React dashboard
- production log collection
- Kubernetes deployment

Those can be integrated later by the other members.

The clean integration point is the FastAPI service:

```text
Java/Spring Boot
      |
      | HTTP POST /incidents/analyze
      v
Python AI service
      |
      +--> Hindsight RECALL
      +--> Groq LLM
      |
      v
AI recommendation
```

## Demo talking points

1. First incident is resolved.
2. The resolution is sent to Hindsight using RETAIN.
3. Months later, a new 503 occurs.
4. The new incident is sent to Hindsight using RECALL.
5. Hindsight finds the previous related incident.
6. The LLM receives the current incident plus historical evidence.
7. The agent warns that restarting the API previously failed and suggests checking the DB connection pool.
8. After the new incident is resolved, its outcome is retained again.

This is the core **Recurring Problem -> Action -> Outcome -> Hindsight Memory -> Precision on Repeat Failure** loop.
