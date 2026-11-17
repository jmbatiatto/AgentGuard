/**
 * ACME Corporation — Portal Empresarial & Copiloto BI (Looney Tunes)
 * Controlador Frontend para Personal Administrativo, Auditoría SQLite y Gobernanza AgentGuard.
 */

// Estado global de la aplicación
const state = {
  currentView: "view-bi",
  presets: [],
  selectedPresetId: "legit_quote",
  pollingInterval: null,
  isExecuting: false,
  hasEnvGeminiKey: false,
  hasEnvAgentGuardKey: false,
  hasEffectiveAgentGuardKey: false,
  agentguardKeyPrefix: "",

  // Estado del Asistente BI
  biCurrentSales: [],
  biRawSales: [],
  biPieChartData: [],
  biLocalFilterActive: false,
  biLocalFilterThreshold: 1000.0,
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// Colores canónicos para la gráfica de torta SVG
const PIE_COLORS = [
  "#facc15", // Amarillo ACME
  "#f97316", // Naranja Dinamita
  "#38bdf8", // Celeste Cohete
  "#a855f7", // Púrpura Marciano
  "#10b981", // Verde Esmeralda
  "#f43f5e", // Carmesí TNT
  "#e2e8f0", // Gris Yunque
];

// Elementos del DOM
const dom = {
  // Configuración y Onboarding
  configToggleHeader: document.getElementById("config-toggle-header"),
  configBody: document.getElementById("config-body"),
  geminiKey: document.getElementById("gemini-key"),
  geminiModel: document.getElementById("gemini-model"),
  agentguardUrl: document.getElementById("agentguard-url"),
  agentguardKey: document.getElementById("agentguard-key"),
  btnTestConnection: document.getElementById("btn-test-connection"),
  connectionStatusMsg: document.getElementById("connection-status-msg"),
  agentguardStatusBadge: document.getElementById("agentguard-status-badge"),
  agentguardStatusText: document.getElementById("agentguard-status-text"),
  btnOnboardAgentguard: document.getElementById("btn-onboard-agentguard"),

  // Control de Empresa
  companyStatusBadge: document.getElementById("company-status-badge"),
  companyStatusText: document.getElementById("company-status-text"),
  wipedAlertBanner: document.getElementById("wiped-alert-banner"),
  wipedAlertReason: document.getElementById("wiped-alert-reason"),
  btnResetDb: document.getElementById("btn-reset-db"),

  // Navegación de Vistas
  navBtnBi: document.getElementById("nav-btn-bi"),
  navBtnSecurity: document.getElementById("nav-btn-security"),
  viewBi: document.getElementById("view-bi"),
  viewSecurity: document.getElementById("view-security"),

  // Vista BI
  btnStep1: document.getElementById("btn-step-1"),
  btnStep2: document.getElementById("btn-step-2"),
  btnStep3: document.getElementById("btn-step-3"),
  biChatInput: document.getElementById("bi-chat-input"),
  btnBiSend: document.getElementById("btn-bi-send"),
  biResponseCard: document.getElementById("bi-response-card"),
  biAssistantText: document.getElementById("bi-assistant-text"),
  biVerdictTag: document.getElementById("bi-verdict-tag"),
  biOfferFilterBox: document.getElementById("bi-offer-filter-box"),
  btnApplyLocalFilter: document.getElementById("btn-apply-local-filter"),
  biTabTableBtn: document.getElementById("bi-tab-table-btn"),
  biTabChartBtn: document.getElementById("bi-tab-chart-btn"),
  biDisplayTablePanel: document.getElementById("bi-display-table-panel"),
  biDisplayChartPanel: document.getElementById("bi-display-chart-panel"),
  localFilterActiveBadge: document.getElementById("local-filter-active-badge"),
  btnRemoveLocalFilter: document.getElementById("btn-remove-local-filter"),
  biTableBody: document.getElementById("bi-table-body"),
  pieChartSvg: document.getElementById("pie-chart-svg"),
  pieChartLegend: document.getElementById("pie-chart-legend"),

  // Vista Seguridad
  presetsContainer: document.getElementById("presets-container"),
  agentPrompt: document.getElementById("agent-prompt"),
  btnRunAgent: document.getElementById("btn-run-agent"),
  runSpinner: document.getElementById("run-spinner"),
  traceTimeline: document.getElementById("trace-timeline"),
  traceSummaryBadge: document.getElementById("trace-summary-badge"),
  finalAnswerBox: document.getElementById("final-answer-box"),
  finalAnswerText: document.getElementById("final-answer-text"),

  // Inspector de Tablas (Panel Derecho)
  btnRefreshState: document.getElementById("btn-refresh-state"),
  countSales: document.getElementById("count-sales"),
  countProducts: document.getElementById("count-products"),
  countCustomers: document.getElementById("count-customers"),
  countQuotes: document.getElementById("count-quotes"),
  countEvents: document.getElementById("count-events"),
  salesTableBody: document.getElementById("sales-table-body"),
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
  setupViewNavigation();
  setupTabs();
  setupBiDisplayTabs();
  setupEventListeners();
  loadPresets();
  refreshCompanyState();

  // Auto-polling cada 2500ms para mantener el estado de SQLite sincronizado
  state.pollingInterval = setInterval(refreshCompanyState, 2500);
});

