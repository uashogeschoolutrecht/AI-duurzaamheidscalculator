import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import InlineInfoButton from './InlineInfoButton';
import datacenters from '../data/datacenters.json';
import { berekenHostingUitstoot } from '../utils/berekeningen';
import { WebHostingProps } from '../types';

// Mapping van cloudprovider keys naar namen
const providerMap: Record<string, string> = {
  azure: 'Microsoft',
  gcp: 'Google',
  aws: 'AWS',
  ibm: 'IBM',
  irm: 'Iron Mountain',
  meta: 'Meta',
  oracle: 'Oracle',
  sap: 'SAP',
  equ: 'Equinix',
  dgr: 'Digital Realty'
};

// WebHosting: laat de gebruiker hostingdetails invullen en toont de geschatte CO₂-uitstoot
const WebHosting: React.FC<WebHostingProps> = ({ data, onUpdate, onNext, onBack }) => {
  const [url, setUrl] = useState('');
  const [greenCheck, setGreenCheck] = useState<null | { green: boolean; hostedBy: string }>(null);
  const [uitstoot, setUitstoot] = useState({ operationeel: 0, productie: 0, totaal: 0 });

  // Bepaal de geselecteerde provider en beschikbare datacenters
  const providerLabel = providerMap[data.cloudProvider || ''] || '';
  const beschikbareDatacenters = datacenters.filter(dc => dc['Bedrijf'] === providerLabel);

  // Handler voor wijzigen van regio
  const wijzigRegio = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const geselecteerde = beschikbareDatacenters.find(dc => dc['Datacenter / regio'] === e.target.value);
    onUpdate({
      region: e.target.value,
      pue: geselecteerde ? parseFloat(geselecteerde['PUE']) : undefined,
      carbonIntensity: geselecteerde ? parseFloat(geselecteerde['Carbon Intensity (gCO2/kWh)']) : undefined
    });
  };

  // Controleer of de opgegeven URL groen gehost wordt via The Green Web Foundation API
  const checkGreenHosting = async () => {
    if (!url) return;
    try {
      const res = await fetch(`https://api.thegreenwebfoundation.org/api/v3/greencheck/${encodeURIComponent(url)}`);
      const json = await res.json();
      setGreenCheck({ green: json.green, hostedBy: json.hosted_by || 'onbekend' });
    } catch {
      setGreenCheck(null);
    }
  };

  // Haal het aantal bezoeken op
  const bezoeken = parseInt(data.annualVisits || '0', 10);

  // Bereken uitstoot telkens als relevante data verandert
  useEffect(() => {
    const nieuweUitstoot = berekenHostingUitstoot(
      bezoeken,
      data.hostingType,
      data.isOnline === true,
      data.pue,
      data.carbonIntensity
    );
    setUitstoot(nieuweUitstoot);
  }, [bezoeken, data.hostingType, data.isOnline, data.pue, data.carbonIntensity]);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Neem de impact van online beschikbaarheid mee</h2>

      <div className="space-y-6">
        {/* Online beschikbaarheid */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Wordt deze toepassing online aangeboden?
          </label>
          <div className="space-y-2">
            <label className="flex items-center space-x-3">
              <input type="radio" name="isOnline" checked={data.isOnline === true}
                className="h-4 w-4 text-indigo-600"
                onChange={() => onUpdate({ isOnline: true })} />
              <span>Ja</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="radio"
                name="isOnline"
                checked={data.isOnline === false}
                className="h-4 w-4 text-indigo-600"
                onChange={() => {
                  onUpdate({
                    isOnline: false,
                    cloudProvider: undefined,
                    region: undefined,
                    pue: undefined,
                    carbonIntensity: undefined,
                    providerInfoKnown: undefined,
                    hostingType: undefined
                  });
                  // Geef expliciet door dat er naar results moet worden gegaan
                  setTimeout(() => onNext(false), 0);
                }}
              />
              <span>Nee</span>
            </label>
          </div>
        </div>

        {/* Alleen tonen als online */}
        {data.isOnline && (
          <>
            {/* URL check */}
            <div>
              <label htmlFor="application-url" className="block text-sm font-medium text-gray-700 mb-2">URL van de toepassing (optioneel)</label>
              <div className="flex space-x-2">
                <input
                  id="application-url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="voorbeeld.nl"
                />
                <button onClick={checkGreenHosting} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                  Check
                </button>
              </div>
              {greenCheck && (
                <p className="text-sm mt-2 text-gray-700">
                  Hostingstatus: <strong className={greenCheck.green ? 'text-green-600' : 'text-red-600'}>
                    {greenCheck.green ? 'Groen' : 'Niet groen'}
                  </strong> – Provider: {greenCheck.hostedBy}
                </p>
              )}
            </div>

            {/* Bezoeken */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label htmlFor="annual-visits" className="block text-sm font-medium text-gray-700">Jaarlijkse bezoeken</label>
                <InlineInfoButton text={`Dit veld is automatisch berekend op basis van:\n\n• Het aantal gebruikers per jaar\n• Het gemiddeld aantal sessies per gebruiker per jaar\n\nDe berekening gebeurt in de vorige stap (Apparaten) en kan daar aangepast worden.`} />
              </div>
              <input
                id="annual-visits"
                type="number"
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                value={data.annualVisits || ''}
                disabled
              />
            </div>

            {/* Hostingtype */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type hosting</label>
              <div className="space-y-2">
                <label className="flex items-center space-x-3">
                  <input type="radio" name="hostingType" value="cloud" checked={data.hostingType === 'cloud'}
                    className="h-4 w-4 text-indigo-600"
                    onChange={(e) => onUpdate({ hostingType: e.target.value as 'cloud' | 'local' })} />
                  <span>Cloud</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="radio" name="hostingType" value="local" checked={data.hostingType === 'local'}
                    className="h-4 w-4 text-indigo-600"
                    onChange={(e) => onUpdate({ hostingType: e.target.value as 'cloud' | 'local' })} />
                  <span>Lokaal</span>
                </label>
              </div>
            </div>

            {/* Cloudspecifiek */}
            {data.hostingType === 'cloud' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Is de cloudprovider en regio bekend?
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="providerInfoKnown"
                        checked={data.providerInfoKnown === true}
                        onChange={() => onUpdate({ providerInfoKnown: true })}
                        className="h-4 w-4 text-indigo-600"
                      />
                      <span>Ja</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="providerInfoKnown"
                        checked={data.providerInfoKnown === false}
                        onChange={() =>
                          onUpdate({
                            providerInfoKnown: false,
                            cloudProvider: undefined,
                            region: undefined,
                            pue: undefined,
                            carbonIntensity: undefined
                          })
                        }
                        className="h-4 w-4 text-indigo-600"
                      />
                      <span>Nee</span>
                    </label>
                  </div>
                </div>

                {data.providerInfoKnown && (
                  <>
                    <div>
                      <label htmlFor="cloud-provider" className="block text-sm font-medium text-gray-700 mb-2">Cloud provider</label>
                      <select
                        id="cloud-provider"
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        value={data.cloudProvider || ''}
                        onChange={(e) =>
                          onUpdate({ cloudProvider: e.target.value, region: '', pue: undefined, carbonIntensity: undefined })
                        }
                      >
                        <option value="">Selecteer een provider</option>
                        {Object.entries(providerMap).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>

                    {data.cloudProvider && (
                      <div>
                        <label htmlFor="region-datacenter" className="block text-sm font-medium text-gray-700 mb-2">Regio / Datacenter</label>
                        <select
                          id="region-datacenter"
                          className="w-full p-3 border border-gray-300 rounded-lg"
                          value={data.region || ''}
                          onChange={wijzigRegio}
                        >
                          <option value="">Selecteer een regio</option>
                          {beschikbareDatacenters.map((dc, index) => (
                            <option key={index} value={dc['Datacenter / regio']}>
                              {dc['Datacenter / regio']} ({dc.Land})
                            </option>
                          ))}
                        </select>

                        {(data.pue || data.carbonIntensity) && (
                          <div className="p-4 bg-gray-50 rounded-lg mt-4 text-sm text-gray-600">
                            {data.pue && <p><strong>PUE:</strong> {data.pue}</p>}
                            {data.carbonIntensity && <p><strong>Energymix:</strong> {data.carbonIntensity} gCO₂/kWh</p>}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* Lokaal */}
            {data.hostingType === 'local' && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label htmlFor="server-location" className="block text-sm font-medium text-gray-700">Serverlocatie</label>
                    <InlineInfoButton text="Dit veld kan gebruikt worden om de locatie van de server te specificeren, bijvoorbeeld 'Nederland' of 'Datacenter X'." />
                  </div>
                  <input
                    id="server-location"
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    onChange={(e) => onUpdate({ serverLocation: e.target.value })}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label htmlFor="server-energy" className="block text-sm font-medium text-gray-700">Energieverbruik (kWh/jaar)</label>
                    <InlineInfoButton text="Voer hier het jaarlijkse energieverbruik van de server in kilowattuur (kWh)." />
                  </div>
                  <input
                    id="server-energy"
                    type="number"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    onChange={(e) => onUpdate({ serverEnergy: e.target.value })}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* Resultaat: toont de berekende uitstoot als er bezoeken zijn */}
        {bezoeken > 0 && (
          <div className="p-4 bg-green-50 text-green-800 rounded-lg mt-4 text-sm space-y-1">
            <p><strong>Totale jaarlijkse uitstoot (operationeel):</strong> {uitstoot.operationeel.toFixed(2)} kg CO₂</p>
            <p><strong>Productie-uitstoot (cloudserver):</strong> {uitstoot.productie.toFixed(2)} kg CO₂</p>
            <p><strong>Totaal:</strong> {uitstoot.totaal.toFixed(2)} kg CO₂</p>
          </div>
        )}
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
          onClick={() => onNext()}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Volgende
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default WebHosting;