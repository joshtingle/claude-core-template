#!/bin/bash
# bootstrap.sh
#
# Run this once after unzipping the template build into an empty local folder.
# It initializes git, commits the contents, pushes to the GitHub repo,
# creates the dev branch, and tags v0.1.
#
# Prerequisites:
# - Git installed and configured (git config user.name / user.email set)
# - SSH key or Git Credential Manager configured for github.com
# - The GitHub repo at https://github.com/joshtingle/claude-core-template
#   exists and is EMPTY (no commits yet, no README created on GitHub)
#
# Usage:
#   cd /path/to/unzipped/claude-core-template
#   chmod +x bootstrap.sh
#   ./bootstrap.sh

set -euo pipefail

REPO_URL='https://github.com/joshtingle/claude-core-template.git'

echo "Bootstrapping claude-core-template..."
echo "Target remote: $REPO_URL"
echo ""

# Verify we're in the right folder
if [ ! -f 'CLAUDE.md' ]; then
    echo "ERROR: CLAUDE.md not found. Run this script from the template root." >&2
    exit 1
fi
if [ ! -f 'TEMPLATE_VERSION' ]; then
    echo "ERROR: TEMPLATE_VERSION not found. Run this script from the template root." >&2
    exit 1
fi

TEMPLATE_VERSION=$(cat TEMPLATE_VERSION | tr -d '[:space:]')
echo "Template version: $TEMPLATE_VERSION"
echo ""

# Initialize git on main branch
if [ -d '.git' ]; then
    echo ".git already exists -- skipping git init"
else
    echo "Initializing git repo on main branch..."
    git init -b main
fi

# Add remote
if git remote get-url origin >/dev/null 2>&1; then
    EXISTING=$(git remote get-url origin)
    echo "Remote 'origin' already configured as $EXISTING"
else
    echo "Adding remote origin..."
    git remote add origin "$REPO_URL"
fi

# Stage and commit
echo "Staging all files..."
git add .

if [ -z "$(git status --porcelain)" ]; then
    echo "Nothing to commit. Repo already at the target state."
else
    echo "Committing initial commit..."
    git commit -m "chore: initial commit of claude-core-template $TEMPLATE_VERSION"
fi

# Push main
echo "Pushing main to origin..."
git push -u origin main

# Create and push dev branch
if git branch --list dev | grep -q dev; then
    echo "dev branch already exists locally."
else
    echo "Creating dev branch..."
    git checkout -b dev
fi

echo "Pushing dev to origin..."
git push -u origin dev

# Tag the initial version
if git tag --list "$TEMPLATE_VERSION" | grep -q "$TEMPLATE_VERSION"; then
    echo "Tag $TEMPLATE_VERSION already exists locally."
else
    echo "Tagging $TEMPLATE_VERSION..."
    git tag "$TEMPLATE_VERSION"
fi

echo "Pushing tags..."
git push --tags

git checkout main 2>/dev/null || true

echo ""
echo "Done."
echo ""
echo "Next steps:"
echo "  1. Verify the repo at https://github.com/joshtingle/claude-core-template"
echo "  2. Set branch protection on main"
echo "  3. Read README.md and docs/UPSTREAMING.md"
