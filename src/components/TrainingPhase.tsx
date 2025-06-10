// SPDX-License-Identifier: EUPL-1.2
// Copyright (C) 2025 Saddik Khaddamellah
// Met dank aan Erik Slingerland voor begeleiding.
import React, { useState, useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import modelData from '../data/Foundation-modellen.json';
import { berekenCo2UitstootTraining } from '../utils/berekeningen';
import { TrainingPhaseProps, GegevensTraining } from '../types';

// TrainingPhase: laat de gebruiker de trainingsfase van het AI-model invullen en berekent de CO₂-uitstoot.
const TrainingPhase: React.FC<TrainingPhaseProps & { onBack: () => void }> = ({ data, onUpdate, onNext, onBack }) => {
  // Haal de gekozen modelkeuze op, standaard 'preloaded'
  const modelKeuze = data.modelKeuze ?? 'preloaded';
  // Bereken de uitstoot op basis van de huidige invoer
  const uitstoot = berekenCo2UitstootTraining(modelKeuze, data.gekozenModelNaam, data.gpuUren);

  // State voor zoekveld en validatie
  const [searchQuery, setSearchQuery] = useState('');
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false);

  // Sorteer modellen alfabetisch
  const sortedModels = useMemo(() => {
    return [...modelData].sort((a, b) =>
      a["LLM Model"].localeCompare(b["LLM Model"])
    );
  }, []);

  // Filter modellen op zoekopdracht
  const filteredModels = sortedModels.filter((model) =>
    model["LLM Model"].toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Validatie: check of alle verplichte velden zijn ingevuld
  const isValid =
    (modelKeuze === 'preloaded' && data.gekozenModelNaam) ||
    ((modelKeuze === 'finetuned' || modelKeuze === 'custom') &&
      data.gpuType &&
      data.gpuUren !== undefined &&
      data.gpuUren > 0);

  // Handler voor wijzigen van modelkeuze
  const handleModelKeuzeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const keuze = e.target.value as GegevensTraining['modelKeuze'];
    onUpdate({
      modelKeuze: keuze,
      gekozenModelNaam: undefined,
      gpuType: undefined,
      gpuUren: undefined,
      co2UitstootTrainingKg: undefined
    });
    setHasTriedSubmit(false);
  };

  // Handler voor selectie van bestaand model
  const handleModelSelect = (modelNaam: string) => {
    const match = modelData.find((m) => m["LLM Model"] === modelNaam);
    const uitstootKg = match ? parseFloat(match["Totale CO₂-uitstoot (in kg)"]) : 0;
    onUpdate({ gekozenModelNaam: modelNaam, co2UitstootTrainingKg: uitstootKg });
  };

  // Handler voor wijzigen van GPU-uren
  const handleGpuUrenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uren = parseFloat(e.target.value);
    const uitstootKg = uren * 0.2;
    onUpdate({ gpuUren: uren, co2UitstootTrainingKg: uitstootKg });
  };

  return (
    <div className="space-y-8">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Bereken de milieu-impact van het trainen en/of gebruik van je AI-model
        </h2>

        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">
              Kies hieronder welk type model van toepassing is voor jullie gemeentelijke AI-toepassing.
              Dit helpt bij het inschatten van de uitstoot tijdens de trainingsfase.
            </p>

            {/* Dropdown voor modelkeuze */}
            <label className="block text-sm font-medium text-gray-700 mb-2">Modelkeuze</label>
            <select
              value={modelKeuze}
              onChange={handleModelKeuzeChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="preloaded">Bestaand foundation model (bijv. GPT-3, LLaMA)</option>
              <option value="finetuned">Fine-tuned model</option>
              <option value="custom">Eigen model (vanaf nul getraind)</option>
            </select>
          </div>

          {/* Als bestaand model gekozen is, laat zoekveld en selectie zien */}
          {modelKeuze === 'preloaded' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecteer bestaand model
              </label>

              {/* Zoekveld voor modellen */}
              <input
                type="text"
                placeholder="Zoek model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg mb-2"
              />

              {/* Dropdown met gefilterde modellen */}
              <select
                value={data.gekozenModelNaam || ''}
                onChange={(e) => handleModelSelect(e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 ${
                  !data.gekozenModelNaam && hasTriedSubmit ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Selecteer een model</option>
                {filteredModels.map((model, index) => (
                  <option key={index} value={model["LLM Model"]}>
                    {model["LLM Model"]}
                  </option>
                ))}
              </select>

              {/* Validatie: model verplicht */}
              {!data.gekozenModelNaam && hasTriedSubmit && (
                <p className="text-sm text-red-600 mt-1">Kies een model om verder te gaan.</p>
              )}
            </div>
          ) : (
            // Fine-tuned of custom model: GPU-type en uren invullen
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">GPU-type</label>
                <select
                  value={data.gpuType || ''}
                  onChange={(e) => onUpdate({ gpuType: e.target.value })}
                  className={`w-full p-3 border rounded-lg focus:ring-2 ${
                    !data.gpuType && hasTriedSubmit ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Selecteer een GPU</option>
                  <option value="v100">NVIDIA V100</option>
                  <option value="a100">NVIDIA A100</option>
                  <option value="h100">NVIDIA H100</option>
                </select>
                {/* Validatie: GPU-type verplicht */}
                {!data.gpuType && hasTriedSubmit && (
                  <p className="text-sm text-red-600 mt-1">Selecteer een GPU-type.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">GPU-uren</label>
                <input
                  type="range"
                  min="1"
                  max="1000"
                  value={data.gpuUren || 0}
                  onChange={handleGpuUrenChange}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>1 uur</span>
                  <span>1000 uur</span>
                </div>
                {/* Validatie: GPU-uren verplicht */}
                {(hasTriedSubmit && (!data.gpuUren || data.gpuUren <= 0)) && (
                  <p className="text-sm text-red-600 mt-1">Geef een geldig aantal GPU-uren op.</p>
                )}
              </div>
            </div>
          )}

          {/* Resultaat: geschatte uitstoot */}
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <p className="text-green-800">
              Geschatte CO₂-uitstoot: {Math.round(uitstoot)} kg CO₂e
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
            onClick={() => {
              setHasTriedSubmit(true);
              if (isValid) onNext();
            }}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
              isValid
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Volgende
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainingPhase;
