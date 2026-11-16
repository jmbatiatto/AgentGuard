/**
 * ACME Corporation — Controlador Frontend del Laboratorio Autónomo Looney Tunes
 * Maneja la interacción en tiempo real, auto-polling de SQLite, ejecución de presets y trazas de decisión.
 */

// Estado global de la aplicación web
const state = {
  presets: [],
  selectedPresetId: "legit_quote",
  pollingInterval: null,
  isExecuting: false,
  hasEnvGeminiKey: false,
  hasEnvAgentGuardKey: false,
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// Elementos del DOM
const dom = {
  // Credenciales
  geminiKey: document.getElementById("gemini-key"),
  geminiModel: document.getElementById("gemini-model"),
  agentguardUrl: document.getElementById("agentguard-url"),
  agentguardKey: document.getElementById("agentguard-key"),
  btnTestConnection: document.getElementById("btn-test-connection"),
  connectionStatusMsg: document.getElementById("connection-status-msg"),

  // Control de Empresa
  companyStatusBadge: document.getElementById("company-status-badge"),
  companyStatusText: document.getElementById("company-status-text"),
  wipedAlertBanner: document.getElementById("wiped-alert-banner"),
  wipedAlertReason: document.getElementById("wiped-alert-reason"),
  btnResetDb: document.getElementById("btn-reset-db"),

  // Ejecución
  presetsContainer: document.getElementById("presets-container"),
  agentPrompt: document.getElementById("agent-prompt"),
  btnRunAgent: document.getElementById("btn-run-agent"),
  runSpinner: document.getElementById("run-spinner"),
  traceTimeline: document.getElementById("trace-timeline"),
  traceSummaryBadge: document.getElementById("trace-summary-badge"),
  finalAnswerBox: document.getElementById("final-answer-box"),
  finalAnswerText: document.getElementById("final-answer-text"),

  // Inspector de Tablas
  btnRefreshState: document.getElementById("btn-refresh-state"),
  countProducts: document.getElementById("count-products"),
  countCustomers: document.getElementById("count-customers"),
  countQuotes: document.getElementById("count-quotes"),
  countEvents: document.getElementById("count-events"),
  catalogTableBody: document.getElementById("catalog-table-body"),
  customersTableBody: document.getElementById("customers-table-body"),
  quotesTableBody: document.getElementById("quotes-table-body"),
  refundsTableBody: document.getElementById("refunds-table-body"),
  eventsTableBody: document.getElementById("events-table-body"),
};

// ---------------------------------------------------------------------------
// Inicialización y Carga de Preferencias Locales
// ---------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  loadSavedCredentials();
  setupTabs();
  setupEventListeners();
  loadPresets();
  refreshCompanyState();

  // Auto-polling cada 2500ms para mantener el estado de la DB sincronizado
  state.pollingInterval = setInterval(refreshCompanyState, 2500);
});

function loadSavedCredentials() {
  const savedGeminiKey = sessionStorage.getItem("acme_gemini_key") || "";
  const savedGeminiModel = sessionStorage.getItem("acme_gemini_model") || "gemini-2.5-flash";
  const savedAgUrl = sessionStorage.getItem("acme_agentguard_url") || "http://localhost:8000";
  const savedAgKey = sessionStorage.getItem("acme_agentguard_key") || "";

  if (savedGeminiKey) dom.geminiKey.value = savedGeminiKey;
  if (savedGeminiModel) dom.geminiModel.value = savedGeminiModel;
  if (savedAgUrl) dom.agentguardUrl.value = savedAgUrl;
  if (savedAgKey) dom.agentguardKey.value = savedAgKey;
}

function saveCredentials() {
  sessionStorage.setItem("acme_gemini_key", dom.geminiKey.value.trim());
  sessionStorage.setItem("acme_gemini_model", dom.geminiModel.value.trim());
  sessionStorage.setItem("acme_agentguard_url", dom.agentguardUrl.value.trim());
  sessionStorage.setItem("acme_agentguard_key", dom.agentguardKey.value.trim());
}

