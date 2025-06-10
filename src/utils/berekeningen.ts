// Importeer de modelgegevens uit een JSON-bestand.
// Dit bestand bevat informatie over verschillende LLM's.
import modelData from '../data/Foundation-modellen.json';

/**
 * Berekent de CO2-uitstoot die vrijkomt bij het trainen van een AI-model.
 *
 * @param modelKeuze - Het type model dat wordt gebruikt. Dit kan 'preloaded', 'finetuned' of 'custom' zijn.
 * @param gekozenModelNaam - De naam van het gekozen model (alleen nodig als modelKeuze 'preloaded' is).
 * @param gpuUren - Het aantal uren dat de GPU heeft gewerkt (voor 'finetuned' of 'custom' modellen).
 * @param lokaleInferenties - Het aantal keren dat de gemeente het model gebruikt.
 * @param wereldwijdeInferenties - Het totaal aantal keren dat het model wereldwijd wordt gebruikt. Standaard is dit 365 miljard.
 * @returns De berekende CO2-uitstoot in kilogram (kg).
 */
export function berekenCo2UitstootTraining(
  modelKeuze: 'preloaded' | 'finetuned' | 'custom',
  gekozenModelNaam?: string,
  gpuUren?: number,
  lokaleInferenties?: number, // inferenties van de gemeente
  wereldwijdeInferenties = 365_000_000_000 // standaardaanname op basis van wereldwijde inferenties van ChatGPT (bron: https://www.demandsage.com/chatgpt-statistics/)
): number {
  // Als het gekozen model een 'preloaded' model is en een naam heeft.
  if (modelKeuze === 'preloaded' && gekozenModelNaam) {
    // Zoek het model in de geïmporteerde data. De zoekopdracht is niet hoofdlettergevoelig.
    const match = modelData.find(
      (m) => m["LLM Model"].toLowerCase() === gekozenModelNaam.toLowerCase()
    );
    // Haal de totale CO2-uitstoot uit de data. Als het model niet wordt gevonden, is de uitstoot 0.
    const totaleUitstoot = match ? parseFloat(match["Totale CO₂-uitstoot (in kg)"]) : 0;

    // Als er lokale inferenties zijn en de wereldwijde inferenties groter zijn dan 0.
    if (lokaleInferenties && wereldwijdeInferenties > 0) {
      // Bereken het aandeel van de lokale inferenties ten opzichte van de wereldwijde inferenties.
      const aandeel = lokaleInferenties / wereldwijdeInferenties;
      // De uitstoot is het lokale aandeel van de totale uitstoot.
      return totaleUitstoot * aandeel;
    }

    // Als er geen lokale inferenties zijn, geef dan de totale uitstoot terug.
    return totaleUitstoot;
  // Als het model 'finetuned' of 'custom' is en de gpuUren zijn opgegeven.
  } else if ((modelKeuze === 'finetuned' || modelKeuze === 'custom') && gpuUren) {
    // De uitstoot is het aantal GPU-uren vermenigvuldigd met een factor 0.3.
    /**
   * AANNAME: 1 GPU-uur ≈ 0.3 kg CO₂-uitstoot
   *
   * Deze aanname is gebaseerd op een gemiddelde trainingssituatie met de volgende onderbouwing:
   *
   * 1. Energieverbruik GPU:
   *    Een veelgebruikte AI-training-GPU zoals de NVIDIA A100 of H100 verbruikt gemiddeld 400 watt.
   *    Dat is 0.4 kWh per uur. (bron: Luccioni et al. 2022)
   *
   * 2. Power Usage Effectiveness (PUE):
   *    Gemiddelde PUE van een datacenter is 1.56 (bron: Statista, 2025).
   *    → 0.4 kWh × 1.56 = 0.624 kWh totaal energieverbruik per GPU-uur.
   *
   * 3. CO₂-uitstoot elektriciteit:
   *    Wereldgemiddelde CO₂-intensiteit is 481 gram per kWh (bron: IEA, 2023).
   *    → 0.624 kWh × 481 g/kWh = 300.14 gram ≈ 0.30 kg CO₂ per GPU-uur.
   *
   * Bronnen:
   * - Luccioni et al. (2022) – ESTIMATING THE CARBON FOOTPRINT OF BLOOM, A 176B PARAMETER LANGUAGE MODEL
   * - https://www.statista.com/statistics/1229367/data-center-average-annual-pue-worldwide/ – Gemiddelde PUE werldwijd
   * - International Energy Agency (2023) – CO₂-uitstoot per kWh
   *
   * Deze waarde is een vereenvoudigde maar onderbouwde schatting voor scenario’s
   * waarin exacte verbruiksgegevens niet beschikbaar zijn.
   */
    // De focus in de huidige versie van de tool ligt op het scenario met een 'preloaded' foundation model.
    return gpuUren * 0.3;
  } else {
    // In alle andere gevallen is de uitstoot 0.
    return 0;
  }
}

