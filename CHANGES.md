# Changes Log

Chronological record of significant changes, architectural decisions, and lessons learned.  One-liner entries with date prefixes.  Don't log every commit -- only inflection points worth recalling later.

Format: `YYYY-MM-DD: brief description of the change and why it matters`

## Entries

2026-06-12: Added the "Operating discipline (judgment scaffolding)" section to CLAUDE.md (v0.4).  Ten rules converting hard-won judgment into procedure: verify-don't-recall, headline-number tripwires treated as incidents, pre-registered decision bars, the too-good rule, frame-mismatch suspicion, incidents-become-procedure (regression test + smells checklist), conservative defaults under thin evidence, the three-surprises rule, re-baselining when the ground moves, and an adversarial close-the-loop self-review.  Motivated by preparing weaker/different models to match a stronger model's catches; every rule traces to a real incident in the auto-trader project.  Also restored the "## Core definitions" heading accidentally dropped in v0.3.

2026-06-11: Added the "Server lifecycle policy (Claude Code)" section to CLAUDE.md (v0.3).  The user runs simultaneous dev servers for different projects on one machine; Claude must probe a port before starting a server, reuse a healthy instance of the project's own server, hunt upward for an open port when the default is taken by anything else, and only ever kill the project's own stale servers or the session's own background tasks.  Upstreamed from the steward project, where a blind kill-and-retry on a busy port would have taken down another project's server.

2026-06-11: Added the "Delegation policy (Claude Code)" section to CLAUDE.md (v0.2).  Standing rule to route defined, judgment-free work (long-running supervision, noisy-output jobs, bulk mechanical execution) to background agents on cheaper models, with a never-delegate list (decisions, safety-critical or money-touching code, decision-recording docs, commits) and a checklist for writing self-contained delegated prompts.  Upstreamed from the auto-trader project, where it proved out on a 3-year market-data backfill.

(Add entries in reverse chronological order, newest at top)