// ---------------------------------------------------------------------------
// Gestión de Pestañas
// ---------------------------------------------------------------------------
function setupTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));

      btn.classList.add("active");
      const targetId = btn.getAttribute("data-tab");
      const targetContent = document.getElementById(targetId);
      if (targetContent) targetContent.classList.add("active");
    });
  });
}

// ---------------------------------------------------------------------------
// Event Listeners
// ---------------------------------------------------------------------------
function setupEventListeners() {
  [dom.geminiKey, dom.geminiModel, dom.agentguardUrl, dom.agentguardKey].forEach((input) => {
    input.addEventListener("input", saveCredentials);
    input.addEventListener("change", saveCredentials);
  });

  dom.btnTestConnection.addEventListener("click", testAgentGuardConnection);
  dom.btnResetDb.addEventListener("click", resetDatabase);
  dom.btnRefreshState.addEventListener("click", refreshCompanyState);
  dom.btnRunAgent.addEventListener("click", runCurrentScenario);
}

// ---------------------------------------------------------------------------
// Carga y Selección de Presets Looney Tunes
// ---------------------------------------------------------------------------
async function loadPresets() {
  try {
    const res = await fetch("/api/agent/presets");
    if (!res.ok) throw new Error("No se pudieron cargar los presets");
    state.presets = await res.json();
    renderPresets();
  } catch (err) {
    console.error("Error al cargar presets:", err);
  }
}

function renderPresets() {
  dom.presetsContainer.innerHTML = "";
  state.presets.forEach((p) => {
    const btn = document.createElement("button");
    btn.className = `preset-card-btn ${p.id === state.selectedPresetId ? "selected" : ""}`;
    btn.dataset.id = p.id;

    let badgeClass = "badge-neutral";
    if (p.expected_protected_decision === "ALLOW") badgeClass = "badge-success";
    else if (p.expected_protected_decision === "REQUIRE_APPROVAL") badgeClass = "badge-warning";
    else if (p.expected_protected_decision === "DENY") badgeClass = "badge-danger";

    btn.innerHTML = `
      <div class="preset-info">
        <span class="preset-name">${p.title}</span>
        <span class="preset-desc">${p.description.substring(0, 85)}...</span>
      </div>
      <span class="badge ${badgeClass}">${p.badge}</span>
    `;

    btn.addEventListener("click", () => selectPreset(p.id));
    dom.presetsContainer.appendChild(btn);
  });

  // Autocompletar prompt del preset inicial
  if (state.selectedPresetId) {
    const initialPreset = state.presets.find((p) => p.id === state.selectedPresetId);
    if (initialPreset) dom.agentPrompt.value = initialPreset.prompt;
  }
}

function selectPreset(presetId) {
  state.selectedPresetId = presetId;
  document.querySelectorAll(".preset-card-btn").forEach((btn) => {
    btn.classList.toggle("selected", btn.dataset.id === presetId);
  });

  const preset = state.presets.find((p) => p.id === presetId);
  if (preset) {
    dom.agentPrompt.value = preset.prompt;
  }
}

// ---------------------------------------------------------------------------
// Probar Conexión con AgentGuard
// ---------------------------------------------------------------------------
async function testAgentGuardConnection() {
  const url = dom.agentguardUrl.value.trim();
  const key = dom.agentguardKey.value.trim();

  if (!key && !state.hasEnvAgentGuardKey) {
    dom.connectionStatusMsg.className = "status-msg error";
    dom.connectionStatusMsg.textContent = "Ingrese la clave X-AgentGuard-Key";
    return;
  }

  dom.connectionStatusMsg.className = "status-msg";
  dom.connectionStatusMsg.textContent = "Probando conexión...";

  try {
    const res = await fetch("/api/agent/discover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentguard_url: url, agentguard_api_key: key || null }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Fallo de conexión");

    dom.connectionStatusMsg.className = "status-msg success";
    dom.connectionStatusMsg.textContent = `¡Conectado! Org: ${data.organization_name} (${data.agents?.length || 0} agentes, ${data.tools?.length || 0} herramientas)`;
  } catch (err) {
    dom.connectionStatusMsg.className = "status-msg error";
    dom.connectionStatusMsg.textContent = `Error: ${err.message}`;
  }
}

