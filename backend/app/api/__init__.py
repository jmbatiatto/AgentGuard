"""Módulo de Routers de API REST para AgentGuard."""

from fastapi import APIRouter
from app.api.organizations import router as organizations_router
from app.api.users import router as users_router

api_router = APIRouter()
api_router.include_router(organizations_router)
api_router.include_router(users_router)

__all__ = ["api_router"]
