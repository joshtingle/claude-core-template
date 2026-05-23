# Distribution (local-tooling)

When and how to share local tools with others.

## When to distribute

Distribute when the tool is stable enough that the next person to run it shouldn't have to rebuild it from scratch.  Signs the tool is ready:

- It runs end-to-end on your machine without manual fixups.
- The README explains what it does, what it needs, and how to run it.
- Secrets and credentials are NOT in the repo (they need to be provided per-user).
- Edge cases that broke it during development are now handled or documented.

## How to distribute by tool type

### PowerShell scripts

Zip the repo (excluding `.env.local`, `node_modules`, etc.) and share via:

- OneDrive shared folder
- GitHub Release with the zip attached
- A simple `Compress-Archive` command writing to a network share

Include a `README.md` with setup steps.  At minimum:

1. PowerShell version required.
2. Modules required (`Install-Module -Name ...`).
3. Configuration file to create (point to `.env.example`).
4. How to run.

For scripts that need to be invoked from outside their directory, include a `Set-ExecutionPolicy` note and a `.cmd` wrapper that calls PowerShell with the right path.

### AutoHotkey v2 utilities

Compile to a standalone `.exe` with Ahk2Exe.  The exe runs on any Windows machine without AHK installed.

Distribute the `.exe` via:

- GitHub Release with the binary attached
- A shared OneDrive folder

Include a README explaining what the tool does and any hotkeys it binds.  AHK tools often hijack global keystrokes, which is fine if expected and surprising otherwise.

### Excel + EVE plugins

The workbook is the artifact.  The repo holds the formulas, queries, and any companion files.

Distribute the workbook via OneDrive.  Provide a separate `INSTALL.md` explaining:

- Which Excel version is required.
- Which add-ins the workbook depends on (EVE plugin, etc.).
- How to refresh data sources after first open.
- Where credentials need to be plugged in (usually a hidden sheet or named range).

### Local CLIs (Node or Python)

For tools that should be callable from any directory:

**Node**: publish to npm (public or private), or use `npm install -g .` from a local clone.

**Python**: use `pip install -e .` from a local clone with a `setup.py` or `pyproject.toml`, or publish to PyPI.

For internal tools, an unpublished local clone with `npm link` (Node) or `pip install -e .` (Python) is usually enough.

## Versioning distributed tools

Tag releases on the repo: `git tag v0.1; git push --tags`.

Bump the version in any package files (`package.json`, `pyproject.toml`) at the same time.

For PowerShell or AHK scripts, write the version into a comment at the top of the file so users can confirm which version they have running.

## Things to never do

Don't distribute a tool with credentials baked in.  Users provide their own; the tool documents what's needed.

Don't distribute `.exe` files via email -- many corporate mail filters block them outright.  Use a download link.

Don't update a widely-distributed tool silently.  Tag the new version, note the change in the release notes, and notify users where reasonable.

Don't ignore feedback from users about confusing behavior.  Local tools that confuse their users get abandoned, and the next person who needs the functionality builds a worse version from scratch.
