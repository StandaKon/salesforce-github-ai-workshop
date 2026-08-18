# Client Document (`Client_Document__c`)

Custom object for storing identification and legal documents (passport, ID card, contract, etc.) associated with a client `Account`. Implemented per [client-documents-requirement.md](client-documents-requirement.md).

## Object

| Property | Value |
| --- | --- |
| API Name | `Client_Document__c` |
| Label / Plural | Client Document / Client Documents |
| Sharing Model | ReadWrite (OWD: **Public Read/Write**) |
| Record Name | Auto Number, format `CD-{0000}` |
| Reports / Search / Activities / History | Enabled |

## Fields

| Field (API Name) | Type | Required | Notes |
| --- | --- | --- | --- |
| `Document_Number__c` | Text(80) | Yes | Real-world document number (e.g. passport number). **Unique** (case-insensitive, global across all Document Types). Field History Tracking enabled. |
| `Document_Type__c` | Picklist (Restricted) | Yes | Values from Global Value Set `Client_Document_Type`: Passport, ID Card, Business License, Contract, Other. |
| `Issue_Date__c` | Date | Yes | Must not be later than today — enforced by validation rule `IssueDateNotInFuture`. |
| `Expiration_Date__c` | Date | No | Left blank if the document is not time-limited. |
| `Client_Account__c` | Lookup(Account) | Yes | Relationship label/name: **Client Documents** (`Client_Documents__r`). Delete constraint: **Restrict** — an Account cannot be deleted while it has related documents. |
| `Status__c` | Picklist (Restricted) | Yes | Values from Global Value Set `Client_Document_Status`: Active, Expired, Pending Review, Revoked. Field History Tracking enabled. |

## Validation Rules

| Name | Rule | Error |
| --- | --- | --- |
| `IssueDateNotInFuture` | `Issue_Date__c > TODAY()` | "Issue Date cannot be later than today." |

## Security

- **OWD**: Public Read/Write on `Client_Document__c` (declarative alternative to Apex sharing, since the relationship to Account is a Lookup, not Master-Detail).
- **Permission Set** `Client_Document_Access`: grants Create/Read/Edit/Delete on the object, edit access to the optional `Expiration_Date__c` field (required fields don't need explicit FLS), and Tab visibility.
  - Not yet assigned to any user — assign it to users who need read/write access (see [Known limitations](#known-limitations)).
  - `System Administrator` has implicit full access.

## UI

- **Custom Tab**: `Client_Document__c`, added to the **Sales** Lightning App (`standard__LightningSales`).
- **Lightning Record Page**: `Client_Document_Record_Page` — Highlights Panel (Name, Status, Document Type, Expiration Date, Account) + Detail + standard Related Lists.
- List Views (standard, not custom-built) can filter by `Status__c` / `Expiration_Date__c` as needed.

## Translations (CZ / SK)

Object label, field labels, field help text (`Document_Number__c`, `Document_Type__c`) and all Global Value Set values are translated into Czech and Slovak via `CustomObjectTranslation` and `GlobalValueSetTranslation` metadata, plus the Custom Tab label via `Translations` (`cs`, `sk`).

## Data Model

```
Account (1) ───< Client_Document__c (N)
                  via Client_Account__c (Lookup, Restrict Deletion)
```

## Known limitations

1. **Related list on Account is not yet wired up.** Salesforce's Metadata API refuses to add a brand-new related list to an existing Page Layout that has never had it added through the UI (`Cannot find related list` error) — this requires one manual step:
   1. Open an Account Page Layout in Setup → Object Manager → Account → Page Layouts.
   2. Drag the **Client Documents** related list onto the layout and save.
   3. Retrieve the updated layout (`sf project retrieve start --metadata "Layout:Account-Account Layout"`, and any other layouts in use) and commit it to `force-app/main/default/layouts/`.
2. **Permission Set not assigned.** No active user in the `training` org currently has the `Custom: Sales Profile`. Assign `Client_Document_Access` to the relevant users once they exist:
   ```
   sf org assign permset --name Client_Document_Access --target-org training
   ```
3. **Org default record page not activated.** Activating a FlexiPage as the org/app default is a Setup UI action (App Builder → Activation), not deployable via metadata.

## Testing

Verified manually in the `training` org (no Apex — purely declarative metadata):
- Required fields, restricted picklists and the Account lookup enforce correctly.
- `IssueDateNotInFuture` blocks a future Issue Date.
- `Document_Number__c` uniqueness blocks duplicate document numbers.

Example record creation:
```
sf data create record --sobject Client_Document__c --values "Document_Number__c=CZ1234567 Document_Type__c=Passport Issue_Date__c=2024-01-15 Status__c=Active Client_Account__c=<AccountId>"
```
