from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq

from .config import settings


class IncidentLLM:
    def __init__(self) -> None:
        if not settings.groq_api_key:
            raise ValueError("GROQ_API_KEY is missing. Add it to .env before starting the agent.")

        self.llm = ChatGroq(
            api_key=settings.groq_api_key,
            model=settings.groq_model,
            temperature=0,
            max_tokens=900,
        )

        self.chain = (
            ChatPromptTemplate.from_messages(
                [
                    (
                        "system",
                        """
You are an Incident Response Agent for software production systems.
You are NOT a generic chatbot.

Your job is to help an engineer investigate the CURRENT incident using CURRENT
symptoms plus relevant HINDSIGHT MEMORY.

Rules:
1. Treat recalled incidents as historical evidence, not proof of the current root cause.
2. Explicitly distinguish historical facts from current observations.
3. If a previous failed attempt is remembered, warn the engineer about it.
4. If a previous successful fix is remembered, recommend checking the same underlying
   condition before blindly applying the fix.
5. Give a short investigation plan followed by a likely explanation.
6. Never invent logs, metrics, deployments, or root causes.
""",
                    ),
                    (
                        "human",
                        """
CURRENT INCIDENT
{incident}

HINDSIGHT MEMORY
{memory}

Produce:
- Similar historical evidence
- What to check first
- Recommended next action
- Important warning from previous failed attempts
""",
                    ),
                ]
            )
            | self.llm
            | StrOutputParser()
        )

    def analyze(self, incident_text: str, memories: list[dict]) -> str:
        if memories:
            memory_text = "\n\n".join(
                f"Memory {i + 1}: {m['text']}" for i, m in enumerate(memories)
            )
        else:
            memory_text = "No relevant historical incident was recalled."

        return self.chain.invoke(
            {
                "incident": incident_text,
                "memory": memory_text,
            }
        )
