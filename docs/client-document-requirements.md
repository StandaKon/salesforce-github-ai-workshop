# Requirements: Client Document Tracking

## Business need

The business needs a simple Salesforce solution to keep basic information about documents related to a client.

## Data to store per document

| # | Field | Description |
|---|---|---|
| 1 | Document number | Identifier of the document |
| 2 | Document type | What kind of document it is |
| 3 | Issue date | When the document was issued |
| 4 | Expiration date | When the document stops being valid |
| 5 | Related client/account | Which client (Account) the document belongs to |
| 6 | Document status | Current lifecycle status of the document record |

## Scope of "ready to use"

- Salesforce metadata for the document data structure
- FlexiPage (Lightning record page)
- Field-level permissions
- Object permissions
- Czech translation
- Slovak translation

## Decisions

The original ask did not specify the following; these have been decided:

1. **Relationship to Account: Master-Detail.** Sharing and deletion are fully inherited from the Account — if the Account is deleted, its documents are deleted with it. No separate sharing rules are needed.
2. **Access point: related list on the Account record page.** No dedicated tab/app.
3. **Document Type values:** ID Card, Passport, Driver's License, Contract, Invoice, Other.
4. **Document Status values:** Draft, Valid, Expired, Revoked — default Draft.
5. **Access scope: all internal standard users**, via a permission set granting object and field-level access to Client Documents.

## Out of scope (unless stated otherwise)

- Storing the actual document file/attachment (this tracks metadata *about* a document, not the file itself).
- Automated status transitions (e.g. auto-flip to "Expired" once the expiration date passes).
- Reporting/dashboards.