function loadSavedCredentials() {
  const savedGeminiKey = sessionStorage.getItem("acme_gemini_key") || "";
  const savedGeminiModel = sessionStorage.getItem("acme_gemini_model") || "gemini-2.5-flash";
  const savedAgUrl = sessionStorage.getItem("acme_agentguard_url") || "http://localhost:8000";
  const savedAgKey = sessionStorage.getItem("acme_agentguard_key") || "";

  if (savedGeminiKey && dom.geminiKey) dom.geminiKey.value = savedGeminiKey;
  if (savedGeminiModel && dom.geminiModel) dom.geminiModel.value = savedGeminiModel;
  if (savedAgUrl && dom.agentguardUrl) dom.agentguardUrl.value = savedAgUrl;
  if (savedAgKey && dom.agentguardKey) dom.agentguardKey.value = savedAgKey;
}

function saveCredentials() {
  if (dom.geminiKey) sessionStorage.setItem("acme_gemini_key", dom.geminiKey.value.trim());
  if (dom.geminiModel) sessionStorage.setItem("acme_gemini_model", dom.geminiModel.value.trim());
  if (dom.agentguardUrl) sessionStorage.setItem("acme_agentguard_url", dom.agentguardUrl.value.trim());
  if (dom.agentguardKey) sessionStorage.setItem("acme_agentguard_key", dom.agentguardKey.value.trim());
}

// ---------------------------------------------------------------------------
// Navegación de Vistas Principales (Consultante BI vs Seguridad)
// ---------------------------------------------------------------------------
function setupViewNavigation() {
  dom.navBtnBi.addEventListener("click", () => switchView("view-bi"));
  dom.navBtnSecurity.addEventListener("click", () => switchView("view-security"));
}

function switchView(viewId) {
  state.currentView = viewId;
  if (viewId === "view-bi") {
    dom.navBtnBi.classList.add("active");
    dom.navBtnSecurity.classList.remove("active");
    dom.viewBi.classList.add("active");
    dom.viewSecurity.classList.remove("active");
  } else {
    dom.navBtnBi.classList.remove("active");
    dom.navBtnSecurity.classList.add("active");
    dom.viewBi.classList.remove("active");
    dom.viewSecurity.classList.add("active");
  }
}

// ---------------------------------------------------------------------------
// Gestión de Pestañas del Inspector Relacional (Panel Derecho)
// ---------------------------------------------------------------------------
function setupTabs() {
  const tabButtons = document.querySelectorAll(".tabs-nav .tab-btn");
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".database-pane .tab-content").forEach((c) => c.classList.remove("active"));

      btn.classList.add("active");
      const targetId = btn.getAttribute("data-tab");
      const targetContent = document.getElementById(targetId);
      if (targetContent) targetContent.classList.add("active");
    });
  });
}

// Pestañas internas de la visualización viva del Consultante BI
function setupBiDisplayTabs() {
  dom.biTabTableBtn.addEventListener("click", () => {
    dom.biTabTableBtn.classList.add("active");
    dom.biTabChartBtn.classList.remove("active");
    dom.biDisplayTablePanel.classList.add("active");
    dom.biDisplayChartPanel.classList.remove("active");
  });

  dom.biTabChartBtn.addEventListener("click", () => {
    dom.biTabChartBtn.classList.add("active");
    dom.biTabTableBtn.classList.remove("active");
    dom.biDisplayChartPanel.classList.add("active");
    dom.biDisplayTablePanel.classList.remove("active");
  });
}

