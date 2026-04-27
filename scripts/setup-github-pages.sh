#!/usr/bin/env bash
# Enable GitHub Pages with the `gh-pages` branch as source (per issue #4 AC-2).
#
# Why this script:
#   GitHub Pages activation is a repo-level governance change. We do NOT auto-run it
#   from CI. Run once manually after this PR is merged.
#
# Requirements:
#   - gh CLI authenticated with `repo` admin scope on this repository.
#   - The `gh-pages` branch will be created automatically below if it doesn't exist.
#
# Result:
#   - Pages source = `gh-pages` branch, root path.
#   - https://<user>.github.io/todo-sdlc/...  serves the contents of that branch.
#   - Staging will live under  /todo-sdlc/staging/  (subfolder under gh-pages root).
#   - Production will live under /todo-sdlc/        (gh-pages root files).
#
# Verification:
#   gh api /repos/ischung/todo-sdlc/pages | jq '{html_url, source, build_type, status}'
set -euo pipefail

REPO="${REPO:-ischung/todo-sdlc}"
BRANCH="${BRANCH:-gh-pages}"
PATH_DIR="${PATH_DIR:-/}"

echo "Enabling GitHub Pages on $REPO (source = $BRANCH:$PATH_DIR)..."

# Ensure the source branch exists. Create an empty orphan branch if missing.
if ! gh api "/repos/$REPO/branches/$BRANCH" >/dev/null 2>&1; then
  echo "ℹ️  '$BRANCH' branch not found. Creating an empty orphan branch..."
  TMPDIR="$(mktemp -d)"
  pushd "$TMPDIR" >/dev/null
  git init -q
  git checkout --orphan "$BRANCH"
  echo "Pages root for $REPO" > README.md
  git add README.md
  git -c user.email=pages-bot@local -c user.name="pages-bot" commit -q -m "chore(pages): initial gh-pages root"
  git remote add origin "https://github.com/$REPO.git"
  git push -q origin "$BRANCH"
  popd >/dev/null
  rm -rf "$TMPDIR"
fi

# Try POST first (initial activation), fall back to PUT (update)
gh api \
  --method POST \
  -H "Accept: application/vnd.github+json" \
  "/repos/$REPO/pages" \
  -f "source[branch]=$BRANCH" \
  -f "source[path]=$PATH_DIR" 2>/dev/null \
  || gh api \
       --method PUT \
       -H "Accept: application/vnd.github+json" \
       "/repos/$REPO/pages" \
       -f "source[branch]=$BRANCH" \
       -f "source[path]=$PATH_DIR"

echo "✅ Pages source = $BRANCH:$PATH_DIR"
echo "Verify: gh api /repos/$REPO/pages | jq '{html_url, source, build_type, status}'"