/**
 * Berekent de CO2-uitstoot voor het gebruik (inferentie) van een AI-model.
 *
 * @param energiePerInferentieKwh - Het energieverbruik in kilowattuur (kWh) per keer dat het model wordt gebruikt.
 * @param aantalInferencesPerJaar - Het aantal keren dat het model per jaar wordt gebruikt.
 * @param pue - Power Usage Effectiveness, een maat voor de efficiëntie van een datacenter.
 * @param co2Intensiteit - De hoeveelheid CO2 die wordt uitgestoten per kWh energie.
 * @param duurInSeconden - De duur van één inferentie in seconden.
 * @returns Een object met de operationele, embedded GPU, embedded server en totale CO2-uitstoot in kg.
 */
export function berekenCo2UitstootInferentie(
  energiePerInferentieKwh: number,
  aantalInferencesPerJaar: number,
  pue: number,
  co2Intensiteit: number,
  duurInSeconden: number
): {
  operationeelKg: number;
  embeddedGpuKg: number;
  embeddedServerKg: number;
  totaalKg: number;
} {
  // Bereken de 'embedded' CO2-uitstoot van de GPU in gram.
  // Dit is de uitstoot die is ontstaan bij de productie van de hardware.
  // 150000g is de geschatte uitstoot voor één GPU, met een levensduur van 6 jaar. Bron: (Luccioni et al 2022)
  const embeddedGpuG = (150000 / (6 * 365 * 24 * 3600)) * duurInSeconden * aantalInferencesPerJaar;
  // Bereken de 'embedded' CO2-uitstoot van de server in gram.
  // 2500000g is de geschatte uitstoot voor één server, 40% daarvan wordt toegerekend aan deze taak. Bron: (Luccioni et al 2022)
  const embeddedServerG = (2500000 / (6 * 365 * 24 * 3600)) * duurInSeconden * aantalInferencesPerJaar * 0.4;

  // Bereken de operationele CO2-uitstoot in kg. Dit is de uitstoot door het energieverbruik tijdens gebruik.
  const operationeelKg = (energiePerInferentieKwh * pue * aantalInferencesPerJaar * co2Intensiteit) / 1000;
  // Zet de embedded uitstoot van de GPU om van gram naar kilogram.
  const embeddedGpuKg = embeddedGpuG / 1000;
  // Zet de embedded uitstoot van de server om van gram naar kilogram.
  const embeddedServerKg = embeddedServerG / 1000;
  // Tel alle uitstoot bij elkaar op voor de totale uitstoot.
  const totaalKg = operationeelKg + embeddedGpuKg + embeddedServerKg;

  // Geef een object terug met alle berekende waarden.
  return {
    operationeelKg,
    embeddedGpuKg,
    embeddedServerKg,
    totaalKg
  };
}

// Een interface beschrijft de structuur van een object.
// Hier beschrijft het de invoergegevens voor het apparaatgebruik.
export interface ApparaatInvoer {
  aantalGebruikers: number;
  sessieduurMin: number;
  sessiesPerGebruiker: number;
}

/**
 * Beschrijft de specificaties van een eindgebruikersapparaat.
 * De waarden voor energieverbruik (`vermogenWatt`) en levensduur (`levensduurJaar`)
 * van laptops, desktops, smartphones en tablets zijn als volgt bepaald:
 *
 * De basiswaarden zijn gemiddelden afkomstig van datavizta.boavizta.org.
 * Deze zijn vervolgens verfijnd met inzichten uit de publicaties van
 * Malmodin & Lundén (2018) en Berthelot et al. (2024).
 *
 * **Belangrijke aanname:** Er wordt uitgegaan van 8 uur gebruik per dag.
 */

// Deze interface beschrijft de specificaties van een apparaat.
export interface ApparaatInfo {
  vermogenWatt: number; // Het vermogen van het apparaat in Watt.
  embeddedCo2Kg: number; // De CO2-uitstoot van de productie van het apparaat in kg.
  levensduurJaar: number; // De verwachte levensduur van het apparaat in jaren.
}

/**
 * Berekent de CO2-uitstoot van de apparaten van de eindgebruikers (zoals laptops of smartphones).
 *
 * @param invoer - Een object met gegevens over het gebruikersgedrag.
 * @param specs - Een object met de specificaties van het apparaat.
 * @param co2PerKwh - De CO2-uitstoot per kWh. De standaardwaarde is 268 gram.
 * @returns Een object met de embedded, operationele en totale CO2-uitstoot in kg.
 */
export function berekenCo2Apparaatgebruik(
  invoer: ApparaatInvoer,
  specs: ApparaatInfo,
  co2PerKwh = 268
) {
  // Haal de waarden uit het 'invoer' object.
  const { aantalGebruikers, sessieduurMin, sessiesPerGebruiker } = invoer;
  // Bereken welk deel van een werkdag (8 uur = 480 min) het apparaat wordt gebruikt.
  const gebruiksFractie = sessieduurMin / 480;

  // Bereken de embedded uitstoot per gebruiker per jaar, gebaseerd op de gebruiksduur.
  const embeddedPerGebruiker = (specs.embeddedCo2Kg / specs.levensduurJaar) * gebruiksFractie;
  // Bereken de totale embedded uitstoot voor alle gebruikers.
  const totaalEmbedded = embeddedPerGebruiker * aantalGebruikers;

  // Bereken het energieverbruik per sessie in kWh.
  const energiePerSessieKwh = (specs.vermogenWatt * sessieduurMin) / 1000 / 60;
  // Bereken de CO2-uitstoot per sessie in gram.
  const co2PerSessieG = energiePerSessieKwh * co2PerKwh;
  // Bereken de totale operationele uitstoot voor alle gebruikers en sessies, en zet om naar kg.
  const totaalOperationeel = (co2PerSessieG * sessiesPerGebruiker * aantalGebruikers) / 1000;

  // Geef een object terug met de berekende resultaten.
  return {
    embeddedKg: totaalEmbedded,
    operationeelKg: totaalOperationeel,
    co2PerSessieKg: co2PerSessieG / 1000,
    totaalPerApparaat: totaalEmbedded + totaalOperationeel
  };
}

