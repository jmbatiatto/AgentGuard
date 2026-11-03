---
trigger: always_on
description: Consult the graphify knowledge graph at graphify-out/ for codebase and architecture questions.
---

## graphify

This project has a graphify knowledge graph at `graphify-out/graph.json`.

Rules:
- For codebase or architecture questions, when `graphify-out/graph.json` exists, first run `python -m graphify query "<question>"` (CLI) or `query_graph` (MCP). Use `python -m graphify path "<A>" "<B>"` for relationships and `python -m graphify explain "<concept>"` for focused concepts instead of broad grep/file scans.
- If `graphify-out/wiki/index.md` exists, navigate it instead of reading raw files.
- Read `graphify-out/GRAPH_REPORT.md` only for broad architecture review when `query`/`path`/`explain` do not surface enough context.
- Run `python -m graphify update .` **once at phase/session close** after modifying code files to keep the graph current (AST-only, zero token cost).
