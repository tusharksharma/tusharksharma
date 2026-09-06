set -eo pipefail
cd /Users/tusharsharma/recipes-site
git add -A
echo "=== staged (non-dist) ==="
git status --short | grep -v "dist/" | grep -v ".cb_" || true
echo ""
git commit -q -F /private/tmp/claude-501/-Users-tusharsharma-cursor-cax-team-cax-team/1f665eaf-bb13-4b04-9f61-64e9b84893af/scratchpad/cb_msg.txt
EXTRA_ALLOWED_ORGS=tusharksharma git push
echo ""
git log --oneline -1
git rev-parse origin/main
git ls-tree -r HEAD --name-only | grep -c "dist/cookbook/minecraft-cherry-blossom-cookie-creami/index.html"
