# Template Notes

This file is unique to this project.  It records (a) which version of `claude-core-template` this project was cloned from, (b) project-specific deviations from the template, and (c) candidate upstream changes -- things done in this project that should probably feed back into the template.

See `docs/UPSTREAMING.md` for the workflow that uses this file.

## Template version at clone

Source repo: https://github.com/joshtingle/claude-core-template
Clone date: ____ (YYYY-MM-DD)
Template version at clone: ____ (from `TEMPLATE_VERSION` at the time)

## Project-specific deviations

When this project intentionally departs from the template's defaults, record it here with the reason.  This protects against re-introducing the deviation by accident on the next template sync, and also signals patterns that might deserve to become first-class template options.

Format:

```
### (date) Short title
Deviation: what the project does differently from the template
Reason: why
Risk to upstream: would this be safe to add as an option in the template?
```

(Empty at clone.)

## Candidate upstream changes

When you discover something in this project that should flow back to the template, record it here.  Future template-maintenance sessions walk this list and decide what to merge upstream.

Format:

```
### (date) Short title
Discovered: brief description of how this came up in the project
Genericized description: what the change is, with project-specific names abstracted
Suggested change to template: which files in the template should be touched, and how
Status: [proposed | reviewed | merged-into-template-v0.X | rejected]
```

(Empty at clone.  Add entries as discoveries happen.)

## Promotion log

When a candidate is merged into the template, move it here with the resulting template version:

```
### (date) Title -- merged into template v0.X
(Brief recap)
```

(Empty at clone.)
