#!/usr/bin/env bash
# Run FastAPI using repo-root .venv
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

if [[ ! -x .venv/bin/python ]]; then
  echo ".venv not found. Run ./setup.sh first." >&2
  exit 1
fi

echo "Starting Donor Retain ML API on http://127.0.0.1:8000 ..."
echo "Docs: http://127.0.0.1:8000/docs"
cd "$ROOT/ml-backend"
exec "$ROOT/.venv/bin/python" -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
