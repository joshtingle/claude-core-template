# Security

How to handle credentials and secrets across this project and its deployment targets.

The general rule: secrets never live in the repo, never get pasted into `.md` files (including `CLAUDE.md`), never get committed.  Anything that ends up in git is in every backup, every clone, every fork, forever -- including history rewrites that don't actually erase the value from the GitHub copy.

## Credential handling on the dev machine

Use Git Credential Manager (Windows default with Git for Windows) or SSH keys for GitHub authentication.  Do not paste Personal Access Tokens into URLs, `.gitconfig` files, or any committed file.

For database connections, API keys, and other runtime secrets, use a `.env.local` file at the repo root.  This file is in `.gitignore` and stays out of the repo.  A `.env.example` file (without real values) ships in the repo to document which keys are needed.

For local credentials that don't fit a `.env.local` pattern (Snowflake key-pair private keys, AWS credentials), use the platform's standard credential store: Windows Credential Manager, macOS Keychain, or `~/.aws/credentials` for AWS.

## What goes in the deployment target

For Azure App Service: App Settings (Configuration > Application Settings).  For higher-stakes secrets, use Key Vault references rather than plain values.

For AWS EC2 with systemd: a gitignored `.env` file in `/opt/<project>/`, owned by the app user with `chmod 600`.  Systemd reads it via `EnvironmentFile=`.

For GitHub Actions: Repository Settings > Secrets and Variables > Actions.  Secrets are encrypted and never appear in logs.

For Vercel: Project Settings > Environment Variables.

In all cases, the same secret value lives in two places (deployment target and `.env.local` on the dev machine) and nowhere else.  If a third copy appears, treat it as compromised.

## Rotating credentials

When a credential might have been exposed (pasted into a chat, committed by accident, shared in a doc), rotate it immediately at the source service.  Do not wait to investigate whether the exposure actually mattered -- rotation is cheap, the cost of a leaked credential is not.

GitHub PATs: https://github.com/settings/tokens
Azure App Service connection strings: storage account > Access Keys > Rotate
Snowflake: ALTER USER ... SET PASSWORD = '...' or rotate key-pair
AWS: IAM > Users > Security credentials

After rotating, update the value in the deployment target and `.env.local`.  Watch for any service that breaks because it still has the old value.

## Never do these things

Do not paste GitHub tokens into `CLAUDE.md`, `README.md`, or any file in the repo.  Even in "private" repos.  Even with comments saying "this is okay for now".  Tokens age into something not-okay faster than you remember to revoke them.

Do not embed database passwords in git remotes (`https://user:pass@github.com/...`).  Use a credential helper instead.

Do not share a single service account across all your projects.  Make one per project, scope its permissions tightly, and rotate when a project ends.

Do not commit `.env.local`, `*.pem`, `id_rsa*`, or any file under `.credentials/`.  All of these are in the template's `.gitignore`.  Verify they're being ignored before pushing for the first time: `git check-ignore -v .env.local` should report the gitignore line that catches it.

## What to do if a secret gets committed

1. Rotate the secret immediately.  Don't try to remove it from git history first.  The compromised value matters more than the history hygiene.
2. After rotation, decide whether to also rewrite history.  For public repos, yes (use `git filter-repo` or BFG).  For private repos with limited access, often not worth the effort, but still possible.
3. Add a `CHANGES.md` entry noting the rotation date and what was affected.
4. If the leak might have been malicious or sustained, review access logs for the affected service.

## What Claude should refuse

Claude (either surface) should refuse to:

- Paste a real token, password, or connection string into a `.md` file even when asked.
- Commit a file containing a real secret even with explicit user permission.
- Help construct a `git remote` URL that embeds a token.
- Echo a real secret back into the conversation in a form that would be logged or saved.

If the user pastes a secret into the conversation by mistake, Claude should flag it and recommend rotation, not pretend not to see it.