// ---------------------------------------------------------------------------
// Restablecer Base de Datos de ACME Corp
// ---------------------------------------------------------------------------
async function resetDatabase() {
  if (!confirm("¿Desea restablecer toda la base de datos de ACME Corporation a sus valores iniciales?")) {
    return;
  }

  try {
    const res = await fetch("/api/reset", { method: "POST" });
    if (!res.ok) throw new Error("Fallo al restablecer base de datos");
    const data = await res.json();
    alert(`✅ ${data.message}`);
    await refreshCompanyState();
  } catch (err) {
    alert(`❌ Error: ${err.message}`);
  }
}

// ---------------------------------------------------------------------------
// Actualización del Estado de la Base de Datos (Inspector de SQLite)
// ---------------------------------------------------------------------------
async function refreshCompanyState() {
  try {
    const res = await fetch("/api/state");
    if (!res.ok) return;
    const data = await res.json();

    state.hasEnvGeminiKey = Boolean(data.has_env_gemini_key);
    state.hasEnvAgentGuardKey = Boolean(data.has_env_agentguard_key);
    dom.geminiKey.placeholder = state.hasEnvGeminiKey
      ? "✓ Cargada desde acme-corp/.env (o pegá otra)"
      : "AIzaSy...";
    dom.agentguardKey.placeholder = state.hasEnvAgentGuardKey
      ? "✓ Cargada desde acme-corp/.env (o pegá otra)"
      : "ag_live_...";

    // Actualizar badge de estado de la empresa y alerta wiped
    const isWiped = data.database_wiped;
    if (isWiped) {
      dom.companyStatusBadge.className = "badge badge-danger";
      dom.companyStatusText.textContent = "🚨 BASE DE DATOS PURGADA (WIPED)";
      dom.wipedAlertBanner.classList.remove("hidden");
      dom.wipedAlertReason.textContent = `Fecha: ${data.wiped_at} | Motivo: ${data.wiped_reason || "Purga destructiva"}. Presiona 'Restablecer ACME Corp' para rehabilitar el servicio.`;
    } else {
      dom.companyStatusBadge.className = "badge badge-success";
      dom.companyStatusText.textContent = "Base de Datos Operativa";
      dom.wipedAlertBanner.classList.add("hidden");
    }

    // Contadores
    dom.countProducts.textContent = data.counts?.products || 0;
    dom.countCustomers.textContent = data.counts?.customers || 0;
    dom.countQuotes.textContent = (data.counts?.quotes || 0) + (data.counts?.refunds || 0);
    dom.countEvents.textContent = data.counts?.events || 0;

    // Rellenar tablas
    renderCatalogTable(data.products || []);
    renderCustomersTable(data.customers || []);
    renderQuotesTable(data.quotes || []);
    renderRefundsTable(data.refunds || []);
    renderEventsTable(data.events || []);
  } catch (err) {
    console.error("Fallo al consultar /api/state:", err);
  }
}

function renderCatalogTable(products) {
  if (products.length === 0) {
    dom.catalogTableBody.innerHTML = `<tr><td colspan="6" class="text-center" style="color:#ef4444;">🚨 Catálogo vacío (Base de datos eliminada o sin registros)</td></tr>`;
    return;
  }

  dom.catalogTableBody.innerHTML = products
    .map((p) => {
      const isTampered = p.price < p.base_price;
      const rowClass = isTampered ? "tampered-row" : "";
      const tamperedTag = isTampered ? `<span class="tampered-badge">¡ALTERADO!</span>` : "";

      return `
        <tr class="${rowClass}">
          <td><code>${p.sku}</code></td>
          <td><strong>${p.name}</strong> ${tamperedTag}</td>
          <td>${p.category}</td>
          <td><strong>$${Number(p.price).toLocaleString("en-US", { minimumFractionDigits: 2 })} USD</strong></td>
          <td style="color:#94a3b8;">$${Number(p.base_price).toLocaleString("en-US", { minimumFractionDigits: 2 })} USD</td>
          <td>${p.stock} un.</td>
        </tr>
      `;
    })
    .join("");
}

