# Background
I'm attending a training focused on working with VS Code, Claude Code with Salesforce (I have the connected Salesforce dev org). We got this requirement what to build. I need to come up with design and then implement it using proper CI/CD pipeline (already created a branch, then I need to commit, push and create a PR)

# What We Want to Build

We want to create a simple Salesforce solution for storing client documents. The business needs to keep basic information about documents related to a client.

For each document, we want to store:

- document number
- document type
- issue date
- expiration date
- related client/account
- document status

The solution should also include everything needed so users can start using it:

- Salesforce metadata for the document structure
- flexipage
- field-level permissions
- object permissions
- Czech translation
- Slovak translation

## Expected Output

At the end of the exercise, the participant should complete the standard project workflow:

- prepare the requirement in a Markdown file
- use Claude Code for design and `grill-me` review
- implement and test the metadata
- try retrieve from the Salesforce org
- create a pull request
- and prepare a short documentation

# Proposed Design

## Data Model

New custom object **`Document__c`**, related to `Account` via a **Master-Detail** relationship (documents always belong to a client/account, inherit its sharing, and are deleted with it).

| Field Label | API Name | Type | Notes |
| --- | --- | --- | --- |
| Document Name | `Name` | Auto Number | Display format `DOC-{0000}` — the record name, distinct from the physical document's own number |
| Document Number | `Document_Number__c` | Text(50), required, unique (case-insensitive) | The number printed on the physical document (e.g. passport number) |
| Document Type | `Document_Type__c` | Picklist | Values: Passport, National ID Card, Driver's License, Other |
| Issue Date | `Issue_Date__c` | Date | |
| Expiration Date | `Expiration_Date__c` | Date | |
| Account | `Account__c` | Master-Detail → Account | Relationship name `Documents` (shows as related list "Documents" on Account) |
| Document Status | `Status__c` | Picklist | Values: Valid, Expired, Pending Review |

Base metadata (API names, picklist values) stays in English per project convention; user-facing labels are translated via Translation Workbench (CS/SK), not Custom Labels, since there's no custom UI code involved.

## Permissions

One **Permission Set** — `Document_Management` — granting:
- Object permissions: Create, Read, Edit, Delete (no ViewAll/ModifyAll)
- Field-level security: Read + Edit on all custom fields above
- Tab visibility: Visible (see below)

## Navigation & UI

- New **Custom Tab** for `Document__c` so it's addable to Lightning apps/navigation.
- New **Lightning Record Page (FlexiPage)** for `Document__c`: highlights panel + record detail.
- **Account Lightning Record Page**: add a "Documents" related list so a client's documents are visible directly from their Account. Since no Account FlexiPage exists in source yet, this will be retrieved from the org first, edited, redeployed, then re-retrieved to confirm — this is also the concrete task-level use of the "try retrieve from the Salesforce org" step.

## Translations

`CustomObjectTranslation` for `cs` and `sk` locales covering the object label, all custom field labels, and picklist values (Czech/Slovak business terms, not literal translations) — no changes needed to `Name`/`Account__c` beyond the field label since `Account` itself is a standard object already translated by Salesforce.

## Implementation Steps

1. Author object + 6 fields metadata (`force-app/main/default/objects/Document__c/`).
2. Author Permission Set `Document_Management`.
3. Author Custom Tab for `Document__c`.
4. Deploy steps 1–3 to the connected `training` dev org, assign the permission set to self, sanity-check in Setup.
5. Build the `Document__c` record page and add the Documents related list to the Account page in-org (Lightning App Builder), then retrieve both FlexiPages into source.
6. Author `cs`/`sk` CustomObjectTranslations, deploy, verify Translation Workbench languages are enabled for the org.
7. Retrieve the full set back from the org to confirm source and org match.
8. Commit on the current feature branch, push, open a PR against `main`.
9. Write short documentation (what was built, how to assign access, screenshots optional).