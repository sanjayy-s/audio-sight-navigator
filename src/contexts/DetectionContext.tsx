
import React, { createContext, useContext, useEffect } from 'react';
import { DetectionContextType, DetectedObject } from '../types/detection';
import { useDetectionState } from '../hooks/useDetectionState';

const DetectionContext = createContext<DetectionContextType | undefined>(undefined);

export const useDetection = () => {
  const context = useContext(DetectionContext);
  if (context === undefined) {
    throw new Error('useDetection must be used within a DetectionProvider');
  }
  return context;
};

export { DetectedObject };

export const DetectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    isDetecting,
    detectedObjects,
    isCameraReady,
    hasCameraPermission,
    isLoading,
    error,
    detectionInterval,
    startDetection,
    stopDetection,
    requestCameraPermission,
    setDetectionInterval
  } = useDetectionState();

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (detectionInterval) {
        clearInterval(detectionInterval as unknown as number);
      }
    };
  }, [detectionInterval]);

  return (
    <DetectionContext.Provider
      value={{
        isDetecting,
        startDetection,
        stopDetection,
        detectedObjects,
        isCameraReady,
        hasCameraPermission,
        requestCameraPermission,
        isLoading,
        error
      }}
    >
      {children}
    </DetectionContext.Provider>
  );
};

declare global {
  interface Window {
    detectionInterval: number | undefined;
  }
}
