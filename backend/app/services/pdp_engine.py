"""Motor de Decisión de Políticas (PDP - Policy Decision Point).

Implementa la función de evaluación determinista de 5 dimensiones:
Decisión = f(Principal, Delegator, Action, Resource, Context)

Cumple con el principio de seguridad Fail-Closed (Denegación por Defecto):
Ante cualquier ambigüedad, error de evaluación o ausencia de reglas que
autoricen la acción, el veredicto es estrictamente DENY.
"""

import logging
from dataclasses import dataclass
from typing import Any, Dict, List, Optional
from uuid import UUID

from sqlalchemy import and_, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enums import PolicyDecision, RuleEffect
from app.models.policy import Policy, PolicyRule

logger = logging.getLogger("agentguard.pdp")


@dataclass
class PDPDecisionResult:
    """Resultado formal inmutable emitido por el evaluador del PDP."""

    decision: PolicyDecision
    evaluated_policy_rule_id: Optional[UUID] = None
    reason: str = ""


class PDPEngine:
    """Motor determinista de evaluación de políticas y resolución de predicados JSONB."""

    @staticmethod
    def _evaluate_numeric_condition(param_val: Any, target_val: Any, op: str) -> bool:
        """Evalúa comparaciones numéricas de forma segura."""
        try:
            num_param = float(param_val)
            num_target = float(target_val)
        except (ValueError, TypeError):
            return False

        match op:
            case "lt":
                return num_param < num_target
            case "lte":
                return num_param <= num_target
            case "gt":
                return num_param > num_target
            case "gte":
                return num_param >= num_target
            case "eq":
                return num_param == num_target
            case _:
                return False

    @classmethod
    def matches_conditions(
        cls,
        conditions: Dict[str, Any],
        parameters: Dict[str, Any],
        context_extra: Optional[Dict[str, Any]] = None,
    ) -> bool:
        """Determina si los parámetros y contexto cumplen con todos los predicados JSONB.
        
        Si conditions es un diccionario vacío {}, la regla aplica incondicionalmente.
        Si alguna condición individual falla, el predicado completo retorna False.
        """
        if not conditions:
            return True

        ctx = {**parameters, **(context_extra or {})}

        for cond_key, cond_val in conditions.items():
            # 1. Reglas de monto / umbrales estándar (max_amount, min_amount)
            if cond_key in ("max_amount", "amount_max"):
                param_amount = ctx.get("amount")
                if param_amount is None or not cls._evaluate_numeric_condition(param_amount, cond_val, "lte"):
                    return False
                continue

            if cond_key in ("min_amount", "amount_min"):
                param_amount = ctx.get("amount")
                if param_amount is None or not cls._evaluate_numeric_condition(param_amount, cond_val, "gte"):
                    return False
                continue

            # 2. Operadores numéricos con sufijo (ej. amount_lt, price_gt, count_lte)
            for suffix, op in (
                ("_lt", "lt"),
                ("_lte", "lte"),
                ("_gt", "gt"),
                ("_gte", "gte"),
                ("_eq", "eq"),
            ):
                if cond_key.endswith(suffix):
                    base_key = cond_key[: -len(suffix)]
                    val = ctx.get(base_key)
                    if val is None or not cls._evaluate_numeric_condition(val, cond_val, op):
                        return False
                    break
            else:
                # 3. Listas y Pertenencia (allowed_destinations, allowed_roles, etc.)
                if cond_key in ("allowed_destinations", "destinations"):
                    dest = ctx.get("dest") or ctx.get("destination") or ctx.get("url")
                    if isinstance(cond_val, (list, tuple, set)):
                        if not dest or dest not in cond_val:
                            return False
                    elif dest != cond_val:
                        return False
                    continue

                if cond_key == "blocked_destinations":
                    dest = ctx.get("dest") or ctx.get("destination") or ctx.get("url")
                    if isinstance(cond_val, (list, tuple, set)):
                        if dest and dest in cond_val:
                            return False
                    elif dest == cond_val:
                        return False
                    continue

                # 4. Sufijos de pertenencia (_in, _not_in)
                if cond_key.endswith("_in") and not cond_key.endswith("_not_in"):
                    base_key = cond_key[:-3]
                    val = ctx.get(base_key)
                    if isinstance(cond_val, (list, tuple, set)):
                        if val not in cond_val:
                            return False
                    elif val != cond_val:
                        return False
                    continue

                if cond_key.endswith("_not_in"):
                    base_key = cond_key[:-7]
                    val = ctx.get(base_key)
                    if isinstance(cond_val, (list, tuple, set)):
                        if val in cond_val:
                            return False
                    elif val == cond_val:
                        return False
                    continue

                # 5. Comparación directa por clave exacta
                if cond_key in ctx:
                    val = ctx[cond_key]
                    if isinstance(cond_val, (list, tuple, set)):
                        if val not in cond_val:
                            return False
                    elif isinstance(cond_val, dict):
                        # Diccionario de sub-operadores ej: {"<": 100, ">=": 10}
                        for sub_op, target in cond_val.items():
                            op_name = {"<": "lt", "<=": "lte", ">": "gt", ">=": "gte", "==": "eq"}.get(sub_op)
                            if not op_name or not cls._evaluate_numeric_condition(val, target, op_name):
                                return False
                    elif val != cond_val:
                        return False
                else:
                    # La condición requiere un campo que no vino en el contexto
                    return False

        return True

    @classmethod
    async def evaluate(
        cls,
        db: AsyncSession,
        organization_id: UUID,
        agent_id: UUID,
        tool_action_id: UUID,
        delegator_user_id: Optional[UUID] = None,
        resource: Optional[str] = None,
        parameters: Optional[Dict[str, Any]] = None,
    ) -> PDPDecisionResult:
        """Evalúa la tupla de 5 dimensiones consultando las reglas activas en la BD.
        
        Aplica el Principio Fail-Closed: si no hay regla coincidente, devuelve DENY.
        """
        params = parameters or {}
        context_extra = {
            "resource": resource,
            "delegator_user_id": str(delegator_user_id) if delegator_user_id else None,
        }

        # 1. Consultar reglas activas para este tenant y acción
        stmt = (
            select(PolicyRule)
            .join(Policy, PolicyRule.policy_id == Policy.id)
            .where(
                and_(
                    Policy.organization_id == organization_id,
                    Policy.is_active == True,
                    PolicyRule.tool_action_id == tool_action_id,
                    or_(
                        PolicyRule.target_agent_id == agent_id,
                        PolicyRule.target_agent_id.is_(None),
                    ),
                )
            )
            .order_by(
                (PolicyRule.target_agent_id.isnot(None)).desc(),  # Reglas específicas del agente primero
                Policy.priority.desc(),
                PolicyRule.priority.desc(),
                PolicyRule.created_at.desc(),
            )
        )

        try:
            result = await db.execute(stmt)
            candidate_rules: List[PolicyRule] = list(result.scalars().all())
        except Exception as exc:
            logger.error("Error al consultar reglas de política en el PDP: %s", exc)
            return PDPDecisionResult(
                decision=PolicyDecision.DENY,
                reason="Error interno en consulta de políticas. Aplicando Fail-Closed (DENY).",
            )

        # 2. Evaluar reglas en orden de prioridad
        for rule in candidate_rules:
            if cls.matches_conditions(rule.conditions, params, context_extra):
                match rule.effect:
                    case RuleEffect.ALLOW:
                        return PDPDecisionResult(
                            decision=PolicyDecision.ALLOW,
                            evaluated_policy_rule_id=rule.id,
                            reason=f"Autorizado por regla ID {rule.id} (Prioridad {rule.priority})",
                        )
                    case RuleEffect.DENY:
                        return PDPDecisionResult(
                            decision=PolicyDecision.DENY,
                            evaluated_policy_rule_id=rule.id,
                            reason=f"Bloqueado deterministamente por regla ID {rule.id} (Efecto DENY)",
                        )
                    case RuleEffect.REQUIRE_APPROVAL:
                        return PDPDecisionResult(
                            decision=PolicyDecision.REQUIRE_APPROVAL,
                            evaluated_policy_rule_id=rule.id,
                            reason=f"Operación sensible detenida por regla ID {rule.id} (Requiere intervención humana)",
                        )

        # 3. Principio Fail-Closed: Sin regla que autorice explícitamente -> DENY
        return PDPDecisionResult(
            decision=PolicyDecision.DENY,
            evaluated_policy_rule_id=None,
            reason="Denegación por defecto (Fail-Closed): Ninguna política activa autoriza esta acción con los parámetros provistos",
        )


pdp_engine = PDPEngine()
