// SPDX-License-Identifier: EUPL-1.2
// Copyright (C) 2025 Saddik Khaddamellah
// Met dank aan Erik Slingerland voor begeleiding.
import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/Tabs';
import IntroPage from './components/IntroPage';
import TrainingPhase from './components/TrainingPhase';
import InferencePhase from './components/InferencePhase';
import EndUserDevices from './components/EndUserDevices';
import NetworkUsage from './components/NetworkUsage';
import WebHosting from './components/WebHosting';
import Results from './components/Results';

import { FormData, FormSection } from './types';
import { BookOpen, Brain, Cpu, Smartphone, Wifi, Globe, BarChart3 } from 'lucide-react';
import HULogo from './Logos/HU-logo.png';
import HCAIMLogo from './Logos/HCAIM_Logo.png';

function App() {
  // Houdt bij welke tab momenteel actief is
  const [activeTab, setActiveTab] = useState<FormSection>('intro');

  // Centrale state voor alle formulierdata per fase
  const [formData, setFormData] = useState<FormData>({
    training: {},
    inference: { locatie: 'cloud' },
    devices: { apparaten: {} },
    network: {},
    hosting: {}
  });

  // Houdt bij welke tabs (stappen) zijn afgerond
  const [completedTabs, setCompletedTabs] = useState<FormSection[]>([]);

  // Markeer een tab als afgerond (voeg toe aan completedTabs)
  const markTabAsComplete = (tab: FormSection) => {
    setCompletedTabs((prev) => (prev.includes(tab) ? prev : [...prev, tab]));
  };

  // Automatische berekening van jaarlijkse bezoeken (annualVisits) op basis van gebruikers en sessies
  useEffect(() => {
    const aantal = parseFloat(formData.devices?.totaalAantalGebruikers || '0');
    const sessies = parseFloat(formData.devices?.sessiesPerJaar || '0');
    const jaarlijkseBezoeken = Math.round(aantal * sessies);

    if (!isNaN(jaarlijkseBezoeken) && jaarlijkseBezoeken > 0) {
      setFormData(prev => ({
        ...prev,
        hosting: {
          ...prev.hosting,
          annualVisits: jaarlijkseBezoeken.toString()
        }
      }));
    }
  }, [formData.devices?.totaalAantalGebruikers, formData.devices?.sessiesPerJaar]);

  // Hulpfunctie om formulierdata per sectie bij te werken
  const updateFormData = <T extends keyof FormData>(section: T, data: Partial<FormData[T]>) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...data
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header met logo's en titel */}
        <header className="mb-12">
          <div className="grid gap-4 md:grid-cols-3 items-center">
            {/* Links logo */}
            <div className="flex justify-center md:justify-start">
              <img src={HCAIMLogo} alt="HCAIM Logo" className="h-10 sm:h-14 md:h-20 object-contain" />
            </div>

            {/* Titel */}
            <div className="text-center md:col-span-1">
              <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-indigo-900 mb-2 leading-tight">
                Gemeentelijke AI duurzaamheidscalculator
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-gray-600">
                Meet de milieu-impact van uw gemeentelijke generatieve AI-toepassing
              </p>
            </div>

            {/* Rechts logo */}
            <div className="flex justify-center md:justify-end">
              <img src={HULogo} alt="HU Logo" className="h-10 sm:h-14 md:h-20 object-contain" />
            </div>
          </div>
        </header>

        {/* Hoofdcontent: tabs met stappen */}
        <div className="bg-white rounded-xl shadow-xl p-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as FormSection)}>
            {/* Navigatiebalk met alle stappen */}
            <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-4 mb-8">
              <TabsTrigger
                value="intro"
                currentValue={activeTab}
                completed={completedTabs.includes('intro')}
                className="flex flex-col items-center gap-2"
              >
                <BookOpen className="h-5 w-5" />
                <span>Introductie</span>
              </TabsTrigger>
              <TabsTrigger
                value="training"
                currentValue={activeTab}
                completed={completedTabs.includes('training')}
                className="flex flex-col items-center gap-2"
              >
                <Brain className="h-5 w-5" />
                <span>Training</span>
              </TabsTrigger>
              <TabsTrigger
                value="inference"
                currentValue={activeTab}
                completed={completedTabs.includes('inference')}
                className="flex flex-col items-center gap-2"
              >
                <Cpu className="h-5 w-5" />
                <span>Inferentie</span>
              </TabsTrigger>
              <TabsTrigger
                value="devices"
                currentValue={activeTab}
                completed={completedTabs.includes('devices')}
                className="flex flex-col items-center gap-2"
              >
                <Smartphone className="h-5 w-5" />
                <span>Apparaten</span>
              </TabsTrigger>
              <TabsTrigger
                value="hosting"
                currentValue={activeTab}
                completed={completedTabs.includes('hosting')}
                className="flex flex-col items-center gap-2"
              >
                <Globe className="h-5 w-5" />
                <span>Hosting</span>
              </TabsTrigger>
              <TabsTrigger
                value="network"
                currentValue={activeTab}
                completed={completedTabs.includes('network')}
                className="flex flex-col items-center gap-2"
              >
                <Wifi className="h-5 w-5" />
                <span>Netwerk</span>
              </TabsTrigger>
              <TabsTrigger
                value="results"
                currentValue={activeTab}
                completed={completedTabs.includes('results')}
                className="flex flex-col items-center gap-2"
              >
                <BarChart3 className="h-5 w-5" />
                <span>Resultaten</span>
              </TabsTrigger>
            </TabsList>

            {/* Introductiepagina */}
            <TabsContent value="intro" currentValue={activeTab}>
              <IntroPage onStart={() => {
                markTabAsComplete('intro');
                setActiveTab('training');
              }} />
            </TabsContent>

            {/* Trainingsfase */}
            <TabsContent value="training" currentValue={activeTab}>
              <TrainingPhase
                data={formData.training}
                onUpdate={(data) => updateFormData('training', data)}
                onNext={() => {
                  markTabAsComplete('training');
                  setActiveTab('inference');
                }}
                onBack={() => setActiveTab('intro')}
              />
            </TabsContent>

            {/* Inferentiefase */}
            <TabsContent value="inference" currentValue={activeTab}>
              <InferencePhase
                data={formData.inference}
                onUpdate={(data) => updateFormData('inference', data)}
                onNext={() => {
                  markTabAsComplete('inference');
                  setActiveTab('devices');
                }}
                onBack={() => setActiveTab('training')}
              />
            </TabsContent>

            {/* Eindgebruikersapparaten */}
            <TabsContent value="devices" currentValue={activeTab}>
              <EndUserDevices
                data={formData.devices}
                onUpdate={(data) => updateFormData('devices', data)}
                onNext={() => {
                  markTabAsComplete('devices');
                  setActiveTab('hosting');
                }}
                onBack={() => setActiveTab('inference')}
              />
            </TabsContent>

            {/* Webhosting */}
            <TabsContent value="hosting" currentValue={activeTab}>
              <WebHosting
                data={formData.hosting}
                onUpdate={(data) => updateFormData('hosting', data)}
                onNext={(isOnline) => {
                  markTabAsComplete('hosting');
                  // Als niet online, sla netwerkstap over
                  if (isOnline === false) {
                    setActiveTab('results');
                  } else {
                    setActiveTab('network');
                  }
                }}
                onBack={() => setActiveTab('devices')}
              />
            </TabsContent>

            {/* Netwerkgebruik */}
            <TabsContent value="network" currentValue={activeTab}>
              <NetworkUsage
                data={formData.network}
                onUpdate={(data) => updateFormData('network', data)}
                onNext={() => {
                  markTabAsComplete('network');
                  setActiveTab('results');
                }}
                onBack={() => setActiveTab('hosting')}
              />
            </TabsContent>

            {/* Resultatenpagina */}
            <TabsContent value="results" currentValue={activeTab}>
              <Results
                formData={formData}
                onBack={() => setActiveTab('network')}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default App;