/**
 * Berekent de CO2-uitstoot voor het versturen van data over het netwerk.
 * Gebaseerd op gemiddeld stroomverbruik van 0.27 kWh/GB (Farfan & Lohrmann, 2023) en een CO₂-intensiteit van 268 gCO₂/kWh (Nederland, 2023).
 *
 * @param hoeveelheid - De hoeveelheid data die wordt verstuurd.
 * @param eenheid - De eenheid van de data ('KB', 'MB', of 'GB').
 * @param uitstootPerKwh - De CO2-uitstoot per kWh, standaard 268 gram.
 * @param verbruikPerGb - Het energieverbruik per gigabyte (GB) data, standaard 0.27 kWh.
 * @returns Een object met het energieverbruik in kWh en de CO2-uitstoot in gram.
 */
export function berekenNetwerkUitstootPerInfferentie(
  hoeveelheid: number,
  eenheid: 'KB' | 'MB' | 'GB',
  uitstootPerKwh = 268,
  verbruikPerGb = 0.27
) {
  let aantalGb = 0;
  // Zet de hoeveelheid data om naar gigabytes (GB).
  if (eenheid === 'KB') aantalGb = hoeveelheid / 1_000_000;
  else if (eenheid === 'MB') aantalGb = hoeveelheid / 1000;
  else aantalGb = hoeveelheid;

  // Bereken het totale energieverbruik in kWh.
  const energieVerbruikKwh = aantalGb * verbruikPerGb;
  // Bereken de totale CO2-uitstoot in gram.
  const uitstootGram = energieVerbruikKwh * uitstootPerKwh;

  // Geef een object terug met het berekende energieverbruik en de uitstoot.
  return {
    energieKwh: energieVerbruikKwh,
    uitstootGramCO2: uitstootGram
  };
}

/**
 * Berekent de CO2-uitstoot voor het hosten van de toepassing (website).
 *
 * @param bezoekenPerJaar - Het aantal jaarlijkse bezoeken aan de toepassing.
 * @param type - Het type hosting: 'cloud' of 'local'.
 * @param isOnline - Geeft aan of de toepassing online is.
 * @param pue - Power Usage Effectiveness van het datacenter.
 * @param carbonIntensity - De CO2-intensiteit van de gebruikte energie.
 * @returns Een object met de operationele, productie en totale uitstoot in kg.
 */
export function berekenHostingUitstoot(
  bezoekenPerJaar: number,
  type: 'cloud' | 'local' | undefined,
  isOnline: boolean,
  pue?: number,
  carbonIntensity?: number
) {
  // Als de toepassing niet online is of geen bezoeken heeft, is er geen uitstoot.
  if (!isOnline || !bezoekenPerJaar || bezoekenPerJaar <= 0) {
    return {
      operationeel: 0,
      productie: 0,
      totaal: 0
    };
  }

  // Bepaal de CO2-uitstoot in gram per bezoek.
  // Als PUE en carbonIntensity bekend zijn, bereken het dynamisch.
  // Anders gebruik een standaardwaarde.
  // 1,66 Wh per bezoek wordt omgerekend naar 0.00166 kWh.
  const gramCO2PerBezoek = (pue && carbonIntensity)
    ? 0.00166 * pue * carbonIntensity
    : 0.8; // Standaardwaarde van 0.8 gram CO2 per bezoek. Gebaseerd op het wereldwijde gemiddelde van 0.8 gCO2 per bezoek (bron: https://www.websitecarbon.com/).

  // Bereken de totale operationele uitstoot en zet het om naar kilogram.
  const operationeel = bezoekenPerJaar * gramCO2PerBezoek / 1000;

  // Bereken de productie-uitstoot (embedded CO2) voor cloud-hosting.
  // Dit is gebaseerd op de geschatte uitstoot van de serverhardware.
  // 2.500.000g voor een server, met een levensduur van 6 jaar en 40% gebruikstoerekening. (bron: Luccioni et al 2022)
  const productie =
    type === 'cloud' && bezoekenPerJaar > 0
      ? 2500000 / (6 * 0.4 * 1000) // Dit resulteert in een vaste waarde in kg.
      : 0;

  // Geef een object terug met de operationele, productie en totale uitstoot.
  return {
    operationeel,
    productie,
    totaal: operationeel + productie
  };
}