#!/usr/bin/env bash
# Manually upload an empty staging stub to gh-pages:/staging/  for issue #4 AC-3.
#
# Verifies that:
#   1. The Pages environment is correctly configured (setup-github-pages.sh ran).
#   2. https://<user>.github.io/todo-sdlc/staging/  returns HTTP 200.
#
# This is a one-time manual step, not part of the CI flow. Issue #5 will
# replace this with main → gh-pages auto-deploy via GitHub Actions.
#
# Usage:
#   bash scripts/staging-stub-deploy.sh
set -euo pipefail

REPO="${REPO:-ischung/todo-sdlc}"
USER_LOGIN="${REPO%%/*}"
PROJECT="${REPO##*/}"
TARGET_URL="https://$USER_LOGIN.github.io/$PROJECT/staging/"

echo "Building staging artifact..."
npm run build -- --mode staging

echo "Cloning gh-pages..."
TMPDIR="$(mktemp -d)"
git clone --branch gh-pages --single-branch "https://github.com/$REPO.git" "$TMPDIR/pages"

echo "Uploading dist/ → /staging/ ..."
mkdir -p "$TMPDIR/pages/staging"
rm -rf "$TMPDIR/pages/staging/"*
cp -R dist/* "$TMPDIR/pages/staging/"

pushd "$TMPDIR/pages" >/dev/null
git add staging
if git diff --cached --quiet; then
  echo "ℹ️  No changes to push (staging up-to-date)."
else
  git -c user.email=pages-bot@local -c user.name="pages-bot" commit -q -m "stub: deploy staging artifact ($(date -u +%FT%TZ))"
  git push -q origin gh-pages
fi
popd >/dev/null
rm -rf "$TMPDIR"

echo "Waiting for Pages to publish (≤ 60s)..."
for i in {1..12}; do
  STATUS=$(curl -sS -o /dev/null -w "%{http_code}" "$TARGET_URL" || true)
  if [ "$STATUS" = "200" ]; then
    echo "✅ $TARGET_URL  →  HTTP 200"
    exit 0
  fi
  echo "  attempt $i: HTTP $STATUS — sleeping 5s..."
  sleep 5
done

echo "⚠️  Did not get HTTP 200 within 60s. Check GitHub Pages status."
echo "    Probe: curl -I $TARGET_URL"
exit 1
