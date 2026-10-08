import xml.etree.ElementTree as ET
import xml.dom.minidom as minidom
import html

# Script to generate AgentGuard MER v2.0 in Draw.io (.drawio / .xml), Mermaid (.mmd), PlantUML (.puml), and SQL DDL (.sql)

def build_drawio_xml():
    mxfile = ET.Element("mxfile", host="app.diagrams.net", modified="2026-09-14T11:20:00.000Z", agent="AgentGuard-Generator", version="24.7.5", type="device")
    diagram = ET.SubElement(mxfile, "diagram", id="agentguard-mer-v2", name="AgentGuard MER v2.0")
    graph_model = ET.SubElement(diagram, "mxGraphModel", 
                               dx="1800", dy="1200", grid="1", gridSize="10", guides="1", tooltips="1", 
                               connect="1", arrows="1", fold="1", page="1", pageScale="1", 
                               pageWidth="1920", pageHeight="1200", background="#F8FAFC", math="0", shadow="0")
    root = ET.SubElement(graph_model, "root")
    
    # Base cells
    ET.SubElement(root, "mxCell", id="0")
    ET.SubElement(root, "mxCell", id="1", parent="0")

    # Helper to add styled card cell
    def add_card(cell_id, title, icon, color_hdr, color_bg, color_border, attributes, x, y, w, h):
        hdr_html = f'<div style="background-color: {color_hdr}; color: #FFFFFF; padding: 6px 10px; font-weight: bold; border-top-left-radius: 6px; border-top-right-radius: 6px; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; display: flex; align-items: center;">{icon} &nbsp;{title}</div>'
        
        attr_lines = []
        for attr in attributes:
            # check if bold pk/fk
            formatted = attr.replace('(PK, UUID)', '<span style="color:#64748B;">(PK, UUID)</span>') \
                            .replace('(FK)', '<span style="color:#64748B;">(FK)</span>') \
                            .replace('(PK)', '<span style="color:#64748B;">(PK)</span>') \
                            .replace('(String)', '<span style="color:#94A3B8;">(String)</span>') \
                            .replace('(Timestamp)', '<span style="color:#94A3B8;">(Timestamp)</span>') \
                            .replace('(Text)', '<span style="color:#94A3B8;">(Text)</span>') \
                            .replace('(Boolean)', '<span style="color:#94A3B8;">(Boolean)</span>') \
                            .replace('(Integer)', '<span style="color:#94A3B8;">(Integer)</span>') \
                            .replace('(JSONB)', '<span style="color:#94A3B8;">(JSONB)</span>') \
                            .replace('(JSONB, Nullable)', '<span style="color:#94A3B8;">(JSONB, Nullable)</span>') \
                            .replace('(Timestamp, Nullable)', '<span style="color:#94A3B8;">(Timestamp, Nullable)</span>')
            
            # Highlight first word (attribute name) in bold
            parts = formatted.split(' ', 1)
            if len(parts) == 2:
                formatted = f'<b>{parts[0]}</b> {parts[1]}'
            else:
                formatted = f'<b>{formatted}</b>'
            attr_lines.append(f'&bull; {formatted}')
        
        body_html = f'<div style="padding: 8px 10px; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; font-size: 11px; text-align: left; color: #1E293B; line-height: 1.4;">' + '<br/>'.join(attr_lines) + '</div>'
        
        val = f'{hdr_html}{body_html}'
        style = f"rounded=1;arcSize=8;whiteSpace=wrap;html=1;fillColor={color_bg};strokeColor={color_border};strokeWidth=1.5;verticalAlign=top;align=left;spacing=0;overflow=hidden;shadow=1;"
        
        cell = ET.SubElement(root, "mxCell", id=cell_id, value=val, style=style, vertex="1", parent="1")
        ET.SubElement(cell, "mxGeometry", x=str(x), y=str(y), width=str(w), height=str(h), **{"as": "geometry"})

    # Helper for simple text box
    def add_textbox(cell_id, text_html, style, x, y, w, h):
        cell = ET.SubElement(root, "mxCell", id=cell_id, value=text_html, style=style, vertex="1", parent="1")
        ET.SubElement(cell, "mxGeometry", x=str(x), y=str(y), width=str(w), height=str(h), **{"as": "geometry"})

    # Helper for connector
    def add_edge(edge_id, src_id, tgt_id, src_label="", tgt_label="", edge_color="#64748B", style_extra=""):
        style = f"edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;strokeColor={edge_color};strokeWidth=1.5;fontSize=11;fontStyle=1;fontColor=#1E293B;endArrow=none;{style_extra}"
        cell = ET.SubElement(root, "mxCell", id=edge_id, value="", style=style, edge="1", source=src_id, target=tgt_id, parent="1")
        geo = ET.SubElement(cell, "mxGeometry", relative="1", **{"as": "geometry"})
        
        if src_label:
            src_cell = ET.SubElement(root, "mxCell", id=f"{edge_id}_src", value=src_label, style="text;html=1;resizable=0;points=[];align=center;verticalAlign=middle;labelBackgroundColor=none;fontSize=11;fontStyle=1;fontColor=#475569;", vertex="1", connectable="0", parent=edge_id)
            ET.SubElement(src_cell, "mxGeometry", x="-0.8", relative="1", **{"as": "geometry"})
        if tgt_label:
            tgt_cell = ET.SubElement(root, "mxCell", id=f"{edge_id}_tgt", value=tgt_label, style="text;html=1;resizable=0;points=[];align=center;verticalAlign=middle;labelBackgroundColor=none;fontSize=11;fontStyle=1;fontColor=#475569;", vertex="1", connectable="0", parent=edge_id)
            ET.SubElement(tgt_cell, "mxGeometry", x="0.8", relative="1", **{"as": "geometry"})

    # --- TOP HEADER BANNER ---
    header_logo_html = '<div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif;">' \
                       '<div style="display: flex; align-items: center; gap: 8px;">' \
                       '<span style="font-size: 26px; font-weight: 800; color: #0F172A; letter-spacing: -0.5px;">🛡️ AgentGuard</span>' \
                       '</div>' \
                       '<div style="font-size: 13px; font-weight: 600; color: #2563EB; margin-top: 2px;">Runtime Authorization & Governance for AI Agents</div>' \
                       '<div style="font-size: 11px; color: #64748B; margin-top: 1px;">Modelo Entidad-Relación (MER) - Versión Mejorada v2.0</div>' \
                       '</div>'
    add_textbox("hdr_title", header_logo_html, "text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;whiteSpace=wrap;", 40, 20, 480, 70)

    # Multi-tenant box (Top Right)
    multi_tenant_html = '<div style="display: flex; align-items: flex-start; gap: 8px; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif;">' \
                        '<div style="font-size: 20px;">🏢</div>' \
                        '<div>' \
                        '<div style="font-weight: 700; font-size: 12px; color: #1E3A8A;">Arquitectura Multi-Tenant</div>' \
                        '<div style="font-size: 10.5px; color: #3B82F6; line-height: 1.35; margin-top: 2px;">Cada organización (tenant) tiene sus propios usuarios, agentes, herramientas, políticas, ejecuciones y auditoría, aislados entre sí.</div>' \
                        '</div>' \
                        '</div>'
    add_textbox("multi_tenant_box", multi_tenant_html, "rounded=1;arcSize=10;whiteSpace=wrap;html=1;fillColor=#EFF6FF;strokeColor=#BFDBFE;strokeWidth=1;align=left;verticalAlign=middle;padding=10;shadow=0;", 1420, 20, 440, 65)

    # --- ENTITIES DEFINITION (12 TABLES) ---
    
    # 1. Organization (Tenant Root)
    add_card("ent_org", "Organization", "🏢", "#5E35B1", "#EDE7F6", "#5E35B1", [
        "id (PK, UUID)",
        "name (String)",
        "created_at (Timestamp)"
    ], 580, 75, 230, 95)

    # 2. User
    add_card("ent_user", "User", "👤", "#0288D1", "#E1F5FE", "#0288D1", [
        "id (PK, UUID)",
        "organization_id (FK)",
        "email (String)",
        "role (Enum: ADMIN, OPERATOR, APPROVER)",
        "created_at (Timestamp)"
    ], 40, 160, 245, 135)

    # 3. Agent
    add_card("ent_agent", "Agent", "🤖", "#2E7D32", "#E8F5E9", "#2E7D32", [
        "id (PK, UUID)",
        "organization_id (FK)",
        "owner_user_id (FK)",
        "name (String)",
        "purpose (Text)",
        "status (Enum: ACTIVE, SUSPENDED, REVOKED)",
        "created_at (Timestamp)"
    ], 330, 160, 255, 165)

    # 4. Tool
    add_card("ent_tool", "Tool", "🔧", "#00838F", "#E0F7FA", "#00838F", [
        "id (PK, UUID)",
        "organization_id (FK)",
        "name (String)",
        "protocol (String: REST)",
        "endpoint_url (String)",
        "description (Text)",
        "created_at (Timestamp)"
    ], 980, 160, 240, 165)

    # 5. ToolAction
    add_card("ent_tool_action", "ToolAction", "⚙️", "#D97706", "#FEF3C7", "#D97706", [
        "id (PK, UUID)",
        "tool_id (FK)",
        "action_name (String)",
        "risk_level (Enum: LOW, MEDIUM, HIGH, CRITICAL)",
        "description (Text)",
        "created_at (Timestamp)"
    ], 1280, 160, 260, 150)

    # 6. Policy
    add_card("ent_policy", "Policy", "🛡️", "#D32F2F", "#FFEBEE", "#D32F2F", [
        "id (PK, UUID)",
        "organization_id (FK)",
        "name (String)",
        "description (Text)",
        "priority (Integer)",
        "is_active (Boolean)",
        "created_at (Timestamp)"
    ], 680, 175, 235, 160)

    # 7. AgentTool (Intermediary N:N)
    add_card("ent_agent_tool", "AgentTool", "🔗", "#EA580C", "#FFEDD5", "#EA580C", [
        "id (PK, UUID)",
        "agent_id (FK)",
        "tool_id (FK)",
        "enabled (Boolean)",
        "config (JSONB, Nullable)",
        "created_at (Timestamp)"
    ], 330, 395, 230, 145)

    # 8. PolicyRule
    add_card("ent_policy_rule", "PolicyRule", "📋", "#512DA8", "#EDE7F6", "#512DA8", [
        "id (PK, UUID)",
        "policy_id (FK)",
        "priority (Integer)",
        "effect (Enum: ALLOW, DENY, REQUIRE_APPROVAL)",
        "tool_action_id (FK)",
        "target_agent_id (FK, Nullable)",
        "conditions (JSONB)",
        "created_at (Timestamp)"
    ], 680, 395, 260, 175)

    # 9. Execution
    add_card("ent_execution", "Execution", "▶️", "#0F766E", "#CCFBF1", "#0F766E", [
        "id (PK, UUID)",
        "organization_id (FK)",
        "agent_id (FK)",
        "delegator_user_id (FK, Nullable)",
        "tool_id (FK)",
        "tool_action_id (FK)",
        "resource (String)",
        "request_context (JSONB)",
        "decision (Enum: ALLOW, DENY, REQUIRE_APPROVAL)",
        "status (Enum: PENDING_APPROVAL, REJECTED, EXECUTED)",
        "evaluated_policy_rule_id (FK, Nullable)",
        "timestamp (Timestamp)"
    ], 1000, 370, 275, 235)

    # 10. Approval
    add_card("ent_approval", "Approval", "✅", "#BE185D", "#FCE7F3", "#BE185D", [
        "id (PK, UUID)",
        "execution_id (FK)",
        "assigned_approver_id (FK, Nullable)",
        "status (Enum: PENDING, APPROVED, REJECTED, EXPIRED)",
        "resolution_reason (Text)",
        "resolved_at (Timestamp, Nullable)"
    ], 1340, 335, 265, 145)

    # 11. Alert
    add_card("ent_alert", "Alert", "⚠️", "#7E22CE", "#F3E8FF", "#7E22CE", [
        "id (PK, UUID)",
        "organization_id (FK)",
        "execution_id (FK, Nullable)",
        "alert_type (Enum)",
        "severity (Enum: LOW, MEDIUM, HIGH, CRITICAL)",
        "status (Enum: OPEN, INVESTIGATING, RESOLVED, DISMISSED)",
        "resolved_by_user_id (FK, Nullable)",
        "resolved_at (Timestamp, Nullable)",
        "created_at (Timestamp)"
    ], 1340, 505, 265, 175)

    # 12. AuditEvent
    add_card("ent_audit_event", "AuditEvent", "📜", "#334155", "#F1F5F9", "#334155", [
        "id (PK, UUID)",
        "organization_id (FK)",
        "actor_type (Enum: USER, AGENT, SYSTEM)",
        "actor_id (UUID)",
        "event_type (String)",
        "metadata (JSONB)",
        "timestamp (Timestamp)"
    ], 1340, 705, 265, 145)

    # --- RELATIONSHIP CONNECTORS ---
    # Org to User (1:N)
    add_edge("edge_org_user", "ent_org", "ent_user", "1", "N")
    # Org to Agent (1:N)
    add_edge("edge_org_agent", "ent_org", "ent_agent", "1", "N")
    # Org to Policy (1:N)
    add_edge("edge_org_policy", "ent_org", "ent_policy", "1", "N")
    # Org to Tool (1:N)
    add_edge("edge_org_tool", "ent_org", "ent_tool", "1", "N")
    # Agent to AgentTool (1:N)
    add_edge("edge_agent_agenttool", "ent_agent", "ent_agent_tool", "1", "N")
    # Tool to ToolAction (1:N)
    add_edge("edge_tool_toolaction", "ent_tool", "ent_tool_action", "1", "N")
    # Tool to AgentTool (1:N)
    add_edge("edge_tool_agenttool", "ent_tool", "ent_agent_tool", "1", "N")
    # Policy to PolicyRule (1:N)
    add_edge("edge_policy_policyrule", "ent_policy", "ent_policy_rule", "1", "N")
    # ToolAction to PolicyRule (1:N)
    add_edge("edge_toolaction_policyrule", "ent_tool_action", "ent_policy_rule", "1", "N")
    # PolicyRule to Execution
    add_edge("edge_policyrule_execution", "ent_policy_rule", "ent_execution", "1", "N")
    # Execution to Approval (1:0..1)
    add_edge("edge_execution_approval", "ent_execution", "ent_approval", "1", "0..1")
    # Execution to Alert (1:N)
    add_edge("edge_execution_alert", "ent_execution", "ent_alert", "1", "N")
    # Execution to AuditEvent (1:N)
    add_edge("edge_execution_audit", "ent_execution", "ent_audit_event", "1", "N")
    # Tool to Execution (1:N)
    add_edge("edge_tool_execution", "ent_tool", "ent_execution", "1", "N")

    # --- BOTTOM SECTION: SUMMARY CARDS & CORRECTIONS ---
    
    # Title "Entidades y atributos"
    add_textbox("title_entities_summary", 
                '<div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif; font-size: 15px; font-weight: 700; color: #0F172A; background-color: #0F172A; color: white; padding: 6px 14px; border-radius: 4px; display: inline-block;">Entidades y atributos</div>', 
                "text;html=1;strokeColor=none;fillColor=none;align=left;", 40, 660, 240, 35)

    # Mini cards summarizing entities
    mini_cards = [
        ("mini_org", "Organization (Empresa / Tenant)", "🏢", "#5E35B1", "#EDE7F6", ["id (PK, UUID)", "name (String)", "created_at (Timestamp)"], 40, 710, 220, 110),
        ("mini_user", "User (Usuario Humano)", "👤", "#0288D1", "#E1F5FE", ["id (PK, UUID)", "organization_id (FK)", "email (String)", "role (Enum: ADMIN, OPERATOR, APPROVER)", "created_at (Timestamp)"], 280, 710, 230, 110),
        ("mini_agent", "Agent (Agente de IA)", "🤖", "#2E7D32", "#E8F5E9", ["id (PK, UUID)", "organization_id (FK)", "owner_user_id (FK)", "name (String)", "purpose (Text)", "status (Enum: ACTIVE, SUSPENDED, REVOKED)", "created_at (Timestamp)"], 530, 710, 220, 110),
        ("mini_agent_tool", "AgentTool (Acceso a Herramientas)", "🔗", "#EA580C", "#FFEDD5", ["id (PK, UUID)", "agent_id (FK)", "tool_id (FK)", "enabled (Boolean)", "config (JSONB, Nullable)", "created_at (Timestamp)"], 770, 710, 220, 110),
        
        ("mini_tool", "Tool (Herramienta Externa)", "🔧", "#00838F", "#E0F7FA", ["id (PK, UUID)", "organization_id (FK)", "name (String)", "protocol (String: REST)", "endpoint_url (String)", "description (Text)", "created_at (Timestamp)"], 40, 835, 220, 110),
        ("mini_tool_action", "ToolAction (Acción de Herramienta)", "⚙️", "#D97706", "#FEF3C7", ["id (PK, UUID)", "tool_id (FK)", "action_name (String)", "risk_level (Enum)", "description (Text)", "created_at (Timestamp)"], 280, 835, 230, 110),
        ("mini_policy", "Policy (Política)", "🛡️", "#D32F2F", "#FFEBEE", ["id (PK, UUID)", "organization_id (FK)", "name (String)", "description (Text)", "priority (Integer)", "is_active (Boolean)", "created_at (Timestamp)"], 530, 835, 220, 110),
        ("mini_policy_rule", "PolicyRule (Regla de Autorización)", "📋", "#512DA8", "#EDE7F6", ["id (PK, UUID)", "policy_id (FK)", "priority (Integer)", "effect (Enum)", "tool_action_id (FK)", "target_agent_id (FK, Nullable)", "conditions (JSONB)"], 770, 835, 220, 110),

        ("mini_exec", "Execution (Solicitud en Tiempo Real)", "▶️", "#0F766E", "#CCFBF1", ["id (PK, UUID)", "organization_id (FK)", "agent_id (FK)", "tool_action_id (FK)", "resource (String)", "decision (Enum)", "status (Enum)", "timestamp (Timestamp)"], 40, 960, 220, 110),
        ("mini_appr", "Approval (Aprobación Humana)", "✅", "#BE185D", "#FCE7F3", ["id (PK, UUID)", "execution_id (FK)", "assigned_approver_id (FK, Nullable)", "status (Enum)", "resolution_reason (Text)", "resolved_at (Timestamp, Nullable)"], 280, 960, 230, 110),
        ("mini_alert", "Alert (Incidente de Seguridad)", "⚠️", "#7E22CE", "#F3E8FF", ["id (PK, UUID)", "organization_id (FK)", "execution_id (FK, Nullable)", "severity (Enum)", "status (Enum)", "resolved_by_user_id (FK, Nullable)"], 530, 960, 220, 110),
        ("mini_audit", "AuditEvent (Trazabilidad)", "📜", "#334155", "#F1F5F9", ["id (PK, UUID)", "organization_id (FK)", "actor_type (Enum)", "actor_id (UUID)", "event_type (String)", "metadata (JSONB)", "timestamp (Timestamp)"], 770, 960, 220, 110),
    ]

    for cid, ctitle, cicon, chdr, cbg, cattrs, cx, cy, cw, ch in mini_cards:
        chdr_html = f'<div style="font-weight: bold; color: {chdr}; font-size: 11px; margin-bottom: 4px;">{cicon} {ctitle}</div>'
        catr_html = '<div style="font-size: 9.5px; color: #475569; line-height: 1.35;">' + '<br/>'.join([f'&bull; {a}' for a in cattrs]) + '</div>'
        add_textbox(cid, f'{chdr_html}{catr_html}', f"rounded=1;arcSize=6;whiteSpace=wrap;html=1;fillColor={cbg};strokeColor={chdr};strokeWidth=1;align=left;verticalAlign=top;padding=6;shadow=0;", cx, cy, cw, ch)

    # Right side: "Resumen de las correcciones" (Container + Items 1-7)
    corrections_html = '''
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="background-color: #0F172A; color: white; padding: 7px 12px; font-weight: 700; font-size: 13px; border-top-left-radius: 6px; border-top-right-radius: 6px;">
        Resumen de las correcciones
      </div>
      <div style="padding: 12px; font-size: 10.5px; color: #1E293B; line-height: 1.45; background-color: #FFFFFF; border-bottom-left-radius: 6px; border-bottom-right-radius: 6px;">
        <div style="display: flex; gap: 8px; margin-bottom: 8px;">
          <span style="background-color: #2563EB; color: white; border-radius: 50%; min-width: 18px; height: 18px; font-size: 10px; font-weight: bold; display: flex; align-items: center; justify-content: center; text-align: center; line-height: 18px;">1</span>
          <div><b>Agente ↔ Herramientas (N:N):</b> Se agregó la entidad AgentTool para modelar correctamente que un agente puede usar varias herramientas y una herramienta puede ser utilizada por varios agentes.</div>
        </div>
        <div style="display: flex; gap: 8px; margin-bottom: 8px;">
          <span style="background-color: #059669; color: white; border-radius: 50%; min-width: 18px; height: 18px; font-size: 10px; font-weight: bold; display: flex; align-items: center; justify-content: center; text-align: center; line-height: 18px;">2</span>
          <div><b>PolicyRule y Execution referencian ToolAction:</b> Se eliminó el campo action (String) y se reemplazó por tool_action_id (FK) para evitar duplicidad y garantizar consistencia.</div>
        </div>
        <div style="display: flex; gap: 8px; margin-bottom: 8px;">
          <span style="background-color: #4F46E5; color: white; border-radius: 50%; min-width: 18px; height: 18px; font-size: 10px; font-weight: bold; display: flex; align-items: center; justify-content: center; text-align: center; line-height: 18px;">3</span>
          <div><b>Política con prioridad:</b> Se agregó priority en Policy para resolver conflictos entre políticas activas. DENY tiene precedencia sobre ALLOW, salvo reglas explícitas de aprobación.</div>
        </div>
        <div style="display: flex; gap: 8px; margin-bottom: 8px;">
          <span style="background-color: #EA580C; color: white; border-radius: 50%; min-width: 18px; height: 18px; font-size: 10px; font-weight: bold; display: flex; align-items: center; justify-content: center; text-align: center; line-height: 18px;">4</span>
          <div><b>Alert con estado:</b> Se reemplazó is_resolved por un campo status y se agregaron resolved_by_user_id y resolved_at para mayor trazabilidad.</div>
        </div>
        <div style="display: flex; gap: 8px; margin-bottom: 8px;">
          <span style="background-color: #0891B2; color: white; border-radius: 50%; min-width: 18px; height: 18px; font-size: 10px; font-weight: bold; display: flex; align-items: center; justify-content: center; text-align: center; line-height: 18px;">5</span>
          <div><b>Contexto de ejecución seguro:</b> Se renombró context_payload a request_context y se aclara que debe estar sanitizado para evitar el almacenamiento de secretos.</div>
        </div>
        <div style="display: flex; gap: 8px; margin-bottom: 8px;">
          <span style="background-color: #BE185D; color: white; border-radius: 50%; min-width: 18px; height: 18px; font-size: 10px; font-weight: bold; display: flex; align-items: center; justify-content: center; text-align: center; line-height: 18px;">6</span>
          <div><b>Relación más clara y normalizada:</b> Se ajustaron las cardinalidades y relaciones para un modelo más coherente, manteniendo la compatibilidad multi-tenant.</div>
        </div>
        <div style="display: flex; gap: 8px;">
          <span style="background-color: #475569; color: white; border-radius: 50%; min-width: 18px; height: 18px; font-size: 10px; font-weight: bold; display: flex; align-items: center; justify-content: center; text-align: center; line-height: 18px;">7</span>
          <div><b>Evolución futura:</b> Se documenta la posibilidad de agregar PolicyEvaluation, AgentCredential y otras entidades en futuras versiones, sin sobrecargar el MVP.</div>
        </div>
      </div>
    </div>
    '''
    add_textbox("box_corrections", corrections_html, "rounded=1;arcSize=6;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#CBD5E1;strokeWidth=1;align=left;verticalAlign=top;shadow=1;overflow=hidden;", 1030, 660, 590, 310)

    # Green badge: "El modelo resultante es sólido, escalable..."
    badge_html = '''
    <div style="display: flex; align-items: center; gap: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="font-size: 26px; color: #059669;">🛡️</div>
      <div>
        <div style="font-weight: 700; font-size: 11.5px; color: #065F46;">El modelo resultante es sólido, escalable y defendible</div>
        <div style="font-size: 10px; color: #047857; margin-top: 1px;">Para un proyecto de Desarrollo Web, con enfoque en seguridad, trazabilidad y multi-tenancy.</div>
      </div>
    </div>
    '''
    add_textbox("box_badge", badge_html, "rounded=1;arcSize=8;whiteSpace=wrap;html=1;fillColor=#ECFDF5;strokeColor=#6EE7B7;strokeWidth=1.5;align=left;verticalAlign=middle;padding=10;shadow=0;", 1030, 985, 590, 60)

    # Bottom footer note
    footer_html = '<div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif; font-size: 10.5px; color: #64748B; display: flex; justify-content: space-between;">' \
                  '<span>🛡️ AgentGuard &nbsp;|&nbsp; Modelo Entidad-Relación (MER) &nbsp;|&nbsp; v2.0</span>' \
                  '<span>Control. Seguridad. Trazabilidad. &nbsp;|&nbsp; AgentGuard Multi-Tenant Architecture</span>' \
                  '</div>'
    add_textbox("footer_banner", footer_html, "text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;", 40, 1075, 1580, 30)

    xml_str = ET.tostring(mxfile, encoding="utf-8")
    parsed = minidom.parseString(xml_str)
    return parsed.toprettyxml(indent="  ")


