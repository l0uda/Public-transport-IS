# Public-transport-IS

Před spuštěním je nutné zprovoznit MySQL server na localhost adrese (port 3306), vytvořit zde databázi s názvem iis_db a naplnit ji daty ze souboru db.sql.

Pro spuštění serveru stačí v kořenovém adresáři repozitáře spustit příkaz npm install (prerekvizitou je NodeJS) a následně pomocí npm start bude na adrese localhost:8000 dostupný informační systém hromadné dopravy (ve fázi fungujícího prototypu se základními funkcionalitami).

Možností a role, které systém nabízí uživatelům, jsou detailně popsány v souboru zadani.md. Pro otestování specifických rolí a jejich funkcí (nelze se registrovat jako administrátor) lze nahlédnout do databáze.

Tento projekt je týmovou prací, mým podílem je návrh a implementace databáze, backendu a napojování některých částí frontendu na API.
