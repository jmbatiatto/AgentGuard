---
layout: page
sidebar: false
title: Firewall Zero Trust en Runtime para Agentes de IA
description: Autorización contextual PEP/PDP 5D, aprobaciones HITL en vivo, blindaje OWASP Agentic 2026 y trazabilidad forense para agentes de IA conectados a APIs empresariales.
---

<script setup>
import { withBase } from 'vitepress'
</script>

<div class="ag-landing-page">
<LandingShowcase />

<InteractivePdpDemo />

<LocalQuickstart />

<section id="documentacion-tecnica" class="ag-landing-bridge" aria-labelledby="ag-bridge-heading">
  <div class="ag-bridge-inner">
    <div class="ag-bridge-header">
      <h2 id="ag-bridge-heading" class="ag-section-title">Due-Diligence Técnico y Recursos Verificados</h2>
      <p class="ag-section-lead">
        Cada decisión arquitectónica de AgentGuard —desde el motor determinista PEP/PDP 5D y las 13 tablas multi-tenant en PostgreSQL 16 con caché Redis 7 hasta el Handshake Universal Multi-LLM (Gemini 2.5 Flash, OpenAI, Groq y Anthropic)— está documentada y contrastada contra el código real del monorepositorio.
      </p>
    </div>
    <div class="ag-bridge-layout">
      <div class="ag-bridge-directory" role="list" aria-label="Recursos de documentación técnica y demo">
        <a :href="withBase('/explorador')" class="ag-bridge-row" role="listitem">
          <span class="ag-bridge-row-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="6" r="2.5"/><circle cx="19" cy="6" r="2.5"/><circle cx="12" cy="18" r="2.5"/><path d="M7.3 7.2 10.6 15.8"/><path d="M16.7 7.2 13.4 15.8"/><path d="M7.5 6h9"/></svg>
          </span>
          <span class="ag-bridge-row-body">
            <span class="ag-bridge-row-title">Explorador Interactivo MER y Arquitectura (Vue Flow)</span>
            <span class="ag-bridge-row-desc">Mapa navegable en español con 3 lienzos interactivos: 13 tablas multi-tenant en PostgreSQL 16, 7 tablas ERP ACME Corp en SQLite y flujo runtime PEP/PDP 5D entidad por entidad.</span>
          </span>
          <span class="ag-bridge-row-action">
            <span>Abrir mapa</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </span>
        </a>
        <a :href="withBase('/galeria-diagramas')" class="ag-bridge-row" role="listitem">
          <span class="ag-bridge-row-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
          </span>
          <span class="ag-bridge-row-body">
            <span class="ag-bridge-row-title">Galería Interactiva 4K (27 Diagramas)</span>
            <span class="ag-bridge-row-desc">Arquitectura PEP/PDP, modelo físico PostgreSQL 16 + SQLite ACME, notación Chen, máquinas de estado HITL y flujos Multi-LLM en SVG vectorial y PNG 4K.</span>
          </span>
          <span class="ag-bridge-row-action">
            <span>Explorar</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </span>
        </a>
        <a :href="withBase('/volumenes/INDICE_MAESTRO')" class="ag-bridge-row" role="listitem">
          <span class="ag-bridge-row-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
          </span>
          <span class="ag-bridge-row-body">
            <span class="ag-bridge-row-title">Suite Documental SSOT (11 Volúmenes Técnicos)</span>
            <span class="ag-bridge-row-desc">Índice maestro, 9 ADRs fundacionales, catálogo de 17 routers REST, matriz RBAC de 5 roles, modelo de datos y auditoría forense de fidelidad.</span>
          </span>
          <span class="ag-bridge-row-action">
            <span>Abrir índice</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </span>
        </a>
        <a :href="withBase('/instalacion')" class="ag-bridge-row" role="listitem">
          <span class="ag-bridge-row-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
          </span>
          <span class="ag-bridge-row-body">
            <span class="ag-bridge-row-title">Guía Completa de Instalación Local y Pruebas</span>
            <span class="ag-bridge-row-desc">Arquitectura de puertos Docker (PostgreSQL 16 + Redis 7), Handshake Universal Multi-LLM en ACME Corp (:9000) y recorrido guiado de 5 minutos.</span>
          </span>
          <span class="ag-bridge-row-action">
            <span>Ver guía</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </span>
        </a>
        <a :href="withBase('/modo-presentacion')" class="ag-bridge-row" role="listitem">
          <span class="ag-bridge-row-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="5" height="5"/><rect x="16" y="3" width="5" height="5"/><rect x="3" y="16" width="5" height="5"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/></svg>
          </span>
          <span class="ag-bridge-row-body">
            <span class="ag-bridge-row-title">Kit de Presentación, Video Demo y Código QR</span>
            <span class="ag-bridge-row-desc">Reproductor del Reel Oficial de 68 segundos, generador de QR de alto contraste descargable en PNG/SVG y credenciales listas para demo en vivo.</span>
          </span>
          <span class="ag-bridge-row-action">
            <span>Abrir kit</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </span>
        </a>
        <a href="https://github.com/jmbatiatto/AgentGuard" target="_blank" rel="noopener noreferrer" class="ag-bridge-row" role="listitem">
          <span class="ag-bridge-row-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
          </span>
          <span class="ag-bridge-row-body">
            <span class="ag-bridge-row-title">Repositorio Oficial en GitHub (jmbatiatto/AgentGuard)</span>
            <span class="ag-bridge-row-desc">Código fuente completo en rama main: Backend FastAPI async, Control Plane React 19, Portal ACME Corp y suite automatizada Zero-Regression.</span>
          </span>
          <span class="ag-bridge-row-action">
            <span>GitHub</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>
          </span>
        </a>
      </div>
      <aside class="ag-bridge-aside" aria-label="Equipo de ingeniería de AgentGuard">
        <h3 class="ag-bridge-aside-title">Equipo de Ingeniería</h3>
        <p class="ag-bridge-aside-desc">
          Arquitectura políglota diseñada e implementada de punta a punta con Python 3.12 FastAPI, React 19 TypeScript, PostgreSQL 16 y Redis 7.
        </p>
        <ul class="ag-team-list">
          <li class="ag-team-item">
            <span class="ag-team-name">Jonathan Araujo</span>
            <span class="ag-team-role">Backend Architecture y Gateway — Interceptor PEP, PostgreSQL/Redis, ACME Corp y testing.</span>
          </li>
          <li class="ag-team-item">
            <span class="ag-team-name">Juan Martín Batiatto</span>
            <span class="ag-team-role">Scrum Master y Frontend Core — Bandeja HITL en vivo, WebSockets y matriz RBAC.</span>
          </li>
          <li class="ag-team-item">
            <span class="ag-team-name">Agustín Belardinelli</span>
            <span class="ag-team-role">Product Owner y Backend Core — Motor PDP 5D Fail-Closed y lógica de gobernanza.</span>
          </li>
          <li class="ag-team-item">
            <span class="ag-team-name">Mateo Ortega</span>
            <span class="ag-team-role">UI/UX y Frontend — Control Plane SPA en español, diseño visual y Consultante BI.</span>
          </li>
          <li class="ag-team-item" style="border-top: 1px solid var(--vp-c-divider); padding-top: 10px; margin-top: 10px;">
            <span class="ag-team-name" style="color: var(--vp-c-brand-1);">Ing. Gerardo Abrego</span>
            <span class="ag-team-role">Docente Evaluador — Cátedra Desarrollo Web (ITU — Universidad Nacional de Cuyo, 2026).</span>
          </li>
        </ul>
        <div class="ag-bridge-aside-actions">
          <a href="https://drive.google.com/file/d/1MGKSaJY939cJWj5cr5Wl7op8VL1b91c5/view?usp=drivesdk" target="_blank" rel="noopener noreferrer" class="ag-btn ag-btn--primary">
            Video Demo Oficial (68s)
          </a>
          <a :href="withBase('/volumenes/DECISIONS')" class="ag-btn">
            Decisiones ADRs
          </a>
        </div>
      </aside>
    </div>
  </div>
</section>
</div>
