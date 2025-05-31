import React, { useState } from 'react';
import { Download, Info, Printer } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { berekenTotaleUitstoot } from '../utils/berekenTotaleUitstoot';
import Uitleg from './Uitleg';
import { ResultsProps } from '../types';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

const determineEnergyLabel = (co2: number): string => {
  if (co2 <= 10000) return 'A';
  if (co2 <= 20000) return 'B';
  if (co2 <= 40000) return 'C';
  if (co2 <= 80000) return 'D';
  if (co2 <= 160000) return 'E';
  if (co2 <= 320000) return 'F';
  return 'G';
};

const getLabelColor = (label: string) => {
  switch (label) {
    case 'A': return 'bg-green-500';
    case 'B': return 'bg-lime-400';
    case 'C': return 'bg-yellow-400';
    case 'D': return 'bg-orange-400';
    case 'E': return 'bg-orange-500';
    case 'F': return 'bg-red-500';
    case 'G': return 'bg-red-700';
    default: return 'bg-gray-300';
  }
};

const kleuren = ['#16a34a', '#2563eb', '#facc15', '#f97316', '#9ca3af', '#6366f1', '#ef4444'];
const getColor = (index: number) => kleuren[index % kleuren.length];

const phaseExplanations = (inferencesPerYear: number): { [key: string]: string } => ({
  training: `De uitstoot van de trainingsfase is proportioneel toegekend op basis van het gemeentelijke gebruik van ${inferencesPerYear.toLocaleString()} inferenties per jaar, vergeleken met een geschat wereldwijd gebruik van 365 miljard inferenties.`,
  inference: 'De uitstoot bij inferentie omvat operationeel verbruik en productie van de gebruikte GPU.',
  devices: 'De uitstoot van apparaten is gebaseerd op sessieduur, apparaattype en productie-impact.',
  network: 'Netwerkverkeer veroorzaakt uitstoot door energiegebruik per GB en CO₂-intensiteit van stroom.',
  hosting: 'Bij hosting is ook de productie-uitstoot van servers meegerekend over hun levensduur.'
});

const Results: React.FC<ResultsProps> = ({ formData, onBack }) => {
  const [visibleInfo, setVisibleInfo] = useState<string | null>(null);
  const { totaalKg, perFase, perFaseDetails, inferencesPerYear } = berekenTotaleUitstoot(formData);
  const label = determineEnergyLabel(totaalKg);

  const downloadResults = () => {
    const results = { totaalKg, perFase };
    const data = JSON.stringify({ formData, results }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-duurzaamheidsrapport.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadPDF = () => {
    const element = document.getElementById('rapport-content');
    if (!element) return;

    const opt = {
      margin: 0.5,
      filename: 'ai-duurzaamheidsrapport.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(element).set(opt).save();
  };

  return (
    <>
      <div id="rapport-content" className="max-w-4xl mx-auto space-y-8">
        <h2 className="text-2xl font-semibold text-gray-900">Resultaten van duurzaamheidsanalyse</h2>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium mb-4">Totale jaarlijkse CO₂-uitstoot</h3>
          <p className="text-2xl font-bold text-green-600">
            {totaalKg.toLocaleString(undefined, { maximumFractionDigits: 0 })} kg CO₂e
          </p>

          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Energielabel (indicatief)</h4>
            <div className="flex items-center space-x-1">
              {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((lbl) => (
                <div
                  key={lbl}
                  className={`w-8 h-8 text-xs text-white font-bold flex items-center justify-center rounded ${getLabelColor(lbl)} ${lbl === label ? 'scale-110 ring-2 ring-black' : ''}`}
                >
                  {lbl}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Gebaseerd op totale CO₂-uitstoot van deze toepassing
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium mb-4">Vergelijkbaar met de uitstoot van</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>🚗 {Math.round(totaalKg / 0.12).toLocaleString()} autokilometers (120 g/km)</p>
            <p>🌳 De hoeveelheid koolstof die {Math.round(totaalKg / 25).toLocaleString()} bomen in een jaar opnemen</p>
            <p>🏠 {(totaalKg / 18500).toFixed(2)} Nederlandse huishoudens (jaarlijks)</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium mb-6">Uitsplitsing per fase</h3>

          <ResponsiveContainer width="100%" height={80}>
            <BarChart
              data={[{ name: 'CO₂-uitstoot per fase', ...perFase }]}
              layout="vertical"
              stackOffset="expand"
            >
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" hide />
              <Tooltip
                formatter={(value: number, key: string) =>
                  `${value.toFixed(2)} kg CO₂e (${((value / totaalKg) * 100).toFixed(2)}%)`
                }
              />
              {Object.keys(perFase).map((fase, index) => (
                <Bar key={fase} dataKey={fase} stackId="1" fill={getColor(index)} />
              ))}
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-4 space-y-2 text-sm text-gray-700">
            {Object.entries(perFase).map(([fase, uitstoot], index) => (
              <div key={fase} className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 rounded" style={{ backgroundColor: getColor(index) }} />
                <span className="font-medium capitalize">{fase}:</span>
                <span>{uitstoot.toFixed(2)} kg CO₂e</span>
              </div>
            ))}
          </div>

          {visibleInfo && (
            <div className="mt-4 text-sm text-gray-700 bg-gray-50 border p-4 rounded">
              <strong>Toelichting:</strong> {phaseExplanations(inferencesPerYear)[visibleInfo]}
            </div>
          )}
        </div>

        <Uitleg formData={formData} results={{ totaalKg, perFase, perFaseDetails }} />

        {inferencesPerYear > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-medium mb-4">Impact per inferentie</h3>
            <p className="text-sm text-gray-600">
              🌍 <strong>{(totaalKg * 1000 / inferencesPerYear).toFixed(2)}</strong> g CO₂e
            </p>
          </div>
        )}

        <div className="text-xs text-gray-500">
          <p>* Embedded CO₂ van GPU’s: 150 kg CO₂e / 6 jaar (Luccioni et al 2022).</p>
          <p>* Embedded CO₂ server: 2500 kg CO₂e / 6 jaar (Luccioni et al 2022).</p>
          <p>* Apparaten: gebaseerd op Malmodin & Lundén (2018), geschaald per sessieduur.</p>
          <p>* Netwerk: 0.27 kWh/GB (Farfan & Lohrmann, 2023); CO₂-intensiteit: 268 g/kWh (2023).</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mt-8 max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="w-full sm:w-auto px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Vorige
        </button>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={downloadPDF}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Download als PDF
            <Printer className="h-4 w-4" />
          </button>
          <button
            onClick={downloadResults}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Download als JSON
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );
};

export default Results;
