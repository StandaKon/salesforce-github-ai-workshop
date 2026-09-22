# Client 360 Prototype — Requirements

## Business Context
The client is a bank. They want a first prototype of a **Client 360** page in Salesforce that shows the most important client and banking information in one clear, visual view, to help relationship managers assess a client at a glance.

## Scope
- Basic client information (existing Account fields: Name, Phone, Industry, Owner, ICO/DIC, etc.)
- Banking metrics (new fields on Account — see below)
- A visual, card-based summary via one custom LWC (`Client Value Panel`)
- A dedicated Lightning Record Page for Account, so the existing Account page layout is untouched
- Deployment to a Salesforce org (scratch/sandbox), no production deployment

## Open Questions & Decisions

| Question | Decision |
| --- | --- |
| Where should banking metrics live — new Account fields or a related custom object? | **New fields directly on Account.** Simplest for a prototype; no new relationship/object needed since metrics are 1:1 with the client. |
| Where should the Client 360 layout live — new page or edit existing Account page? | **New Lightning Record Page** (`Client360RecordPage`), so it can be assigned/activated independently (e.g. per app or profile) without disturbing the current default Account page. |
| Which metrics to include? | All 10 suggested metrics, as fields on Account (see table below). The LWC surfaces the 5 most decision-relevant ones as cards; the rest are visible via a "Banking Metrics" detail section on the page. |
| Real data source vs. manual/demo data? | Prototype only — fields are plain (non-formula) so they can be populated manually or via seed data for demos. No integration/calculation logic in this iteration. |

## Data Model — New Fields on `Account`

| Field API Name | Label | Type | Notes |
| --- | --- | --- | --- |
| `TotalPortfolioValue__c` | Total Portfolio Value | Currency(18,2) | Shown as LWC card |
| `ActiveProducts__c` | Active Products | Number(3,0) | Shown as LWC card |
| `MonthlyTransactionVolume__c` | Monthly Transaction Volume | Currency(18,2) | Detail section |
| `AverageAccountBalance__c` | Average Account Balance | Currency(18,2) | Detail section |
| `CreditExposure__c` | Credit Exposure | Currency(18,2) | Shown as LWC card |
| `ClientProfitability__c` | Client Profitability | Currency(18,2) | Shown as LWC card |
| `CrossSellPotential__c` | Cross-Sell Potential | Picklist (Low, Medium, High) | Drives "Next Best Action" card |
| `ClientSatisfactionScore__c` | Client Satisfaction Score | Number(3,0), 0–100 | Detail section |
| `NextReviewDate__c` | Next Review Date | Date | Detail section |
| `LastContactDate__c` | Last Contact Date | Date | Detail section |

Field API names use no-underscore PascalCase per the user's naming decision for this feature's new metadata (labels stay Title Case with spaces). No cs/sk field translations were added, matching the existing `ICO__c`/`DIC__c` precedent on Account (translations exist for `Account_Document__c`/`Client_Document__c`, but not for direct Account fields).

## LWC — `Client Value Panel`
A simple, icon-based card layout placed at the top of the Client 360 page, showing:
1. Portfolio Value
2. Active Products
3. Credit Exposure
4. Client Profitability
5. Next Best Action — a derived label based on `CrossSellPotential__c`: High → "Schedule a Meeting" (red), Medium → "Call by Account Manager" (amber), Low → "Marketing Campaign" (olive-green). Also shows the underlying `CrossSellPotential__c` value and `LastContactDate__c` as supporting context beneath the action label.

Card design (confirmed): `lightning-card` tiles with a green (#2E8B57) left-border accent and neutral (#FAFAFA) fill, flat SLDS utility icons in the same green. The 4 metric tiles sit in an even row; the Next Best Action card is a wider, visually distinct hero banner below them. Its label color varies by urgency (red/amber/olive-green — chosen to not clash with the brand-green card chrome).

Implementation: `@wire(getRecord)` against the Account fields above (Lightning Data Service, no Apex needed for this prototype).

## Page — `Client360RecordPage`
New Account Lightning Record Page (single column, matching this repo's existing minimal FlexiPage convention):
- Header region: standard highlights panel
- Main region: `Client Value Panel` LWC full-width at the top, followed by the standard detail panel (all Account fields, including the 5 remaining banking metrics, remain visible/editable there)

## Deployment
- Deploy to the developer's scratch org / sandbox using the `deploying-metadata` skill (SF CLI).
- No deployment to production — production releases go through the release manager per project rules.
- Suggest activating the new Client 360 page as the default Account record page for at least one app, or assigning it manually for the demo.

## Out of Scope (for this prototype)
- Automated metric calculations / integrations with banking systems
- Historical trend charts
- Apex controllers (LDS is sufficient for read display in this iteration)
