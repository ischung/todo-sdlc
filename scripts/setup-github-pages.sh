#!/usr/bin/env bash
# Enable GitHub Pages with GitHub Actions as the build/deploy source.
#
# Why this script:
#   GitHub Pages activation is a repo-level governance change. We do NOT auto-run it
#   from CI. Run once manually after this PR is merged.
#
# Requirements:
#   - gh CLI authenticated with `repo` admin scope on this repository.
#   - Workflow `.github/workflows/deploy-staging.yml` will be added in issue #5.
#
# Result:
#   - Pages source set to "GitHub Actions" (not gh-pages branch).
#   - Allows `actions/deploy-pages@v4` from any workflow on the default branch.
#
# Verification after running:
#   gh api /repos/ischung/todo-sdlc/pages
set -euo pipefail

REPO="${REPO:-ischung/todo-sdlc}"

echo "Enabling GitHub Pages on $REPO (source = GitHub Actions)..."

gh api \
  --method POST \
  -H "Accept: application/vnd.github+json" \
  "/repos/$REPO/pages" \
  -f "build_type=workflow" 2>/dev/null \
  || gh api \
       --method PUT \
       -H "Accept: application/vnd.github+json" \
       "/repos/$REPO/pages" \
       -f "build_type=workflow"

echo "✅ GitHub Pages source set to 'GitHub Actions'."
echo "Verify: gh api /repos/$REPO/pages | jq '{html_url, build_type, status}'"
