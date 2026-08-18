# Requirement template

> How to use: copy this file to `docs/<feature-name>/requirement.md`, fill in each section, then work through it with Claude Code (or another agent) as a **design and grill-me review** before any metadata gets written. Delete the guidance blockquotes as you fill in each section; keep the headings.

This template captures the standard workflow used on this project: write the requirement → design + grill-me review → implement/test metadata → retrieve from org → pull request → short documentation. See a completed example at [../client-document/requirement.md](../client-document/requirement.md).

## Business ask (as given)

> Paste the requirement as it was given to you — verbatim, in a quote block — even if it's informal or incomplete. This is the source of truth to check the final solution against, and it's useful evidence later of what was actually asked for vs. what got assumed.

## Scope

List what's explicitly in scope, and call out anything a reasonable reader might assume is included but isn't (and why). Being explicit about exclusions here avoids scope creep discovered late, during review or testing.

In scope:
1. ...

Out of scope (not requested, called out for a future iteration):
- ...

## Data model / design decisions

> One row per decision that wasn't fully specified by the business ask and had to be made by the implementer. Each decision should be checked with the stakeholder during the grill-me review, not silently assumed.

| Decision | Choice | Rationale |
|---|---|---|
| e.g. Relationship type | Master-Detail / Lookup | Why this one, not the other |

## Fields / components (implemented)

> Fill this in once the design is settled — one table row per field, component, or metadata unit. Match whatever's relevant to what you're building (fields for an object, a truth table for a Flow, etc.)

| API Name | Label | Type | Required |
|---|---|---|---|

## Remaining work

> A checklist of every deliverable the requirement implies, so nothing quietly gets skipped: implementation, tests, translations, permissions, retrieve verification, PR, documentation, seed data. Check items off as they're completed — this section becomes the project's own status tracker.

- [ ] ...

## Grill-me review — open questions / risks

> Before writing any metadata, challenge the design out loud: what happens on delete? What's not covered that the business probably expects? What's ambiguous and being guessed at? What platform constraint might bite later? Put each one here as a question, then resolve it with the stakeholder and turn it into a decision (move it into "Data model / design decisions" once resolved, noting what was decided and why).

1. ...

## Implementation notes / lessons learned

> Fill this in *after* implementation, not before. Capture anything genuinely surprising that came up while deploying/testing this specific requirement — a metadata rule, an org-specific quirk, an error message and its fix — so the next person (or the next AI session) doesn't have to rediscover it. Skip generic Salesforce knowledge everyone already knows; only write down what was actually surprising here.
