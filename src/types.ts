// Type voor de trainingsfase
export type ModelKeuze = 'preloaded' | 'finetuned' | 'custom';

export interface GegevensTraining {
  modelKeuze?: ModelKeuze;
  gekozenModelNaam?: string;
  co2UitstootTrainingKg?: number;
  gpuType?: string;
  gpuUren?: number;
}

// Type voor de inferentiefase
export interface GegevensInferentie {
  locatie?: 'cloud' | 'local';
  provider?: string;
  region?: string;
  pue?: number;
  carbonIntensity?: number;
  task?: string;
  energyPerInference?: number;
  inferencesPerYear?: number;
  inferenceDuration?: number;
  totalCO2?: number;
  embeddedServerCO2?: number;
}

// Type voor eindgebruikersapparaten
export type Apparaatgegevens = {
  [apparaatType: string]: {
    aantalGebruikers?: string;
    sessieduurMinuten?: string;
    sessiesPerJaar?: string;
  };
};

export interface GegevensApparaten {
  apparaten: Apparaatgegevens;
  percentages?: { [apparaatType: string]: string };
  totaalAantalGebruikers?: string;
  sessieduurMinuten?: string;
  sessiesPerJaar?: string;
}

// Type voor netwerkgebruik
export interface GegevensNetwerk {
  dataHoeveelheid?: string;
  dataEenheid?: 'KB' | 'MB' | 'GB';
}

// Type voor webhosting
export interface GegevensHosting {
  isOnline?: boolean;
  hostingType?: 'cloud' | 'local';
  cloudProvider?: string;
  region?: string;
  pue?: number;
  carbonIntensity?: number;
  annualVisits?: string;
  serverLocation?: string;
  serverEnergy?: string;
  providerInfoKnown?: boolean; // <- toevoegen
}

// Alles samen in het formulier
export interface FormData {
  training: GegevensTraining;
  inference: GegevensInferentie;
  devices: GegevensApparaten;
  network: GegevensNetwerk;
  hosting: GegevensHosting;
}

export type FormSection =
  | 'intro'
  | 'training'
  | 'inference'
  | 'devices'
  | 'network'
  | 'hosting'
  | 'results';

// Props voor componenten
export interface TrainingPhaseProps {
  data: GegevensTraining;
  onUpdate: (data: Partial<GegevensTraining>) => void;
  onNext: () => void;
  onBack?: () => void; 
}

export interface InferencePhaseProps {
  data: GegevensInferentie;
  onUpdate: (data: Partial<GegevensInferentie>) => void;
  onNext: () => void;
  onBack?: () => void; 
}

export interface EndUserDevicesProps {
  data: GegevensApparaten;
  onUpdate: (data: Partial<GegevensApparaten>) => void;
  onNext: () => void;
  onBack?: () => void; 
}

export interface NetworkUsageProps {
  data: GegevensNetwerk;
  onUpdate: (data: Partial<GegevensNetwerk>) => void;
  onNext: () => void;
  onBack?: () => void; 
}

export interface WebHostingProps {
  data: GegevensHosting;
  onUpdate: (data: Partial<GegevensHosting>) => void;
  onNext: () => void;
  onBack?: () => void; 
}

export interface ResultsProps {
  formData: FormData;
  onBack: () => void;
}