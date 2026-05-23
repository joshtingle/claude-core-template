# App Kickoff (local-tooling)

The lightest kickoff in the template, because these projects have the least ceremony.

## Intake questions

### Identity

Project slug?  Used in script filenames and the repo folder name.

What does this tool do, in one sentence?

Who runs it?  Just you, your team, distributed to others?

### Runtime

What runtime?  PowerShell 7, Windows PowerShell 5.1, AutoHotkey v2, Node, Python, Bash on WSL?

Pin the version if it matters.  Some scripts behave differently on PS 5 vs PS 7.

### Trigger

How does this run?  Manual double-click, Windows Task Scheduler, called from another script, cron job (if WSL), or invoked from a UI like a stream deck button or browser bookmark?

Document the trigger in `CLAUDE.md` so future sessions know.

### Secrets

Does this tool need credentials?  If yes, where do they live?

- `.env.local` (gitignored, loaded explicitly by the script)
- Windows Credential Manager (`Get-StoredCredential`)
- A platform-specific credential store

Never hardcode credentials in the script itself.

### Distribution

Will this be shared with others, or stay on your machine only?

If shared:

- PowerShell: zip the repo, share via OneDrive or a tagged GitHub Release with a README.
- AutoHotkey: compile to `.exe` with Ahk2Exe; distribute the binary.
- Excel/EVE plugins: distribute the workbook plus supporting files.

## After intake

1. Update `CLAUDE.md` "Project identity" with the runtime, trigger, and distribution choices.

2. Remove the template's `app/`, `exploration/`, and `warehouse/` folders.

3. Remove or simplify `.github/workflows/`.  If the tool needs CI (linting, Pester tests), keep `test.yml` and adjust.  Otherwise remove all three workflow files.

4. Create the right script folder structure: `scripts/`, `bin/`, `modules/`, etc.

5. Add a project `README.md` describing what the tool does, how to run it, and what dependencies it needs.

6. Populate initial `TODO.md` with what you actually want to build.

## What this kickoff does NOT do

It does not write the script.  That's the work after kickoff.

It does not set up a build system.  Most local tools don't need one.

It does not configure deployment.  By definition this profile has none.
