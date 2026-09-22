# Evidence klientských dokumentů – dokumentace řešení

Aktuální k 2026-09-22

## 1. Přehled řešení

Cílem řešení je jednoduše evidovat dokumenty vztahující se ke klientovi (např. občanský průkaz, pas, řidičský průkaz, smlouva, faktura apod.) přímo v Salesforce, napojené na záznam Účtu (Account) daného klienta.

Řešení je plně funkční a připravené k okamžitému použití. Obsahuje:

- **datovou strukturu** pro evidenci dokumentů (nový objekt *Klientský dokument*),
- **validační pravidlo** hlídající logickou správnost dat,
- **stránku záznamu (FlexiPage)** pro zobrazení a editaci dokumentu,
- **sadu oprávnění (Permission Set)** pro přidělení přístupi uživatelům,
- **český a slovenský překlad** názvů a chybových hlášek.

## 2. Datový model – objekt Klientský dokument

Nový vlastní objekt **Klientský dokument** (API název `Client_Document__c`) slouží jako základní evidence dokumentů. Každý záznam je automaticky pojmenován ve formátu `CD-0000`.

| Pole | API název | Typ | Povinné | Popis |
| --- | --- | --- | --- | --- |
| Číslo dokumentu | `Document_Number__c` | Text (40) | Ano | Číslo/identifikátor dokumentu podle jeho vydavatele |
| Typ dokumentu | `Document_Type__c` | Výběr | Ano | Občanský průkaz, Pas, Řidičský průkaz, Smlouva, Faktura, Jiné |
| Datum vydání | `Issue_Date__c` | Datum | Ano | Datum, od kdy dokument platí |
| Datum platnosti | `Expiration_Date__c` | Datum | Ne | Datum konce platnosti dokumentu (nepovinné – např. smlouvy bez expirace) |
| Klient | `Client__c` | Vztah Master-Detail na Účet (Account) | Ano | Klient, ke kterému se dokument váže |
| Stav dokumentu | `Document_Status__c` | Výběr | Ano | Koncept, Platný, Expirovaný, Zrušený (výchozí hodnota: Koncept) |

Vztah na klienta je typu **Master-Detail** na standardní objekt Účet – dokument tedy vždy patří právě jednomu klientovi a přebírá jeho sdílení a zabezpečení (viz kapitola 4).

## 3. Validace a pravidla

Validační pravidlo **Expiration\_After\_Issue\_Date** hlídá, aby datum platnosti nebylo dřívější než datum vydání. Pokud uživatel zadá nekonzistentní data, systém uložení zamítne a zobrazí hlášku:

> *„Datum platnosti nemůže být dřívější než datum vydání.“*

## 4. Vazba na klienta a sdílení

Každý Klientský dokument je pomocí pole *Klient* naveden na příslušný záznam Účtu. Díky vztahu Master-Detail:

- se dokument zobrazuje na záznamu klienta v souvisejícím seznamu „Klientské dokumenty“,
- se přístupová práva a sdílení dokumentu řídí sdílením nadřazeného Účtu („Controlled by Parent“) – není tedy potřeba nastavovat samostatná sdílecí pravidla pro dokumenty,
- smazání Účtu vede ke smazání všech jeho dokumentů.

## 5. Zobrazení záznamu (FlexiPage)

Pro objekt je připravena stránka záznamu **Client Document Record Page**, která se použije jako výchozí zobrazení detailu dokumentu. Obsahuje:

- horní panel se základními údaji o záznamu (highlights panel),
- hlavní panel se všemi poli dokumentu (detail panel).

Stránka je postavená na standardní desktopové šabloně pro záznamy a lze ji dále upravit v App Builderu (např. přidat související seznamy či komponenty na míru).

## 6. Oprávnění (Permission Set)

Přístup uživatelům se přiděluje pomocí sady oprávnění **Client Document User**, kterou stačí přiřadit příslušným uživatelům. Sada obsahuje:

| Objekt / pole | Zobrazit | Vytvořit | Upravit | Smazat |
| --- | --- | --- | --- | --- |
| Klientský dokument (všechna pole) | Ano | Ano | Ano | Ano |
| Účet | Ano | – | – | – |

Sada oprávnění dává uživatelům plný přístup k dokumentům (čtení, vytváření, úprava i mazání) a pouze prohlížecí přístup k objektu Účet, aby bylo možné dokument přiřadit ke správnému klientovi. Skutečné záznamy, které uživatel uvidí, se navíc řídí sdílením nadřazeného Účtu (viz kapitola 4).

## 7. Lokalizace – čeština a slovenština

Objekt má připravený překlad názvů (včetně pádů pro skloňování) a chybové hlášky validačního pravidla pro oba jazyky:

| Jazyk | Název objektu (1./mn. č.) | Chybová hláška validačního pravidla |
| --- | --- | --- |
| čeština | Klientský dokument / Klientské dokumenty | Datum platnosti nemůže být dřívější než datum vydání. |
| slovenština | Klientský dokument / Klientské dokumenty | Dátum platnosti nemôže byť skorší ako dátum vydania. |

Uživatelé tak uvidí názvy polí, objektu i chybové hlášky ve svém jazyce podle nastavení jazyka uživatelského profilu.

> Skloňování názvu objektu je strojový/best-effort překlad a před nasazením do produkce by ho měl zkontrolovat rodilý mluvčí (čeština i slovenština).

## 8. Jak začít používat řešení

1. Nasadit metadata (objekt, pole, validační pravidlo, FlexiPage, překlady a sadu oprávnění) do cílového Salesforce organizace.
2. Přiřadit sadu oprávnění **Client Document User** všem uživatelům, kteří mají s dokumenty pracovat.
3. Přidat související seznam „Klientské dokumenty“ na stránku záznamu Účtu (pokud už tam není), aby uživatelé viděli dokumenty přímo u klienta.
4. Ověřit, že mají uživatelé v profilu nastaven požadovaný jazyk (čeština/slovenština), aby se jim zobrazil správný překlad.
5. Vyzkoušet vytvoření testovacího dokumentu u vybraného klienta a ověřit validaci dat i zobrazení na stránce záznamu.
