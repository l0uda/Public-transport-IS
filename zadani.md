# IIS projekt
- Varianta termínu
    **3. Hromadná doprava: zadávání, vyhledávání spojů a rezervaci jízdenek**

- **členové týmu**
    * xburda13 - Burda Luděk
    * xfridr08 - Fridrich David

## Cíle

navrhnout a implementovat informační systém s webovým rozhraním pro zvolené zadání jedné z variant. Postup řešení by měl být následující:
* Analýza a návrh informačního systému (analýza požadavků, tvorba diagramu případů užití, modelu relační databáze)
* Volba implementačního prostředí - databázového serveru a aplikační platformy
* Implementace navrženého databázového schématu ve zvoleném DB systému
* Návrh webového uživatelského rozhraní aplikace
* Implementace vlastní aplikace

## Rozsah
* Musí umožňovat vložení odpovídajících vstupů
* Nezobrazovat obsah tabulek databáze, ale prezentovat uložená data tak, aby byla pro danou roli uživatele a danou činnost užitečná (např. spojit data z více tabulek, je-li to vhodné, poskytnout odkazy na související data, apod)
* Správa uživatelů a jejich rolí (podle povahy aplikace, např. obchodník, zákazník, administrátor). Tím se rozumí přidávání nových uživatelů u jednotlivých rolí, stejně tak možnost editace a mazání nebo deaktivace účtů. Musí být k dispozici alespoň dvě různé role uživatelů
* Ošetření všech uživatelských vstupů tak, aby nebylo možno zadat nesmyslná nebo nekonzistentní data.
    * Povinná pole formulářů musí být odlišena od nepovinných
    * Hodnoty ve formulářích, které nejsou pro fungování aplikace nezbytné, neoznačujte jako povinné (např. adresy, telefonní čísla apod.) Nenuťte uživatele (opravujícího) vyplňovat desítky zbytečných řádků
    * Při odeslání formuláře s chybou by správně vyplněná pole měla zůstat zachována (uživatel by neměl být nucen vyplňovat vše znovu)
    * Pokud je vyžadován konkrétní formát vstupu (např. datum), měl by být u daného pole naznačen
    * Pokud to v daném případě dává smysl, pole obsahující datum by měla být předvyplněna aktuálním datem
    * Nemělo by být vyžadováno zapamatování a zadávání generovaných identifikátorů (cizích klíčů), jako např. ID položky na skladě. To je lépe nahradit výběrem ze seznamu. Výjimku tvoří případy, kdy se zadáním ID simuluje např. čtečka čipových karet v knihovně. V takovém případě prosím ušetřete opravujícímu práci nápovědou několika ID, která lze použít pro testování
    * Žádné zadání nesmí způsobit nekonzistentní stav databáze (např. přiřazení objednávky neexistujícímu uživateli)
* Přihlašování a odhlašování uživatelů přes uživatelské jméno (případně e-mail) a heslo. Automatické odhlášení po určité době nečinnosti

## Implementos prostředkos
* FRONT-END == HTML + CSS (max React)
    * HTML5 + CSS, s využitím JavaScriptu, pokud je to vhodné

* BACK-END == prob JS (max JS/node.js)
    * **kódování UTF-8** (soubor .htaccess - dle návodu v FAQ - bod 14)
    * problém s nutností použití vyšší verze php než 5.3 (FAQ - bod 15)
    * ** #1** je, aby byl informační systém dostupný - ověřte si předem, že máte k dispozici vhodný hosting/cloud, na kterém bude schopni IS zprovoznit (např. Heroku, Google Cloud, RedHat Openshift, MS Azure, apod.)
    * **podmínkou #2** je, abyste nepoužili hotový redakční systém, administrační stránky umožňující spravovat obsah apod. (např. při použití Frameworku Django se žádný uživatel nebude přihlašovat do administrační stránky)
* DB
    * **mySQL ONLY**

## Detailní popis

Úkolem zadání je vytvořit informační systém pro zadávání a vyhledávání spojů drobných soukromých dopravců a následnou rezervaci jízdenek cestujícími. Každý spoj má nějaké označení, pomocí kterého ho budou moci uživatelé vhodně odlišit a další atributy (dopravce, popis vozidla, počet míst, různé kategorie cen, seznam zastávek a časy, v kterých danými zastávkami projíždí). Zastávky se vztahují k nějaké geografické poloze, mají unikátní označení, pomocí kterých mohou cestující vyhledávat spoje (např. 1. Brno-Královo Pole -> Pardubice-Pardubičky - pro jednoduchost vyhledávání uvažujte pouze vyhledávání spojů a tras v rámci jednoho spoje, neřešte přestupy). Rezervace jízdenky zajišťuje konkrétnímu cestujícímu vybraný počet konkrétních míst u konkrétního spoje. Jízdenky jsou ověřeny u řidiče/personálu vozidla. Personál může uživatelsky jednoduchým způsobem aktualizovat aktuální polohu na trase (průjezd zastávkami), kterou pak vidí cestující. Uživatelé budou moci dále informační systém použít konkrétně následujícím způsobem:

* administrátor
    * spravuje uživatele
    * schvaluje zastávky (viz dopravce)
    * má rovněž práva všech následujících rolí
* dopravce
    * zadává, spravuje a maže spoje (opakující se spoj je možné zadat uživatelsky přívětivou cestou)
    * navrhuje nové zastávky a jejich změny
    * vytváří, spravuje a maže vozidla
    * vytváří, spravuje a maže uživatelské účty personálu dopravce
* personál
    * spravuje rezervace jízdenek cestujících, po úhradě jízdného potvrdí rezervaci a případně vydá jízdenku (pokud je hrazeno na místě)
    * uživatelsky přívětivým způsobem aktualizuje aktuální polohu na trase (průjezd zastávkami)
* cestující
    * rezervuje 1 až N míst spoje (zvolte vhodné omezení - např. max. množství, úhrada v daném intervalu - kontroluje a případně ruší personál; v případě souběžně prováděných rezervací více uživateli a překročení limitu míst je pomalejší uživatel vhodně upozorněn, že jeho registrace nebyla provedena)
    * sleduje, kde se spoj cestujícího nachází
    * má rovněž práva (a) neregistrovaného uživatele 
* neregistrovaný
    * (a) vyhledává spoje (uživatelsky přívětivé vyhledávání dle různých atributů - čas, názvů zastávek, případně spádových obcí, apod.), prohlíží dostupnost volných míst
    * může provést rezervaci 1 až N míst spoje bez registrace: vyžadujte vhodné údaje (má možnost dokončit registraci a stát se cestujícím)