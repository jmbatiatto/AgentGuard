"""Módulo de Routers de API REST y WebSockets para AgentGuard."""

from fastapi import APIRouter
from app.api.organizations import router as organizations_router
from app.api.users import router as users_router
from app.api.tools import router as tools_router
from app.api.tool_actions import router as tool_actions_router
from app.api.agents import router as agents_router
from app.api.policies import router as policies_router
from app.api.policy_rules import router as policy_rules_router
from app.api.gateway import router as gateway_router
from app.api.approvals import router as approvals_router
from app.api.websocket import router as websocket_router
from app.api.executions import router as executions_router
from app.api.alerts import router as alerts_router

api_router = APIRouter()
api_router.include_router(organizations_router)
api_router.include_router(users_router)
api_router.include_router(tools_router)
api_router.include_router(tool_actions_router)
api_router.include_router(agents_router)
api_router.include_router(policies_router)
api_router.include_router(policy_rules_router)
api_router.include_router(gateway_router)
api_router.include_router(approvals_router)
api_router.include_router(websocket_router)
api_router.include_router(executions_router)
api_router.include_router(alerts_router)

__all__ = ["api_router"]
