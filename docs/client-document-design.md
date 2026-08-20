# Design: Client Document Tracking

See [client-document-requirements.md](./client-document-requirements.md) for the business ask.

## Data model

**Custom Object:** `Client_Document__c` (label "Client Document" / plural "Client Documents")
- Record name: Autonumber, format `CD-{0000}` (a document number is already tracked as its own field, so the Name doesn't need to duplicate it and shouldn't be user-entered).
- Sharing model: `ControlledByParent` (required for a master-detail child).
- Reports and search enabled; Activities disabled (not needed for a document record).

**Fields:**

| API Name              | Type                              | Required | Notes |
|-----------------------|------------------------------------|----------|-------|
| `Client__c`            | Master-Detail(Account)              | Yes      | relationshipName `Client_Documents` — shows as a related list on Account |
| `Document_Number__c`   | Text(40)                            | Yes      | Free text, uniqueness not enforced |
| `Document_Type__c`     | Picklist (restricted)                | Yes      | ID Card, Passport, Driver's License, Contract, Invoice, Other |
| `Issue_Date__c`        | Date                                | Yes      | |
| `Expiration_Date__c`   | Date                                | No       | Some document types (e.g. contracts) may not expire |
| `Document_Status__c`   | Picklist (restricted), default Draft | Yes    | Draft, Valid, Expired, Revoked |

**Validation rule:** `Expiration_After_Issue_Date` — blocks save when `Expiration_Date__c` is populated and earlier than `Issue_Date__c`.

## Security

**Permission Set:** `Client_Document_User`
- Object permissions: Read, Create, Edit, Delete (no View All / Modify All — sharing is inherited from the Account via master-detail, so org-wide "view all" bypass isn't needed).
- Field permissions: Read + Edit on all fields above.
- Assigned manually to users/profiles that need to manage documents (not baked into a default profile, to keep the change additive/non-disruptive).

## UI

**FlexiPage:** `Client_Document_Record_Page` — standard Lightning record page: highlights panel (Document Number, Document Type, Document Status) + a details section with all fields. Set as the org default record page for the object.

No custom tab; users reach documents through the Account's related list (automatic once the master-detail relationship exists) or global search.

## Translations

`Translations` metadata for `cs` (Czech) and `sk` (Slovak): object label + plural label, all field labels, and picklist value labels for `Document_Type__c` / `Document_Status__c`. These are best-effort business translations, not reviewed by a native speaker for tone — flagged for review in the final documentation.

## Self-review ("grill me")

**Q: What happens to a Client Document when its Account is deleted?**
A: Cascade-deleted, by design of master-detail. If the business wants documents to survive Account deletion/merge (e.g. for compliance retention), master-detail is the wrong choice and this would need to become a Lookup with explicit sharing rules instead. Flagging this now since it's the highest-consequence assumption in this design — worth an explicit yes/no from the business before relying on it for compliance-relevant documents.

**Q: Is `Document_Number__c` guaranteed unique?**
A: No. The requirement didn't ask for uniqueness (e.g. across all clients, or per client+type), and document numbering schemes vary by document type/issuer, so no uniqueness constraint or duplicate rule was added. Can be tightened later if a specific numbering scheme is confirmed.

**Q: Can a document be created without a Status?**
A: No — `Document_Status__c` is required with a default of "Draft", so it's never blank, but nothing stops a document being left in "Draft" indefinitely. No automation was added to progress status (out of scope per requirements) — status changes are manual.

**Q: Does the validation rule handle documents with no expiration (e.g. a permanent contract)?**
A: Yes — the rule only fires when `Expiration_Date__c` is populated, so open-ended documents are unaffected.

**Q: Why restricted picklists instead of open picklists?**
A: Restricted picklists keep `Document_Type__c`/`Document_Status__c` values consistent (important since they drive the translation files and are the only ones translated) — but this means adding a new document type later requires a metadata change, not just an admin editing picklist values in Setup. Acceptable trade-off for a v1 with well-defined categories.

**Q: Who can see the FlexiPage / does everyone get the permission set?**
A: The permission set is opt-in — nobody gets access automatically. This avoids accidentally exposing a new object org-wide before the business has decided who should manage documents. The FlexiPage itself has no security implication (FLS still governs field visibility for whoever views a record).
