// Importeer de benodigde functies uit het 'berekeningen' bestand.
// Deze functies doen de echte berekeningen voor elke fase.
import {
  berekenCo2UitstootTraining,
  berekenCo2UitstootInferentie,
  berekenCo2Apparaatgebruik,
  berekenNetwerkUitstootPerInfferentie,
  berekenHostingUitstoot
} from './berekeningen';
// Importeer de 'FormData' type-beschrijving om te weten hoe de formulierdata eruitziet.
import { FormData } from '../types';

// Definieer de mogelijke apparaattypes die een gebruiker kan kiezen.
export type ApparaatType = 'smartphone' | 'laptop' | 'desktop' | 'tablet';

/**
 * Dit object bevat de technische specificaties voor elk apparaattype.
 * De waarden voor energieverbruik, productie-uitstoot en levensduur zijn gebaseerd op:
 * - Gemiddelden van datavizta.boavizta.org.
 * - Inzichten uit de papers van Malmodin & Lundén (2018) en Berthelot et al. (2024).
 *
 * Aanname: De berekeningen gaan uit van 8 uur gebruik per dag.
 */
const apparaatSpecs: Record<ApparaatType, {
  vermogenWatt: number; // Energieverbruik van het apparaat in Watt.
  embeddedCo2Kg: number; // CO2-uitstoot door de productie van het apparaat.
  levensduurJaar: number; // Hoeveel jaar het apparaat meegaat.
}> = {
  smartphone: { vermogenWatt: 1, embeddedCo2Kg: 86.6, levensduurJaar: 3 },
  laptop: { vermogenWatt: 75, embeddedCo2Kg: 522.6, levensduurJaar: 4 },
  desktop: { vermogenWatt: 175, embeddedCo2Kg: 1273.4, levensduurJaar: 5 },
  tablet: { vermogenWatt: 7.5, embeddedCo2Kg: 110.1, levensduurJaar: 4 }
};

/**
 * Hoofdfunctie die de totale CO2-uitstoot berekent.
 * Het combineert de uitkomsten van alle losse onderdelen (training, inferentie, etc.).
 * @param formData - De data die de gebruiker in het formulier heeft ingevuld.
 * @returns Een object met de totale uitstoot en een uitsplitsing per fase.
 */
