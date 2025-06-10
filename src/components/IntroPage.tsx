// SPDX-License-Identifier: EUPL-1.2
// Copyright (C) 2025 Saddik Khaddamellah
// Met dank aan Erik Slingerland voor begeleiding.
import React from 'react';

interface IntroPageProps {
  onStart: () => void;
}

// IntroPage toont de introductie, uitleg en methodologie van de tool.
// De gebruiker kan hierna starten met de berekening.
const IntroPage: React.FC<IntroPageProps> = ({ onStart }) => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 text-gray-800">
      {/* Titel */}
      <h1 className="text-3xl font-bold mb-4">Welkom!</h1>
      {/* Korte uitleg over de tool */}
      <p className="mb-4">
        Deze tool berekent de geschatte CO₂-uitstoot van een gemeentelijke AI-toepassing op basis van vijf fasen:
        training, inferentie (gebruik), eindgebruikersapparaten, netwerkverkeer en hosting. De gebruikte berekeningen zijn
        gebaseerd op aannames uit wetenschappelijke literatuur.
      </p>

      {/* Methodologie uitleg */}
      <h2 className="text-xl font-semibold mt-6 mb-2">Methodologie</h2>
      <p className="mb-4 whitespace-pre-line">
        <strong>1. Training van het AI-model</strong>
        {"\n"}Als je een bestaand model gebruikt (zoals GPT-3), haalt de tool de totale uitstoot op uit een gegevensbestand. De tool berekent vervolgens welk deel van de uitstoot toerekenbaar is aan het gemeentelijke gebruik. Voor zelfgetrainde modellen wordt gerekend met 0,3 kg CO₂ per GPU-uur. Dit is gebaseerd op 0,4 kWh GPU-verbruik × PUE 1,56 × 481 g CO₂/kWh = 0,30 kg.

        {"\n\n"}<strong>2. Gebruik van het model (inferentie)</strong>
        {"\n"}De tool rekent met het energieverbruik per inference, het aantal keer dat het model jaarlijks gebruikt wordt, de PUE van het datacenter en de lokale CO₂-intensiteit van elektriciteit. Daarnaast telt ook de 'embedded' uitstoot van GPU’s en servers mee, gebaseerd op Luccioni et al. (2022).

        {"\n\n"}<strong>3. Eindgebruikersapparaten</strong>
        {"\n"}De tool berekent de uitstoot van apparaten zoals laptops of telefoons op basis van het energieverbruik tijdens gebruik en de productie-uitstoot (embedded CO₂), verdeeld over de levensduur. Gebaseerd op data van datavizta.boavizta.org, Malmodin & Lundén (2018) en Berthelot et al. (2024).

        {"\n\n"}<strong>4. Netwerkverkeer</strong>
        {"\n"}De uitstoot door dataverkeer wordt berekend op basis van 0,27 kWh per GB data en een uitstoot van 268 g CO₂/kWh voor Nederland (2023). De gebruiker geeft de hoeveelheid data per inference in (bijv. 2 MB).

        {"\n\n"}<strong>5. Webhosting</strong>
        {"\n"}De CO₂-uitstoot van webhosting wordt berekend op basis van een standaardwaarde van 0,8 g CO₂ per bezoek (bron: websitecarbon.com), en — bij cloudhosting — ook op basis van embedded serveruitstoot van 2.500.000 g CO₂ over 6 jaar (waarvan 40% wordt meegeteld).
      </p>

      {/* Bronnen */}
      <p className="mt-6 text-sm text-gray-600">
        Wetenschappelijke bronnen: Luccioni et al. (2022), Malmodin & Lundén (2018), Berthelot et al. (2024), IEA (2023), Farfan & Lohrmann (2023)
      </p>

      {/* Startknop */}
      <div className="mt-8 text-center">
        <button
          onClick={onStart}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
        >
          Start berekening
        </button>
      </div>

      {/* Footer met auteur */}
      <p className="mt-6 text-xs text-gray-500 text-center">
        Ontwikkeld door Saddik Khaddamellah – 2025 · saddik.khaddamellah@student.hu.nl
      </p>
    </div>
  );
};

export default IntroPage;
