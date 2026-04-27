#!/usr/bin/env bash
# GitHub Environment 'production' 생성 + 본인을 required reviewer 로 등록.
#
# Why this script:
#   환경/리뷰어 설정은 리포 거버넌스 변경이라 CI 에서 자동 적용하지 않는다.
#   이 PR 머지 후 본인이 직접 한 번 실행한다.
#
# Requirements:
#   - gh CLI 인증 (repo admin)
#
# Verify:
#   gh api /repos/$REPO/environments/production | jq '{name, deployment_branch_policy, protection_rules}'
set -euo pipefail

REPO="${REPO:-ischung/todo-sdlc}"
REVIEWER="${REVIEWER:-ischung}"

# 1) 본인 user id 조회
USER_ID="$(gh api "/users/$REVIEWER" -q .id)"
echo "reviewer user id = $USER_ID"

# 2) production 환경 upsert + required reviewer 1 명
gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  "/repos/$REPO/environments/production" \
  -F "wait_timer=0" \
  -F "deployment_branch_policy=null" \
  --raw-field "reviewers=[{\"type\":\"User\",\"id\":$USER_ID}]"

echo "✅ environment 'production' has $REVIEWER as the sole required reviewer."
echo "Verify: gh api /repos/$REPO/environments/production | jq '{name, protection_rules}'"
