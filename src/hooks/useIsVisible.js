import { useState, useEffect } from 'react';

const useIsVisible = (ref) => {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    // Busca el contenedor de scroll más cercano
    const scrollContainer = element.closest('.scroll-container');
    if (!scrollContainer) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          element.classList.add('visible');
          observer.unobserve(element);
        }
      },
      { root: scrollContainer, threshold: 0.4 }
    );
    observer.observe(element);
    return () => {
      if(element) observer.unobserve(element);
    };
  }, [ref]);
  return isVisible;
};

export default useIsVisible;