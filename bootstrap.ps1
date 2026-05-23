# bootstrap.ps1
#
# Run this once after unzipping the template build into an empty local folder.
# It initializes git, commits the contents, pushes to the GitHub repo,
# creates the dev branch, and tags v0.1.
#
# Prerequisites:
# - Git installed and configured (git config user.name / user.email set)
# - Git Credential Manager or SSH key configured for github.com
# - The GitHub repo at https://github.com/joshtingle/claude-core-template
#   exists and is EMPTY (no commits yet, no README created on GitHub)
#
# Usage:
#   cd C:\path\to\unzipped\claude-core-template
#   .\bootstrap.ps1
#
# If the repo at GitHub is not empty (has commits), this script will fail at
# the push step. In that case, either delete the repo and recreate it empty,
# or run `git push -u origin main --force` manually after this script (risky;
# only do it if you know the existing content is throwaway).

$ErrorActionPreference = 'Stop'

$RepoUrl = 'https://github.com/joshtingle/claude-core-template.git'

Write-Host "Bootstrapping claude-core-template..."
Write-Host "Target remote: $RepoUrl"
Write-Host ""

# Verify we're in the right folder
if (-not (Test-Path 'CLAUDE.md')) {
    Write-Error "CLAUDE.md not found in current directory. Run this script from the template root."
}
if (-not (Test-Path 'TEMPLATE_VERSION')) {
    Write-Error "TEMPLATE_VERSION not found in current directory. Run this script from the template root."
}

$TemplateVersion = (Get-Content TEMPLATE_VERSION -Raw).Trim()
Write-Host "Template version: $TemplateVersion"
Write-Host ""

# Initialize git on main branch
if (Test-Path '.git') {
    Write-Host ".git already exists -- skipping git init"
} else {
    Write-Host "Initializing git repo on main branch..."
    git init -b main
    if ($LASTEXITCODE -ne 0) { Write-Error "git init failed" }
}

# Add remote
$existingRemote = git remote get-url origin 2>$null
if ($existingRemote) {
    Write-Host "Remote 'origin' already configured as $existingRemote"
    if ($existingRemote -ne $RepoUrl) {
        Write-Warning "Existing remote does not match $RepoUrl. Update manually if needed."
    }
} else {
    Write-Host "Adding remote origin..."
    git remote add origin $RepoUrl
    if ($LASTEXITCODE -ne 0) { Write-Error "git remote add failed" }
}

# Stage and commit
Write-Host "Staging all files..."
git add .
if ($LASTEXITCODE -ne 0) { Write-Error "git add failed" }

# Check if there's anything to commit
$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "Nothing to commit. Repo already at the target state."
} else {
    Write-Host "Committing initial commit..."
    git commit -m "chore: initial commit of claude-core-template $TemplateVersion"
    if ($LASTEXITCODE -ne 0) { Write-Error "git commit failed" }
}

# Push main
Write-Host "Pushing main to origin..."
git push -u origin main
if ($LASTEXITCODE -ne 0) {
    Write-Error "git push failed. Common causes: the repo at GitHub is not empty, or authentication is not set up. See script comments for guidance."
}

# Create and push dev branch
$existingDev = git branch --list dev
if ($existingDev) {
    Write-Host "dev branch already exists locally."
} else {
    Write-Host "Creating dev branch..."
    git checkout -b dev
    if ($LASTEXITCODE -ne 0) { Write-Error "git checkout -b dev failed" }
}

Write-Host "Pushing dev to origin..."
git push -u origin dev
if ($LASTEXITCODE -ne 0) { Write-Error "git push dev failed" }

# Tag the initial version
$existingTag = git tag --list $TemplateVersion
if ($existingTag) {
    Write-Host "Tag $TemplateVersion already exists locally."
} else {
    Write-Host "Tagging $TemplateVersion..."
    git tag $TemplateVersion
    if ($LASTEXITCODE -ne 0) { Write-Error "git tag failed" }
}

Write-Host "Pushing tags..."
git push --tags
if ($LASTEXITCODE -ne 0) { Write-Error "git push --tags failed" }

# Switch back to main as the working branch
git checkout main 2>$null

Write-Host ""
Write-Host "Done."
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Verify the repo at https://github.com/joshtingle/claude-core-template"
Write-Host "  2. Set branch protection on main: Settings > Branches > Add rule > main, require PR before merge"
Write-Host "  3. Add yourself (and anyone else who'll maintain the template) as collaborators if private"
Write-Host "  4. Read README.md and docs/UPSTREAMING.md to understand the maintenance loop"
Write-Host ""
Write-Host "To start a new project from this template:"
Write-Host "  - Clone or use 'Use this template' on GitHub"
Write-Host "  - Open in Claude.ai or Claude Code"
Write-Host "  - Claude will detect the fresh clone and run docs/PROJECT_KICKOFF.md"
