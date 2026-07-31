#!/usr/bin/env bash
# Create repo-root .venv and install requirements (macOS / Linux)
set -euo pipefail
cd "$(dirname "$0")"

if command -v python3 >/dev/null 2>&1; then
  PY=python3
elif command -v python >/dev/null 2>&1; then
  PY=python
else
  echo "Python not found. Install Python 3.10+ and retry." >&2
  exit 1
fi

echo "Using: $($PY --version)"

if [[ ! -x .venv/bin/python ]]; then
  echo "Creating .venv ..."
  "$PY" -m venv .venv
else
  echo ".venv already exists - reusing"
fi

.venv/bin/python -m pip install --upgrade pip
.venv/bin/python -m pip install -r requirements.txt

if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "Created .env from .env.example - fill in secrets if needed."
fi

echo ""
echo "Setup complete. Start the API with:"
echo "  ./run-backend.sh"
