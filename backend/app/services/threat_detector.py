"""Detector de Amenazas e Inyecciones de Prompt (OWASP Top 10 for Agentic Applications 2026).

Inspecciona en tiempo real las llamadas a herramientas interceptadas por el Gateway PEP
para detectar vectores de ataque comunes en aplicaciones de agentes de IA:
- ASI01: Agent Goal Hijacking / Direct Prompt Injection
- ASI03: Sensitive Data Exfiltration (Webhooks no autorizados / C2)
- ASI04: Context Evasion & Obfuscation (Base64 / Hidden Instructions)
- ASI05: Insecure Execution & Injection (Destructive SQL / Shell)
"""

import base64
import logging
import re
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple

logger = logging.getLogger("agentguard.threat_detector")

# Patrones Regex para Inyección de Prompt / Goal Hijacking (ASI01)
PROMPT_INJECTION_PATTERNS = [
    re.compile(r"(?i)ignore\s+(all\s+)?(previous|prior|above|existing)\s+(instructions|rules|guardrails|directions|commands|constraints)"),
    re.compile(r"(?i)(bypass|disable|override)\s+(all\s+)?(security|guardrails|pdp|policy|policies|authorization|limits|approval)"),
    re.compile(r"(?i)you\s+are\s+now\s+(in\s+)?(developer|god|unrestricted|debug|sudo|root|dan)\s+mode"),
    re.compile(r"(?i)do\s+anything\s+now\b"),
    re.compile(r"(?i)system\s+prompt\s+(override|leak|reveal|print)"),
    re.compile(r"(?i)disregard\s+(the\s+)?(guardrails|guidelines|policies)"),
]

# Dominios y patrones de Exfiltración de Datos no autorizados (ASI03)
UNTRUSTED_DESTINATIONS = [
    "attacker.io",
    "webhook.site",
    "requestbin",
    "pastebin.com",
    "ngrok.io",
    "ngrok-free.app",
    "pipedream.net",
    "burpcollaborator.net",
    "leak.external",
]

# Patrones de Inyección destructiva (ASI05)
DESTRUCTIVE_INJECTION_PATTERNS = [
    re.compile(r"(?i)\bDROP\s+TABLE\b"),
    re.compile(r"(?i)\bTRUNCATE\s+TABLE\b"),
    re.compile(r"(?i)\bDELETE\s+FROM\s+\w+\s*(WHERE\s+1\s*=\s*1|;|\Z)"),
    re.compile(r"(?i);\s*(SHUTDOWN|DROP|EXEC|xp_cmdshell)"),
    re.compile(r"(?i)\b(rm\s+-rf|del\s+/f|powershell\s+-enc)\b"),
]

# Regex para detección de Base64 potencial (mínimo 24 caracteres)
BASE64_CANDIDATE_REGEX = re.compile(r"^[A-Za-z0-9+/]{24,}={0,2}$")
BASE64_TOKEN_REGEX = re.compile(r"(?<![A-Za-z0-9+/])[A-Za-z0-9+/]{24,}={0,2}(?![A-Za-z0-9+/=])")



@dataclass
class ThreatAnalysisResult:
    """Resultado del análisis heurístico de amenazas del Gateway PEP."""
    is_threat: bool
    threat_type: Optional[str] = None
    owasp_category: Optional[str] = None
    attack_vector: Optional[str] = None
    confidence: float = 0.0
    matched_pattern: Optional[str] = None
    details: str = "Sin amenazas detectadas. Contexto seguro."
    decoded_payload: Optional[str] = None


