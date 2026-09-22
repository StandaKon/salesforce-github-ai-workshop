# Client Document

Tracks documents (ID cards, passports, contracts, invoices, etc.) belonging to a client, stored directly on the client's Account.

See [client-document-requirements.md](./client-document-requirements.md) and [client-document-design.md](./client-document-design.md) for the original ask and design rationale.

## What was added

| Metadata | Location |
|---|---|
| Custom object `Client_Document__c` + 6 fields + a validation rule | `force-app/main/default/objects/Client_Document__c/` |
| Record page `Client_Document_Record_Page` | `force-app/main/default/flexipages/` |
| Permission set `Client_Document_User` | `force-app/main/default/permissionsets/` |
| Czech (cs) / Slovak (sk) translations | `force-app/main/default/objectTranslations/Client_Document__c-cs/`, `-sk/` |

## Field reference

| Field | API Name | Type | Required |
|---|---|---|---|
| Client | `Client__c` | Master-Detail → Account | Yes |
| Document Number | `Document_Number__c` | Text(40) | Yes |
| Document Type | `Document_Type__c` | Picklist: ID Card, Passport, Driver's License, Contract, Invoice, Other | Yes |
| Issue Date | `Issue_Date__c` | Date | Yes |
| Expiration Date | `Expiration_Date__c` | Date | No |
| Document Status | `Document_Status__c` | Picklist: Draft, Valid, Expired, Revoked (default Draft) | Yes |

A validation rule (`Expiration_After_Issue_Date`) blocks saving a record whose Expiration Date is earlier than its Issue Date.

## Behavior to be aware of

- **Cascade delete**: because Client is a master-detail relationship, deleting an Account deletes all of its Client Document records. There is no separate sharing model to configure — a document is only visible to whoever can see its Account.
- Documents show up in a related list on the Account page automatically; there is no separate tab.

## Granting access

Assign the **Client Document User** permission set to any user who needs to create/view/edit/delete documents:

```
sf org assign permset -n Client_Document_User -o <org alias>
```

The permission set grants Read/Create/Edit/Delete on Client Document, Read on Account (required because of the master-detail relationship), and field-level access to the one optional field (`Expiration_Date__c` — required fields are always visible to anyone with object access).

## Translations

Czech and Slovak labels/picklist values are included. For them to actually appear in the UI, the org needs those languages enabled under **Setup → Translation Workbench → Company Languages** (add cs/sk as supported languages first if not already active) — this is an org configuration step, not something the metadata deploy can turn on by itself. All six grammatical cases (nominative through locative) are now translated for the object name in both languages, so Salesforce's dynamic sentence generation (e.g. "Related Client Document") renders correctly regardless of case. These declensions are a best-effort translation, not yet reviewed by a native speaker — flag for review before relying on them in production.

## Testing performed

- Deployed via `sf project deploy start` to the workshop dev org — succeeded (12/12 components).
- Created a real Account + Client Document record via `sf data create record`; confirmed required fields/picklists/defaults work.
- Confirmed the validation rule blocks an expiration date earlier than the issue date.
- Confirmed cascade delete: deleting the Account removed its Client Document record.
- Retrieved the metadata back from the org (`sf project retrieve start`) to confirm it round-trips cleanly.
- Test Account/record were deleted afterward — no leftover data in the org.