def build_mermaid():
    return """erDiagram
    %% AgentGuard: Runtime Authorization & Governance for AI Agents
    %% Modelo Entidad-Relación (MER) - Versión Mejorada v2.0

    ORGANIZATION ||--o{ USER : "has (1:N)"
    ORGANIZATION ||--o{ AGENT : "owns (1:N)"
    ORGANIZATION ||--o{ TOOL : "registers (1:N)"
    ORGANIZATION ||--o{ POLICY : "defines (1:N)"
    ORGANIZATION ||--o{ EXECUTION : "records (1:N)"
    ORGANIZATION ||--o{ ALERT : "raises (1:N)"
    ORGANIZATION ||--o{ AUDIT_EVENT : "logs (1:N)"

    USER ||--o{ AGENT : "manages (owner_user_id)"
    USER ||--o{ EXECUTION : "delegates (delegator_user_id)"
    USER ||--o{ APPROVAL : "resolves (assigned_approver_id)"
    USER ||--o{ ALERT : "investigates (resolved_by_user_id)"

    AGENT ||--o{ AGENT_TOOL : "grants (1:N)"
    TOOL ||--o{ AGENT_TOOL : "assigned_to (1:N)"
    TOOL ||--o{ TOOL_ACTION : "exposes (1:N)"

    POLICY ||--o{ POLICY_RULE : "contains (1:N)"
    TOOL_ACTION ||--o{ POLICY_RULE : "governed_by (1:N)"
    AGENT ||--o{ POLICY_RULE : "targeted_by (0..1:N)"

    AGENT ||--o{ EXECUTION : "requests (1:N)"
    TOOL ||--o{ EXECUTION : "invoked_in (1:N)"
    TOOL_ACTION ||--o{ EXECUTION : "executed_in (1:N)"
    POLICY_RULE ||--o{ EXECUTION : "evaluated_in (0..1:N)"

    EXECUTION ||--o| APPROVAL : "requires_if_pending (1:0..1)"
    EXECUTION ||--o{ ALERT : "triggers_if_anomaly (1:N)"
    EXECUTION ||--o{ AUDIT_EVENT : "traces (1:N)"

    ORGANIZATION {
        UUID id PK
        string name
        timestamp created_at
    }

    USER {
        UUID id PK
        UUID organization_id FK
        string email
        string role "ADMIN | OPERATOR | APPROVER"
        timestamp created_at
    }

    AGENT {
        UUID id PK
        UUID organization_id FK
        UUID owner_user_id FK
        string name
        string purpose
        string status "ACTIVE | SUSPENDED | REVOKED"
        timestamp created_at
    }

    TOOL {
        UUID id PK
        UUID organization_id FK
        string name
        string protocol "REST"
        string endpoint_url
        string description
        timestamp created_at
    }

    TOOL_ACTION {
        UUID id PK
        UUID tool_id FK
        string action_name
        string risk_level "LOW | MEDIUM | HIGH | CRITICAL"
        string description
        timestamp created_at
    }

    AGENT_TOOL {
        UUID id PK
        UUID agent_id FK
        UUID tool_id FK
        boolean enabled
        jsonb config
        timestamp created_at
    }

    POLICY {
        UUID id PK
        UUID organization_id FK
        string name
        string description
        int priority
        boolean is_active
        timestamp created_at
    }

    POLICY_RULE {
        UUID id PK
        UUID policy_id FK
        int priority
        string effect "ALLOW | DENY | REQUIRE_APPROVAL"
        UUID tool_action_id FK
        UUID target_agent_id FK
        jsonb conditions
        timestamp created_at
    }

    EXECUTION {
        UUID id PK
        UUID organization_id FK
        UUID agent_id FK
        UUID delegator_user_id FK
        UUID tool_id FK
        UUID tool_action_id FK
        string resource
        jsonb request_context
        string decision "ALLOW | DENY | REQUIRE_APPROVAL"
        string status "PENDING_APPROVAL | REJECTED | EXECUTED"
        UUID evaluated_policy_rule_id FK
        timestamp timestamp
    }

    APPROVAL {
        UUID id PK
        UUID execution_id FK
        UUID assigned_approver_id FK
        string status "PENDING | APPROVED | REJECTED | EXPIRED"
        string resolution_reason
        timestamp resolved_at
    }

    ALERT {
        UUID id PK
        UUID organization_id FK
        UUID execution_id FK
        string alert_type
        string severity "LOW | MEDIUM | HIGH | CRITICAL"
        string status "OPEN | INVESTIGATING | RESOLVED | DISMISSED"
        UUID resolved_by_user_id FK
        timestamp resolved_at
        timestamp created_at
    }

    AUDIT_EVENT {
        UUID id PK
        UUID organization_id FK
        string actor_type "USER | AGENT | SYSTEM"
        UUID actor_id
        string event_type
        jsonb metadata
        timestamp timestamp
    }
"""


