// SPDX-License-Identifier: EUPL-1.2
// Copyright (C) 2025 Saddik Khaddamellah
// Met dank aan Erik Slingerland voor begeleiding.
import React from 'react';

// Props-type voor de uitlegcomponent: verwacht formData en resultaten
interface ExplanationProps {
  formData: any;
  results: {
    totaalKg: number;
    perFase: Record<string, number>;
    perFaseDetails: {
      inferenceOperationeel: number;
      inferenceEmbeddedGpu: number;
      inferenceEmbeddedServer: number;
    };
  };
}

// Specificaties van ondersteunde apparaten voor berekening
const deviceInfo: any = {
  smartphone: { power: 1, embeddedCO2: 86.6, lifetime: 3 },
  laptop: { power: 75, embeddedCO2: 522.6, lifetime: 4 },
  desktop: { power: 175, embeddedCO2: 1273.4, lifetime: 5 },
  tablet: { power: 7.5, embeddedCO2: 110.1, lifetime: 4 },
};

// Uitleg toont een toelichting op de berekende CO₂-uitstoot per fase
const Uitleg: React.FC<ExplanationProps> = ({ formData, results }) => {
  const { training, inference, devices, network, hosting } = formData;
  const { totaalKg, perFase, perFaseDetails } = results;

  // Haal aantal inferenties per jaar en hoeveelheid data op
  const infPerYear = parseFloat(inference?.inferencesPerYear || 0);
  const dataAmount = parseFloat(network?.dataHoeveelheid || 0);

  // Bepaal de eenheid van data (KB, MB, GB)
  const rawUnit = (network?.dataEenheid || 'MB').toUpperCase();
  const dataUnit = ['KB', 'MB', 'GB'].includes(rawUnit) ? rawUnit : 'MB';

  // Zet hoeveelheid data om naar GB
  const gbData =
    dataUnit === 'GB'
      ? dataAmount
      : dataUnit === 'MB'
      ? dataAmount / 1000
      : dataUnit === 'KB'
      ? dataAmount / 1_000_000
      : 0;

  // Bereken energieverbruik door netwerkverkeer
  const netEnergy = gbData * 0.27 * infPerYear;

  // Haal aantal bezoeken en bereken server productie-uitstoot
  const visits = parseFloat(hosting?.annualVisits || 0);
  const lifetimeVisits = visits * 6;
  const serverProdCO2 =
    hosting?.isOnline && hosting?.hostingType === 'cloud'
      ? ((2500000 / lifetimeVisits) * visits) / 1000
      : 0;

  // Genereer uitleg per apparaattype
  const deviceDetails = devices?.apparaten
    ? (() => {
        const regels = Object.entries(devices.apparaten)
          .map(([type, d]: any) => {
            const count = parseFloat(d?.aantalGebruikers || '0');
            const duration = parseFloat(d?.sessieduurMinuten || '0');
            const info = deviceInfo[type];
            if (!info || count <= 0 || duration <= 0) return null;

            const hours = duration / 60;
            // Embedded uitstoot geschaald naar gebruiksduur
            const embedded = ((info.embeddedCO2 / info.lifetime) * (duration / 480)) * count;
            // Operationele uitstoot op basis van vermogen, duur en CO₂-intensiteit
            const operational = (count * info.power * hours * 268) / 1000;

            return `${count} ${type}(s) werden gemiddeld ${duration} minuten per sessie gebruikt, wat leidde tot ~${Math.round(
              operational
            )} kg CO₂ voor operationeel gebruik en ~${Math.round(embedded)} kg CO₂ aan productie-uitstoot (gebaseerd op 8 uur per dag).`;
          })
          .filter(Boolean);

        return regels.length > 0 ? regels.join(' ') : 'Geen apparaatgegevens opgegeven.';
      })()
    : 'Geen apparaatgegevens beschikbaar.';

  // Totale uitstoot inferentie (operationeel + embedded GPU + embedded server)
  const totaleInferentieUitstoot =
    (perFaseDetails.inferenceOperationeel || 0) +
    (perFaseDetails.inferenceEmbeddedGpu || 0) +
    (perFaseDetails.inferenceEmbeddedServer || 0);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
      <h3 className="text-lg font-medium">Toelichting bij de berekende CO₂-uitstoot</h3>
      <p className="text-sm text-gray-700">
        Voor deze toepassing is de totale CO₂-uitstoot geschat op <strong>~{Math.round(totaalKg)} kg CO₂e</strong>, 
        gebaseerd op vijf verschillende fasen.
      </p>

      <p className="text-sm text-gray-700">
        Tijdens de <strong>trainingsfase</strong> is gekozen voor het model "{training.gekozenModelNaam}". 
        De totale uitstoot voor het trainen van dit model wordt geschat op ~{Math.round(training.co2UitstootTrainingKg || 0)} kg CO₂e. 
        Aangezien deze uitstoot éénmalig plaatsvindt en wereldwijd benut wordt, is deze proportioneel toegerekend aan het gemeentelijk gebruik. 
        Bij een jaarlijkse inzet van ~{infPerYear.toLocaleString()} inferenties, tegenover een geschat wereldwijd gebruik van 365 miljard inferenties per jaar, 
        komt dit neer op een gealloceerde trainingsuitstoot van ~{Math.round((perFase.training || 0) * 1000)} gram CO₂e voor deze toepassing.
      </p>

      <div className="text-sm text-gray-700">
        <p>
          Voor de <strong>inferentiefase</strong> werd rekening gehouden met ~{infPerYear.toLocaleString()} jaarlijkse inferenties. Dit resulteert in:
        </p>
        <ul className="list-disc pl-5 mt-1">
          <li>~{(perFaseDetails.inferenceOperationeel || 0).toFixed(2)} kg CO₂e aan operationeel energieverbruik,</li>
          <li>~{(perFaseDetails.inferenceEmbeddedGpu || 0).toFixed(2)} kg CO₂e aan productie-uitstoot van de GPU’s,</li>
          <li>~{(perFaseDetails.inferenceEmbeddedServer || 0).toFixed(2)} kg CO₂e aan productie-uitstoot van de serverhardware.</li>
        </ul>
        <p>
          Samen komt dit neer op ~{totaleInferentieUitstoot.toFixed(2)} kg CO₂e in deze fase.
        </p>
      </div>

      <p className="text-sm text-gray-700">
        Bij de <strong>gebruikte apparaten</strong> werd het volgende opgegeven: {deviceDetails}
        Samen leidt dit tot een totale uitstoot van ~{Math.round(perFase.devices || 0)} kg CO₂e.
      </p>

      <p className="text-sm text-gray-700">
        Voor de <strong>netwerkfase</strong> werd gerekend met ~{dataAmount} <strong>{dataUnit}</strong> aan dataverkeer per inferentie.
        Dat komt neer op ~{gbData.toFixed(2)} GB over een jaar, wat ongeveer ~{Math.round(netEnergy)} kWh aan energie verbruikt.
        Omgerekend naar uitstoot is dit ~{Math.round(perFase.network || 0)} kg CO₂e.
      </p>

      <p className="text-sm text-gray-700">
        Wat betreft <strong>hosting</strong> werd opgegeven dat het model jaarlijks ~{visits} keer benaderd wordt.
        Op basis van het wereldwijde gemiddelde van 0,8 gram CO₂ per pageview betekent dit ~{Math.round((visits * 0.8) / 1000)} kg CO₂e aan operationele uitstoot.
        De productie van de server zelf draagt hier ~{Math.round(serverProdCO2)} kg CO₂e aan bij.
        De totale uitstoot voor hosting komt hiermee op ~{Math.round(perFase.hosting || 0)} kg CO₂e.
      </p>

      <p className="text-sm text-gray-700">
        Samenvattend komt de totale geschatte klimaatimpact van deze toepassing jaarlijks uit op <strong>~{Math.round(totaalKg)} kg CO₂e</strong>.
        En een gemiddelde van <strong>{infPerYear > 0 ? ((totaalKg * 1000) / infPerYear).toFixed(2) : '0'}</strong> gram CO₂e per inferentie.
      </p>
    </div>
  );
};

export default Uitleg;
