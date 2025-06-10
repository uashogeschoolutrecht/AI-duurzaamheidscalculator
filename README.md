[![License: EUPL 1.2](https://img.shields.io/badge/License-EUPL_1.2-blue.svg)](https://opensource.org/licenses/EUPL-1.2)
# Gemeentelijke AI Duurzaamheidscalculator

Deze webapplicatie is een prototype meettool waarmee gemeenten de geschatte CO₂-uitstoot van hun generatieve AI-toepassingen kunnen berekenen. De tool begeleidt gebruikers stap voor stap door alle relevante fasen van een AI-toepassing en geeft inzicht in de klimaatimpact per fase én in totaal.

## Functionaliteit

- **Stapsgewijze invoer:** Vul gegevens in over het gebruikte AI-model, het aantal inferenties, eindgebruikersapparaten, netwerkverkeer en webhosting.
- **Wetenschappelijk onderbouwd:** De berekeningen zijn gebaseerd op recente wetenschappelijke literatuur en openbare bronnen.
- **Direct inzicht:** Na het invullen van de gegevens toont de tool direct de geschatte jaarlijkse CO₂-uitstoot, uitgesplitst per fase.
- **Vergelijkingen:** De resultaten worden vergeleken met herkenbare referenties, zoals autokilometers of het aantal huishoudens.
- **Downloadopties:** Download het rapport als PDF of JSON-bestand voor verdere rapportage of analyse.

## Gebruikte fasen

De tool rekent met de volgende vijf fasen:
1. **Training van het AI-model:** Uitstoot door het trainen van het model, op basis van bekende modellen of eigen GPU-uren.
2. **Inferentie:** Uitstoot door het gebruik van het model (operationeel en productie van hardware).
3. **Eindgebruikersapparaten:** Uitstoot door apparaten zoals laptops, smartphones of tablets.
4. **Netwerkverkeer:** Uitstoot door het verzenden van data tussen gebruiker en server.
5. **Webhosting:** Uitstoot door hosting van de toepassing, inclusief productie van servers.

## Installatie & Gebruik

1. **Vereisten:**  
   - Node.js (v18 of hoger aanbevolen)
   - npm of yarn

2. **Installeren:**
   ```bash
   npm install
   # of
   yarn install
   ```

3. **Start de ontwikkelserver:**
   ```bash
   npm run dev
   # of
   yarn dev
   ```

4. **Open de tool:**  
   Ga naar [http://localhost:5173](http://localhost:5173) in je browser.

## Projectstructuur

- `src/components/` – Alle React-componenten per stap
- `src/utils/` – Hulpfuncties voor berekeningen
- `src/data/` – Dataset met modellen en datacenters
- `src/types.ts` – TypeScript types voor formulierdata

## Bronnen

- Luccioni et al. (2022)
- Luccioni et al. (2024)
- Malmodin & Lundén (2018)
- Berthelot et al. (2024)
- IEA (2023)
- Farfan & Lohrmann (2023)
- Websitecarbon.com

## Disclaimer

Deze tool is een prototype en bedoeld voor educatieve en indicatieve doeleinden. De resultaten zijn schattingen en kunnen afwijken van de werkelijke uitstoot.

---

**Auteur:** Saddik Khaddamellah & Erik Slingerland  
**Contact:** saddik.khaddamellah@student.hu.nl - erik.slingerland@hu.nl
**Jaar:** 2025
