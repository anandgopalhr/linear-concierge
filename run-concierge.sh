#!/bin/bash

# Linear Concierge CLI wrapper script
# Makes it easy to run the tool with default settings

cd "$(dirname "$0")"

MAX_ISSUES=${1:-50}
DAYS_STALE=${2:-2}
DAYS_NO_MOVE=${3:-4}
OUTPUT_PATH="/Users/anand/Documents/Obsidian Vault/Linear Concierge Today.md"

npm start -- \
  --out "$OUTPUT_PATH" \
  --maxIssues "$MAX_ISSUES" \
  --daysStale "$DAYS_STALE" \
  --daysNoMove "$DAYS_NO_MOVE"