export function berekenTotaleUitstoot(formData: FormData) {
  // Haal de data voor elke fase uit het formulier.
  const { training, inference, devices, network, hosting } = formData;

  console.log('🔍 Ontvangen trainingsdata:', training);

  // --- Stap 1: Training ---
  // Haal de benodigde gegevens op voor de trainingsberekening.
  // Als er geen waarde is, gebruiken we een standaardwaarde.
  const trainingModelKeuze = training.modelKeuze ?? 'preloaded';
  const gekozenModelNaam = training.gekozenModelNaam ?? '';
  const gpuUren = training.gpuUren ?? 0;

  // --- Stap 2: Inferentie (gebruik van het model) ---
  // Haal het aantal keer dat het model per jaar wordt gebruikt op.
  const aantalInferenties = parseFloat(String(inference.inferencesPerYear || '0'));
  
  // Voer de berekening voor inferentie uit met de ingevulde gegevens.
  // We zetten de waarden om naar getallen, met '0' of '1' als standaard.
  const inf = berekenCo2UitstootInferentie(
    parseFloat(String(inference.energyPerInference || '0')),
    aantalInferenties,
    parseFloat(String(inference.pue || '1')), // PUE is standaard 1 als het niet is ingevuld.
    parseFloat(String(inference.carbonIntensity || '0')),
    parseFloat(String(inference.inferenceDuration || '0'))
  );

  // --- Stap 3: Eindgebruikersapparaten ---
  // We beginnen met een totaal van 0 en tellen de uitstoot van elk apparaat erbij op.
  let totaalApparaat = 0;
  const apparaten = devices?.apparaten;

  // Controleer of er überhaupt apparaten zijn ingevuld.
  if (apparaten && Object.keys(apparaten).length > 0) {
    // Haal de types van de gebruikte apparaten op (bv. 'laptop', 'smartphone').
    const gebruikteApparaatTypes = Object.keys(apparaten) as ApparaatType[];

    // Loop door elk opgegeven apparaattype.
    for (const type of gebruikteApparaatTypes) {
      const entry = apparaten[type]; // De data voor dit specifieke type.
      // Haal de ingevulde waarden op en zet ze om naar getallen.
      const aantal = parseFloat(entry.aantalGebruikers || '0');
      const duur = parseFloat(entry.sessieduurMinuten || '0');
      const sessies = parseFloat(entry.sessiesPerJaar || '0');

      // Als we het apparaattype niet kennen, slaan we het over.
      if (!apparaatSpecs[type]) {
        console.warn(`⚠️ Onbekend apparaattype: ${type}`);
        continue; // Ga verder met het volgende apparaat in de lijst.
      }

      // Voer de berekening alleen uit als alle benodigde velden zijn ingevuld.
      if (aantal > 0 && duur > 0 && sessies > 0) {
        const result = berekenCo2Apparaatgebruik(
          {
            aantalGebruikers: aantal,
            sessieduurMin: duur,
            sessiesPerGebruiker: sessies
          },
          apparaatSpecs[type] // Gebruik de specificaties van het juiste apparaat.
        );
        // Tel de uitkomst op bij het totaal voor apparaten.
        totaalApparaat += result.totaalPerApparaat;
      }
    }
  }

  // --- Stap 4: Netwerk ---
  // Haal de gegevens op voor de netwerkberekening.
  const netwerkHoeveelheid = parseFloat(network.dataHoeveelheid || '0');
  const rawUnit = (network.dataEenheid || 'MB').toUpperCase(); 
  // Zorg ervoor dat de eenheid altijd 'KB', 'MB' of 'GB' is. Standaard 'MB'.
  const netwerkEenheid: 'KB' | 'MB' | 'GB' =
    rawUnit === 'KB' || rawUnit === 'MB' || rawUnit === 'GB' ? rawUnit : 'MB';

  // Bereken de uitstoot voor één enkele netwerkactie.
  const perNetwerk = berekenNetwerkUitstootPerInfferentie(
    netwerkHoeveelheid,
    netwerkEenheid
  );

  // Nu de overige berekeningen die afhankelijk zijn van eerdere stappen.
  // De uitstoot van training hangt af van het aantal inferenties van de gemeente.
  const trainingKg = berekenCo2UitstootTraining(
    trainingModelKeuze,
    gekozenModelNaam,
    gpuUren,
    aantalInferenties // dit is het aantal inferenties van de gemeente
  );
  // Bereken de totale jaarlijkse netwerkuitstoot. Zet het resultaat om van gram naar kg.
  const totaalNetwerk = (perNetwerk.uitstootGramCO2 * aantalInferenties) / 1000;

  // --- Stap 5: Hosting ---
  // Bereken de uitstoot van de webhosting.
  const totaalHosting = berekenHostingUitstoot(
    parseFloat(hosting.annualVisits || '0'),
    hosting.hostingType,
    hosting.isOnline || false
  );

  // --- Eindberekening: Alles optellen ---
  // Tel de uitstoot van alle fases bij elkaar op voor het eindresultaat.
  const totaal = trainingKg + inf.totaalKg + totaalApparaat + totaalNetwerk + totaalHosting.totaal;

  // Log de resultaten in de console. Dit heb ik gedaan om te kunnen controleren.
  console.log('✅ Input ontvangen voor berekening:', formData);
  console.log('📊 Totale uitstoot (kg):', totaal);
  console.log('📦 Uitsplitsing:', {
    training: trainingKg,
    inference: inf.totaalKg,
    apparaten: totaalApparaat,
    netwerk: totaalNetwerk,
    hosting: totaalHosting.totaal
  });

  // Geef een object terug met alle resultaten, netjes gestructureerd.
  // Dit gebruiken ik om de grafieken en getallen te tonen.
    return {
    totaalKg: totaal,
    perFase: {
      training: trainingKg,
      inference: inf.totaalKg,
      devices: totaalApparaat,
      network: totaalNetwerk,
      hosting: totaalHosting.totaal
    },
    perFaseDetails: {
      inferenceOperationeel: inf.operationeelKg,
      inferenceEmbeddedGpu: inf.embeddedGpuKg,
      inferenceEmbeddedServer: inf.embeddedServerKg
    },
    inferencesPerYear: aantalInferenties
  };
}