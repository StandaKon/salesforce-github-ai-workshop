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

Assign the **Client Document User** permission set to any user who needs to create/view/edit documents:

```
sf org assign permset -n Client_Document_User -o <org alias>
```

The permission set grants Read/Create/Edit (**no Delete**) on Client Document, Read on Account (required because of the master-detail relationship), and field-level access to the one optional field (`Expiration_Date__c` — required fields are always visible to anyone with object access; Salesforce doesn't allow an explicit FLS entry for a required field). Delete was intentionally left out: these records can hold sensitive personal documents (ID cards, passports), and a document should be retired via the `Document_Status__c` = "Revoked" value rather than deleted outright, so there's always a record that it existed.

## Translations

Czech and Slovak labels are included for the object name, all field labels, and all picklist values on `Document_Type__c` and `Document_Status__c`. For them to actually appear in the UI, the org needs those languages enabled under **Setup → Translation Workbench → Company Languages** (add cs/sk as supported languages first if not already active) — this is an org configuration step, not something the metadata deploy can turn on by itself. Only the nominative grammatical case was translated for the object name; other Czech/Slovak noun cases were left as Salesforce's auto-generated (commented-out) nominative fallback and can be refined later by a native speaker if needed.

## Testing performed

- Validated with `sf project deploy start --dry-run` (check-only, no changes saved) against the workshop dev org — succeeded, 0 failures across all 13 components.
- This caught a real error during development: an explicit field-level permission entry on a *required* field (`Document_Status__c`) is rejected by Salesforce, since required fields are always visible/editable to anyone with object access. Fixed by only granting FLS on the one optional field, `Expiration_Date__c`.
- A real deploy, live record creation, and retrieve round-trip were **not** performed in this session (dry-run only, by request) — still open as next steps before merging.
