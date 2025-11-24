import React from 'react';

const BrailleCell = ({ dots, char, onClick, showChar = false, className = "", role = "button", isInteractive = true }) => {
  const getAriaLabel = () => {
    const dotNumbers = dots.map((isActive, i) => (isActive ? i + 1 : null)).filter(Boolean).join(', ');
    if (char === ' ') return "Espacio";
    if (char === '#') return "Prefijo numérico. Puntos: 3, 4, 5, 6.";
    if (dotNumbers) return `Letra ${char}. Puntos: ${dotNumbers}.`;
    return `Carácter desconocido: ${char}`;
  };
  
  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && isInteractive) {
      e.preventDefault();
      onClick(e);
    }
  };

  const commonProps = isInteractive ? { role, tabIndex: 0, onClick, onKeyDown: handleKeyDown, "aria-label": getAriaLabel() } : { role: "img", "aria-label": getAriaLabel() };

  return (
    <div {...commonProps} className={`relative border border-gray-300 rounded bg-gray-50 flex justify-center items-center ${isInteractive ? 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white' : ''} ${className}`}>
      <svg width="24" height="36" viewBox="0 0 24 36" aria-hidden="true" className="shrink-0">
        {[0, 1, 2, 3, 4, 5].map((index) => {
          const col = index < 3 ? 0 : 1;
          const row = index % 3;
          return (
            <circle key={index} cx={6 + col * 12} cy={6 + row * 12} r={dots[index] ? 4 : 1.5} fill={dots[index] ? "currentColor" : "lightgray"} />
          );
        })}
      </svg>
      {showChar && <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs font-mono text-gray-500">{char}</span>}
    </div>
  );
};

export default BrailleCell;