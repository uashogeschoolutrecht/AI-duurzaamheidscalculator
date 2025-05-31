import React, { useState } from 'react';
import datacenters from '../data/datacenters.json';
import { berekenCo2UitstootInferentie } from '../utils/berekeningen';
import { InferencePhaseProps } from '../types';
import InlineInfoButton from './InlineInfoButton';

const providerMap = {
  azure: 'Microsoft',
  gcp: 'Google',
  aws: 'AWS',
  ibm: 'IBM',
  irm: 'Iron Mountain',
  meta: 'Meta',
  oracle: 'Oracle',
  sap: 'SAP',
  equ: 'Equinix',
  dgr: 'Digital Realty',
};

const taken = [
  { naam: 'Tekstgeneratie', waarde: 'text-generation', energie: 0.047 / 1000 },
  { naam: 'Beeldgeneratie', waarde: 'image-generation', energie: 2.907 / 1000 },
  { naam: 'Tekstclassificatie', waarde: 'text-classification', energie: 0.002 / 1000 },
  { naam: 'Vraag beantwoording (extractief)', waarde: 'extractive-qa', energie: 0.003 / 1000 },
  { naam: 'Masked language modeling', waarde: 'masked-lm', energie: 0.003 / 1000 },
  { naam: 'Tokenclassificatie', waarde: 'token-classification', energie: 0.004 / 1000 },
  { naam: 'Beeldclassificatie', waarde: 'image-classification', energie: 0.007 / 1000 },
  { naam: 'Objectdetectie', waarde: 'object-detection', energie: 0.038 / 1000 },
  { naam: 'Samenvatting maken', waarde: 'summarization', energie: 0.049 / 1000 },
  { naam: 'Beeldonderschrift genereren', waarde: 'image-captioning', energie: 0.063 / 1000 }
];

