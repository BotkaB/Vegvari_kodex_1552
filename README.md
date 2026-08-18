Gemini által generált readme

Végvári Kódex 1552 — Multi-Persona Mentor Engine
A Végvári Kódex 1552 egy mesterséges intelligenciával (AI) támogatott és AI-vezérelt vállalati onboarding és tudásmenedzsment alkalmazás, amely egy középkori végvári helyőrség (Egri vár) narratíváját használja keretként. Célja, hogy a modern HR-folyamatokat — céges szabályzatok elsajátítását, kérdés-válasz interakciót és önellenőrzést — élvezetes, gamifikált formában mutassa be.

A projekt telis-tele van AI-integrációval: nemcsak a futásidőben működő RAG-alapú funkciókat biztosítja mesterséges intelligencia, hanem maga a fejlesztési folyamat is egy modern, eszközspecializált AI-workflow mentén valósult meg.

🤖 Az AI szerepe a projektben
1. Futtatókörnyezeti AI (RAG és Generatív Réteg)
Google Gemini API Integráció: A rendszer a Google Gemini modellek erejét használja a háttérben biztonságos API proxy-n keresztül.

Modell-fallback lánc: Ha az elsődleges modell kvótája kimerül, a rendszer automatikusan vált a lánc következő tagjára, így biztosítva a magas rendelkezésre állást.

Kényszerített JSON-séma (responseSchema): Az AI válaszok szigorú, előre megadott struktúrába kényszerülnek, garantálva a hibamentes frontend renderelést.

Dokumentum-alapú Grounding: Az AI kizárólag a csatolt dokumentumokból (pl. a jogdíjmentes Egri csillagok szövegéből és a vállalati szabályzatokból) dolgozik, minimalizálva a hallucinációt.

Biztonság és Prompt Injection Védelem: Beépített middleware-ek és rendszerszintű szabályok szűrik ki a szerepkör-felülírási (ROLE_PLAY_OVERRIDE) és adatszivárgási kísérleteket.

2. AI-támogatott Fejlesztési Workflow (Hogyan készült?)
A szoftver fejlesztése is egy tudatos, többlépcsős AI-asszisztált módszertannal zajlott:

Tervezés és prompt-tervezés: A mentor-perszónák viselkedését és a JSON sémákat először a Google AI Studio felületén tesztelték és finomították.

Implementáció: A komponensstruktúra, az API-végpontok és a védelmi rétegek megírásában a Gemini nyújtott kódolási asszisztenciát.

Dokumentáció és prezentáció: A kódbázis elemzését, a szakmai dokumentációt és a beépített projektbemutató struktúráját AI-eszközök (Claude: bemutatószöveg, Gemini: prezentáció készítés) segítettek összeállítani (a döntések és a minőségbiztosítás természetesen emberi kézben maradtak).

🏛️ Főbb Funkciók
Erőforrás Motor (ResourceEngine):

GYIK mód: Kategóriákba rendezett, statikus és gyorsan elérhető kérdések-válaszok.

Kvízgenerálás: AI által támogatott 5 kérdéses tesztek azonnali visszajelzéssel.

Fejezet-összefoglaló: A dokumentumok strukturált, tömör összefoglalása.

Mentor Chat (MentorChat): Négy egyidejűleg megszólaló, egyedi karakterrel rendelkező AI-perszóna (Máté bá, Ambrus bá, Kristóf apród, János deák), akik különböző nézőpontokból válaszolnak a felhasználó kérdéseire.

Beépített Projektbemutató: Egy kattintással elérhető, akadálymentesített (a11y) modális prezentációs nézet a rendszer architektúrájáról és mérnöki döntéseiről.

🛠️ Technológiai Stack
Frontend: React 18, Vite, Tailwind CSS, akadálymentesített felépítés (aria-live, role="dialog").

Backend: Node.js, Express, session-alapú autentikáció (HttpOnly sütikkel).

AI & Biztonság: Google Gemini API (@google/genai), rate limiting (költségkontroll), safe JSON parser és valós idejű Attack UI visszajelzés.

🚀 Telepítés és Futtatás
Klónozd a repository-t:

Bash
git clone https://github.com/felhasznalonev/vegvari-kodex-1552.git
cd vegvari-kodex-1552
Telepítsd a függőségeket:

Bash
npm install
Állítsd be a környezeti változókat:
Hozz létre egy .env fájlt a gyökérkönyvtárban a Google Gemini API kulcsoddal és a szükséges beállításokkal.

Indítsd el a fejlesztői szervert:

Bash
npm run dev

npm run dev
📄 Licenc
Ez a projekt nyílt forráskódú, oktatási, demonstrációs és AI-fejlesztési céllal készült.
