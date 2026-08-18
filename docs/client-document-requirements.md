# Requirement: Client Document Tracking

## Business need

The business needs to keep basic information about documents related to a client (e.g. ID cards, contracts, invoices) directly in Salesforce, attached to the client's Account record.

## Data to store per document

| # | Field                  | Description                                   |
|---|-------------------------|------------------------------------------------|
| 1 | Document number          | Identifier printed on the physical/digital document |
| 2 | Document type             | What kind of document it is |
| 3 | Issue date                | When the document was issued |
| 4 | Expiration date            | When the document stops being valid (if applicable) |
| 5 | Related client/account    | Which Account the document belongs to |
| 6 | Document status           | Current lifecycle status of the document record |

## Scope of "ready to use"

- Salesforce metadata for the document data structure (custom object + fields)
- A FlexiPage (Lightning record page) for viewing/editing a document
- Field-level security and object permissions so a business user role can actually use the object
- Czech translation of labels
- Slovak translation of labels

## Assumptions requiring sign-off

These were not specified in the original ask and were decided during design — please confirm or correct:

1. **Relationship type: Master-Detail to Account** (not a plain Lookup). Consequence: a document's sharing/visibility is fully inherited from its Account, and documents are automatically deleted if the parent Account is deleted. No separate sharing rules are needed.
2. **No dedicated tab/app** — documents are accessed via a related list on the Account, not a standalone navigation item.
3. **Document Type values** (default proposal): ID Card, Passport, Driver's License, Contract, Invoice, Other.
4. **Document Status values** (default proposal): Draft, Valid, Expired, Revoked (default: Draft).

## Out of scope

- Document file/attachment storage (this tracks *metadata about* a document, not the file itself — Salesforce Files/ContentDocument could be linked later if needed).
- Automated status transitions (e.g. auto-flip to "Expired" when the expiration date passes) — not requested.
- Reporting/dashboards.
