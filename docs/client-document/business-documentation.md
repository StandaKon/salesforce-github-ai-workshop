# Client Documents — Business Documentation

## What problem does this solve?

The business needs a simple, reliable place to keep track of the documents it holds for each client — things like identification documents, signed contracts, invoices, or certificates. Before this solution, there was no structured way in Salesforce to record which documents exist for a client, when they were issued, when they expire, and whether they're still valid.

**Client Documents** gives every client (Account) a related list of its documents, each with enough information to answer the questions that matter day to day:

- What documents do we have on file for this client?
- What type of document is it?
- When was it issued, and does it expire?
- Is it still valid, expired, pending review, or rejected?

## Who uses it

Two levels of access are available, assigned via Permission Set:

| Permission Set | Who it's for | What they can do |
|---|---|---|
| **Client Document Access** | Staff who manage client documentation (e.g. onboarding, compliance, account management) | Create, view, edit, and delete document records |
| **Client Document Read Only** | Staff who only need to check document status (e.g. support, sales) | View documents only — cannot create, change, or delete them |

Ask your Salesforce admin to assign the appropriate Permission Set to a user.

## What information is captured

| Field | Business meaning |
|---|---|
| **Document Number** | A unique reference number assigned automatically by Salesforce to every document record — used to identify it in lists, searches, and reports. |
| **Client Account** | The client this document belongs to. Every document is always linked to exactly one client. |
| **Document Type** | The kind of document: Identification Document, Contract, Invoice, Certificate, or Other. |
| **Issue Date** | The date the document was issued/signed. Always required. |
| **Expiration Date** | The date the document stops being valid, if it has one. Not every document type expires (e.g. a signed contract may not have an expiration date), so this field is optional. |
| **Document Status** | Where the document stands: **Pending** (default, awaiting review), **Active** (valid and in effect), **Expired** (past its expiration date), or **Rejected** (not accepted). |

## Business rules

- **A document always belongs to a client.** It cannot be created or exist without being linked to an Account. Deleting a client's Account also deletes its documents — this was a deliberate decision (see "Design decisions" in [requirement.md](requirement.md)), because a document with no client isn't meaningful for this business process.
- **Document Number is never entered manually** — it's assigned automatically so every document has a unique, unambiguous reference.
- **Document Status defaults to "Pending"** when a document is first created, reflecting that new documents typically need review before being marked Active.
- **Document Type is a fixed list of categories.** Adding a new category (beyond the five currently defined) requires an admin/configuration change — it's not free text.

## Example scenarios

These match the sample data currently loaded in the training org:

| Scenario | Document Number | Client | Type | Status |
|---|---|---|---|---|
| A valid ID on file for a long-standing client | DOC-0001 | Edge Communications | Identification Document | Active |
| A signed contract with no expiration | DOC-0002 | Edge Communications | Contract | Active |
| An invoice awaiting processing | DOC-0003 | Burlington Textiles Corp of America | Invoice | Pending |
| A certificate that has lapsed | DOC-0004 | Pyramid Construction Inc. | Certificate | Expired |
| An ID document that didn't pass review | DOC-0005 | Dickenson plc | Identification Document | Rejected |

## Language support

The solution is available in **English**, **Czech**, and **Slovak** — object names, field labels, and status/type values are all translated. A user sees the solution in their own Salesforce language automatically, based on their personal language setting.

## What's not included (yet)

- **The document file itself is not stored here.** This solution tracks information *about* a document (its number, type, dates, status) — it does not store the scanned PDF or image. If the business needs to attach the actual file, that's a separate, future enhancement (Salesforce Files).
- No automated reminders when a document is about to expire.
- No reporting/dashboards have been built yet, though the data is fully reportable since it's a standard Salesforce object.

For the underlying design decisions and trade-offs behind these choices, see [requirement.md](requirement.md). For deployment and configuration details, see [technical-documentation.md](technical-documentation.md).
