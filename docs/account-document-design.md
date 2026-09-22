# Design: Account Document Tracking

See [account-document-requirements.md](./account-document-requirements.md) for the business ask.

## Data model

**Custom Object:** `Account_Document__c` (label "Account Document" / plural "Account Documents")
- Record name: Autonumber, format `AD-{0000}` (the document number is already tracked as its own field, so the Name doesn't need to duplicate it and shouldn't be user-entered).
- Sharing model: `ControlledByParent` (required for a master-detail child).
- Reports and search enabled; Activities disabled (not needed for a document record).

**Fields:**

| API Name               | Type                                  | Required | Notes |
|-------------------------|-----------------------------------------|----------|-------|
| `Account__c`             | Master-Detail(Account)                   | Yes      | relationshipName `Account_Documents` — shows as a related list on Account |
| `Document_Number__c`     | Text(40), Unique (case-insensitive)      | Yes      | Org-wide unique — declarative field-level uniqueness, no scoping per Account/Type |
| `Document_Type__c`       | Picklist (restricted)                     | Yes      | ID Card, Passport, Contract, Invoice, Certificate, Other |
| `Issue_Date__c`          | Date                                      | Yes      | |
| `Expiration_Date__c`     | Date                                      | No       | Some document types (e.g. contracts) may not expire |
| `Document_Status__c`     | Picklist (restricted), default Draft       | Yes      | Draft, Valid, Expired, Revoked |

**Validation rule:** `Expiration_After_Issue_Date` — blocks save when `Expiration_Date__c` is populated and earlier than `Issue_Date__c`.

## Security

**Permission Set:** `Account_Document_User`
- Object permissions: Read, Create, Edit, Delete (no View All / Modify All — sharing is inherited from the Account via master-detail, so an org-wide "view all" bypass isn't needed).
- Field permissions: Read + Edit on all fields above.
- Assigned manually to users/profiles that need to manage documents (not baked into a default profile, to keep the change additive/non-disruptive).

## UI

**FlexiPage:** `Account_Document_Record_Page` — standard Lightning record page: highlights panel (Document Number, Document Type, Document Status) + a details section with all fields. Set as the org default record page for the object.

No custom tab; users reach documents through the Account's related list (automatic once the master-detail relationship exists) or global search.

## Translations

`Translations` metadata for `cs` (Czech) and `sk` (Slovak): object label + plural label, all field labels, and picklist value labels for `Document_Type__c` / `Document_Status__c`. These are best-effort business translations, not reviewed by a native speaker for tone — flagged for review in the final documentation.

## Self-review ("grill me") — decisions confirmed with the business

1. **Master-Detail to Account, not Lookup.** Accepted cascade-delete consequence: deleting an Account deletes its Account Documents, with no separate retention path. Sharing is fully inherited — no sharing rules needed.
2. **Restricted picklists** for `Document_Type__c` and `Document_Status__c`. Required for translation-workbench value translation and data consistency; adding a new value later needs a metadata deploy, not just a Setup edit.
3. **`Document_Number__c` is org-wide unique**, case-insensitive, via the field's declarative `unique` property — not scoped per Account or per Document Type (that would require a validation rule/trigger instead, which was explicitly ruled out for v1).
4. **`Account_Document_User` permission set is opt-in only** — nobody gets it by default; must be manually assigned.
5. **This duplicates the existing `Client_Document__c` object** in this repo, built independently as a workshop practice exercise. This is *not* intended to merge into `main` as a second production object — the PR must flag this explicitly so the team consciously decides which implementation (if either) becomes canonical.

## Relationship to the existing `Client_Document__c` object

This repo already contains a `Client_Document__c` object covering the same business need (added by another contributor in an earlier exercise). `Account_Document__c` is a deliberately separate, independently-designed object built for practice purposes on this branch — it is **not** intended to coexist with `Client_Document__c` in a real org long-term. Before merging to `main`, the team should decide which one (if either) becomes the canonical implementation, and this duplication should be called out explicitly in the PR description.
