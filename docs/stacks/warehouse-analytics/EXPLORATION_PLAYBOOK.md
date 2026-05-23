# Exploration Playbook

How to run productive exploration sessions against raw data via MCP (or via pasted query results when MCP isn't available).

## Setup before any exploration

Connect Claude to the database via MCP.  The exact steps depend on the backend -- see `docs/databases/<backend>.md` for connection patterns.  Default in this profile is Snowflake.

Confirm the connection works by asking Claude to run a trivial query like `SELECT current_database(), current_schema()` (Snowflake / Postgres) or `SELECT DB_NAME(), SCHEMA_NAME()` (SQL Server).  If that returns expected values, the channel is open.

For Claude Code, MCP configuration goes in the project's settings file.  For Claude.ai, MCP is configured per project.  Both should be configured before starting Phase 1.

If MCP isn't available in your environment (corporate security policies, lack of suitable driver), exploration still works -- you become the query executor.  Claude proposes SQL, you copy/paste it into your warehouse tool, paste results back into the conversation.  The methodology is unchanged; only the execute step changes.  Note the no-MCP setup in `CLAUDE.md` so future sessions know not to expect direct query execution.

## Phase 1: Discovery and inventory

The goal of Phase 1 is to produce `DATA_INVENTORY.md` and per-table notes in `exploration/inventory/`.  You should be able to read these in 15 minutes and understand what's in the warehouse.

Start with a table inventory.  Ask Claude to list all tables in the in-scope schemas, with row counts, column counts, and last-updated patterns where available.  Capture in `DATA_INVENTORY.md`.

For each table, ask Claude to sample 20 rows and write a hypothesis paragraph: what does this table appear to represent, what's the grain, what columns look like keys, what columns look derived.  Save to `exploration/inventory/<table_name>.md` using `_TEMPLATE.md` as the structure.

Resist the urge to start querying business logic in Phase 1.  The goal is the map, not the journey.  You'll get to destinations in Phase 2.

Phase 1 typically takes 2-5 sessions depending on the number of tables in scope.

## Phase 2: Concept-by-concept exploration

This is the heart of the project.  Pick one business concept at a time.  A concept is a specific question with a specific number as the answer: "what was Gross Retention for Q1 2026", "how many active customers did we have at month-end April 2026", "what was the total ARR walked from new logos in 2025".

For each concept:

Open a new file at `exploration/concepts/<concept_name>.md` using `_TEMPLATE.md`.  Fill in the business question and the validation reference (where you'll cross-check the answer).

Ask Claude to propose SQL that answers the question.  The first attempt is usually wrong.  Run it, look at the result, iterate.

The iteration loop: Claude proposes SQL, you (or MCP) run it, the number doesn't match the validation reference, you diagnose why together.  Common diagnoses: wrong filter, wrong join condition, wrong aggregation level, edge cases not handled (test accounts, internal records, etc).

When the number matches the validation reference, the concept is validated.  Capture the final SQL in the concept doc along with the validation reference and the exact number it produces, the edge cases discovered during iteration, and any caveats about scope or applicability.

A successful concept session produces 50-100 lines of SQL and one markdown file.  Sessions are typically 60-90 minutes.  Resist chaining concepts in one session -- focus drops sharply after the first.

## Phase 3: Mart design

Once you have 5-10 validated concepts, patterns will be visible.  Common joins, common filters, common groupings.  Time to propose marts.

A mart is a curated table or view that the app reads.  Each mart serves multiple related concepts efficiently.  Mart design is about finding the right granularity: too fine and the app re-aggregates everything; too coarse and you can't answer related questions.

For each mart proposal, create `exploration/proposals/<mart_name>.md` and `<mart_name>.sql`.  The markdown answers: which concepts does this mart serve, what's the grain, what does refreshing it cost, why is this a separate mart instead of a column in another.  The SQL is the actual proposed mart definition.

Review proposals carefully.  Push back on proposals that try to do too much.  A mart that serves 8 concepts but is incomprehensible is worse than three marts that each serve 3 concepts cleanly.

When approved, the mart graduates to `warehouse/marts/<mart_name>.sql` and gets a validation query in `warehouse/marts/validations/<mart_name>.sql`.  The validation runs every refresh and produces a known number for a known period.

## Phase 4: App development

The mart layer is now a contract.  App development is a separate workflow.  See `APP_KICKOFF.md` for instantiating the app scaffold.  Key principle: the app reads marts.  It does not contain business logic.  When a number changes, you change SQL.

## Working effectively across phases

You will be tempted to skip ahead.  Don't.  Phases exist because skipping leads to rework.  Building an app on an unvalidated mart layer leads to bugs that require teardown.  Designing marts on unvalidated concepts leads to marts that don't answer the right questions.  Exploring concepts without an inventory leads to wasted queries against the wrong tables.

Phase 1 and Phase 2 often interleave in practice.  Discovering a concept requires touching tables, and touching tables fills in the inventory.  Just make sure `DATA_INVENTORY.md` and concept docs stay in sync.

## When numbers don't match

The most common failure mode.  You ran the SQL Claude proposed, the number is wrong, you don't know why.  Debugging hierarchy:

First, check the SQL against the business question.  Is the filter right?  Is the aggregation level right?  Is the join doing what you expect?  AI assistants make subtle errors here often.

Second, check the validation reference.  Is the reference itself definitely correct?  Is it for exactly the same scope and period?  "Q1 2026" might mean fiscal vs. calendar; "active customers" might exclude certain types in one source and not another.

Third, check the raw data.  Run isolation queries: how many rows in the source table for this period?  What's the distinct count of accounts?  Are there obvious outliers or duplicates?  Sometimes the raw data has issues that no SQL will paper over.

Fourth, ask Claude to enumerate edge cases.  "What could cause this number to be lower/higher than expected?"  Often the answer is in there -- a category of records that's being included or excluded inappropriately.

Discipline: do not declare a concept validated when the number is "close enough".  A $200K discrepancy on a $6.5M number looks small but usually indicates a real categorization or scoping difference that will compound across other concepts.

## Skepticism toward vendor confidence scores

When a source system or third-party data provider gives you a "trust", "confidence", or "match quality" field, treat it as one input among many, not as the answer.  Most projects discover at some point that vendor confidence and actual usability are not the same thing.

Build an independent validation when the vendor confidence matters.  The ISW Active Customers project, for example, built a 7-signal independent scoring model because D&B's own confidence code doesn't detect the "wrong data confidently matched" failure mode.

## Documentation hygiene

Update `DATA_INVENTORY.md` as you learn things in Phase 2 and 3.  The inventory built in Phase 1 is the first draft, not the final word.

Add notes to `BUSINESS_LOGIC.md` for any non-obvious rationale.  Why does this calculation exclude internal accounts?  Why is this filter applied at the join rather than the WHERE?  Future you will not remember.

When a session produces meaningful artifacts, commit them to dev with a descriptive message.  The commit log of exploration is itself documentation.
