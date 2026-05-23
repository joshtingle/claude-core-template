# Upstreaming

The point of `claude-core-template` is that it gets better with each project that uses it.  This doc describes the workflow that makes that real.

Without discipline, you end up with N projects that each have slightly different copies of the same scaffolding, the template never gets updated, and the "ever-improving" part stays theoretical.  The pattern below makes the loop concrete.

## The loop in three steps

**Step 1: discover.**  While working on a project, you find a pattern, a fix, a new component, a doc improvement, or a workflow tweak that would help any future project using the template.

**Step 2: record.**  In the current project's `TEMPLATE_NOTES.md`, add an entry under "Candidate upstream changes" with a genericized description (project-specific names abstracted) and a suggestion for which files in the template should change.

**Step 3: promote.**  Periodically (every few weeks, or when finishing a project), visit the template repo, walk through candidate upstream changes from active projects, decide which to merge, make the changes in the template, bump `TEMPLATE_VERSION`, tag, and push.

## When to record an upstream candidate

Good triggers:

- You wrote a small utility function or component and realized any project could use it.
- You hit a gotcha and added a fix; the gotcha is generic but the fix landed in this project only.
- You added a doc clarification because something was unclear; the doc lives in your project but should be in the template.
- You discovered the template makes an assumption that's wrong for your case; the assumption should be flagged as an option in the template instead.
- You stitched together a workflow (claude.ai posture, prompt phrasing, kickoff question order, etc.) that worked well and should be baked into the template.

Bad triggers (do NOT record these as upstream candidates):

- Code that's specific to your project's domain.  An ARR calculation belongs in the project, not the template.
- A library choice you made because of project-specific constraints.  Don't push your stack choices on future projects unless they generalize.
- A fix that was actually a workaround for a bug you should have fixed at the root.

## Recording an upstream candidate

In the project's `TEMPLATE_NOTES.md`, under "Candidate upstream changes":

```
### 2026-06-15 WelcomeModal multi-tenant support
Discovered: building the dashboard for a multi-tenant client, the welcome modal showed pages the user couldn't access.
Genericized description: WelcomeModal's PAGES array should be optionally filterable by user role or capability.
Suggested change to template: add an optional `filterByRole` prop to WelcomeModal that, if provided, filters PAGES before rendering.  Backwards-compatible default of no filter preserves current behavior.
Status: proposed
```

Keep it brief.  The candidate is a memo to your future self when you visit the template, not a full pull request.

If you have time and energy, you can attach a code snippet showing the change with project-specific names abstracted.  If you don't, the description is enough -- the template-maintenance session can re-derive the code.

## Periodic template maintenance

Every few weeks, or when you finish a project, sit down at the template repo and process the upstream queue.

Standard prompt to fire at Claude:

> We're doing a template maintenance pass.  Here are the `TEMPLATE_NOTES.md` files from my active projects: [paste them, or list the repos].  Walk through each "Candidate upstream changes" entry.  For each, recommend: merge as-is, merge with modifications, reject (with reason), or defer (with reason).  Group related candidates together where possible.  Show me the plan before making any changes.

Walk through the recommendations.  For each accepted candidate:

1. Make the actual change in the template.
2. Move the entry in the originating project's `TEMPLATE_NOTES.md` from "Candidate upstream changes" to "Promotion log" with the resulting template version.
3. Add a `CHANGES.md` entry in the template.

When the maintenance pass is complete:

1. Bump `TEMPLATE_VERSION` (use semver-ish: minor bump for additions, major for breaking changes).
2. Commit with a descriptive message.
3. Tag the commit with the new version (`git tag v0.2; git push --tags`).
4. Optionally, notify active projects that a new template version is out so they can adopt anything they want.

## Backporting into an active project

Most of the time you won't backport template changes into a running project -- the project is what it is, and you're focused on its current goals.  Sometimes you will, especially for security fixes or important bug fixes.

To backport:

1. Read the relevant diff from the template since the project's clone version.
2. Apply the changes manually to the project (or ask Claude Code to do it).
3. Update the project's `TEMPLATE_NOTES.md`: change the "Template version at clone" to reflect the current adopted version, and add a note in "Promotion log" about which changes were adopted.

Don't try to do automatic merges from the template into a project.  Files diverge too much.  Manual selective backports are the realistic path.

## What this loop produces over time

After 3-5 projects, the template has absorbed the patterns that proved useful across them.  The kickoff conversation gets sharper.  The default app scaffold has the components every project needs.  The stack profile docs have the gotchas you've actually hit.  Mature templates are battle-tested templates.

The discipline is: record candidates immediately when you spot them, even if you can't articulate them well yet.  A half-formed entry is better than a forgotten insight.  Process the queue when you have a quiet hour.
