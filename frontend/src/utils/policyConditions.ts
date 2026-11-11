/**
 * Traducción de condiciones de política (JSONB) a lenguaje natural en español.
 *
 * El motor PDP evalúa condiciones estructuradas como { "amount": { "lte": 5000 } }.
 * La interfaz las muestra al usuario común como "Monto menor o igual a 5.000",
 * manteniendo intacto el contrato JSON que consume el backend.
 */

const FIELD_LABELS: Record<string, string> = {
  amount: 'monto',
  amount_usd: 'monto',
  monto: 'monto',
  max_amount: 'monto máximo',
  amount_limit: 'límite de monto',
  customer_id: 'cliente',
  customer: 'cliente',
  customer_email: 'correo del cliente',
  tool: 'herramienta',
  tool_id: 'herramienta',
  tool_name: 'herramienta',
  action: 'acción',
  action_name: 'acción',
  destination: 'destino',
  destination_url: 'destino',
  domain: 'dominio',
  country: 'país',
  currency: 'moneda',
  environment: 'entorno',
  risk: 'riesgo',
  risk_level: 'nivel de riesgo',
  hour: 'hora',
  day: 'día',
  user_role: 'rol del usuario',
  include_ssn: 'incluir datos sensibles',
  format: 'formato',
  auth_token: 'token de acceso',
  payload_b64: 'carga codificada',
  records: 'cantidad de registros',
  notes: 'notas',
  reason: 'motivo',
};

const OPERATOR_WORDS: Record<string, string> = {
  lte: 'menor o igual a',
  less_than_or_equal: 'menor o igual a',
  gte: 'mayor o igual a',
  greater_than_or_equal: 'mayor o igual a',
  lt: 'menor que',
  gt: 'mayor que',
  eq: 'igual a',
  equals: 'igual a',
  neq: 'distinto de',
  ne: 'distinto de',
  in: 'dentro de',
  nin: 'fuera de',
  contains: 'contiene',
  not_contains: 'no contiene',
  starts_with: 'empieza con',
  ends_with: 'termina con',
  between: 'entre',
  exists: 'existe',
};

/** Campos cuyo valor numérico representa dinero. */
const MONEY_FIELDS = new Set([
  'amount',
  'amount_usd',
  'monto',
  'max_amount',
  'amount_limit',
]);

/** Operadores cuyos operandos son listas de valores permitidos. */
const LIST_OPERATORS = new Set(['in', 'nin']);

function capitalize(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatField(field: string): string {
  const normalized = field.trim().toLowerCase();
  return FIELD_LABELS[normalized] || normalized.replace(/[_-]+/g, ' ');
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function formatNumber(value: number, isMoney: boolean): string {
  const formatted = value.toLocaleString('es-AR');
  return isMoney ? `$ ${formatted}` : formatted;
}

function lowerFirst(text: string): string {
  if (!text) return text;
  return text.charAt(0).toLowerCase() + text.slice(1);
}

function formatValue(value: unknown, isMoney: boolean = false): string {
  if (value === null || value === undefined) return 'sin valor';
  if (typeof value === 'boolean') return value ? 'sí' : 'no';
  if (typeof value === 'number') return formatNumber(value, isMoney);
  if (typeof value === 'string') {
    return value.trim() === '' ? 'vacío' : value.trim();
  }
  if (Array.isArray(value)) {
    return value.map((item) => formatValue(item, isMoney)).join(', ');
  }
  if (isPlainObject(value)) {
    const nested = Object.entries(value)
      .map(([key, nestedValue]) => `${formatField(key)} ${formatValue(nestedValue)}`)
      .join(' y ');
    return nested || 'sin valor';
  }
  return String(value);
}

function describeOperator(field: string, operator: string, operand: unknown): string {
  const fieldLabel = formatField(field);
  const operatorWord = OPERATOR_WORDS[operator.trim().toLowerCase()];
  const isMoney = MONEY_FIELDS.has(field.trim().toLowerCase());
  const isList = LIST_OPERATORS.has(operator.trim().toLowerCase());

  // Operador desconocido: se muestra tal cual para no inventar semántica.
  const word = operatorWord || operator.replace(/[_-]+/g, ' ');

  if (isList && Array.isArray(operand)) {
    const items = operand.map((item) => formatValue(item, isMoney)).join(', ');
    return `${capitalize(fieldLabel)} ${word} ${items}`;
  }

  if (operator.trim().toLowerCase() === 'between' && Array.isArray(operand) && operand.length === 2) {
    return `${capitalize(fieldLabel)} ${word} ${formatValue(operand[0], isMoney)} y ${formatValue(operand[1], isMoney)}`;
  }

  return `${capitalize(fieldLabel)} ${word} ${formatValue(operand, isMoney)}`;
}

function describeEntry(field: string, value: unknown): string {
  const fieldLabel = formatField(field);
  const isMoney = MONEY_FIELDS.has(field.trim().toLowerCase());

  if (isPlainObject(value)) {
    const nestedEntries = Object.entries(value);
    const areOperators =
      nestedEntries.length > 0 &&
      nestedEntries.every(([key]) => {
        const normalizedKey = key.trim().toLowerCase();
        return Boolean(OPERATOR_WORDS[normalizedKey]) || LIST_OPERATORS.has(normalizedKey);
      });

    if (areOperators) {
      return nestedEntries
        .map(([operator, operand]) => describeOperator(field, operator, operand))
        .join(' y ');
    }

    if (nestedEntries.length === 0) {
      return `${capitalize(fieldLabel)} sin condición definida`;
    }

    const nestedClauses = nestedEntries.map(([key, nestedValue]) =>
      lowerFirst(describeEntry(key, nestedValue))
    );
    return `${capitalize(fieldLabel)} con ${nestedClauses.join(' y ')}`;
  }

  if (Array.isArray(value)) {
    const items = value.map((item) => formatValue(item, isMoney)).join(', ');
    return `${capitalize(fieldLabel)} dentro de ${items}`;
  }

  if (typeof value === 'boolean') {
    return `${capitalize(fieldLabel)}: ${value ? 'sí' : 'no'}`;
  }

  return `${capitalize(fieldLabel)} igual a ${formatValue(value, isMoney)}`;
}

/**
 * Devuelve la descripción en español de un conjunto de condiciones.
 * Devuelve "Sin restricciones" cuando el objeto está vacío o no es válido.
 */
export function describeConditions(conditions: unknown): string {
  if (!isPlainObject(conditions)) return 'Sin restricciones';

  const entries = Object.entries(conditions);
  if (entries.length === 0) return 'Sin restricciones';

  const clauses = entries
    .map(([field, value]) => describeEntry(field, value))
    .filter(Boolean);

  return clauses.length > 0 ? clauses.join(' y ') : 'Sin restricciones';
}

export interface ConditionPreview {
  valid: boolean;
  text: string;
}

/**
 * Interpreta el texto JSON de un formulario y devuelve su lectura en español.
 * Nunca lanza excepción: informa si el JSON todavía no es válido.
 */
export function describeConditionJson(raw: string): ConditionPreview {
  const trimmed = (raw || '').trim();
  if (!trimmed) {
    return { valid: true, text: 'Sin restricciones' };
  }

  try {
    const parsed = JSON.parse(trimmed);
    return { valid: true, text: describeConditions(parsed) };
  } catch {
    return { valid: false, text: 'JSON incompleto: revisá llaves, comas y comillas.' };
  }
}