function renderCustomersTable(customers) {
  if (customers.length === 0) {
    dom.customersTableBody.innerHTML = `<tr><td colspan="5" class="text-center" style="color:#ef4444;">🚨 Sin clientes (Base de datos vaciada)</td></tr>`;
    return;
  }

  dom.customersTableBody.innerHTML = customers
    .map(
      (c) => `
      <tr>
        <td><code>${c.id}</code></td>
        <td><strong>${c.name}</strong> <small style="color:#94a3b8;">(${c.alias || "VIP"})</small></td>
        <td>${c.email}</td>
        <td><code>${c.tax_id}</code></td>
        <td>$${Number(c.credit_limit).toLocaleString("en-US", { minimumFractionDigits: 2 })} USD</td>
      </tr>
    `
    )
    .join("");
}

function renderQuotesTable(quotes) {
  if (quotes.length === 0) {
    dom.quotesTableBody.innerHTML = `<tr><td colspan="6" class="text-center">No hay cotizaciones registradas.</td></tr>`;
    return;
  }

  dom.quotesTableBody.innerHTML = quotes
    .map(
      (q) => `
      <tr>
        <td><code>${q.id}</code></td>
        <td><strong>${q.customer_name}</strong></td>
        <td><strong>$${Number(q.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong></td>
        <td>${q.currency}</td>
        <td><small>${q.details || "Sin detalles"}</small></td>
        <td><small>${new Date(q.created_at).toLocaleTimeString()}</small></td>
      </tr>
    `
    )
    .join("");
}

function renderRefundsTable(refunds) {
  if (refunds.length === 0) {
    dom.refundsTableBody.innerHTML = `<tr><td colspan="6" class="text-center">No hay reembolsos registrados.</td></tr>`;
    return;
  }

  dom.refundsTableBody.innerHTML = refunds
    .map(
      (r) => `
      <tr>
        <td><code>${r.id}</code></td>
        <td><code>${r.transaction_id}</code></td>
        <td><strong>${r.customer_name || "Cliente VIP"}</strong></td>
        <td><strong style="color:#f87171;">$${Number(r.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })} USD</strong></td>
        <td><small>${r.reason || "Sin motivo"}</small></td>
        <td><span class="badge badge-warning">${r.status}</span></td>
      </tr>
    `
    )
    .join("");
}

function renderEventsTable(events) {
  if (events.length === 0) {
    dom.eventsTableBody.innerHTML = `<tr><td colspan="5" class="text-center">No hay eventos registrados.</td></tr>`;
    return;
  }

  dom.eventsTableBody.innerHTML = events
    .map((e) => {
      let badgeClass = "badge-neutral";
      if (e.severity === "CRITICAL") badgeClass = "badge-danger";
      else if (e.severity === "HIGH") badgeClass = "badge-warning";
      else if (e.severity === "INFO") badgeClass = "badge-success";

      return `
        <tr>
          <td><span class="badge ${badgeClass}">${e.severity}</span></td>
          <td><code>${e.event_type}</code></td>
          <td><strong>${e.action}</strong></td>
          <td>${e.message}</td>
          <td><small>${new Date(e.created_at).toLocaleTimeString()}</small></td>
        </tr>
      `;
    })
    .join("");
}

