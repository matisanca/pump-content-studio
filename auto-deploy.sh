#!/bin/bash
DIR="/Users/matiassancari/pump-content-studio"
cd "$DIR"

/opt/homebrew/bin/fswatch -o --exclude="\.git" --exclude="auto-deploy" --exclude="\.log" "$DIR" | while read event; do
  sleep 2
  CHANGES=$(git status --porcelain 2>/dev/null | grep -v "auto-deploy\|\.log")
  if [ -n "$CHANGES" ]; then
    git add -A
    git commit -m "auto $(date '+%d/%m %H:%M')" 2>/dev/null
    git push origin main 2>/dev/null
  fi
done
