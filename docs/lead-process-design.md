# Design: Lead Process

See [../requirements/lead-process.md](../requirements/lead-process.md) for the business ask.

## Data model

**Object:** standard `Lead` (not a custom object — reuses built-in conversion, reporting, and list views; the requirement's fields and statuses all map onto it directly).

**Fields:**

| Field | Source | Notes |
|---|---|---|
| First Name | `FirstName` (standard) | |
| Last Name | `LastName` (standard) | |
| Primary Phone | `Phone` (standard) | |
| Secondary Phone | `Secondary_Phone__c` (new, Phone) | Standard Lead has no second phone field |
| Email | `Email` (standard) | |
| Address | `Street` / `City` / `State` / `PostalCode` / `Country` (standard compound address) | |
| Status | `Status` (standard picklist, values replaced — see below) | Business-facing values: New, In Progress, Closed |
| Outcome | `Outcome__c` (new, Picklist) | `Won` / `Lost`. Only meaningful once Status = Closed |
| Closing Reason | `Closing_Reason__c` (new, Picklist, dependent on `Outcome__c`) | Required only when Status = Closed |

**Closing Reason values (dependent on Outcome):**

| Outcome | Closing Reason values |
|---|---|
| Won | Signed Contract, Other |
| Lost | Budget, No Response, Chose Competitor, Other |

**Validation rule:** block save when `Status = 'Closed'` and (`Outcome__c` is blank or `Closing_Reason__c` is blank).

### Status picklist migration

The org's `Lead.Status` currently ships with the standard defaults: `Open - Not Contacted`, `Working - Contacted`, `Closed - Converted`, `Closed - Not Converted`. No existing custom automation or flows reference Lead in this org today, so there's nothing else to reconcile.

Salesforce requires at least one Status value to be flagged as the **Converted** category (used internally by the standard Convert action, which stays available on the object even though conversion is out of scope for this process). So the picklist can't be reduced to exactly 3 values — instead:

- `New`, `In Progress`, `Closed` — the three business-facing values used by this process (New is the default).
- A 4th value stays mapped to the Converted category (repurposing `Closed - Converted`) but is excluded from this process's page layouts and Flow logic — it's only ever set if someone manually uses Convert, which is outside this process.
- `Working - Contacted` and `Closed - Not Converted` are removed/replaced by the above.

## Automation

**Record-triggered Flows** on `Task` and on `Event` (after a record is created with `WhoId` pointing to a Lead), each a thin trigering flow that calls one shared subflow containing the actual logic:
- If the related Lead's `Status = 'New'`, update it to `'In Progress'`.
- No change if the Lead is already `In Progress` or `Closed` — a closed Lead never reopens automatically just because an activity was logged against it (reopening a closed Lead is left as a deliberate manual action).

Keeping the logic in one shared subflow (rather than duplicated across the Task and Event flows) means future changes to the transition rule only need to be made once.

Scope: only `Task` and `Event` creation trigger this. `EmailMessage` is not included — logged/sent emails against a Lead normally create an associated `Task` automatically, so a separate `EmailMessage` trigger would be redundant for this manual-entry-only process.

## Manual status changes

Users may edit `Status` (and `Outcome__c` / `Closing_Reason__c`) directly at any time, in any direction — including manually reopening a `Closed` Lead. No additional validation beyond the "reason required when Closed" rule restricts this; the automation only saves a manual step forward, it doesn't police the field.

## Out of scope (per requirement)

- No Lead conversion (Account/Contact/Opportunity) as part of this process — the process as described ends at "Closed." The standard Convert action remains available on the object (see Status picklist migration above) but isn't part of this process's flow.
- No web-to-lead, API intake, or import-specific handling — manual entry only.
- No assignment rules, duplicate management, or reporting.

## Security

**Permission Set:** `Lead_Process_User` — grants field-level access to the new custom fields (`Secondary_Phone__c`, `Outcome__c`, `Closing_Reason__c`). Standard Lead object access continues to come from the user's existing profile/permission sets, since this isn't a new object.

## Seed data

No `/data` seed data exists for Lead yet, so there's nothing to update as part of this change.