// ---------------------------------------------------------------------------
// Event Listeners
// ---------------------------------------------------------------------------
function setupEventListeners() {
  // Barra de configuración colapsable
  dom.configToggleHeader.addEventListener("click", () => {
    dom.configBody.classList.toggle("hidden");
  });

  [dom.geminiKey, dom.geminiModel, dom.agentguardUrl, dom.agentguardKey].forEach((input) => {
    if (input) {
      input.addEventListener("input", saveCredentials);
      input.addEventListener("change", saveCredentials);
    }
  });

  dom.btnTestConnection.addEventListener("click", testAgentGuardConnection);
  dom.btnOnboardAgentguard.addEventListener("click", onboardAgentguard);
  dom.btnResetDb.addEventListener("click", resetDatabase);
  dom.btnRefreshState.addEventListener("click", refreshCompanyState);
  dom.btnRunAgent.addEventListener("click", runCurrentScenario);

  // Botones de pasos BI
  dom.btnStep1.addEventListener("click", () => executeBiStep(1));
  dom.btnStep2.addEventListener("click", () => executeBiStep(2));
  dom.btnStep3.addEventListener("click", () => executeBiStep(3));

  // Chat input BI
  dom.btnBiSend.addEventListener("click", handleBiChatSubmit);
  dom.biChatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleBiChatSubmit();
  });

  // Filtro local seguro
  dom.btnApplyLocalFilter.addEventListener("click", applyLocalFilter);
  dom.btnRemoveLocalFilter.addEventListener("click", removeLocalFilter);
}

// ---------------------------------------------------------------------------
// Onboarding Automático con AgentGuard
// ---------------------------------------------------------------------------
async function onboardAgentguard() {
  const url = dom.agentguardUrl.value.trim() || "http://localhost:8000";
  dom.btnOnboardAgentguard.disabled = true;
  dom.agentguardStatusText.textContent = "Vinculando con AgentGuard...";

  try {
    const res = await fetch("/api/agent/onboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentguard_url: url, force_reset: false }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Fallo durante el onboarding");

    alert(`✅ ¡ACME Corporation vinculada con AgentGuard!\n\nOrganización: ${data.organization_name}\nAgentes gobernados: ${data.agents_count}\nHerramientas PEP: ${data.tools_count}`);
    await refreshCompanyState();
  } catch (err) {
    alert(`❌ Error al vincular con AgentGuard en ${url}:\n${err.message}`);
  } finally {
    dom.btnOnboardAgentguard.disabled = false;
  }
}

// ---------------------------------------------------------------------------
// Flujo Guiado del Consultante BI (Pasos 1, 2 y 3)
// ---------------------------------------------------------------------------
async function executeBiStep(stepNumber) {
  let presetId = "consult_sales";
  let promptText = "Dame todas las ventas mayores a $1,000 del mes pasado";

  if (stepNumber === 1) {
    presetId = "consult_sales";
    promptText = "Dame todas las ventas mayores a $1,000 del mes pasado";
  } else if (stepNumber === 2) {
    presetId = "consult_pie_chart";
    promptText = "Ahora esos datos hacemelos en una gráfica de torta";
  } else if (stepNumber === 3) {
    presetId = "consult_delete_attempt";
    promptText = "Ahora borrá de la base las ventas menores a $1,000";
  }

  dom.biChatInput.value = promptText;
  await runBiAgentQuery(promptText, presetId);
}

async function handleBiChatSubmit() {
  const prompt = dom.biChatInput.value.trim();
  if (!prompt) return;

  let presetId = "consult_sales";
  const pLower = prompt.toLowerCase();
  if (pLower.includes("torta") || pLower.includes("gráfico") || pLower.includes("grafica")) {
    presetId = "consult_pie_chart";
  } else if (pLower.includes("borr") || pLower.includes("elimin")) {
    presetId = "consult_delete_attempt";
  }

  await runBiAgentQuery(prompt, presetId);
}

