# Account Document

Tracks documents (ID cards, passports, contracts, invoices, certificates, etc.) belonging to a client, stored directly on the client's Account record.

See [account-document-requirements.md](./account-document-requirements.md) and [account-document-design.md](./account-document-design.md) for the original ask, the design rationale, and the confirmed decisions from the grill-me review.

> **Note on scope:** this repo already contains a `Client_Document__c` object covering the same business need (added separately, see commit `9d68601`). `Account_Document__c` was built independently as a workshop practice exercise — it is **not** intended to be merged into `main` alongside `Client_Document__c` as a second production object. Before merging, the team should decide which implementation (if either) becomes canonical.

## What was added

| Metadata | Location |
|---|---|
| Custom object `Account_Document__c` + 6 fields + a validation rule | `force-app/main/default/objects/Account_Document__c/` |
| Record page `Account_Document_Record_Page` | `force-app/main/default/flexipages/` |
| Permission set `Account_Document_User` | `force-app/main/default/permissionsets/` |
| Czech (cs) / Slovak (sk) translations | `force-app/main/default/objectTranslations/Account_Document__c-cs/`, `-sk/` |

## Field reference

| Field | API Name | Type | Required |
|---|---|---|---|
| Account | `Account__c` | Master-Detail → Account | Yes |
| Document Number | `Document_Number__c` | Text(40), unique (case-insensitive) | Yes |
| Document Type | `Document_Type__c` | Picklist: ID Card, Passport, Contract, Invoice, Certificate, Other | Yes |
| Issue Date | `Issue_Date__c` | Date | Yes |
| Expiration Date | `Expiration_Date__c` | Date | No |
| Document Status | `Document_Status__c` | Picklist: Draft, Valid, Expired, Revoked (default Draft) | Yes |

A validation rule (`Expiration_After_Issue_Date`) blocks saving a record whose Expiration Date is earlier than its Issue Date.

## Behavior to be aware of

- **Cascade delete**: because Account is a master-detail relationship, deleting an Account deletes all of its Account Document records. There is no separate sharing model to configure — a document is only visible to whoever can see its Account.
- **Org-wide unique document numbers**: `Document_Number__c` cannot repeat anywhere in the org (case-insensitive), not just within one Account or Document Type.
- **`Expiration_Date__c` requires FLS to be granted explicitly.** Unlike required fields (which are visible to anyone with object access by default), this optional field is only visible/editable to users who have the `Account_Document_User` permission set — including via the API. This is expected platform behavior, not a bug: it caught us out during testing when the field appeared to be "missing" from SOQL/describe results until the permission set was assigned to the testing user.
- Documents show up in a related list on the Account page automatically via the master-detail relationship; there is currently **no related list added to the Account page layouts** (see "Known gaps" below).

## Granting access

Assign the **Account Document User** permission set to any user who needs to create/view/edit/delete documents:

```
sf org assign permset -n Account_Document_User
```

The permission set grants Read/Create/Edit/Delete on Account Document, Read on Account (required because of the master-detail relationship), and field-level access to the one optional field (`Expiration_Date__c` — required fields are always visible to anyone with object access).

## Translations

Czech and Slovak labels (object label, all field labels, picklist value labels for `Document_Type__c`/`Document_Status__c`, and the validation rule error message) are included in source control as the intended configuration.

**Known org prerequisite:** for these to actually appear in the UI — or even round-trip via retrieve — the org needs cs/sk enabled under **Setup → Translation Workbench → Company Languages**. During testing on the `training` org, the object's top-level label translated and persisted correctly, but the field-label, picklist-value, and validation-rule-message translations did **not** persist server-side (a metadata retrieve came back missing them) even though the deploy reported success. This is consistent with cs/sk not being enabled as Company Languages in this org yet — it's an org configuration step, not something the metadata deploy can turn on by itself. The full translation content stays in source control as the intended target state.

Only the nominative grammatical case was translated for the object name; other Czech/Slovak noun cases were left as Salesforce's auto-generated (commented-out) nominative fallback and can be refined later by a native speaker if needed.

## Known gaps / follow-ups

- **No related list on Account page layouts.** The design intended documents to be reachable via a related list on the Account record page (like the existing `Client_Document__c` implementation does). Adding that related list to the four Account layouts was attempted but is currently **blocked**: those layout files also reference `Account.ICO__c`, a field that's committed to `main` but not yet deployed to the `training` org, so any deploy touching those layout files fails on an unrelated pre-existing gap. Once `Account.ICO__c` is deployed to the target org (or the layout dependency is otherwise resolved), the related list can be added the same way `Client_Document__c` did it.
- **Duplication with `Client_Document__c`** needs a team decision before this can merge to `main` as-is (see the note at the top of this document).

## Testing performed

- Deployed via `sf deploy metadata` to the `training` org (this CLI installation is an older `sf` v1.70.0, so the command topic is `sf deploy metadata` rather than the newer `sf project deploy start` — same underlying behavior) — succeeded (12/12 components: object, 6 fields, validation rule, FlexiPage, permission set, cs/sk translations).
- Created a real Account + Account Document record via `sf data create record`; confirmed required fields/picklists/defaults work.
- Confirmed the validation rule blocks an expiration date earlier than the issue date.
- Confirmed the unique constraint blocks a duplicate `Document_Number__c` (case-insensitive: `ad-test-001` collided with `AD-TEST-001`).
- Confirmed cascade delete: deleting the Account removed its Account Document record.
- Retrieved the metadata back from the org (`sf retrieve metadata`) to confirm the object/fields/validation rule round-trip cleanly; the cs/sk translation round-trip surfaced the Company Languages gap documented above.
- Test Account/record and the temporary self-assigned permission set were removed afterward — no leftover data or access in the org.
