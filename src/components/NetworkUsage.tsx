import React from 'react';
import { ChevronRight } from 'lucide-react';
import { berekenNetwerkUitstootPerInfferentie } from '../utils/berekeningen';
import { NetworkUsageProps } from '../types';
import InlineInfoButton from './InlineInfoButton';

// NetworkUsage vraagt de gebruiker om de hoeveelheid data per inferentie
// en toont de geschatte CO₂-uitstoot door netwerkgebruik.
const NetworkUsage: React.FC<NetworkUsageProps> = ({ data, onUpdate, onNext, onBack }) => {
  // Haal de ingevulde hoeveelheid en eenheid op, standaard naar 0 en 'KB'
  const hoeveelheid = parseFloat(data.dataHoeveelheid || '0');
  const eenheid = data.dataEenheid || 'KB';

  // Bereken de uitstoot en het energieverbruik op basis van invoer
  const berekening = berekenNetwerkUitstootPerInfferentie(hoeveelheid, eenheid);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        Schat de CO₂-uitstoot door netwerkgebruik
      </h2>

      <div className="space-y-6">
        <div>
          {/* Label en info-button naast elkaar */}
          <div className="flex items-center gap-2 mb-2">
            <label htmlFor="data-hoeveelheid" className="block text-sm font-medium text-gray-700">
              Gemiddelde hoeveelheid data per inferentie
            </label>
            <InlineInfoButton text={'Een gemiddelde inferentie (bijv. via ChatGPT) verbruikt ongeveer 8 kilobyte aan data. Dit is gebaseerd op tekstinvoer en -output van zo’n 2000 tekens, met een geschatte grootte van ~4 bytes per teken (Unicode). Deze schatting is afgeleid van een analyse over het dataverbruik van generatieve AI-tools. Bron: https://www.datasciencecentral.com/heres-how-much-data-gets-used-by-generative-ai-tools-for-each-request/'} />
          </div>
          {/* Invoer voor hoeveelheid en eenheid */}
          <div className="flex space-x-4">
            <input
              id="data-hoeveelheid" // Toegankelijkheids-ID toegevoegd
              type="number"
              className="flex-1 p-3 border border-gray-300 rounded-lg"
              placeholder="bijv. 8"
              value={data.dataHoeveelheid || ''}
              onChange={(e) => onUpdate({ dataHoeveelheid: e.target.value })}
            />
            <select
              id="data-eenheid" // Toegankelijkheids-ID toegevoegd
              className="w-24 p-3 border border-gray-300 rounded-lg"
              value={data.dataEenheid || 'KB'}
              onChange={(e) => onUpdate({ dataEenheid: e.target.value as 'KB' | 'MB' | 'GB' })}
            >
              <option value="KB">KB</option>
              <option value="MB">MB</option>
              <option value="GB">GB</option>
            </select>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Bijvoorbeeld: een tekstgeneratie van ongeveer 2000 tekens is ongeveer 8 kB.
          </p>
        </div>

        {/* Resultaatweergave */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Geschatte impact per inferentie</h3>
          <p className="text-sm text-gray-600 mb-1">
            <strong>Elektriciteitsverbruik:</strong> {berekening.energieKwh.toFixed(6)} kWh
          </p>
          <p className="text-sm text-gray-600 mb-1">
            <strong>CO₂-uitstoot:</strong> {berekening.uitstootGramCO2.toFixed(2)} gram CO₂
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Gebaseerd op 0.27 kWh/GB (Farfan & Lohrmann, 2023) en een CO₂-intensiteit van 268 g/kWh (Nederland, 2023).
          </p>
        </div>
      </div>

      {/* Navigatieknoppen */}
      <div className="flex justify-between items-center mt-8">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Vorige
        </button>
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Volgende
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default NetworkUsage;