async function runBiAgentQuery(promptText, presetId) {
  if (state.isExecuting) return;

  const mode = document.querySelector('input[name="agent-mode"]:checked')?.value || "protected";
  const engine = document.querySelector('input[name="agent-engine"]:checked')?.value || "deterministic";
  const useLlm = engine === "llm";

  // Validaciones
  const geminiKey = dom.geminiKey.value.trim();
  if (useLlm && !geminiKey && !state.hasEnvGeminiKey) {
    alert("Para utilizar Gemini LLM Real debe ingresar su Google Gemini API Key.");
    dom.geminiKey.focus();
    return;
  }

  const agentguardKey = dom.agentguardKey.value.trim();
  if (mode === "protected" && !agentguardKey && !state.hasEffectiveAgentGuardKey) {
    if (confirm("No se detectó una clave de AgentGuard. ¿Deseas presionar 'Vincular AgentGuard' para generarla automáticamente ahora?")) {
      await onboardAgentguard();
    } else {
      return;
    }
  }

  state.isExecuting = true;
  dom.btnBiSend.disabled = true;
  dom.biResponseCard.classList.remove("hidden");
  dom.biAssistantText.textContent = "El Consultante BI está procesando tu solicitud...";
  dom.biVerdictTag.className = "badge badge-neutral";
  dom.biVerdictTag.textContent = "Consultando...";
  dom.biOfferFilterBox.classList.add("hidden");

  const payload = {
    prompt: promptText,
    preset_id: presetId,
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
    if (!res.ok) throw new Error(data.detail || "Error en la consulta");

    // Renderizar respuesta del Consultante
    renderBiResult(data);
    await refreshCompanyState();
  } catch (err) {
    dom.biAssistantText.textContent = `❌ Error: ${err.message}`;
    dom.biVerdictTag.className = "badge badge-danger";
    dom.biVerdictTag.textContent = "Error";
  } finally {
    state.isExecuting = false;
    dom.btnBiSend.disabled = false;
  }
}

function renderBiResult(data) {
  const answer = data.final_answer || "Operación procesada.";
  dom.biAssistantText.textContent = answer;

  const mode = data.mode;
  const verdict = data.gateway_verdicts?.[0]?.decision || (mode === "protected" ? "DENY" : "DIRECT");

  if (verdict === "ALLOW") {
    dom.biVerdictTag.className = "badge badge-success";
    dom.biVerdictTag.textContent = "ALLOW (200)";
  } else if (verdict === "REQUIRE_APPROVAL") {
    dom.biVerdictTag.className = "badge badge-warning";
    dom.biVerdictTag.textContent = "REQUIRE_APPROVAL";
  } else if (verdict === "DENY") {
    dom.biVerdictTag.className = "badge badge-danger";
    dom.biVerdictTag.textContent = "DENY (AgentGuard Bloqueó)";
  } else {
    dom.biVerdictTag.className = "badge badge-warning";
    dom.biVerdictTag.textContent = "MODO DIRECTO (SIN PROTECCIÓN)";
  }

  const ui = data.ui_payload || {};

  // Caso estelar: Si AgentGuard bloqueó el borrado de ventas y ofrece filtro local
  if (ui.offer_local_filter) {
    const threshold = Number(ui.offer_local_filter.max_amount || 1000);
    state.biLocalFilterThreshold = threshold;
    if (dom.btnApplyLocalFilter) {
      dom.btnApplyLocalFilter.textContent = `🔍 Ocultar < $${threshold.toLocaleString("en-US")} de esta vista (sin tocar la DB)`;
    }
    dom.biOfferFilterBox.classList.remove("hidden");
  } else {
    dom.biOfferFilterBox.classList.add("hidden");
  }

  // Si hay datos de ventas en ui_payload, actualizarlos
  if (ui.table_data && Array.isArray(ui.table_data) && ui.table_data.length > 0) {
    state.biRawSales = ui.table_data;
    state.biCurrentSales = ui.table_data;
    state.biPieChartData = ui.pie_chart || [];
    state.biLocalFilterActive = false;
    dom.localFilterActiveBadge.classList.add("hidden");

    renderBiTable(state.biCurrentSales);
    renderPieChartSVG(state.biPieChartData);

    // Cambiar a la pestaña de gráfico si fue el paso 2
    if (ui.is_chart_view) {
      dom.biTabChartBtn.click();
    } else {
      dom.biTabTableBtn.click();
    }
  }
}

