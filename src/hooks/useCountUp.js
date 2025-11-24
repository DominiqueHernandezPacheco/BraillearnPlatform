import { useState, useEffect, useRef } from 'react';

const useCountUp = (target, duration = 1500, start) => {
  const [count, setCount] = useState(0);
  const frameRef = useRef(null); 

  useEffect(() => {
    if (!start) {
      setCount(0); 
      return;
    }
    let startTime = null;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      const newCount = Math.floor(percentage * target);
      setCount(newCount);
      if (progress < duration) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration, start]); 
  
  return count; 
};

export default useCountUp;