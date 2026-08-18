# Zadání: Client Documents v Salesforce

## Cíl

Vytvořit jednoduché řešení v Salesforce pro ukládání dokumentů klienta.

Cílem je zachytit základní informace o dokumentech souvisejících s klientem a umožnit uživatelům začít je používat bez dalších úprav.

## Business requirements

Pro každý dokument chceme ukládat:

- dokumentové číslo,
- typ dokumentu,
- datum vydání,
- datum expirace,
- související klient/účet,
- stav dokumentu.

## Požadované artefakty řešení

Řešení má obsahovat veškeré potřebné komponenty pro běžné nasazení a používání:

- Salesforce metadata pro strukturu dokumentu,
- flexipage,
- field-level permissions,
- object permissions,
- český překlad,
- slovenský překlad.

## Očekávaný výstup cvičení

Uživatel/participant má dokončit standardní pracovní postup projektu:

1. připravit požadavek ve formě Markdown souboru,
2. použít Claude Code pro návrh a revizi `grill-me`,
3. implementovat a otestovat metadata,
4. zkusit načíst data z Salesforce org,
5. vytvořit pull request,
6. připravit krátkou dokumentaci.

## Návrhové doporučení

Na základě datového modelu a konvence repozitáře je vhodné zvažovat následující:

- použít standardní objekt `Account` jako klienta, pokud to odpovídá obchodnímu modelu,
- vytvořit samostatný custom object pro dokumenty, např. `Client_Document__c`,
- pojmenovávat API názvy a metadata v anglickém jazyce podle konvence projektu,
- pro uživatelské texty používat custom labels a překlady,
- zajistit minimální bezpečnostní model: objektová oprávnění a pole-level permissions pro běžné role.

## Navržené pole pro custom object

Předpokládané pole pro objekt dokumentu:

- Document Number (Text, required, unique)
- Document Type (Picklist, required)
- Issue Date (Date, required)
- Expiration Date (Date, optional)
- Client / Account (Lookup na Account, required, deletion constraint: Restrict Deletion — viz Rozhodnutí č. 6/12)
- Status (Picklist, required)

## Datové typy a pravidla

- `Document Number`: unikátní identifikátor dokumentu (globálně, case-insensitive), textové pole,
- `Document Type`: předdefinované hodnoty, například: Passport, ID Card, Business License, Contract, Other,
- `Status`: předdefinované hodnoty, například: Active, Expired, Pending Review, Revoked,
- `Expiration Date`: může být prázdné, pokud dokument není časově omezený,
- `Issue Date`: musí být menší nebo rovno dnešnímu datu (vynuceno validation rule).

## Uživatelé a přístup

Požadavek by měl zohlednit základní správu přístupu:

- uživatelé s přístupem ke klientům by měli mít přístup i k dokumentům,
- minimálně jeden profil/role by měl mít čtení a zápis,
- field-level permissions by měly být explicitně definované.

## Otevřené otázky / nejasnosti

Následující body je potřeba dopředu vyjasnit před finálním návrhem a implementací:

1. Má být `Document Number` ručně zadávané pole nebo se má generovat automaticky?
2. Měl by se dokument vztahovat na standardní objekt `Account` nebo je potřeba samostatný custom object `Client__c`?
3. Jaké přesně mají být povolené hodnoty pro `Document Type` a `Document Status`?
4. Má být `Expiration Date` povinné pro všechny typy dokumentů, nebo jen pro některé?
5. Má být dokument pouze metadata záznamu, nebo se má v budoucnu rozšířit o přílohu / soubor / File upload?
6. Jaký je požadovaný přístup pro uživatele: pouze čtení pro všechny, nebo i úpravy pro konkrétní role/profily?
7. Má být řešení navrženo jen pro one-off business case, nebo má být připravené pro budoucí rozšíření a reportování?
8. Jak má být upravený UI: jednoduchý list/detail, nebo i lightning page s komponentami pro rychlé filtrování a práci s dokumenty?
9. Je nutné vytvořit i testy pro metadata a validace, nebo je klíčový pouze základní deploy a konfigurace do orgu?
10. Jsou požadované překlady pouze pro labels a UI texty, nebo také pro custom object, field labels a help text?
11. Jak má být řešena ochrana citlivých osobních údajů (Passport, ID Card) — field-level encryption, field history tracking, řízení exportu/mazání?
12. Co se má stát se záznamy `Client_Document__c`, pokud je smazán související `Account` (cascade delete vs. restrict)?
13. Má být `Document Number` vynucen jako unikátní na úrovni pole (Unique constraint), a pokud ano, v jakém rozsahu (globálně vs. per Document Type)?
14. Mají být hodnoty `Document Type` a `Status` řešeny jako Global Value Set, nebo jako lokální picklist přímo na poli?
15. Kam přesně má patřit flexipage — related list na Account record page, samostatná record page pro `Client_Document__c`, nebo obojí?
16. Má se dokument v budoucnu vztahovat i na jiné objekty než `Account` (např. Contact, Case, Opportunity)?
17. Jaké cílové prostředí a způsob nasazení se má použít pro implementaci a testování (sandbox/scratch org, deploy metoda)?

## Rozhodnutí k otevřeným otázkám (návrh řešení)

Návrh vychází z konvencí repozitáře ([AGENTS.md](../AGENTS.md)): metadata a API názvy v angličtině, uživatelské texty přes Custom Labels/translations, deklarativní řešení bez Apexu, cílový org alias `training` (již nastaven v `.sf/config.json`).

