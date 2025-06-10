import React from 'react';
import { ChevronRight } from 'lucide-react';
import { berekenCo2Apparaatgebruik } from '../utils/berekeningen';
import { EndUserDevicesProps } from '../types';

// Specificaties van de ondersteunde apparaten
const apparatenSpecs = {
  smartphone: { label: 'Smartphone', vermogenWatt: 1, embeddedCo2Kg: 86.6, levensduurJaar: 3 },
  laptop: { label: 'Laptop', vermogenWatt: 75, embeddedCo2Kg: 522.6, levensduurJaar: 4 }
  // desktop: { label: 'Desktop', vermogenWatt: 175, embeddedCo2Kg: 1273.4, levensduurJaar: 5 },
  // tablet: { label: 'Tablet', vermogenWatt: 7.5, embeddedCo2Kg: 110.1, levensduurJaar: 4 }
};

const EndUserDevices: React.FC<EndUserDevicesProps> = ({ data, onUpdate, onNext, onBack }) => {
  // Wijzigt een veld in de data en roept onUpdate aan
  const wijzigVeld = (veld: string, waarde: string) => {
    onUpdate({ ...data, [veld]: waarde });
  };

  // Past het percentage laptops aan, smartphones wordt automatisch aangevuld tot 100%
  const wijzigLaptopPercentage = (waarde: number) => {
    const laptop = waarde;
    const smartphone = 100 - laptop;

    onUpdate({
      ...data,
      percentages: {
        laptop: laptop.toString(),
        smartphone: smartphone.toString(),
      }
    });
  };

  // Berekent de totale embedded uitstoot voor alle apparaten
  const totaalEmbedded = Object.entries(apparatenSpecs).reduce((acc, [type, info]) => {
    const percentage = parseFloat(data.percentages?.[type] || '0');
    const aantalGebruikers = parseFloat(data.totaalAantalGebruikers || '0') * (percentage / 100);
    const sessieduur = parseFloat(data.sessieduurMinuten || '0');
    const sessies = parseFloat(data.sessiesPerJaar || '0');
    const berekening = berekenCo2Apparaatgebruik({
      aantalGebruikers,
      sessieduurMin: sessieduur,
      sessiesPerGebruiker: sessies
    }, info);
    return acc + berekening.embeddedKg;
  }, 0);

  // Berekent de totale operationele uitstoot voor alle apparaten
  const totaalOperationeel = Object.entries(apparatenSpecs).reduce((acc, [type, info]) => {
    const percentage = parseFloat(data.percentages?.[type] || '0');
    const aantalGebruikers = parseFloat(data.totaalAantalGebruikers || '0') * (percentage / 100);
    const sessieduur = parseFloat(data.sessieduurMinuten || '0');
    const sessies = parseFloat(data.sessiesPerJaar || '0');
    const berekening = berekenCo2Apparaatgebruik({
      aantalGebruikers,
      sessieduurMin: sessieduur,
      sessiesPerGebruiker: sessies
    }, info);
    return acc + berekening.operationeelKg;
  }, 0);

  // Wordt aangeroepen bij 'Volgende', update apparaten-data en gaat naar de volgende stap
  const handleNext = () => {
    const apparatenData: any = {};
    Object.entries(apparatenSpecs).forEach(([type, info]) => {
      const percentage = parseFloat(data.percentages?.[type] || '0');
      const aantalGebruikers = parseFloat(data.totaalAantalGebruikers || '0') * (percentage / 100);
      const sessieduur = parseFloat(data.sessieduurMinuten || '0');
      const sessies = parseFloat(data.sessiesPerJaar || '0');

      apparatenData[type] = {
        aantalGebruikers: aantalGebruikers.toString(),
        sessieduurMinuten: sessieduur.toString(),
        sessiesPerJaar: sessies.toString()
      };
    });

    onUpdate({
      ...data,
      apparaten: apparatenData
    });

    onNext();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        Energie- en materiaalgebruik van eindgebruikersapparaten
      </h2>

      {/* Invoer: totaal aantal gebruikers */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Aantal gebruikers per jaar (totaal)
        </label>
        <input
          type="number"
          className="w-full p-3 border border-gray-300 rounded-lg"
          value={data.totaalAantalGebruikers || ''}
          onChange={(e) => wijzigVeld('totaalAantalGebruikers', e.target.value)}
          placeholder="bijv. 1000"
        />
      </div>

      {/* Invoer: sessieduur */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Duur per sessie (minuten)
        </label>
        <input
          type="number"
          className="w-full p-3 border border-gray-300 rounded-lg"
          value={data.sessieduurMinuten || ''}
          onChange={(e) => wijzigVeld('sessieduurMinuten', e.target.value)}
          placeholder="bijv. 5"
        />
      </div>

      {/* Invoer: aantal sessies per gebruiker */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Aantal sessies per gebruiker per jaar
        </label>
        <input
          type="number"
          className="w-full p-3 border border-gray-300 rounded-lg"
          value={data.sessiesPerJaar || ''}
          onChange={(e) => wijzigVeld('sessiesPerJaar', e.target.value)}
          placeholder="bijv. 300"
        />
      </div>

      {/* Slider voor verdeling tussen laptop en smartphone */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h3 className="text-lg font-medium mb-4">Verdeling gebruikers per apparaat</h3>

        <div className="space-y-6">
          {/* Laptop slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-gray-800">Laptop</span>
              <span className="text-sm text-gray-600">{data.percentages?.laptop || '0'}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={parseFloat(data.percentages?.laptop || '0')}
              onChange={(e) => wijzigLaptopPercentage(parseFloat(e.target.value))}
              className="w-full"
            />
            <p className="text-sm text-gray-600 mt-1">
              Gebruikers met laptop: {(
                parseFloat(data.totaalAantalGebruikers || '0') *
                (parseFloat(data.percentages?.laptop || '0') / 100)
              ).toFixed(0)}
            </p>
          </div>

          {/* Smartphone percentage wordt automatisch berekend */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-gray-800">Smartphone</span>
              <span className="text-sm text-gray-600">
                {100 - parseFloat(data.percentages?.laptop || '0')}%
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Gebruikers met smartphone: {(
                parseFloat(data.totaalAantalGebruikers || '0') *
                ((100 - parseFloat(data.percentages?.laptop || '0')) / 100)
              ).toFixed(0)}
            </p>
          </div>
        </div>
      </div>

      {/* Resultaten per apparaattype */}
      <div className="space-y-4">
        {Object.entries(apparatenSpecs).map(([type, info]) => {
          const percentage = parseFloat(data.percentages?.[type] || '0');
          const aantalGebruikers = parseFloat(data.totaalAantalGebruikers || '0') * (percentage / 100);
          const sessieduur = parseFloat(data.sessieduurMinuten || '0');
          const sessies = parseFloat(data.sessiesPerJaar || '0');

          const invoer = {
            aantalGebruikers,
            sessieduurMin: sessieduur,
            sessiesPerGebruiker: sessies
          };

          const berekening = berekenCo2Apparaatgebruik(invoer, info);

          return (
            <div key={type} className="border rounded-lg p-4 bg-white">
              <h4 className="font-semibold text-gray-800 mb-2">{info.label}</h4>
              <p className="text-sm text-gray-600">
                <strong>Embedded uitstoot:</strong> {berekening.embeddedKg.toFixed(2)} kg CO₂e/jaar
              </p>
              <p className="text-sm text-gray-600">
                <strong>Operationele uitstoot:</strong> {berekening.operationeelKg.toFixed(2)} kg CO₂e/jaar
              </p>
              <p className="text-sm text-gray-600">
                <strong>CO₂ per sessie:</strong> {berekening.co2PerSessieKg.toFixed(4)} kg
              </p>
              <p className="text-sm text-gray-800 font-medium mt-1">
                Totaal per apparaattype: {berekening.totaalPerApparaat.toFixed(2)} kg CO₂e/jaar
              </p>
            </div>
          );
        })}
      </div>

      {/* Samenvatting van de totale uitstoot */}
      <div className="mt-8 p-4 bg-green-50 rounded-lg text-green-800 text-sm">
        <p><strong>Totale embedded uitstoot:</strong> {totaalEmbedded.toFixed(2)} kg CO₂e/jaar</p>
        <p><strong>Totale operationele uitstoot:</strong> {totaalOperationeel.toFixed(2)} kg CO₂e/jaar</p>
        <p><strong>Totaal uitstoot apparaten:</strong> {(totaalEmbedded + totaalOperationeel).toFixed(2)} kg CO₂e/jaar</p>
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
          onClick={handleNext}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Volgende
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default EndUserDevices;
