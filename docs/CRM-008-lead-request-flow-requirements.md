# Requirement: Lead Request Capture Flow (CRM-008)

## Business need

Users need a guided, self-service way to capture a new Lead directly from Salesforce, without navigating the standard Lead creation UI. This is delivered as a Screen Flow ("Lead Request") that collects the essential contact details for a Lead and can be launched by a user directly from the Lead list view.

## Flow type

Two flows are needed:

1. **Screen Flow** ("Lead Request") — per [CLAUDE.md](../CLAUDE.md) guidance to prefer screen flows only where the project already uses them for similar features; this is the first flow in the project, and a screen flow is the correct fit here since this is an interactive, user-initiated data capture form.
2. **Record-Triggered Flow** (after-save, on `Task` create) — drives the `Status` automation described below. Not a screen flow; this is backend automation, not user-initiated.

## Data to capture

| # | Field | Description | Exists on standard Lead object? | Required on screen? | Proposed handling |
|---|---|---|---|---|---|
| 1 | Company | Standard Lead requires `Company` at the platform level for every insert | Yes — standard `Company` | **Required** | Reuse. Discovered during requirements review — not in the original field list, but the Record Create element fails without it, so it must be captured on the screen. |
| 2 | First Name | Lead's first name | Yes — standard `FirstName` | Optional | Reuse |
| 3 | Last Name | Lead's last name | Yes — standard `LastName` (required on Lead) | **Required** | Reuse |
| 4 | Email | Lead's email address | Yes — standard `Email` | **Required** | Reuse. Also the sole field used for the duplicate check (see below). |
| 5 | Primary Phone | Lead's main phone number | Yes — standard `Phone` | Optional | Reuse (mapped to standard Phone field) |
| 6 | Secondary Phone | Lead's alternate phone number | **No** — no standard equivalent | Optional | **New custom field required**: `Secondary_Phone__c` (Phone type) |
| 7 | Postal Address | Lead's mailing address | Yes — standard compound `Address` (Street, City, State/Province, Zip/Postal Code, Country) | Optional (no sub-field individually required) | Reuse — screen flow exposes the individual address components (`Street`, `City`, `State`, `PostalCode`, `Country`) |

Per the "create if missing" instruction, only **Secondary Phone** requires new metadata — all other fields already exist on the standard Lead object. `Secondary_Phone__c` is also added to the **Lead page layout and FlexiPage** (not flow-only), with **field-level security explicitly set** via the dedicated permission set described under Permissions.

## Lead status model

The Lead `Status` picklist must support exactly these values:

