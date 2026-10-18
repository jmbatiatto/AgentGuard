"""Módulo de Routers de API REST para AgentGuard."""

from fastapi import APIRouter
from app.api.organizations import router as organizations_router
from app.api.users import router as users_router
from app.api.tools import router as tools_router
from app.api.tool_actions import router as tool_actions_router
from app.api.agents import router as agents_router
from app.api.policies import router as policies_router

api_router = APIRouter()
api_router.include_router(organizations_router)
api_router.include_router(users_router)
api_router.include_router(tools_router)
api_router.include_router(tool_actions_router)
api_router.include_router(agents_router)
api_router.include_router(policies_router)

__all__ = ["api_router"]
