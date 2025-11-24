import React, { useState, useRef } from 'react';
import useIsVisible from '../../hooks/useIsVisible';
import { CodeIcon, ZapIcon, MicIcon, DollarSign, CpuIcon, BoxIcon } from '../common/Icons';

const TechnicalDetailsSection = () => {
  const ref = useRef(null);
  useIsVisible(ref);
  const [activeTab, setActiveTab] = useState('software');

  const TabButton = ({ id, label }) => (
    <button className={`tab-button text-lg font-medium py-4 px-6 border-b-2 border-transparent hover:text-blue-500 transition-all ${activeTab === id ? 'active' : ''}`} onClick={() => setActiveTab(id)}>{label}</button>
  );

  return (
    <section ref={ref} className="full-page-section bg-white px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Profundizando en el Proyecto</h2>
          <p className="text-lg text-gray-600">Información técnica para evaluación.</p>
        </div>
        <div>
          <div className="flex flex-col sm:flex-row justify-center border-b border-gray-300 mb-8">
            <TabButton id="software" label="Software" />
            <TabButton id="hardware" label="Hardware" />
          </div>
          <div id="tabs-content" className="bg-white p-6 md:p-10 rounded-2xl shadow-lg border border-gray-100">
            <div className={`tab-panel ${activeTab === 'software' ? 'active' : ''}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Componentes de Software</h3>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4"><div className="shrink-0 w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center"><CodeIcon className="w-6 h-6" /></div><div><h4 className="font-semibold text-lg text-gray-900">Frontend: ReactJS</h4><p className="text-gray-600">Interfaz interactiva y multimodal.</p></div></div>
                    <div className="flex items-start gap-4"><div className="shrink-0 w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center"><ZapIcon className="w-6 h-6" /></div><div><h4 className="font-semibold text-lg text-gray-900">Backend: FastAPI</h4><p className="text-gray-600">Gestión de lecciones y progreso.</p></div></div>
                    <div className="flex items-start gap-4"><div className="shrink-0 w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center"><MicIcon className="w-6 h-6" /></div><div><h4 className="font-semibold text-lg text-gray-900">IA: NLP</h4><p className="text-gray-600">Reconocimiento de voz.</p></div></div>
                  </div>
                </div>
                <div className="rounded-lg overflow-hidden flex items-center justify-center h-full"><div className="w-full h-64 rounded-lg bg-gray-100 border border-gray-300 flex items-center justify-center"><CodeIcon className="w-16 h-16 text-gray-400" /></div></div>
              </div>
            </div>
            <div className={`tab-panel ${activeTab === 'hardware' ? 'active' : ''}`}>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Componentes de Hardware</h3>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4"><div className="shrink-0 w-12 h-12 bg-green-100 text-green-700 rounded-lg flex items-center justify-center"><DollarSign className="w-6 h-6" /></div><div><h4 className="font-semibold text-lg text-gray-900">Innovación: Solenoides</h4><p className="text-gray-600">Reducción de costo a ~$750 MXN.</p></div></div>
                    <div className="flex items-start gap-4"><div className="shrink-0 w-12 h-12 bg-green-100 text-green-700 rounded-lg flex items-center justify-center"><CpuIcon className="w-6 h-6" /></div><div><h4 className="font-semibold text-lg text-gray-900">Controlador: ESP32</h4><p className="text-gray-600">Microcontrolador de bajo costo.</p></div></div>
                    <div className="flex items-start gap-4"><div className="shrink-0 w-12 h-12 bg-green-100 text-green-700 rounded-lg flex items-center justify-center"><BoxIcon className="w-6 h-6" /></div><div><h4 className="font-semibold text-lg text-gray-900">Diseño: Modular</h4><p className="text-gray-600">Cuerpo impreso en 3D.</p></div></div>
                  </div>
                </div>
                <div className="rounded-lg overflow-hidden flex items-center justify-center h-full"><div className="w-full h-64 rounded-lg bg-gray-100 border border-gray-300 flex items-center justify-center"><CpuIcon className="w-16 h-16 text-gray-400" /></div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default TechnicalDetailsSection;