def build_plantuml():
    return """@startuml AgentGuard_MER_v2.0
!theme plain
skinparam roundcorner 10
skinparam shadowing true
skinparam handwritten false
skinparam class {
    BackgroundColor #F8FAFC
    ArrowColor #475569
    BorderColor #64748B
}

title AgentGuard: Runtime Authorization & Governance for AI Agents (MER v2.0)

entity "Organization" as Organization #EDE7F6 {
    * id : UUID [PK]
    --
    * name : VARCHAR
    * created_at : TIMESTAMP
}

entity "User" as User #E1F5FE {
    * id : UUID [PK]
    --
    * organization_id : UUID [FK]
    * email : VARCHAR
    * role : ENUM (ADMIN, OPERATOR, APPROVER)
    * created_at : TIMESTAMP
}

entity "Agent" as Agent #E8F5E9 {
    * id : UUID [PK]
    --
    * organization_id : UUID [FK]
    * owner_user_id : UUID [FK]
    * name : VARCHAR
    * purpose : TEXT
    * status : ENUM (ACTIVE, SUSPENDED, REVOKED)
    * created_at : TIMESTAMP
}

entity "Tool" as Tool #E0F7FA {
    * id : UUID [PK]
    --
    * organization_id : UUID [FK]
    * name : VARCHAR
    * protocol : VARCHAR [REST]
    * endpoint_url : VARCHAR
    * description : TEXT
    * created_at : TIMESTAMP
}

entity "ToolAction" as ToolAction #FEF3C7 {
    * id : UUID [PK]
    --
    * tool_id : UUID [FK]
    * action_name : VARCHAR
    * risk_level : ENUM (LOW, MEDIUM, HIGH, CRITICAL)
    * description : TEXT
    * created_at : TIMESTAMP
}

entity "AgentTool" as AgentTool #FFEDD5 {
    * id : UUID [PK]
    --
    * agent_id : UUID [FK]
    * tool_id : UUID [FK]
    * enabled : BOOLEAN
    config : JSONB
    * created_at : TIMESTAMP
}

entity "Policy" as Policy #FFEBEE {
    * id : UUID [PK]
    --
    * organization_id : UUID [FK]
    * name : VARCHAR
    * description : TEXT
    * priority : INTEGER
    * is_active : BOOLEAN
    * created_at : TIMESTAMP
}

entity "PolicyRule" as PolicyRule #EDE7F6 {
    * id : UUID [PK]
    --
    * policy_id : UUID [FK]
    * priority : INTEGER
    * effect : ENUM (ALLOW, DENY, REQUIRE_APPROVAL)
    * tool_action_id : UUID [FK]
    target_agent_id : UUID [FK, Nullable]
    * conditions : JSONB
    * created_at : TIMESTAMP
}

entity "Execution" as Execution #CCFBF1 {
    * id : UUID [PK]
    --
    * organization_id : UUID [FK]
    * agent_id : UUID [FK]
    delegator_user_id : UUID [FK, Nullable]
    * tool_id : UUID [FK]
    * tool_action_id : UUID [FK]
    * resource : VARCHAR
    * request_context : JSONB
    * decision : ENUM (ALLOW, DENY, REQUIRE_APPROVAL)
    * status : ENUM (PENDING_APPROVAL, REJECTED, EXECUTED)
    evaluated_policy_rule_id : UUID [FK, Nullable]
    * timestamp : TIMESTAMP
}

entity "Approval" as Approval #FCE7F3 {
    * id : UUID [PK]
    --
    * execution_id : UUID [FK, Unique]
    assigned_approver_id : UUID [FK, Nullable]
    * status : ENUM (PENDING, APPROVED, REJECTED, EXPIRED)
    resolution_reason : TEXT
    resolved_at : TIMESTAMP
}

entity "Alert" as Alert #F3E8FF {
    * id : UUID [PK]
    --
    * organization_id : UUID [FK]
    execution_id : UUID [FK, Nullable]
    * alert_type : ENUM
    * severity : ENUM (LOW, MEDIUM, HIGH, CRITICAL)
    * status : ENUM (OPEN, INVESTIGATING, RESOLVED, DISMISSED)
    resolved_by_user_id : UUID [FK, Nullable]
    resolved_at : TIMESTAMP
    * created_at : TIMESTAMP
}

entity "AuditEvent" as AuditEvent #F1F5F9 {
    * id : UUID [PK]
    --
    * organization_id : UUID [FK]
    * actor_type : ENUM (USER, AGENT, SYSTEM)
    * actor_id : UUID
    * event_type : VARCHAR
    * metadata : JSONB
    * timestamp : TIMESTAMP
}

Organization ||--o{ User : "1 : N"
Organization ||--o{ Agent : "1 : N"
Organization ||--o{ Tool : "1 : N"
Organization ||--o{ Policy : "1 : N"
Organization ||--o{ Execution : "1 : N"
Organization ||--o{ Alert : "1 : N"
Organization ||--o{ AuditEvent : "1 : N"

User ||--o{ Agent : "owner"
Agent ||--o{ AgentTool : "1 : N"
Tool ||--o{ AgentTool : "1 : N"
Tool ||--o{ ToolAction : "1 : N"

Policy ||--o{ PolicyRule : "1 : N"
ToolAction ||--o{ PolicyRule : "1 : N"
Agent ||--o{ PolicyRule : "target (optional)"

Agent ||--o{ Execution : "1 : N"
Tool ||--o{ Execution : "1 : N"
ToolAction ||--o{ Execution : "1 : N"
PolicyRule ||--o{ Execution : "evaluates (optional)"

Execution ||--o| Approval : "1 : 0..1"
Execution ||--o{ Alert : "1 : N"
Execution ||--o{ AuditEvent : "1 : N"

@enduml
"""


