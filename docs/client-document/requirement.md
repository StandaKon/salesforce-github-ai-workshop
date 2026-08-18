# Requirement: Client Documents

## Business ask (as given)

> We want to create a simple Salesforce solution for storing client documents.
>
> The business needs to keep basic information about documents related to a client.
>
> For each document, we want to store:
> - document number
> - document type
> - issue date
> - expiration date
> - related client/account
> - document status
>
> The solution should also include everything needed so users can start using it:
> - Salesforce metadata for the document structure
> - FlexiPage
> - Field-level permissions
> - Object permissions
> - Czech translation
> - Slovak translation

## Scope

In scope:
1. Custom object to store client documents, related to `Account`.
2. Lightning record page (FlexiPage) to view/edit a document.
3. A Permission Set granting object- and field-level access to the new object.
4. Translations (`cs`, `sk`) for the object, fields, and picklist values.

Out of scope (not requested, called out for a future iteration):
- Document file/attachment storage (Salesforce Files / ContentVersion) — the ask is metadata about a document, not the document file itself.
- Automation (validation rules, flows, triggers) — none requested.
- Reports/Dashboards.
- Seed data — no `/data` folder exists yet for this object; can be added later if needed for testing/demos.

## Data model decisions (confirmed with stakeholder)

| Decision | Choice | Rationale |
|---|---|---|
| Object | New custom object `Client_Document__c` | Dedicated entity, no existing standard object fits "document metadata for a client". |
| Relationship to Account | **Master-Detail** | Business confirmed a document should never exist without its client; inherits Account's sharing/security; documents are deleted when the Account is deleted. |
| Document Number | **Auto Number** (`DOC-{0000}`), used as the object's `Name` field | Avoids a redundant custom field just to identify records in list views/search; system-generated, unique per record. |
| Document Type | Picklist — restricted, values: `Identification Document`, `Contract`, `Invoice`, `Certificate`, `Other` | Stakeholder deferred exact values; this is a reasonable default set covering common client-document categories. **Flagged for review below.** |
| Document Status | Picklist — restricted, values: `Pending` (default), `Active`, `Expired`, `Rejected` | Standard lifecycle for a time-bound document. |
| Issue Date / Expiration Date | `Date` fields, Issue Date required, Expiration Date optional | Not every document type expires (e.g. a signed contract may have no expiration). |

## Fields (implemented)

| API Name | Label | Type | Required |
|---|---|---|---|
| `Name` (system) | Document Number | Auto Number `DOC-{0000}` | n/a |
| `Account__c` | Client Account | Master-Detail → Account | Yes |
| `Document_Type__c` | Document Type | Picklist | Yes |
| `Issue_Date__c` | Issue Date | Date | Yes |
| `Expiration_Date__c` | Expiration Date | Date | No |
| `Document_Status__c` | Document Status | Picklist | Yes |

## Remaining work

- [x] FlexiPage (Lightning Record Page) for `Client_Document__c`
- [x] Permission Set `Client_Document_Access` — full CRUD + FLS (read/edit) on all fields
- [x] Permission Set `Client_Document_ReadOnly` — Read + FLS read-only on all fields
- [ ] Related list for Client Documents added to the Account FlexiPage — not done; see note below
- [x] Czech (`cs`) translation — object/field labels, picklist values
- [x] Slovak (`sk`) translation — object/field labels, picklist values
- [x] Deploy + manual verification in the `training` dev org
- [x] Retrieve from org to confirm local source matches deployed metadata
- [ ] Pull request
- [x] Short documentation (README section or doc page)

**Account FlexiPage note:** no Account FlexiPage exists yet in this template repo, so the org serves its own auto-generated default Account page. Master-Detail children (like Client Document) are automatically included in a dynamic Related Lists component, so no explicit change is required. If/when a custom Account Lightning page is introduced, add "Client Documents" to its Related Lists explicitly.

## Implementation notes / lessons learned

