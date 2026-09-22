# Requirement: Client Document Evidence (CRM-007)

## Business need

The business needs to keep basic information about documents related to a client (e.g. ID cards, contracts, invoices) directly in Salesforce, attached to the client's Account record — tracked as "document evidence" for the client.

## Relationship to the existing Client Document object

An object covering the same concept (`Client_Document__c`, label "Client Document") already exists in this org — see [client-document.md](./client-document.md), [client-document-requirements.md](./client-document-requirements.md), and [client-document-design.md](./client-document-design.md). This ticket (CRM-007) revisits the same data, so this document should be read as a **refinement of that existing object**, not a brand-new one. The field list below is otherwise identical to the original; differences from what's currently deployed are called out explicitly under Open Questions.

## Data to store per document evidence record

| # | Field | Description | Proposed Type | Notes |
|---|---|---|---|---|
| 1 | Document Number | Identifier printed on the physical/digital document | Text(40) | Free text; uniqueness not enforced — numbering schemes vary by document type/issuer |
| 2 | Document Type | What kind of document it is | Picklist (restricted) | ID Card, Passport, Driver's License, Contract, Invoice, Other |
| 3 | Issue Date | When the document was issued | Date | Required |
| 4 | Expiration Date | When the document stops being valid (if applicable) | Date | Optional — some document types (e.g. contracts) may not expire |
| 5 | Related Client | Which client the document belongs to | Master-Detail(Account) | Confirmed — sharing inherited from Account (`ControlledByParent`), cascade-delete on Account deletion |
| 6 | Document Status | Current lifecycle status of the document record | Picklist (restricted), default Draft | Draft, Valid, Expired, Revoked |

Same field types as the currently deployed `Client_Document__c`, plus a validation rule blocking Expiration Date earlier than Issue Date (carried over from the existing object's design).

## Open questions requiring sign-off

1. ~~Relationship type~~ — **Resolved: Master-Detail to Account**, matching the currently deployed object.
2. **Document Type values**: carrying over the existing set — ID Card, Passport, Driver's License, Contract, Invoice, Other — unless this ticket needs new/different values.
3. **Document Status values**: carrying over the existing set — Draft, Valid, Expired, Revoked (default Draft) — unless this ticket needs new/different values.
4. ~~Is this a new object or an update to `Client_Document__c`?~~ — **Resolved: same object.** This ticket (CRM-007) confirms and documents `Client_Document__c` as already deployed; the field list, types, and relationship above match it exactly, so **no metadata changes are required**.

## Supporting metadata

The following were already built for `Client_Document__c` in a prior commit (`9d68601`, PR #11) and match this spec as confirmed — no new metadata required for CRM-007:

| Item | Location |
|---|---|
| FlexiPage (`Client_Document_Record_Page`) | `force-app/main/default/flexipages/` |
| Permission Set (`Client_Document_User`) — object + field-level permissions | `force-app/main/default/permissionsets/` |
| Czech translation | `force-app/main/default/objectTranslations/Client_Document__c-cs/` |
| Slovak translation | `force-app/main/default/objectTranslations/Client_Document__c-sk/` |

See [client-document.md](./client-document.md) and [client-document-design.md](./client-document-design.md) for full details.

## Out of scope (unless stated otherwise)

- Document file/attachment storage (this tracks *metadata about* a document, not the file itself).
- Automated status transitions (e.g. auto-flip to "Expired" when the expiration date passes).
- Reporting/dashboards.
