import React, { useState, useRef } from 'react';
import useIsVisible from '../../hooks/useIsVisible';
import { CodeIcon, ZapIcon, MicIcon, DollarSign, CpuIcon, BoxIcon } from '../common/Icons';

// IMPORTA TUS IMÁGENES
import softwareImg from '../../assets/images/Software.png';
import hardwareImg from '../../assets/images/Hardware.png';

const TechnicalDetailsSection = () => {
  const ref = useRef(null);
  useIsVisible(ref);
  const [activeTab, setActiveTab] = useState('software');

  const TabButton = ({ id, label }) => (
    <button 
      className={`tab-button text-lg font-medium py-4 px-6 border-b-2 border-transparent hover:text-blue-500 transition-all ${activeTab === id ? 'active' : ''}`} 
      onClick={() => setActiveTab(id)}
    >
      {label}
    </button>
  );

  return (
    <section ref={ref} className="full-page-section bg-white px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Profundizando en la Ingeniería</h2>
          <p className="text-lg text-gray-600">Arquitectura técnica y especificaciones detalladas del sistema.</p>
        </div>
        
        <div>
          {/* Pestañas de Navegación */}
          <div className="flex flex-col sm:flex-row justify-center border-b border-gray-300 mb-8">
            <TabButton id="software" label="Software & IA" />
            <TabButton id="hardware" label="Hardware & Electrónica" />
          </div>

          <div id="tabs-content" className="bg-white p-6 md:p-10 rounded-2xl shadow-lg border border-gray-100">
            
            {/* TAB SOFTWARE */}
            <div className={`tab-panel ${activeTab === 'software' ? 'active' : ''}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Arquitectura Full-Stack</h3>
                  <div className="space-y-6">
                    {/* Frontend */}
                    <div className="flex items-start gap-4">
                        <div className="shrink-0 w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center"><CodeIcon className="w-6 h-6" /></div>
                        <div>
                            <h4 className="font-semibold text-lg text-gray-900">Frontend Interactivo</h4>
                            <p className="text-gray-600">Desarrollado en <strong>ReactJS + Vite</strong>. Interfaz optimizada para lectores de pantalla y navegación por teclado.</p>
                        </div>
                    </div>
                    {/* Backend */}
                    <div className="flex items-start gap-4">
                        <div className="shrink-0 w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center"><ZapIcon className="w-6 h-6" /></div>
                        <div>
                            <h4 className="font-semibold text-lg text-gray-900">Backend & Datos</h4>
                            <p className="text-gray-600">API robusta con <strong>FastAPI (Python)</strong> y persistencia de datos en <strong>PostgreSQL</strong>.</p>
                        </div>
                    </div>
                    {/* IA */}
                    <div className="flex items-start gap-4">
                        <div className="shrink-0 w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center"><MicIcon className="w-6 h-6" /></div>
                        <div>
                            <h4 className="font-semibold text-lg text-gray-900">Inteligencia Artificial</h4>
                            <p className="text-gray-600">Integración de modelos locales <strong>(Ollama/Gemma 270m)</strong> para procesamiento de lenguaje natural y voz.</p>
                        </div>
                    </div>
                  </div>
                </div>
                
                {/* Imagen Software (Estilo Plano) */}
                <div className="flex items-center justify-center h-full p-4">
                    <img 
                        src={softwareImg} 
                        alt="Diagrama de arquitectura de software: React, FastAPI y PostgreSQL" 
                        className="w-full h-auto max-h-80 object-contain hover:scale-105 transition-transform duration-500" 
                    />
                </div>
              </div>
            </div>

            {/* TAB HARDWARE */}
            <div className={`tab-panel ${activeTab === 'hardware' ? 'active' : ''}`}>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Ingeniería del Dispositivo</h3>
                  <div className="space-y-6">
                    {/* Solenoides */}
                    <div className="flex items-start gap-4">
                        <div className="shrink-0 w-12 h-12 bg-green-100 text-green-700 rounded-lg flex items-center justify-center"><DollarSign className="w-6 h-6" /></div>
                        <div>
                            <h4 className="font-semibold text-lg text-gray-900">Actuadores Electromagnéticos</h4>
                            <p className="text-gray-600">Solenoides lineales customizados con alambre de cobre <strong>calibre 38 (0.1mm)</strong>. Costo reducido a ~$750 MXN.</p>
                        </div>
                    </div>
                    {/* Control */}
                    <div className="flex items-start gap-4">
                        <div className="shrink-0 w-12 h-12 bg-green-100 text-green-700 rounded-lg flex items-center justify-center"><CpuIcon className="w-6 h-6" /></div>
                        <div>
                            <h4 className="font-semibold text-lg text-gray-900">Control y Energía</h4>
                            <p className="text-gray-600">Microcontrolador <strong>ESP32</strong> alimentado por batería LiPo de 3.7V (2000mAh) con módulo step-up a 5V.</p>
                        </div>
                    </div>
                    {/* Manufactura */}
                    <div className="flex items-start gap-4">
                        <div className="shrink-0 w-12 h-12 bg-green-100 text-green-700 rounded-lg flex items-center justify-center"><BoxIcon className="w-6 h-6" /></div>
                        <div>
                            <h4 className="font-semibold text-lg text-gray-900">Diseño y Materiales</h4>
                            <p className="text-gray-600">Cuerpo modular impreso en 3D utilizando <strong>PETG</strong> para mayor durabilidad y resistencia térmica.</p>
                        </div>
                    </div>
                  </div>
                </div>
                
                {/* Imagen Hardware (Estilo Plano) */}
                <div className="flex items-center justify-center h-full p-4">
                    <img 
                        src={hardwareImg} 
                        alt="Prototipo del dispositivo Braille mostrando solenoides" 
                        className="w-full h-auto max-h-80 object-contain hover:scale-105 transition-transform duration-500" 
                    />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
export default TechnicalDetailsSection;