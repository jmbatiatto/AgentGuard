"""Módulo de Agente Inteligente para ACME Corporation."""

from agent.gemini_client import (
    GEMINI_FUNCTION_DECLARATIONS,
    GeminiAgentClient,
    discover_agentguard_context,
)
from agent.presets import PRESETS, get_preset_by_id, list_presets

__all__ = [
    "GeminiAgentClient",
    "discover_agentguard_context",
    "GEMINI_FUNCTION_DECLARATIONS",
    "PRESETS",
    "get_preset_by_id",
    "list_presets",
]