// ---------------------------------------------------------------------------
// Ejecución de Escenarios y Renderizado de Traza
// ---------------------------------------------------------------------------
async function runCurrentScenario() {
  if (state.isExecuting) return;

  const mode = document.querySelector('input[name="agent-mode"]:checked')?.value || "protected";
  const engine = document.querySelector('input[name="agent-engine"]:checked')?.value || "deterministic";
  const useLlm = engine === "llm";
  const prompt = dom.agentPrompt.value.trim();

  // Validaciones (respetando claves ya definidas en acme-corp/.env)
  const geminiKey = dom.geminiKey.value.trim();
  if (useLlm && !geminiKey && !state.hasEnvGeminiKey) {
    alert("Para utilizar Gemini LLM Real debe ingresar su Google Gemini API Key.");
    dom.geminiKey.focus();
    return;
  }

  const agentguardKey = dom.agentguardKey.value.trim();
  if (mode === "protected" && !agentguardKey && !state.hasEnvAgentGuardKey) {
    alert("Para ejecutar en Modo Protegido debe ingresar su X-AgentGuard-Key.");
    dom.agentguardKey.focus();
    return;
  }

  // Activar UI de carga
  state.isExecuting = true;
  dom.btnRunAgent.disabled = true;
  dom.runSpinner.classList.remove("hidden");
  dom.traceSummaryBadge.className = "badge badge-neutral";
  dom.traceSummaryBadge.textContent = "Procesando...";
  dom.traceTimeline.innerHTML = `<div class="empty-state">Iniciando ciclo deliberativo del agente...</div>`;
  dom.finalAnswerBox.classList.add("hidden");

  const payload = {
    prompt: prompt,
    preset_id: state.selectedPresetId,
    mode: mode,
    use_llm: useLlm,
    gemini_api_key: geminiKey || null,
    gemini_model: dom.geminiModel.value,
    agentguard_url: dom.agentguardUrl.value.trim(),
    agentguard_api_key: agentguardKey || null,
  };

  try {
    const res = await fetch("/api/agent/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Fallo en la ejecución");

    renderTrace(data);
    await refreshCompanyState();
  } catch (err) {
    dom.traceTimeline.innerHTML = `
      <div class="timeline-item danger">
        <div class="timeline-header">
          <span>❌ Error de Ejecución</span>
        </div>
        <div class="timeline-detail">${err.message}</div>
      </div>
    `;
    dom.traceSummaryBadge.className = "badge badge-danger";
    dom.traceSummaryBadge.textContent = "Error";
  } finally {
    state.isExecuting = false;
    dom.btnRunAgent.disabled = false;
    dom.runSpinner.classList.add("hidden");
  }
}

function renderTrace(traceData) {
  const steps = traceData.steps || [];
  dom.traceTimeline.innerHTML = "";

  steps.forEach((s) => {
    const item = document.createElement("div");
    item.className = `timeline-item ${s.status || "info"}`;

    item.innerHTML = `
      <div class="timeline-header">
        <span>[Paso ${escapeHtml(s.step)}] ${escapeHtml(s.title)}</span>
      </div>
      <div class="timeline-detail">${escapeHtml(s.detail)}</div>
    `;
    dom.traceTimeline.appendChild(item);
  });

  // Badge de veredicto
  if (traceData.mode === "protected") {
    const verdicts = traceData.gateway_verdicts || [];
    const mainVerdict = verdicts[0]?.decision || "UNKNOWN";

    if (mainVerdict === "ALLOW") {
      dom.traceSummaryBadge.className = "badge badge-success";
      dom.traceSummaryBadge.textContent = "ALLOW (200 OK)";
    } else if (mainVerdict === "REQUIRE_APPROVAL") {
      dom.traceSummaryBadge.className = "badge badge-warning";
      dom.traceSummaryBadge.textContent = "REQUIRE_APPROVAL (202)";
    } else {
      dom.traceSummaryBadge.className = "badge badge-danger";
      dom.traceSummaryBadge.textContent = "DENY (403)";
    }
  } else {
    dom.traceSummaryBadge.className = "badge badge-danger";
    dom.traceSummaryBadge.textContent = "MODO DIRECTO (SIN PROTECCIÓN)";
  }

  // Respuesta Final
  if (traceData.final_answer) {
    dom.finalAnswerBox.classList.remove("hidden");
    dom.finalAnswerText.textContent = traceData.final_answer;
  }
}
