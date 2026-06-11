# Changes Log

Chronological record of significant changes, architectural decisions, and lessons learned.  One-liner entries with date prefixes.  Don't log every commit -- only inflection points worth recalling later.

Format: `YYYY-MM-DD: brief description of the change and why it matters`

## Entries

2026-06-11: Added the "Delegation policy (Claude Code)" section to CLAUDE.md (v0.2).  Standing rule to route defined, judgment-free work (long-running supervision, noisy-output jobs, bulk mechanical execution) to background agents on cheaper models, with a never-delegate list (decisions, safety-critical or money-touching code, decision-recording docs, commits) and a checklist for writing self-contained delegated prompts.  Upstreamed from the auto-trader project, where it proved out on a 3-year market-data backfill.

(Add entries in reverse chronological order, newest at top)
