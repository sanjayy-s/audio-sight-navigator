
import React, { createContext, useContext, useState, useEffect } from 'react';

interface DetectionContextType {
  isDetecting: boolean;
  startDetection: () => void;
  stopDetection: () => void;
  detectedObjects: DetectedObject[];
  isCameraReady: boolean;
  hasCameraPermission: boolean | null;
  requestCameraPermission: () => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

export interface DetectedObject {
  id: string;
  label: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  distance: 'near' | 'medium' | 'far';
}

const DetectionContext = createContext<DetectionContextType | undefined>(undefined);

export const useDetection = () => {
  const context = useContext(DetectionContext);
  if (context === undefined) {
    throw new Error('useDetection must be used within a DetectionProvider');
  }
  return context;
};

export const DetectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const requestCameraPermission = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      // Clean up the stream since we're just checking for permissions
      stream.getTracks().forEach(track => track.stop());
      
      setHasCameraPermission(true);
      setError(null);
      return true;
    } catch (err) {
      console.error('Error requesting camera permission:', err);
      setHasCameraPermission(false);
      setError('Camera access denied. Please enable camera permissions to use this app.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const startDetection = () => {
    if (!hasCameraPermission) {
      requestCameraPermission();
      return;
    }
    
    setIsDetecting(true);
    // This would be replaced with actual object detection in the production app
    // We're simulating detection for demo purposes
    const mockDetectionInterval = setInterval(() => {
      const mockObjects: DetectedObject[] = [
        {
          id: Math.random().toString(),
          label: ['chair', 'table', 'person', 'door', 'wall'][Math.floor(Math.random() * 5)],
          confidence: 0.7 + Math.random() * 0.3,
          boundingBox: {
            x: Math.random() * 0.8,
            y: Math.random() * 0.8,
            width: 0.1 + Math.random() * 0.3,
            height: 0.1 + Math.random() * 0.3,
          },
          distance: ['near', 'medium', 'far'][Math.floor(Math.random() * 3)] as 'near' | 'medium' | 'far',
        },
      ];
      
      setDetectedObjects(mockObjects);
    }, 2000);

    // Store interval ID to clean up later
    window.detectionInterval = mockDetectionInterval;
  };

  const stopDetection = () => {
    setIsDetecting(false);
    
    // Clear any detection intervals
    if (window.detectionInterval) {
      clearInterval(window.detectionInterval);
    }
    
    setDetectedObjects([]);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (window.detectionInterval) {
        clearInterval(window.detectionInterval);
      }
    };
  }, []);

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

// Add type declaration for the window object
declare global {
  interface Window {
    detectionInterval: number | undefined;
  }
}
