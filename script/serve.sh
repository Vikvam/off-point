#!/bin/sh
# Usage: ./script/serve.sh [--ssl] [port]
exec python3 "$(dirname "$0")/serve.py" "$@"