| Status | Meaning | Set by |
|---|---|---|
| New | Default status for a freshly captured Lead | Lead Request screen flow, on record creation |
| In Progress | Someone has started working the Lead | Automatically, by the Task-triggered automation below (see [Automation: status update on Task creation](#automation-status-update-on-task-creation)) |
| Closed Won | Lead was successfully worked to a positive outcome | Manually, by the Lead owner |
| Closed Lost | Lead was worked but did not convert | Manually, by the Lead owner |

`New` becomes the default value of `Status` and is set explicitly by the Lead Request flow's Record Create element (not left to whatever the field's platform default currently is).

Standard Lead ships with different out-of-the-box Status values (e.g. "Open - Not Contacted", "Working - Contacted", "Closed - Converted", "Closed - Not Converted"). This requirement replaces that value set with the four values above. The impact on existing Leads/reports that reference the old values is **out of scope for now** — this will need to be revisited separately before go-live, but does not block CRM-008.

## Deduplication

Before creating a Lead, the flow checks for an existing Lead with the same **Email** (Email is mandatory on the screen, so this check always runs):
- **No match** → proceed straight to creation.
- **Match found** → show a warning screen naming/linking the matching Lead record, and let the user choose to **cancel** or **proceed anyway** (create a duplicate). The flow never blocks creation outright and never silently updates the existing record — the decision stays with the user.

Only Email is used for matching; Phone/Name matching was considered and rejected as too weak/noisy for this flow. This is the flow's own lightweight dedup check — it does not replace or change the org's standard Lead duplicate/matching rules (out of scope, see below).

## Screen flow design

Runs in **User Context** (respects the running user's own object/field permissions and sharing rules — access is governed entirely by the `Lead_Request_User` permission set; no elevated "without sharing" access).

1. **Screen: "Lead Details"**
   - Input fields: Company (required), First Name, Last Name (required), Email (required), Primary Phone, Secondary Phone, and an Address component (Street, City, State/Province, Postal Code, Country — all optional).
   - Client-side validation: Company, Last Name, and Email required; Email format validation via the platform's built-in email input component.
2. **Get Records**: look up an existing Lead by the entered Email.
3. **Decision**: if a match is found, show the **duplicate warning screen** (matching Lead name, linked to the record; Cancel / Proceed Anyway); otherwise continue directly to step 4. Choosing "Proceed Anyway" also continues to step 4.
4. **Record Create element**: creates a new `Lead` record from the screen inputs, mapping:
   - Company → `Company`
   - First Name → `FirstName`
   - Last Name → `LastName`
   - Email → `Email`
   - Primary Phone → `Phone`
   - Secondary Phone → `Secondary_Phone__c`
   - Address inputs → `Street`, `City`, `State`, `PostalCode`, `Country`
   - `Status` → hard-set to `New`
5. **Confirmation screen**: single success message with a link/reference to the newly created Lead. No "create another" loop — the flow ends here; launching it again for a second Lead means re-triggering it from the list view.

## Trigger from Lead List View

The flow must be launchable by a user from the Lead list view (not from an individual record page). Approach:
- A **custom List Button** on the Lead object (Object Manager → Lead → Buttons, Links, and Actions → New Button or Link; Display Type = *List Button*, Content Source = *URL*, target `/flow/Lead_Request`), added to the Lead **List View Button Layout** so it appears above the list view.
- Declarative and code-free, consistent with [CLAUDE.md](../CLAUDE.md)'s preference for standard/declarative tools over custom Lightning components (Aura/LWC explicitly discouraged for this).
- The flow runs standalone (no Lead record context needed as input, since it *creates* a new Lead rather than acting on a selected one).

## Automation: status update on Task creation

Whenever a **Task** is created against a Lead, that Lead's `Status` must automatically change to `In Progress` — **Tasks only**, Events do not trigger this automation.

Design:
- A **record-triggered flow** (after-save, on create) on the `Task` object, filtered to records where `WhoId` references a Lead.
- Runs in **System Context Without Sharing** (Flow Builder's default for record-triggered flows) — this is backend status-sync automation, not user-initiated, so it should not depend on the triggering user's own edit access/sharing to that particular Lead.
- Updates the related Lead's `Status` to `In Progress`, **but only if the Lead's current Status is not already `Closed Won` or `Closed Lost`** — closed Leads are never reopened by new Task activity.
- This is a separate automation from the Lead Request screen flow — it reacts to Task creation regardless of how or where the Task was created.

## Permissions

A new dedicated permission set, **`Lead_Request_User`** (matching the existing `Client_Document_User` convention — see [CRM-007's doc](./CRM-007-client-document-evidence-requirements.md)), grants:
- Create (and Read/Edit as needed) on `Lead`.
- Field-level security (Read/Edit) on `Secondary_Phone__c`.
- Whatever is needed to run the Lead Request flow.

The Task-triggered Status automation runs in System Context Without Sharing and does not depend on this permission set (see above).

## Open questions requiring sign-off

1. **Naming**: confirm the flow's exact API name (`Lead_Request` assumed above) and the record-triggered automation's API name, plus the permission set's final label (`Lead_Request_User` assumed above).
2. **List View Button Layout scope**: confirm this List Button, once added to the Lead's List View Button Layout, is acceptable to appear on **all** Lead list views (this is an object-wide layout, not selectable per individual list view) — no way to scope it to only some list views without a custom component, which is out of scope here.

## Out of scope (unless stated otherwise)

- Lead conversion logic.
- The org's standard duplicate/matching rule configuration (distinct from this flow's own Email-based dedup check).
- Assignment rules for newly created Leads.
- Bulk/mass Lead creation (this flow creates one Lead per run).
- Automatic transitions into `Closed Won` / `Closed Lost` (these are set manually by the Lead owner, not by automation).
- Reverting `Status` back to `New` or `In Progress` once a Lead has been closed.
- Impact of the Status value replacement on existing Leads, reports, or list views referencing the old standard values.
- Event-triggered status changes (this automation reacts to Tasks only).
- "Create another" looping in the screen flow (single success screen only).
