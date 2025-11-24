import React, { useRef } from 'react';
import useIsVisible from '../../hooks/useIsVisible';
import useCountUp from '../../hooks/useCountUp';

const Quote = () => {
  const ref = useRef(null);
  const isVisible = useIsVisible(ref);
  const animatedPercent = useCountUp(10, 1500, isVisible);

  return (
    <section ref={ref} className="full-page-section bg-gray-50 px-6">
      <div className="container mx-auto max-w-3xl text-center">
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl" role="status" aria-live="polite">
          <p className="text-3xl md:text-4xl font-medium text-blue-600 mb-4 tabular-nums">
            "solo el {animatedPercent}% de personas con ceguera puede leer braille"
          </p>
          <p className="text-lg text-gray-600">- Tu aprendizaje marca la diferencia</p>
        </div>
      </div>
    </section>
  );
};
export default Quote;