const InferencePhase: React.FC<InferencePhaseProps> = ({ data, onUpdate, onNext, onBack }) => {
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const markTouched = (field: string) => setTouched(prev => ({ ...prev, [field]: true }));

  const datacenterLabel = providerMap[data.provider as keyof typeof providerMap] ?? '';
  const datacentersBeschikbaar = datacenters.filter(dc => dc['Bedrijf'] === datacenterLabel);

  const resultaten = berekenCo2UitstootInferentie(
    data.energyPerInference ?? 0,
    data.inferencesPerYear ?? 0,
    data.pue ?? 1,
    data.carbonIntensity ?? 0,
    data.inferenceDuration ?? 0
  );

  const updateRegion = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const gekozen = e.target.value;
    const match = datacentersBeschikbaar.find(dc => dc['Datacenter / regio'] === gekozen);
    onUpdate({
      region: gekozen,
      pue: match ? parseFloat(match['PUE']) : undefined,
      carbonIntensity: match ? parseFloat(match['Carbon Intensity (gCO2/kWh)']) : undefined,
    });
    markTouched('region');
  };

  const isValid =
    data.locatie &&
    (data.locatie === 'local' || (data.provider && data.region)) &&
    data.task &&
    data.inferencesPerYear &&
    data.energyPerInference &&
    data.inferenceDuration;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h2 className="text-2xl font-semibold text-gray-900">CO₂-uitstoot tijdens inferentie</h2>

      <div className="space-y-6">
        {/* Locatie */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Waar wordt inferentie uitgevoerd?
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-gray-800">
              <input
                type="radio"
                value="cloud"
                checked={data.locatie === 'cloud'}
                onChange={() => {
                  onUpdate({ locatie: 'cloud', provider: '', region: '' });
                  markTouched('locatie');
                }}
              />
              Cloud
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-800">
              <input
                type="radio"
                value="local"
                checked={data.locatie === 'local'}
                onChange={() => {
                  onUpdate({ locatie: 'local', provider: '', region: '' });
                  markTouched('locatie');
                }}
              />
              Lokaal
            </label>
            {!data.locatie && touched.locatie && (
              <p className="text-sm text-red-600">Selecteer een locatie.</p>
            )}
          </div>
        </div>

        {data.locatie === 'cloud' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cloudprovider</label>
              <select
                className={`w-full p-3 border rounded-lg ${
                  !data.provider && touched.provider ? 'border-red-500' : 'border-gray-300'
                }`}
                value={data.provider || ''}
                onChange={(e) => {
                  onUpdate({ provider: e.target.value, region: '' });
                  markTouched('provider');
                }}
              >
                <option value="">Selecteer een provider</option>
                {Object.entries(providerMap).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              {!data.provider && touched.provider && (
                <p className="text-sm text-red-600">Selecteer een provider.</p>
              )}
            </div>

            {data.provider && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Regio / Datacenter</label>
                <select
                  className={`w-full p-3 border rounded-lg ${
                    !data.region && touched.region ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={data.region || ''}
                  onChange={updateRegion}
                >
                  <option value="">Selecteer een regio</option>
                  {datacentersBeschikbaar.map((dc, i) => (
                    <option key={i} value={dc['Datacenter / regio']}>
                      {dc['Datacenter / regio']} ({dc.Land})
                    </option>
                  ))}
                </select>
                {!data.region && touched.region && (
                  <p className="text-sm text-red-600">Selecteer een regio.</p>
                )}
              </div>
            )}
          </>
        )}

        {/* AI-taak */}
        <div>
          <div className="flex items-center gap-2 mb-2"> {/* Aangepast: flex items-center en gap-2 */}
            <label htmlFor="ai-task" className="block text-sm font-medium text-gray-700">
              Voor welke AI-taak wordt de toepassing vooral gebruikt?
            </label>
            <InlineInfoButton text="Tekstgeneratie betekent dat het model vrij een tekst schrijft, bijvoorbeeld een alinea of verhaal. Vraag-beantwoording betekent dat het model antwoord geeft op een specifieke vraag op basis van bestaande informatie. De taak heeft invloed op het energieverbruik en de CO₂-uitstoot." />
          </div>
          <select
            id="ai-task" // Voeg een ID toe voor accessibility
            className={`w-full p-3 border rounded-lg ${
              !data.task && touched.task ? 'border-red-500' : 'border-gray-300'
            }`}
            value={data.task || ''}
            onChange={(e) => {
              const taak = taken.find(t => t.waarde === e.target.value);
              onUpdate({ task: e.target.value, energyPerInference: taak?.energie });
              markTouched('task');
            }}
          >
            <option value="">Selecteer een taak</option>
            {taken.map(taak => (
              <option key={taak.waarde} value={taak.waarde}>{taak.naam}</option>
            ))}
          </select>
          {!data.task && touched.task && (
            <p className="text-sm text-red-600">Selecteer een taak.</p>
          )}
        </div>

        {/* Jaarverbruik */}
        <div>
          <div className="flex items-center gap-2 mb-2"> {/* Aangepast: flex items-center en gap-2 */}
            <label htmlFor="inferences-per-year" className="block text-sm font-medium text-gray-700">
              Aantal inferenties per jaar
            </label>
            <InlineInfoButton text="Een inferentie is een modeluitvoer, zoals een antwoord of gegenereerde tekst. Bijvoorbeeld: 1 gebruiker die 10 vragen stelt aan een AI-chatbot, heeft 10 inferenties gedaan." />
          </div>
          <input
            id="inferences-per-year" // Voeg een ID toe voor accessibility
            type="number"
            className={`w-full p-3 border rounded-lg ${
              !data.inferencesPerYear && touched.inferencesPerYear ? 'border-red-500' : 'border-gray-300'
            }`}
            value={data.inferencesPerYear || ''}
            onChange={(e) => {
              onUpdate({ inferencesPerYear: parseFloat(e.target.value) });
              markTouched('inferencesPerYear');
            }}
            placeholder="bijv. 10.000"
          />
          {!data.inferencesPerYear && touched.inferencesPerYear && (
            <p className="text-sm text-red-600">Vul het aantal inferenties per jaar in.</p>
          )}
        </div>

        <div>
          <label htmlFor="energy-per-inference" className="block text-sm font-medium text-gray-700 mb-2">
            Energieverbruik per inferentie (kWh)
          </label>
          <input
            id="energy-per-inference" // Voeg een ID toe voor accessibility
            type="number"
            className={`w-full p-3 border rounded-lg ${
              !data.energyPerInference && touched.energyPerInference ? 'border-red-500' : 'border-gray-300'
            }`}
            value={data.energyPerInference || ''}
            onChange={(e) => {
              onUpdate({ energyPerInference: parseFloat(e.target.value) });
              markTouched('energyPerInference');
            }}
          />
          {!data.energyPerInference && touched.energyPerInference && (
            <p className="text-sm text-red-600">Vul het energieverbruik in.</p>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2"> {/* Aangepast: flex items-center en gap-2 */}
            <label htmlFor="inference-duration" className="block text-sm font-medium text-gray-700">
              Gemiddelde duur per inferentie (seconden)
            </label>
            <InlineInfoButton text='De gemiddelde "duur per inferentie" is ongeveer 18.41 seconden, gebaseerd op de Artificial Analysis LLM Performance Leaderboard op Hugging Face. Geraadpleegd op 22-5-2025' />
          </div>
          <input
            id="inference-duration" // Voeg een ID toe voor accessibility
            type="number"
            className={`w-full p-3 border rounded-lg ${
              !data.inferenceDuration && touched.inferenceDuration ? 'border-red-500' : 'border-gray-300'
            }`}
            value={data.inferenceDuration || ''}
            onChange={(e) => {
              onUpdate({ inferenceDuration: parseFloat(e.target.value) });
              markTouched('inferenceDuration');
            }}
            placeholder="Bijv. 18"
          />
          {!data.inferenceDuration && touched.inferenceDuration && (
            <p className="text-sm text-red-600">Vul de duur per inferentie in.</p>
          )}
        </div>
      </div>

      {(data.inferencesPerYear && data.inferenceDuration) && (
        <div className="bg-gray-50 p-4 rounded-lg mt-6 text-sm text-gray-700 space-y-1">
          <p><strong>Operationeel:</strong> {resultaten.operationeelKg.toFixed(2)} kg CO₂e/jaar</p>
          <p><strong>Embedded GPU:</strong> {resultaten.embeddedGpuKg.toFixed(2)} kg CO₂e/jaar</p>
          <p><strong>Embedded Server:</strong> {resultaten.embeddedServerKg.toFixed(2)} kg CO₂e/jaar</p>
          <p className="font-semibold pt-2">Totaal: {resultaten.totaalKg.toFixed(2)} kg CO₂e/jaar</p>
        </div>
      )}

      <div className="flex justify-between items-center mt-8">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Vorige
        </button>
        <button
          onClick={onNext}
          disabled={!isValid}
          className={`px-6 py-3 rounded-lg transition-colors ${
            isValid
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Volgende
        </button>
      </div>
    </div>
  );
};

export default InferencePhase;