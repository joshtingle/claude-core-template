# Session Workflow

The mechanics of running individual sessions productively.  This is about HOW to work within a session.  The stack profile docs are about WHAT the work is.

## Session start

Every session begins the same way regardless of phase or stack.  Don't skip this -- 5 minutes of orientation prevents 30 minutes of re-deriving things already settled.

Standard prompt to fire at Claude at the start of a session (this is also what the auto session-start behavior in `CLAUDE.md` performs):

> Read `CLAUDE.md`, `TODO.md`, `CHANGES.md` (last 10 entries), and `DATA_INVENTORY.md` if it exists.  If `HANDOFF.md` exists and has no Acknowledged section, read it and acknowledge.  Then summarize the current project state in 3-5 sentences.  Call out any TODO items marked `[~]` in progress.  Flag anything in the "Known data quality issues" section relevant to today's planned work.  Then ask what to work on.

The point is to orient Claude before it produces code.  If Claude jumps straight to work without orientation, it frequently re-derives concepts already in "Core definitions", or queries sources already documented as out of scope, or misses a known landmine.

When Claude returns with its summary, verify it.  If the summary is wrong, fix the `.md` files before continuing -- they're persistent memory and they need to be correct.

## Automatic kickoff detection

You don't have to remember to run kickoff.  `CLAUDE.md`'s "Session start behavior" section instructs Claude to check on every session start whether the project has been kicked off and whether the app scaffold has been instantiated.  When the user gives an instruction that triggers either gap, Claude runs the relevant kickoff doc autonomously before doing the requested work.

## Session end

Every productive session needs to leave a trace.  Without it, the next session restarts from zero.

Standard prompt at session end:

> We've wrapped up.  Please read the current `CLAUDE.md` and generate an updated version that incorporates everything we decided and discovered.  Specifically: update Core definitions with any agreed definitions, add new gotchas to Known data quality issues, update Current headline numbers if any tile values were validated.  Refresh `TODO.md` and `CHANGES.md` with one-liner entries for what we did and what's now pending.  Show me what changed before I commit.

Claude should produce a diff or a clearly marked "what changed" section so you can review before committing.  Don't accept a blanket "I updated everything" -- you need to see the specific edits.

After review and commit, also paste the updated `CLAUDE.md` contents into the Claude.ai project instructions panel if you use that surface for this project.  The repo `CLAUDE.md` is what Claude Code reads automatically; the project instructions panel is what Claude.ai reads.  Both need to stay in sync.

## Upstreaming check at session end

This is new in `claude-core-template` and worth doing whenever the session produced substantive work.

Standard addition to the session-end prompt:

> Also: review what we did today and identify anything that wasn't specific to this project's domain.  Patterns that would help any future project using this template.  Record those in `TEMPLATE_NOTES.md` under "Candidate upstream changes" with a genericized description (project-specific names abstracted).  These will be reviewed when the template repo gets its next maintenance pass.

See `docs/UPSTREAMING.md` for the full loop.

## SQL promotion workflow (warehouse-analytics)

During exploration, SQL evolves quickly.  The query in turn 14 is probably better than the one in turn 7.  The validated version that finally matched the reference number is the one to save.

When SQL is ready to promote from conversation into the repo:

It must have produced a number that matches a validation reference.  Unvalidated SQL stays in the conversation; it does not graduate.

It must have a clear home: concept SQL in `exploration/concepts/<concept_name>.md` (embedded), mart proposal SQL in `exploration/proposals/<mart_name>.sql`, validation SQL in `warehouse/marts/validations/<mart_name>.sql`.  Don't drop loose SQL files at random paths.

It must have the standard header block:

```sql
-- Project: [project name]
-- Concept: [what business concept this represents]
-- Grain: [one row per what]
-- Source tables: [list]
-- Known edge cases: [list anything that would break a naive reader]
-- Validation: [what reference number this was checked against and when]
-- Last updated: [date]
```

The header is non-negotiable.  Future readers will see scripts in this repo without the conversation context, and the header is the only thing that makes them readable.

Standard promotion prompt:

> The SQL we landed on in this session is ready to promote.  Please add the standard header block, format it cleanly, and write it to the appropriate location.  Show me the final file before committing.

## Mockup workflow (when designing UI)

Before building real components, build an interactive mockup of the eventual UI.  The mockup surfaces definition questions and shape decisions that are easier to address against a visual than against an empty file.

When to build a mockup: after enough concepts (warehouse-analytics) or user-flows (other profiles) are validated that the UI shape is becoming clear.  Not before -- you'll mock the wrong thing.

Where to build it: in Claude.ai using the visualizer tool.  Claude Code cannot render interactive visuals.

How to use it: ask Claude.ai to build an interactive React mockup with fabricated but reasonable data.  The mockup is throwaway -- it doesn't connect to real data, doesn't get committed.

What to look for: definitional gaps.  As you imagine real data flowing into the mockup, you'll discover what wasn't fully defined.  Capture those as you go -- they're free design feedback.

When the mockup feels right, convert it to a written spec via:

> Convert this mockup into a written spec.  For each component, list: what data it needs, what filtering it accepts, what aggregation it expects, and what the expected row/value count is at typical scale.  Save this to `docs/DASHBOARD_SPEC.md` (or `docs/UI_SPEC.md` for non-dashboard projects).

The spec then drives the build phase.

## Handoff between Claude.ai and Claude Code

These two surfaces serve different purposes:

Claude.ai is good for thinking, exploration conversations, mockups, discussing definitions.  Cannot directly modify files or run code beyond what's pasted in.

Claude Code is good for actually changing files, running tests, executing complex operations against real systems, and committing work.  Cannot build visual mockups.

A common pattern: use Claude.ai to validate a concept or design a component.  Then use Claude Code to add the standard header, write the file to disk, and commit.

When handing off, generate `HANDOFF.md` at the repo root using `docs/HANDOFF.md.template`.  Claude Code reads it at the next session start and acknowledges.

## When the session goes sideways

Some sessions feel productive but produce nothing usable.  Two common failure modes:

**Unscoped exploration**: you started with a vague question and Claude generated 15 attempts that each almost answered a different question.  Recovery: stop, write a tightly-scoped question in `TODO.md`, restart the session against that.

**Unresolved disagreement**: Claude proposed an approach, you pushed back, it proposed another, you pushed back, and now you're three rounds deep with no resolution.  Recovery: stop and ask Claude Code to run a diagnostic against the actual data or files.  Often the disagreement is grounded in different assumptions about what the data looks like, and one observation settles it.

Either way: don't let a sideways session end without a session-end summary.  Even "we explored X and concluded the approach was wrong, deferring to next session" is valuable to capture.  Sessions that fail silently waste their lessons.
