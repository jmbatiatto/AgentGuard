"""Wrapper en la raíz para ejecutar el seeder de base de datos de AgentGuard."""

import sys
import subprocess
from pathlib import Path

root_dir = Path(__file__).resolve().parent.parent
backend_dir = root_dir / "backend"
venv_python = backend_dir / ".venv" / "Scripts" / "python.exe"
seed_script = backend_dir / "scripts" / "seed_demo.py"

python_cmd = str(venv_python) if venv_python.exists() else sys.executable

args = [python_cmd, str(seed_script)] + sys.argv[1:]
ret = subprocess.run(args, cwd=str(backend_dir))
sys.exit(ret.returncode)
