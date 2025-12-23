import { useState, useEffect } from 'react';

export const useLoadingSteps = (isGenerating: boolean, stepsCount: number, intervalMs: number = 2500) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isGenerating) {
      setCurrentStepIndex(0);
      interval = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev < stepsCount - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, intervalMs);
    }
    return () => clearInterval(interval);
  }, [isGenerating, stepsCount, intervalMs]);

  return currentStepIndex;
};