# Client Documents — Requirement

## Overview
We need a simple Salesforce solution for storing documents related to a client. The solution should let users record basic information about each document and associate it with a Client/Account.

## Data Model

### Object: Client Document
A new custom object to hold document records, related to an Account.

| Field | API Name (suggested) | Type | Notes |
| --- | --- | --- | --- |
| Document Number | `Document_Number__c` | Text | Identifier of the document (e.g., ID card number, passport number) |
| Document Type | `Document_Type__c` | Picklist | e.g., ID Card, Passport, Driver's License, Contract — to be confirmed |
| Issue Date | `Issue_Date__c` | Date | Date the document was issued |
| Expiration Date | `Expiration_Date__c` | Date | Date the document expires |
| Related Client/Account | `Account__c` | Lookup/Master-Detail to Account | Links the document to a client |
| Document Status | `Status__c` | Picklist | e.g., Valid, Expired, Revoked — to be confirmed |

Exact field types (Lookup vs. Master-Detail, picklist values) and sharing model to be finalized during design.

## Functional Scope

1. **Metadata** — Custom object and fields for the document structure listed above.
2. **FlexiPage** — Record page for the Client Document object (and/or a related list on the Account page) so users can view and manage documents.
3. **Field-Level Security** — Field-level permissions configured (e.g., via a Permission Set) so the right users can access the new fields.
4. **Object Permissions** — Object-level CRUD permissions configured (e.g., via a Permission Set) for the new object.
5. **Translations**
   - Czech translation of labels/picklist values.
   - Slovak translation of labels/picklist values.

## Out of Scope
- Anything not explicitly listed above (e.g., automation/validation rules, document file attachments/content) unless agreed during design.

## Expected Workflow
1. Prepare this requirement as a Markdown file. ✅ (this document)
2. Use Claude Code to design the solution and run a grill-me review of the design.
3. Implement and test the metadata in a scratch/dev org.
4. Retrieve the metadata from the Salesforce org to confirm it matches what was deployed.
5. Create a pull request against `main`.
6. Prepare short documentation describing the solution.