def build_sql():
    return """-- ==========================================================
-- AgentGuard: Runtime Authorization & Governance for AI Agents
-- Modelo Entidad-Relación (MER) - Versión Mejorada v2.0
-- Compatible con Draw.io (Import SQL DDL) & PostgreSQL
-- ==========================================================

-- ENUMS
CREATE TYPE user_role AS ENUM ('ADMIN', 'OPERATOR', 'APPROVER');
CREATE TYPE agent_status AS ENUM ('ACTIVE', 'SUSPENDED', 'REVOKED');
CREATE TYPE tool_protocol AS ENUM ('REST');
CREATE TYPE risk_level AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE rule_effect AS ENUM ('ALLOW', 'DENY', 'REQUIRE_APPROVAL');
CREATE TYPE execution_decision AS ENUM ('ALLOW', 'DENY', 'REQUIRE_APPROVAL');
CREATE TYPE execution_status AS ENUM ('PENDING_APPROVAL', 'REJECTED', 'EXECUTED');
CREATE TYPE approval_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED');
CREATE TYPE alert_severity AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE alert_status AS ENUM ('OPEN', 'INVESTIGATING', 'RESOLVED', 'DISMISSED');
CREATE TYPE actor_type AS ENUM ('USER', 'AGENT', 'SYSTEM');

-- 1. Organization (Tenant)
CREATE TABLE organizations (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. User
CREATE TABLE users (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    role user_role NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Agent
CREATE TABLE agents (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    owner_user_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    purpose TEXT,
    status agent_status NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tool
CREATE TABLE tools (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    protocol tool_protocol NOT NULL,
    endpoint_url VARCHAR(1024) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. ToolAction
CREATE TABLE tool_actions (
    id UUID PRIMARY KEY,
    tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
    action_name VARCHAR(255) NOT NULL,
    risk_level risk_level NOT NULL DEFAULT 'MEDIUM',
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tool_action UNIQUE (tool_id, action_name)
);

-- 6. AgentTool (N:N)
CREATE TABLE agent_tools (
    id UUID PRIMARY KEY,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    config JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_agent_tool UNIQUE (agent_id, tool_id)
);

-- 7. Policy
CREATE TABLE policies (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    priority INTEGER NOT NULL DEFAULT 100,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8. PolicyRule
CREATE TABLE policy_rules (
    id UUID PRIMARY KEY,
    policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    priority INTEGER NOT NULL DEFAULT 100,
    effect rule_effect NOT NULL,
    tool_action_id UUID NOT NULL REFERENCES tool_actions(id) ON DELETE CASCADE,
    target_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    conditions JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 9. Execution
CREATE TABLE executions (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(id),
    delegator_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    tool_id UUID NOT NULL REFERENCES tools(id),
    tool_action_id UUID NOT NULL REFERENCES tool_actions(id),
    resource VARCHAR(1024) NOT NULL,
    request_context JSONB NOT NULL DEFAULT '{}',
    decision execution_decision NOT NULL,
    status execution_status NOT NULL,
    evaluated_policy_rule_id UUID REFERENCES policy_rules(id) ON DELETE SET NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 10. Approval
CREATE TABLE approvals (
    id UUID PRIMARY KEY,
    execution_id UUID NOT NULL UNIQUE REFERENCES executions(id) ON DELETE CASCADE,
    assigned_approver_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status approval_status NOT NULL DEFAULT 'PENDING',
    resolution_reason TEXT,
    resolved_at TIMESTAMP
);

-- 11. Alert
CREATE TABLE alerts (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    execution_id UUID REFERENCES executions(id) ON DELETE SET NULL,
    alert_type VARCHAR(100) NOT NULL,
    severity alert_severity NOT NULL,
    status alert_status NOT NULL DEFAULT 'OPEN',
    resolved_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 12. AuditEvent
CREATE TABLE audit_events (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    actor_type actor_type NOT NULL,
    actor_id UUID NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}',
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
"""


if __name__ == "__main__":
    import os
    out_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "out"))
    os.makedirs(out_dir, exist_ok=True)
    
    drawio_content = build_drawio_xml()
    with open(os.path.join(out_dir, "AgentGuard_MER_v2.0.drawio"), "w", encoding="utf-8") as f:
        f.write(drawio_content)
    with open(os.path.join(out_dir, "AgentGuard_MER_v2.0.xml"), "w", encoding="utf-8") as f:
        f.write(drawio_content)
    
    with open(os.path.join(out_dir, "AgentGuard_MER_v2.0.mmd"), "w", encoding="utf-8") as f:
        f.write(build_mermaid())
        
    with open(os.path.join(out_dir, "AgentGuard_MER_v2.0.puml"), "w", encoding="utf-8") as f:
        f.write(build_plantuml())

    with open(os.path.join(out_dir, "AgentGuard_Schema.sql"), "w", encoding="utf-8") as f:
        f.write(build_sql())

    print(f"Successfully generated all diagram files in: {out_dir}")
