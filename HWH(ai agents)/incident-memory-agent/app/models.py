from typing import Optional
from pydantic import BaseModel, Field


class Incident(BaseModel):
    incident_id: str
    service: str
    error: str
    root_cause: Optional[str] = None
    failed_attempts: list[str] = Field(default_factory=list)
    successful_fix: Optional[str] = None
    deployment_version: Optional[str] = None
    lessons: Optional[str] = None


class NewIncident(BaseModel):
    incident_id: str
    service: str
    error: str
    deployment_version: Optional[str] = None


class Resolution(BaseModel):
    incident_id: str
    service: str
    error: str
    root_cause: str
    failed_attempts: list[str] = Field(default_factory=list)
    successful_fix: str
    deployment_version: Optional[str] = None
    lessons: Optional[str] = None


class AnalyzeResponse(BaseModel):
    incident: NewIncident
    similar_incidents: list[dict]
    recommendation: str