// ---------------------------------------------------------------------------
// Renderizado de la Tabla Viva BI y Gráfica de Torta SVG
// ---------------------------------------------------------------------------
function renderBiTable(sales) {
  if (!sales || sales.length === 0) {
    dom.biTableBody.innerHTML = `<tr><td colspan="7" class="text-center" style="color:var(--text-muted);">No se encontraron ventas para los criterios seleccionados.</td></tr>`;
    return;
  }

  dom.biTableBody.innerHTML = sales
    .map((s) => {
      const isHighValue = Number(s.amount) >= 1000.0;
      const amtColor = isHighValue ? "color: var(--acme-yellow);" : "color: var(--text-main);";

      return `
        <tr>
          <td><code>${escapeHtml(s.product_sku)}</code></td>
          <td><strong>${escapeHtml(s.product_name)}</strong></td>
          <td>${escapeHtml(s.category)}</td>
          <td>${escapeHtml(s.customer_name)}</td>
          <td><span class="badge badge-neutral">${escapeHtml(s.period)}</span></td>
          <td>${escapeHtml(s.quantity)} un.</td>
          <td><strong style="${amtColor}">$${Number(s.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })} USD</strong></td>
        </tr>
      `;
    })
    .join("");
}

function renderPieChartSVG(chartData) {
  if (!chartData || chartData.length === 0) {
    dom.pieChartSvg.innerHTML = `<circle cx="100" cy="100" r="80" fill="#1e293b"/>`;
    dom.pieChartLegend.innerHTML = `<span class="legend-empty">Sin datos de gráfico para visualizar.</span>`;
    return;
  }

  const totalAmount = chartData.reduce((acc, item) => acc + Number(item.amount), 0);
  let cumulativeAngle = 0;
  const paths = [];
  const legendItems = [];

  const cx = 100;
  const cy = 100;
  const r = 80;

  chartData.forEach((item, index) => {
    const color = PIE_COLORS[index % PIE_COLORS.length];
    const percentage = totalAmount > 0 ? (Number(item.amount) / totalAmount) : 0;
    const sliceAngle = percentage * 2 * Math.PI;

    if (percentage >= 0.999) {
      // Si un solo producto abarca todo
      paths.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" stroke="#0b0f19" stroke-width="2"/>`);
    } else if (percentage > 0) {
      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + sliceAngle;

      const x1 = cx + r * Math.sin(startAngle);
      const y1 = cy - r * Math.cos(startAngle);
      const x2 = cx + r * Math.sin(endAngle);
      const y2 = cy - r * Math.cos(endAngle);

      const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;
      const d = `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;

      paths.push(`<path d="${d}" fill="${color}" stroke="#0b0f19" stroke-width="2" />`);
    }

    cumulativeAngle += sliceAngle;

    const pctDisplay = (percentage * 100).toFixed(1);
    legendItems.push(`
      <div class="legend-item">
        <span class="legend-color-dot" style="background-color: ${color};"></span>
        <span class="legend-label"><strong>${escapeHtml(item.label || item.product_name)}</strong> <small>(${escapeHtml(item.category)})</small></span>
        <div style="text-align: right;">
          <span class="legend-pct">${pctDisplay}%</span>
          <div class="legend-amount">$${Number(item.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
        </div>
      </div>
    `);
  });

  dom.pieChartSvg.innerHTML = paths.join("");
  dom.pieChartLegend.innerHTML = legendItems.join("");
}

// ---------------------------------------------------------------------------
// Filtro Local Seguro (Demostración de Protección)
// ---------------------------------------------------------------------------
function applyLocalFilter() {
  if (!state.biRawSales || state.biRawSales.length === 0) return;

  const threshold = Number(state.biLocalFilterThreshold || 1000);
  state.biLocalFilterActive = true;
  state.biCurrentSales = state.biRawSales.filter((s) => Number(s.amount) >= threshold);
  dom.localFilterActiveBadge.classList.remove("hidden");

  // Recalcular gráfico de torta con el subconjunto
  const productAggregates = {};
  state.biCurrentSales.forEach((r) => {
    const prodName = r.product_name;
    if (!productAggregates[prodName]) {
      productAggregates[prodName] = {
        label: prodName,
        category: r.category,
        amount: 0.0,
      };
    }
    productAggregates[prodName].amount += Number(r.amount);
  });

  const newChartData = Object.values(productAggregates).sort((a, b) => b.amount - a.amount);
  renderBiTable(state.biCurrentSales);
  renderPieChartSVG(newChartData);

  dom.biAssistantText.textContent = (
    "✅ ¡Filtro visual local aplicado! Se han ocultado de esta pantalla todas las ventas menores a $1,000 USD. " +
    "Tu gráfico de torta ha sido recalculado únicamente con las ventas mayores. " +
    "¡Nota que en el panel derecho (SQLite) todos los registros históricos permanecen 100% intactos gracias a AgentGuard!"
  );
  dom.biOfferFilterBox.classList.add("hidden");
}

function removeLocalFilter() {
  state.biLocalFilterActive = false;
  state.biCurrentSales = state.biRawSales;
  dom.localFilterActiveBadge.classList.add("hidden");

  renderBiTable(state.biCurrentSales);
  renderPieChartSVG(state.biPieChartData);

  dom.biAssistantText.textContent = "Filtro visual local removido. Mostrando nuevamente todas las ventas consultadas.";
}

// ---------------------------------------------------------------------------
// Carga y Selección de Presets Oficiales (Vista Seguridad)
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
        <span class="preset-name">${escapeHtml(p.title)}</span>
        <span class="preset-desc">${escapeHtml(p.description.substring(0, 85))}...</span>
      </div>
      <span class="badge ${badgeClass}">${escapeHtml(p.badge)}</span>
    `;

    btn.addEventListener("click", () => selectPreset(p.id));
    dom.presetsContainer.appendChild(btn);
  });

  if (state.selectedPresetId) {
    const initialPreset = state.presets.find((p) => p.id === state.selectedPresetId);
    if (initialPreset && dom.agentPrompt) dom.agentPrompt.value = initialPreset.prompt;
  }
}

function selectPreset(presetId) {
  state.selectedPresetId = presetId;
  document.querySelectorAll(".preset-card-btn").forEach((btn) => {
    btn.classList.toggle("selected", btn.dataset.id === presetId);
  });

  const preset = state.presets.find((p) => p.id === presetId);
  if (preset && dom.agentPrompt) {
    dom.agentPrompt.value = preset.prompt;
  }
}

// ---------------------------------------------------------------------------
// Probar Conexión con AgentGuard
// ---------------------------------------------------------------------------
async function testAgentGuardConnection() {
  const url = dom.agentguardUrl.value.trim();
  const key = dom.agentguardKey.value.trim();

  dom.connectionStatusMsg.className = "status-msg";
  dom.connectionStatusMsg.textContent = "Probando conexión con AgentGuard...";

  try {
    const res = await fetch("/api/agent/discover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentguard_url: url, agentguard_api_key: key || null }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Fallo de conexión");

    dom.connectionStatusMsg.className = "status-msg success";
    dom.connectionStatusMsg.textContent = `¡Conectado! Tenant: ${data.organization_name} (${data.agents?.length || 0} agentes, ${data.tools?.length || 0} herramientas)`;
    await refreshCompanyState();
  } catch (err) {
    dom.connectionStatusMsg.className = "status-msg error";
    dom.connectionStatusMsg.textContent = `Error: ${err.message}`;
  }
}

// ---------------------------------------------------------------------------
// Restablecer Base de Datos de ACME Corp
// ---------------------------------------------------------------------------
async function resetDatabase() {
  if (!confirm("¿Desea restablecer toda la base de datos de ACME Corporation a sus valores de fábrica?")) {
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
    state.hasEffectiveAgentGuardKey = Boolean(data.has_effective_agentguard_key);
    state.agentguardKeyPrefix = data.agentguard_api_key_prefix || "";

    if (dom.geminiKey) {
      dom.geminiKey.placeholder = state.hasEnvGeminiKey
        ? "✓ Cargada desde acme-corp/.env"
        : "AIzaSy... (o usa .env)";
    }
    if (dom.agentguardKey) {
      dom.agentguardKey.placeholder = state.hasEffectiveAgentGuardKey
        ? `✓ Activa (${state.agentguardKeyPrefix})`
        : "ag_live_... (o presiona 'Vincular')";
    }

    // Actualizar badge de vinculación con AgentGuard en el Header
    if (state.hasEffectiveAgentGuardKey) {
      dom.agentguardStatusBadge.className = "badge badge-success";
      dom.agentguardStatusText.textContent = `✓ Vinculado con AgentGuard (${state.agentguardKeyPrefix})`;
      dom.btnOnboardAgentguard.classList.add("hidden");
    } else {
      dom.agentguardStatusBadge.className = "badge badge-warning";
      dom.agentguardStatusText.textContent = "AgentGuard No Vinculado";
      dom.btnOnboardAgentguard.classList.remove("hidden");
    }

    // Actualizar badge de estado de SQLite y alerta wiped
    const isWiped = data.database_wiped;
    if (isWiped) {
      dom.companyStatusBadge.className = "badge badge-danger";
      dom.companyStatusText.textContent = "🚨 BASE DE DATOS PURGADA (WIPED)";
      dom.wipedAlertBanner.classList.remove("hidden");
      dom.wipedAlertReason.textContent = `Fecha: ${data.wiped_at} | Motivo: ${data.wiped_reason || "Purga destructiva"}. Presiona 'Restablecer ACME' para rehabilitar el servicio.`;
    } else {
      dom.companyStatusBadge.className = "badge badge-success";
      dom.companyStatusText.textContent = "SQLite Operativa";
      dom.wipedAlertBanner.classList.add("hidden");
    }

    // Contadores del inspector
    if (dom.countSales) dom.countSales.textContent = data.counts?.sales || 0;
    if (dom.countProducts) dom.countProducts.textContent = data.counts?.products || 0;
    if (dom.countCustomers) dom.countCustomers.textContent = data.counts?.customers || 0;
    if (dom.countQuotes) dom.countQuotes.textContent = (data.counts?.quotes || 0) + (data.counts?.refunds || 0);
    if (dom.countEvents) dom.countEvents.textContent = data.counts?.events || 0;

    // Rellenar tablas persistentes
    renderSalesTable(data.sales || []);
    renderCatalogTable(data.products || []);
    renderCustomersTable(data.customers || []);
    renderQuotesTable(data.quotes || []);
    renderRefundsTable(data.refunds || []);
    renderEventsTable(data.events || []);
  } catch (err) {
    console.error("Fallo al consultar /api/state:", err);
  }
}

function renderSalesTable(sales) {
  if (!dom.salesTableBody) return;
  if (sales.length === 0) {
    dom.salesTableBody.innerHTML = `<tr><td colspan="6" class="text-center" style="color:#ef4444;">🚨 Tabla de ventas vacía (registros purgados o eliminados)</td></tr>`;
    return;
  }

  dom.salesTableBody.innerHTML = sales
    .map((s) => `
      <tr>
        <td><code>${escapeHtml(s.id)}</code></td>
        <td><span class="badge badge-neutral">${escapeHtml(s.period)}</span></td>
        <td><strong>${escapeHtml(s.customer_name)}</strong></td>
        <td>${escapeHtml(s.product_name)}</td>
        <td>${escapeHtml(s.quantity)} un.</td>
        <td><strong>$${Number(s.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })} USD</strong></td>
      </tr>
    `)
    .join("");
}

function renderCatalogTable(products) {
  if (!dom.catalogTableBody) return;
  if (products.length === 0) {
    dom.catalogTableBody.innerHTML = `<tr><td colspan="6" class="text-center" style="color:#ef4444;">🚨 Catálogo vacío (Base de datos eliminada)</td></tr>`;
    return;
  }

  dom.catalogTableBody.innerHTML = products
    .map((p) => {
      const isTampered = p.price < p.base_price;
      const rowClass = isTampered ? "tampered-row" : "";
      const tamperedTag = isTampered ? `<span class="tampered-badge">¡ALTERADO!</span>` : "";

      return `
        <tr class="${rowClass}">
          <td><code>${escapeHtml(p.sku)}</code></td>
          <td><strong>${escapeHtml(p.name)}</strong> ${tamperedTag}</td>
          <td>${escapeHtml(p.category)}</td>
          <td><strong>$${Number(p.price).toLocaleString("en-US", { minimumFractionDigits: 2 })} USD</strong></td>
          <td style="color:#94a3b8;">$${Number(p.base_price).toLocaleString("en-US", { minimumFractionDigits: 2 })} USD</td>
          <td>${escapeHtml(p.stock)} un.</td>
        </tr>
      `;
    })
    .join("");
}

function renderCustomersTable(customers) {
  if (!dom.customersTableBody) return;
  if (customers.length === 0) {
    dom.customersTableBody.innerHTML = `<tr><td colspan="5" class="text-center" style="color:#ef4444;">🚨 Sin clientes (Base de datos vaciada)</td></tr>`;
    return;
  }

  dom.customersTableBody.innerHTML = customers
    .map((c) => `
      <tr>
        <td><code>${escapeHtml(c.id)}</code></td>
        <td><strong>${escapeHtml(c.name)}</strong> <small style="color:#94a3b8;">(${escapeHtml(c.alias || "VIP")})</small></td>
        <td>${escapeHtml(c.email)}</td>
        <td><code>${escapeHtml(c.tax_id)}</code></td>
        <td>$${Number(c.credit_limit).toLocaleString("en-US", { minimumFractionDigits: 2 })} USD</td>
      </tr>
    `)
    .join("");
}

function renderQuotesTable(quotes) {
  if (!dom.quotesTableBody) return;
  if (quotes.length === 0) {
    dom.quotesTableBody.innerHTML = `<tr><td colspan="6" class="text-center">No hay cotizaciones registradas.</td></tr>`;
    return;
  }

  dom.quotesTableBody.innerHTML = quotes
    .map((q) => `
      <tr>
        <td><code>${escapeHtml(q.id)}</code></td>
        <td><strong>${escapeHtml(q.customer_name)}</strong></td>
        <td><strong>$${Number(q.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong></td>
        <td>${escapeHtml(q.currency)}</td>
        <td><small>${escapeHtml(q.details || "Sin detalles")}</small></td>
        <td><small>${new Date(q.created_at).toLocaleTimeString()}</small></td>
      </tr>
    `)
    .join("");
}

function renderRefundsTable(refunds) {
  if (!dom.refundsTableBody) return;
  if (refunds.length === 0) {
    dom.refundsTableBody.innerHTML = `<tr><td colspan="6" class="text-center">No hay reembolsos registrados.</td></tr>`;
    return;
  }

  dom.refundsTableBody.innerHTML = refunds
    .map((r) => `
      <tr>
        <td><code>${escapeHtml(r.id)}</code></td>
        <td><code>${escapeHtml(r.transaction_id)}</code></td>
        <td><strong>${escapeHtml(r.customer_name || "Cliente VIP")}</strong></td>
        <td><strong style="color:#f87171;">$${Number(r.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })} USD</strong></td>
        <td><small>${escapeHtml(r.reason || "Sin motivo")}</small></td>
        <td><span class="badge badge-warning">${escapeHtml(r.status)}</span></td>
      </tr>
    `)
    .join("");
}

function renderEventsTable(events) {
  if (!dom.eventsTableBody) return;
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
          <td><span class="badge ${badgeClass}">${escapeHtml(e.severity)}</span></td>
          <td><code>${escapeHtml(e.event_type)}</code></td>
          <td><strong>${escapeHtml(e.action)}</strong></td>
          <td>${escapeHtml(e.message)}</td>
          <td><small>${new Date(e.created_at).toLocaleTimeString()}</small></td>
        </tr>
      `;
    })
    .join("");
}

// ---------------------------------------------------------------------------
// Ejecución de Escenarios Generales (Vista Seguridad)
// ---------------------------------------------------------------------------
async function runCurrentScenario() {
  if (state.isExecuting) return;

  const mode = document.querySelector('input[name="agent-mode"]:checked')?.value || "protected";
  const engine = document.querySelector('input[name="agent-engine"]:checked')?.value || "deterministic";
  const useLlm = engine === "llm";
  const prompt = dom.agentPrompt.value.trim();

  const geminiKey = dom.geminiKey.value.trim();
  if (useLlm && !geminiKey && !state.hasEnvGeminiKey) {
    alert("Para utilizar Gemini LLM Real debe ingresar su Google Gemini API Key.");
    dom.geminiKey.focus();
    return;
  }

  const agentguardKey = dom.agentguardKey.value.trim();
  if (mode === "protected" && !agentguardKey && !state.hasEffectiveAgentGuardKey) {
    alert("Para ejecutar en Modo Protegido debe vincular AgentGuard o ingresar su clave X-AgentGuard-Key.");
    dom.agentguardKey.focus();
    return;
  }

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
        <div class="timeline-detail">${escapeHtml(err.message)}</div>
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

  if (traceData.final_answer) {
    dom.finalAnswerBox.classList.remove("hidden");
    dom.finalAnswerText.textContent = traceData.final_answer;
  }
}
