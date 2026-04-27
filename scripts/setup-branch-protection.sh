#!/usr/bin/env bash
# Apply branch protection rules to the `main` branch.
#
# Requirements:
#   - gh CLI authenticated with a token that has `repo` admin scope
#   - The `ci` status check (from .github/workflows/ci.yml) must have run at least once
#
# Rules enforced:
#   - 1 review required (CODEOWNERS auto-requested)
#   - `ci` status check is a required check (strict: branch must be up-to-date)
#   - No force pushes, no branch deletion
#   - Linear history enforced (squash/rebase only)
#   - Conversation resolution required before merge
#
# Re-run is idempotent — GitHub overwrites the entire protection config on PUT.
set -euo pipefail

REPO="${REPO:-ischung/todo-sdlc}"
BRANCH="${BRANCH:-main}"

echo "Applying branch protection: $REPO @ $BRANCH"

gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  "/repos/$REPO/branches/$BRANCH/protection" \
  --input - <<'JSON'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["lint · typecheck · test · build"]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true,
    "required_approving_review_count": 1
  },
  "restrictions": null,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": true
}
JSON

echo "✅ Branch protection applied."
