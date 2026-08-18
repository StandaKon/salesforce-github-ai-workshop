# Client Documents

Stores basic information about documents related to a client (Account) — e.g. IDs, contracts, invoices, certificates — so users can track what documents exist, their validity period, and their status.

See [requirement.md](requirement.md) for the full requirement, design decisions, and implementation notes.

## What's included

| Metadata | API Name | Purpose |
|---|---|---|
| Custom Object | `Client_Document__c` | Stores one record per client document |
| FlexiPage | `Client_Document_Record_Page` | Default Lightning record page for viewing/editing a document |
| Permission Set | `Client_Document_Access` | Full access (Create/Read/Edit/Delete) — assign to users who manage documents |
| Permission Set | `Client_Document_ReadOnly` | Read-only access — assign to users who only need to view documents |
| Translations | `cs`, `sk` | Czech and Slovak labels for the object, fields, and picklist values |

## Data model

`Client_Document__c` is a **child of Account** (Master-Detail): a document cannot exist without its client, and deleting the Account deletes its documents.

| Field | Type | Required | Notes |
|---|---|---|---|
| Document Number (`Name`) | Auto Number `DOC-{0000}` | — | System-generated record identifier |
| Client Account (`Account__c`) | Master-Detail → Account | Yes | |
| Document Type (`Document_Type__c`) | Picklist | Yes | Identification Document, Contract, Invoice, Certificate, Other |
| Issue Date (`Issue_Date__c`) | Date | Yes | |
| Expiration Date (`Expiration_Date__c`) | Date | No | Not every document type expires |
| Document Status (`Document_Status__c`) | Picklist | Yes | Pending (default), Active, Expired, Rejected |

## Getting started (as an admin)

1. Deploy the metadata: `sf project deploy start --source-dir force-app --target-org <org>`
2. Assign a Permission Set to users:
   ```
   sf org assign permset --name Client_Document_Access --target-org <org>
   ```
   or `Client_Document_ReadOnly` for view-only users.
3. Open any Account and add the "Client Documents" related list to its Lightning page (Master-Detail children aren't added to a customized Account page automatically).
4. Users with either Permission Set can now create/view Client Document records from the Account's related list.

## Known follow-ups (not in this iteration)

- No file/attachment storage — this object holds document *metadata* only, not the scanned file itself.
- `Document_Type__c` values are a placeholder set — validate against real business categories before go-live.
- Only the Nominative grammatical case is translated for cs/sk; other cases are blank (rarely needed).
- No automation, validation rules, or reporting — none requested for this iteration.