Deploying this metadata surfaced a few platform rules worth capturing for next time:

1. **FLS cannot be set on Master-Detail fields or required fields.** `Account__c` (Master-Detail) and any field with `<required>true</required>` (`Document_Type__c`, `Issue_Date__c`, `Document_Status__c`) must **not** appear in a Permission Set's `<fieldPermissions>` — the platform grants/denies access to them implicitly based on object permissions. Only `Expiration_Date__c` (optional) needed an explicit `fieldPermissions` entry.
2. **Master-Detail child access requires parent Read.** Deploying `allowRead` on `Client_Document__c` without also granting `allowRead` on `Account` fails validation ("Read Client_Document__c depends on permission(s): Read Account"). Both Permission Sets grant `Account: Read` only (no Create/Edit/Delete) — enough to satisfy the dependency without over-granting Account access.
3. **FlexiPage template names are exact and org-validated.** `flexipage:defaultRecordHomeTemplate` does not exist; the correct template for a simple custom-object record page is `flexipage:recordHomeTemplateDesktop`.
4. **A `mode: Replace` region needs something to replace.** That requires a `<parentFlexiPage>` reference to a base template (`flexipage__default_rec_L`, the standard blank record-page template) — without it, the deploy fails with "a parent region enabling that mode doesn't exist."
5. **`startsWith` (grammatical article config) doesn't apply to case-based languages.** Czech and Slovak use noun declension (`caseValues` with `caseType`: Nominative, Accusative, Genitive, Dative, Instrumental, Locative — each singular/plural), not an article system like German/French, so `<startsWith>` must be omitted for `cs`/`sk` `CustomObjectTranslation` files.
6. **Retrieve decomposes object translations per field.** `sf project retrieve` returns one `<Field>.fieldTranslation-meta.xml` per translated field (under the `objectTranslations/<Object>-<lang>/` folder) instead of embedding them inline in the `.objectTranslation-meta.xml` — this is the current canonical SFDX source shape and what's committed here.
7. Retrieve also came back with several platform-default values that weren't explicitly authored (e.g. `actionOverrides`, `compactLayoutAssignment`, `enableBulkApi`, `externalSharingModel`, `visibility` on the `CustomObject`, and `trackTrending`/explicit picklist `<label>` on fields). These are harmless Salesforce-generated defaults and were kept as-is since they reflect the org's actual canonical state.
8. Only the **Nominative** case was authored for the object's cs/sk label; the other five grammatical cases came back from retrieve as empty `<!-- placeholder -->` comments. They're valid to leave blank (rarely used outside of certain merge-field/report contexts) but could be filled in later for full grammatical correctness.

## Grill-me review — resolved decisions

1. **Master-Detail cascade delete** — confirmed to keep **Master-Detail**. A document is not meaningful without its client; cascade delete on Account removal is accepted behavior.
2. **Document Type picklist values are a placeholder** — stakeholder deferred this decision; default values (`Identification Document`, `Contract`, `Invoice`, `Certificate`, `Other`) stand for this exercise. Values should be validated against real business categories before go-live; a restricted picklist means new values require an admin/metadata change.
3. **No file attachment** — confirmed **out of scope**. The object stores metadata only (no `Files`/`ContentVersion` component on the FlexiPage). Can be added later if the business needs the actual scanned document stored.
4. **Permission Set scope** — confirmed **two** Permission Sets:
   - `Client_Document_Access` — full CRUD (Create/Read/Edit/Delete) + FLS (read/edit) on all fields.
   - `Client_Document_ReadOnly` — Read only, FLS read-only on all fields.
5. **Translation mechanism** — using the standard Salesforce Translation Workbench (`translations` metadata type) for object/field labels and picklist values. Custom Labels are not used here since none of the user-facing text is generated dynamically in Apex/LWC; all labels are standard metadata labels.
6. **History tracking / audit** — not requested; `enableHistory` is currently `false` on the object. Flagging in case compliance requires tracking status changes over time.