class ThreatDetectorService:
    """Motor de detección contextual de inyecciones y vectores de ataque."""

    @classmethod
    def _check_string(cls, text: str) -> Optional[Tuple[str, str, str, str, float, Optional[str]]]:
        """Analiza una cadena individual en busca de patrones hostiles.
        
        Retorna (threat_type, owasp_category, attack_vector, matched_pattern, confidence, decoded_payload) o None.
        """
        # 1. Chequeo de Inyección de Prompt Directa (ASI01)
        for pattern in PROMPT_INJECTION_PATTERNS:
            match = pattern.search(text)
            if match:
                return (
                    "PROMPT_INJECTION",
                    "ASI01: Agent Goal Hijacking",
                    "Direct Prompt Injection (Guardrail Bypass)",
                    match.group(0),
                    0.95,
                    None,
                )

        # 2. Chequeo de Exfiltración a Destino Sospechoso (ASI03)
        text_lower = text.lower()
        for untrusted in UNTRUSTED_DESTINATIONS:
            if untrusted in text_lower:
                return (
                    "DATA_EXFILTRATION",
                    "ASI03: Sensitive Data Exfiltration",
                    f"Exfiltración hacia destino no autorizado '{untrusted}'",
                    untrusted,
                    0.99,
                    None,
                )

        # 3. Chequeo de Inyección Destructiva / Insecure Execution (ASI05)
        for pattern in DESTRUCTIVE_INJECTION_PATTERNS:
            match = pattern.search(text)
            if match:
                return (
                    "INSECURE_EXECUTION",
                    "ASI05: Insecure Execution & Command Injection",
                    "Inyección de comando destructivo / SQL Drop",
                    match.group(0),
                    0.98,
                    None,
                )

        # 4. Chequeo de Ofuscación Base64 (ASI04)
        clean_text = text.strip()
        candidates: List[str] = []
        if BASE64_CANDIDATE_REGEX.match(clean_text):
            candidates.append(clean_text)
        else:
            for match in BASE64_TOKEN_REGEX.finditer(clean_text):
                candidates.append(match.group(0))

        for cand in candidates:
            try:
                decoded_bytes = base64.b64decode(cand, validate=True)
                decoded_str = decoded_bytes.decode("utf-8", errors="ignore")
                if len(decoded_str) > 8:
                    # Recursivamente evaluar el texto decodificado
                    inner = cls._check_string(decoded_str)
                    if inner:
                        return (
                            "BASE64_OBFUSCATION",
                            "ASI04: Context Evasion & Obfuscation",
                            f"Payload Base64 Ofuscado detectado -> [{inner[2]}]",
                            inner[3],
                            0.99,
                            decoded_str,
                        )
            except Exception:
                pass

        return None

    @classmethod
    def _inspect_recursive(cls, data: Any) -> Optional[Tuple[str, str, str, str, float, Optional[str]]]:
        """Inspecciona recursivamente estructuras de datos."""
        if isinstance(data, str):
            return cls._check_string(data)
        elif isinstance(data, dict):
            for k, v in data.items():
                res_key = cls._check_string(str(k))
                if res_key:
                    return res_key
                res_val = cls._inspect_recursive(v)
                if res_val:
                    return res_val
        elif isinstance(data, (list, tuple, set)):
            for item in data:
                res = cls._inspect_recursive(item)
                if res:
                    return res
        return None

    @classmethod
    def analyze(
        cls,
        parameters: Dict[str, Any],
        resource: Optional[str] = None,
        action_name: Optional[str] = None,
    ) -> ThreatAnalysisResult:
        """Ejecuta el análisis completo de seguridad sobre los parámetros de invocación."""
        # Evaluar parámetros
        match_params = cls._inspect_recursive(parameters)
        if match_params:
            threat_type, owasp, vector, pattern, conf, decoded = match_params
            return ThreatAnalysisResult(
                is_threat=True,
                threat_type=threat_type,
                owasp_category=owasp,
                attack_vector=vector,
                confidence=conf,
                matched_pattern=pattern,
                details=f"Detectado vector de ataque hostil [{vector}]. Coincidencia con regla heurística: '{pattern}'.",
                decoded_payload=decoded,
            )

        # Evaluar recurso o URI
        if resource:
            match_res = cls._check_string(resource)
            if match_res:
                threat_type, owasp, vector, pattern, conf, decoded = match_res
                return ThreatAnalysisResult(
                    is_threat=True,
                    threat_type=threat_type,
                    owasp_category=owasp,
                    attack_vector=vector,
                    confidence=conf,
                    matched_pattern=pattern,
                    details=f"Detectado recurso no autorizado [{vector}].",
                    decoded_payload=decoded,
                )

        return ThreatAnalysisResult(is_threat=False)


threat_detector = ThreatDetectorService()