1. **Document Number** — manuální textové pole (Text, 40–80 znaků, required). Jde o reálné číslo existujícího dokumentu (např. číslo pasu), nelze ho tedy generovat auto-number sekvencí.
2. **Account vs. `Client__c`** — používá se standardní `Account`. Rozpor v původním zadání se řeší ve prospěch doporučení v sekci "Návrhové doporučení"; samostatný `Client__c` se nezavádí.
3. **Povolené hodnoty Document Type/Status** — použijí se hodnoty uvedené v sekci "Datové typy a pravidla" (Passport, ID Card, Business License, Contract, Other / Active, Expired, Pending Review, Revoked) jako Restricted picklist.
4. **Expiration Date povinné?** — zůstává optional pro všechny typy dokumentů, v souladu s pravidlem "může být prázdné, pokud dokument není časově omezený". Pokud by v budoucnu bylo potřeba vynutit povinnost jen pro některé typy, řeší se validation rule podmíněně na `Document_Type__c`.
5. **Pouze metadata, nebo i soubor/příloha?** — v rozsahu cvičení pouze metadata záznamu. Doporučuji navíc nechat na page layoutu/flexipage výchozí related list "Files" (Salesforce Files) — je to standardní bezplatná funkce bez implementace navíc, která připraví cestu k nahrávání souborů v budoucnu.
6. **Přístup uživatelů** — pole `Client / Account` zůstává **Lookup** (ne Master-Detail — zamítnuto při revizi kvůli riziku cascade delete u citlivých osobních dokumentů, viz bod 12). Sharing řeší **OWD = Public Read/Write** na `Client_Document__c` (deklarativní řešení bez Apex sharingu, přiměřené rozsahu cvičení). Read/Write nad rámec OWD se řeší samostatným Permission Setem `Client_Document_Access` (Object + Field-Level Security + Tab Visibility), přiřazeným profilu **Custom: Sales Profile** (ověřeno v org `training`); `System Administrator` má implicitní plný přístup.
7. **One-off vs. rozšiřitelnost/reporting** — jako standardní custom object je `Client_Document__c` automaticky reportovatelný (vlastní Report Type), žádná speciální práce navíc není potřeba.
8. **UI** — Lightning Record Page pro `Client_Document__c` (Highlights Panel + Detail + Related Lists, vygenerováno přes `generating-flexipage` skill) a related list komponenta na Account record page. Navíc **Custom Tab** pro `Client_Document__c`, zařazený do **Sales App** (`standard__LightningSales`), aby byl objekt použitelný "bez dalších úprav" i mimo Account. Filtrování řeší standardní List Views (např. dle Status, Expiration Date) — bez custom LWC.
9. **Testy** — jde čistě o deklarativní metadata (object, fields, validation rule, permission set), Apex testy proto nejsou potřeba. Ověření proběhne manuálně vytvořením testovacích záznamů v org `training` (`sf data create record` / `sf data query` dle `deploying-metadata` skillu).
10. **Rozsah překladů** — Custom Object label (singular/plural), Field Labels, hodnoty Global Value Setu **a Help Text** (min. u `Document_Type__c` a `Document_Number__c`, kvůli citlivosti dat) se překládají povinně (CZ i SK).
11. **Ochrana citlivých údajů** — Shield Platform Encryption je placený add-on a je mimo rozsah tohoto cvičení. Doporučuji povolit bezplatné **Field History Tracking** na klíčových polích (`Document_Number__c`, `Status__c`) pro auditní stopu. Pro produkční nasazení by měl být encryption/DLP posouzen zvlášť.
12. **Deletion constraint** — Lookup pole `Client / Account` má nastaveno **Restrict Deletion**: `Account` nelze smazat, dokud u něj existují navázané `Client_Document__c` záznamy. Zvoleno místo cascade delete (Master-Detail i lookup cascade), aby nedocházelo k tiché ztrátě citlivých osobních dokumentů jako vedlejšímu efektu smazání klienta.
13. **Unikátnost Document Number** — ano, nastavit `unique="true"` (case-insensitive) na úrovni pole, globálně napříč všemi `Document Type` (přesnější per-type unikátnost by vyžadovala validation rule s dotazem a je mimo rozsah cvičení).
14. **Global Value Set vs. lokální picklist** — použít Global Value Set (`Client_Document_Type`, `Client_Document_Status`) — snazší správa a překlad hodnot, připraveno na budoucí sdílení s dalšími objekty.
15. **Umístění flexipage** — related list komponenta doplněná do existující Account Lightning Record Page + nová vygenerovaná record page pro `Client_Document__c` (viz bod 8).
16. **Vztah k jiným objektům** — v rozsahu cvičení pouze `Account`. Rozšíření na Contact/Case se neřeší předem (YAGNI), případně jako budoucí samostatný lookup.
17. **Cílové prostředí a deploy** — target org alias `training` (`.sf/config.json`), nasazení přes `sf project deploy start` dle `deploying-metadata` skillu. Podle pravidel v AGENTS.md: žádné přímé commity do `main`, žádný deploy do produkce — změny jdou přes PR z branchu `AB123-client-docs`.
18. **Validation rule Issue Date** — implementována jako `Issue_Date__c <= TODAY()`; datum vydání dokumentu v budoucnu nedává business smysl.

## Poznámka pro implementaci

- Metadata a API názvy mají být v anglickém jazyce podle konvence projektu.
- Uživ. přístup a překlady je třeba zachytit v metadata a zkontrolovat v Salesforce org.
- Pokud se mění datový model, je vhodné zohlednit možnou aktualizaci seed dat, pokud existují.

## Shrnutí

Jedná se o jednoduchý, ale celistvý Salesforce projekt pro správu dokumentů klienta. Hlavní nejasnosti se týkají business pravidel, datového modelu a přístupových požadavků. Po jejich doplnění je možné navrhnout metadata, UI, testy a dokumentaci v souladu s workflow projektu.
