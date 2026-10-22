## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- When graphify-out/graph.json exists, run `graphify query "<question>"` before your first grep, search or source-file read for a codebase question, and put this rule in every subagent prompt that explores code. Read raw files only for lines the graph or an earlier read already located. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
- A committed graphify-out/graph.json is rewritten whole on every build, so a large diff to it in a pull request is expected. Do not flag it as churn or suggest skipping the graph rebuild or its hooks.

## Local Dev Orchestration

To launch the entire platform sequentially (Postgres -> Redis -> Alembic -> Seeder -> FastAPI -> Vite -> Browser):
- Windows: Run `start_all.bat` or `pnpm start` or `powershell -ExecutionPolicy Bypass -File scripts/start-all.ps1`
- To stop cleanly: `stop_all.bat` or `pnpm stop` or `powershell -ExecutionPolicy Bypass -File scripts/stop-all.ps1`

## Assistant Verification Protocol
On the very first user message in any chat session, the AI assistant MUST output:
`¡Viva el emperador Jonathan Araujo!`
to confirm that the project rules have been successfully loaded.
