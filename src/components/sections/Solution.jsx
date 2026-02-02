import React, { useRef } from 'react';
import useIsVisible from '../../hooks/useIsVisible';

const SolutionSection = () => {
  const ref = useRef(null);
  useIsVisible(ref);

  return (
    <section ref={ref} className="full-page-section bg-blue-600 text-white px-6">
      <div className="container mx-auto">
        <div className="max-w-2xl text-center mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Nuestra Solución Integral</h2>
          <p className="text-lg text-blue-100">
            Braillearn rompe el modelo de obsolescencia con un sistema híbrido diseñado para el contexto latinoamericano.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Software */}
          <div className="bg-white/10 p-8 rounded-2xl shadow-lg border border-white/20 backdrop-blur-sm transition-all duration-300 ease-out hover:shadow-2xl hover:-translate-y-1.5">
            <h3 className="text-2xl font-bold mb-3 text-yellow-400">Software: Plataforma Multimodal</h3>
            <p className="text-blue-50 mb-4">
              Una herramienta web de acceso inmediato que combina aprendizaje <strong>táctil, auditivo y visual</strong>. Permite iniciar la alfabetización sin hardware costoso, conectando a estudiantes, docentes y familiares.
            </p>
            <ul className="list-disc list-inside text-blue-100 text-sm space-y-1">
              <li>Simulador web interactivo.</li>
              <li>Compatible con lectores de pantalla.</li>
              <li>Gamificación del aprendizaje.</li>
            </ul>
          </div>

          {/* Hardware */}
          <div className="bg-white/10 p-8 rounded-2xl shadow-lg border border-white/20 backdrop-blur-sm transition-all duration-300 ease-out hover:shadow-2xl hover:-translate-y-1.5">
            <h3 className="text-2xl font-bold mb-3 text-yellow-400">Hardware: Dispositivo Modular</h3>
            <p className="text-blue-50 mb-4">
              Un lector Braille de bajo costo (~$750 MXN) basado en <strong>solenoides lineales</strong> en lugar de cristales piezoeléctricos. Su diseño modular permite reparaciones fáciles y expansión futura.
            </p>
            <ul className="list-disc list-inside text-blue-100 text-sm space-y-1">
              <li>Celdas reemplazables individualmente.</li>
              <li>Lectura de formatos digitales (PDF, DOCX).</li>
              <li>Batería recargable de larga duración.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
export default SolutionSection;