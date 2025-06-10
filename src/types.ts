// SPDX-License-Identifier: EUPL-1.2
// Copyright (C) 2025 Saddik Khaddamellah
// Met dank aan Erik Slingerland voor begeleiding.

// Type voor de trainingsfase
export type ModelKeuze = 'preloaded' | 'finetuned' | 'custom';

export interface GegevensTraining {
  modelKeuze?: ModelKeuze; // Type modelkeuze
  gekozenModelNaam?: string; // Naam van gekozen model
  co2UitstootTrainingKg?: number; // CO2-uitstoot van training in kg
  gpuType?: string; // Type GPU gebruikt voor training
  gpuUren?: number; // Aantal GPU-uren
}

// Type voor de inferentiefase
export interface GegevensInferentie {
  locatie?: 'cloud' | 'local'; // Locatie van inferentie
  provider?: string; // Cloudprovider
  region?: string; // Regio/datacenter
  pue?: number; // Power Usage Effectiveness
  carbonIntensity?: number; // CO2-intensiteit van stroom (g/kWh)
  task?: string; // Type taak
  energyPerInference?: number; // Energieverbruik per inferentie
  inferencesPerYear?: number; // Aantal inferenties per jaar
  inferenceDuration?: number; // Duur van een inferentie
  totalCO2?: number; // Totale CO2-uitstoot
  embeddedServerCO2?: number; // Embedded CO2 van server
}

// Type voor eindgebruikersapparaten
export type Apparaatgegevens = {
  [apparaatType: string]: {
    aantalGebruikers?: string; // Aantal gebruikers van dit apparaat
    sessieduurMinuten?: string; // Gemiddelde sessieduur in minuten
    sessiesPerJaar?: string; // Sessies per jaar
  };
};

export interface GegevensApparaten {
  apparaten: Apparaatgegevens; // Alle apparaten
  percentages?: { [apparaatType: string]: string }; // Percentage per apparaat
  totaalAantalGebruikers?: string; // Totaal aantal gebruikers
  sessieduurMinuten?: string; // Gemiddelde sessieduur
  sessiesPerJaar?: string; // Sessies per jaar
}

// Type voor netwerkgebruik
export interface GegevensNetwerk {
  dataHoeveelheid?: string; // Hoeveelheid data per inferentie
  dataEenheid?: 'KB' | 'MB' | 'GB'; // Eenheid van data
}

// Type voor webhosting
export interface GegevensHosting {
  isOnline?: boolean; // Of de toepassing online is
  hostingType?: 'cloud' | 'local'; // Type hosting
  cloudProvider?: string; // Cloudprovider
  region?: string; // Regio/datacenter
  pue?: number; // Power Usage Effectiveness
  carbonIntensity?: number; // CO2-intensiteit van stroom (g/kWh)
  annualVisits?: string; // Jaarlijkse bezoeken
  serverLocation?: string; // Locatie van server (lokaal)
  serverEnergy?: string; // Energieverbruik server (lokaal)
  providerInfoKnown?: boolean; // Of provider/regio bekend is
}

// Alles samen in het formulier
export interface FormData {
  training: GegevensTraining;
  inference: GegevensInferentie;
  devices: GegevensApparaten;
  network: GegevensNetwerk;
  hosting: GegevensHosting;
}

// Mogelijke secties/stappen in het formulier
export type FormSection =
  | 'intro'
  | 'training'
  | 'inference'
  | 'devices'
  | 'network'
  | 'hosting'
  | 'results';

// Props voor componenten

// Props voor trainingsfase-component
export interface TrainingPhaseProps {
  data: GegevensTraining;
  onUpdate: (data: Partial<GegevensTraining>) => void;
  onNext: () => void;
  onBack?: () => void; 
}

// Props voor inferentiefase-component
export interface InferencePhaseProps {
  data: GegevensInferentie;
  onUpdate: (data: Partial<GegevensInferentie>) => void;
  onNext: () => void;
  onBack?: () => void; 
}

// Props voor eindgebruikersapparaten-component
export interface EndUserDevicesProps {
  data: GegevensApparaten;
  onUpdate: (data: Partial<GegevensApparaten>) => void;
  onNext: () => void;
  onBack?: () => void; 
}

// Props voor netwerkgebruik-component
export interface NetworkUsageProps {
  data: GegevensNetwerk;
  onUpdate: (data: Partial<GegevensNetwerk>) => void;
  onNext: () => void;
  onBack?: () => void; 
}

// Props voor webhosting-component
export interface WebHostingProps {
  data: GegevensHosting;
  onUpdate: (data: Partial<GegevensHosting>) => void;
  onNext: (isOnline?: boolean) => void;
  onBack?: () => void; 
}

// Props voor resultaten-component
export interface ResultsProps {
  formData: FormData;
  onBack: () => void;
}