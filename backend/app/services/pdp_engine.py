"""Motor de Decisión de Políticas (PDP - Policy Decision Point).

Implementa la función de evaluación determinista de 5 dimensiones:
Decisión = f(Principal, Delegator, Action, Resource, Context)

Cumple con el principio de seguridad Fail-Closed (Denegación por Defecto):
Ante cualquier ambigüedad, error de evaluación o ausencia de reglas que
autoricen la acción, el veredicto es estrictamente DENY.
Incluye soporte para caché volátil L2 en Redis 7 (sub-5ms) y operadores extendidos
(neq, contains, allowed_hours, allowed_roles).
"""

from datetime import datetime, timezone
import logging
from dataclasses import dataclass
from typing import Any, Dict, List, Optional
from uuid import UUID

from sqlalchemy import and_, or_, select, case
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.policy_cache import policy_cache
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
            case "neq":
                return num_param != num_target
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

            # 2. Control de horario operativo (allowed_hours)
            if cond_key == "allowed_hours":
                now_hour = datetime.now(timezone.utc).hour
                if isinstance(cond_val, dict):
                    start = cond_val.get("start", 0)
                    end = cond_val.get("end", 24)
                    if not (start <= now_hour < end):
                        return False
                elif isinstance(cond_val, (list, tuple)) and len(cond_val) >= 2:
                    if not (cond_val[0] <= now_hour < cond_val[1]):
                        return False
                continue

            # 3. Restricción por rol de delegador (allowed_roles)
            if cond_key == "allowed_roles":
                delegator_role = ctx.get("delegator_role")
                if isinstance(cond_val, (list, tuple, set)):
                    if not delegator_role or delegator_role not in cond_val:
                        return False
                elif delegator_role != cond_val:
                    return False
                continue

            # 4. Operadores numéricos y de igualdad con sufijo
            handled_suffix = False
            for suffix, op in (
                ("_lt", "lt"),
                ("_lte", "lte"),
                ("_gt", "gt"),
                ("_gte", "gte"),
                ("_eq", "eq"),
                ("_neq", "neq"),
            ):
                if cond_key.endswith(suffix):
                    base_key = cond_key[: -len(suffix)]
                    val = ctx.get(base_key)
                    if val is None or not cls._evaluate_numeric_condition(val, cond_val, op):
                        return False
                    handled_suffix = True
                    break
            if handled_suffix:
                continue

            # 5. Operador contains con sufijo
            if cond_key.endswith("_contains"):
                base_key = cond_key[:-9]
                val = ctx.get(base_key)
                if val is None:
                    return False
                if isinstance(val, (list, tuple, set)):
                    if cond_val not in val:
                        return False
                elif str(cond_val).lower() not in str(val).lower():
                    return False
                continue

            # 6. Listas y Pertenencia (allowed_destinations, etc.)
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

            # 7. Sufijos de pertenencia (_in, _not_in)
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

            # 8. Comparación directa por clave exacta
            if cond_key in ctx:
                val = ctx[cond_key]
                if isinstance(cond_val, (list, tuple, set)):
                    if val not in cond_val:
                        return False
                elif isinstance(cond_val, dict):
                    # Diccionario de sub-operadores ej: {"<": 100, "!=": "DEV", "contains": "prod"}
                    for sub_op, target in cond_val.items():
                        op_str = str(sub_op).lower()
                        if op_str in ("!=", "neq"):
                            if str(val) == str(target):
                                return False
                        elif op_str == "contains":
                            if str(target).lower() not in str(val).lower():
                                return False
                        else:
                            op_name = {
                                "<": "lt",
                                "<=": "lte",
                                ">": "gt",
                                ">=": "gte",
                                "==": "eq",
                                "eq": "eq",
                                "lt": "lt",
                                "lte": "lte",
                                "gt": "gt",
                                "gte": "gte",
                            }.get(op_str)
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
        delegator_role: Optional[str] = None,
        resource: Optional[str] = None,
        parameters: Optional[Dict[str, Any]] = None,
    ) -> PDPDecisionResult:
        """Evalúa la tupla de 5 dimensiones consultando las reglas activas (con caché L2 Redis).
        
        Aplica el Principio Fail-Closed: si no hay regla coincidente, devuelve DENY.
        """
        params = parameters or {}
        context_extra = {
            "resource": resource,
            "delegator_user_id": str(delegator_user_id) if delegator_user_id else None,
            "delegator_role": delegator_role,
        }

        # 1. Intentar resolver reglas desde caché Redis L2
        candidate_rules: List[Dict[str, Any]] = []
        cached = await policy_cache.get_rules(organization_id, tool_action_id)
        if cached is not None:
            candidate_rules = cached
        else:
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
                    (PolicyRule.target_agent_id.isnot(None)).desc(),
                    Policy.priority.desc(),
                    PolicyRule.priority.desc(),
                    case(
                        (PolicyRule.effect == RuleEffect.DENY, 1),
                        (PolicyRule.effect == RuleEffect.REQUIRE_APPROVAL, 2),
                        else_=3,
                    ).asc(),
                    PolicyRule.created_at.desc(),
                )
            )

            try:
                result = await db.execute(stmt)
                db_rules: List[PolicyRule] = list(result.scalars().all())
                # Serializar para evaluación y almacenamiento en Redis
                candidate_rules = [
                    {
                        "id": str(r.id),
                        "priority": r.priority,
                        "effect": r.effect.value,
                        "conditions": r.conditions,
                        "target_agent_id": str(r.target_agent_id) if r.target_agent_id else None,
                    }
                    for r in db_rules
                ]
                await policy_cache.set_rules(organization_id, tool_action_id, candidate_rules)
            except Exception as exc:
                logger.error("Error al consultar reglas de política en el PDP: %s", exc)
                return PDPDecisionResult(
                    decision=PolicyDecision.DENY,
                    reason="Error interno en consulta de políticas. Aplicando Fail-Closed (DENY).",
                )

        # 2. Evaluar reglas en orden estricto de precedencia
        for rule in candidate_rules:
            # Si la regla está acotada a un agente específico y no coincide, omitir
            rule_agent = rule.get("target_agent_id")
            if rule_agent and rule_agent != str(agent_id):
                continue

            conditions = rule.get("conditions", {})
            if cls.matches_conditions(conditions, params, context_extra):
                effect_str = rule.get("effect")
                rule_id = UUID(rule["id"])
                rule_priority = rule.get("priority", 100)
                match effect_str:
                    case RuleEffect.ALLOW | "ALLOW":
                        return PDPDecisionResult(
                            decision=PolicyDecision.ALLOW,
                            evaluated_policy_rule_id=rule_id,
                            reason=f"Autorizado por regla ID {rule_id} (Prioridad {rule_priority})",
                        )
                    case RuleEffect.DENY | "DENY":
                        return PDPDecisionResult(
                            decision=PolicyDecision.DENY,
                            evaluated_policy_rule_id=rule_id,
                            reason=f"Bloqueado deterministamente por regla ID {rule_id} (Efecto DENY)",
                        )
                    case RuleEffect.REQUIRE_APPROVAL | "REQUIRE_APPROVAL":
                        return PDPDecisionResult(
                            decision=PolicyDecision.REQUIRE_APPROVAL,
                            evaluated_policy_rule_id=rule_id,
                            reason=f"Operación sensible detenida por regla ID {rule_id} (Requiere intervención humana)",
                        )

        # 3. Principio Fail-Closed: Sin regla que autorice explícitamente -> DENY
        return PDPDecisionResult(
            decision=PolicyDecision.DENY,
            evaluated_policy_rule_id=None,
            reason="Denegación por defecto (Fail-Closed): Ninguna política activa autoriza esta acción con los parámetros provistos",
        )


pdp_engine = PDPEngine()
