# Requirement: Client Document Management

## What We Want to Build

We want to create a simple Salesforce solution for storing client documents.

The business needs to keep basic information about documents related to a client.

For each document, we want to store:

- document number
- document type
- issue date
- expiration date
- related client/account
- document status

The solution should also include everything needed so users can start using it:

- Salesforce metadata for the document structure
- FlexiPage
- field-level permissions
- object permissions
- Czech translation
- Slovak translation

## Expected Output

At the end of the exercise, the participant should complete the standard project workflow:

1. prepare the requirement in a Markdown file
2. use Claude Code for design and grill-me review
3. implement and test the metadata
4. try retrieve from the Salesforce org
5. create a pull request
6. prepare a short documentation

## Implementation Phases

### Phase 1 — Data Model

- Create a custom object to represent a client document (e.g. `Client_Document__c`).
- Add fields:
  - Document Number (Text or Auto Number)
  - Document Type (Picklist)
  - Issue Date (Date)
  - Expiration Date (Date)
  - Account (Lookup or Master-Detail to Account)
  - Status (Picklist)
- Decide sharing model and relationship type (Lookup vs. Master-Detail) to Account.
- Follow the `generating-custom-object` and `generating-custom-field` skills; base metadata and API names stay in English (en-US).

### Phase 2 — User Interface (FlexiPage)

- Create a record page (FlexiPage) for the new document object.
- Add a related list for documents on the Account record page so users can see a client's documents in context.
- Follow the `generating-flexipage` skill.

### Phase 3 — Security

- Field-level security for all new fields.
- Object permissions (CRUD) for the relevant profiles/permission sets.
- Prefer a dedicated Permission Set over profile changes.

### Phase 4 — Localization

- Czech translation for the object label, field labels, and picklist values.
- Slovak translation for the object label, field labels, and picklist values.

### Phase 5 — Implementation, Test & Retrieve

- Design the solution and run a grill-me review with Claude Code before implementing.
- Implement the metadata described in Phases 1–4.
- Deploy to a scratch/dev org and validate manually.
- Retrieve the metadata from the org to confirm it matches what was deployed.

### Phase 6 — Pull Request & Documentation

- Open a pull request with the changes (no direct commits to `main`/`master`).
- Prepare short documentation describing the data model, permissions, and translations delivered.
