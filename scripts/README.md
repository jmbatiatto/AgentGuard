# 🛠️ Scripts de Automatización y Generación — AgentGuard

Este directorio contiene herramientas de automatización en Python utilizadas para la conversión y renderizado de artefactos del proyecto.

---

## 📋 Catálogo de Scripts

| Script | Propósito | Salida Generada |
| :--- | :--- | :--- |
| [`generate_diagrams.py`](./generate_diagrams.py) | Genera el modelo MER v2.0 en 5 formatos interoperables (Draw.io XML/drawio, Mermaid, PlantUML y PostgreSQL SQL DDL). | `02-domain/AgentGuard_MER_v2.0.*` y `02-domain/AgentGuard_Schema.sql` |
| [`convert_docs_to_docx.py`](./convert_docs_to_docx.py) | Convierte la suite de documentos de producto (`01-product/*.md`) a formato enriquecido Word `.docx`, incluyendo el documento consolidado maestro. | `01-product/*.docx` |
| [`convert_domain_to_docx.py`](./convert_domain_to_docx.py) | Convierte las especificaciones técnicas del modelo de dominio (`02-domain/*.md`) a `.docx`. | `02-domain/*.docx` |

---

## 🚀 Requisitos y Ejecución

Los scripts requieren Python 3.10+ y la biblioteca `python-docx`:

```bash
pip install python-docx
```

### Ejecutar desde la raíz del proyecto o desde `/scripts`:
```bash
python scripts/generate_diagrams.py
python scripts/convert_docs_to_docx.py
python scripts/convert_domain_to_docx.py
```
