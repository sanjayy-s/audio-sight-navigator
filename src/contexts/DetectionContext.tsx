
import React, { createContext, useContext, useState, useEffect } from 'react';
import { calculateObjectDistance, stabilizeDetections } from '../utils/detectionUtils';

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
  const [detectionInterval, setDetectionInterval] = useState<number | null>(null);
  
  const requestCameraPermission = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      // Clean up the stream since we're just checking for permissions
      stream.getTracks().forEach(track => track.stop());
      
      setHasCameraPermission(true);
      setIsCameraReady(true);
      setError(null);
      return true;
    } catch (err) {
      console.error('Error requesting camera permission:', err);
      setHasCameraPermission(false);
      setIsCameraReady(false);
      setError('Camera access denied. Please enable camera permissions to use this app.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced object definitions for more realistic detection
  const objectDefinitions = [
    { 
      label: 'person', 
      sizeRange: { min: 0.1, max: 0.4 },
      confidenceRange: { min: 0.85, max: 0.98 }
    },
    { 
      label: 'chair', 
      sizeRange: { min: 0.05, max: 0.2 },
      confidenceRange: { min: 0.82, max: 0.95 }
    },
    { 
      label: 'table', 
      sizeRange: { min: 0.1, max: 0.3 },
      confidenceRange: { min: 0.8, max: 0.95 }
    },
    { 
      label: 'cup', 
      sizeRange: { min: 0.02, max: 0.08 },
      confidenceRange: { min: 0.75, max: 0.92 }
    },
    { 
      label: 'book', 
      sizeRange: { min: 0.02, max: 0.1 },
      confidenceRange: { min: 0.78, max: 0.94 }
    },
    { 
      label: 'phone', 
      sizeRange: { min: 0.01, max: 0.06 },
      confidenceRange: { min: 0.8, max: 0.96 }
    },
    { 
      label: 'laptop', 
      sizeRange: { min: 0.08, max: 0.25 },
      confidenceRange: { min: 0.85, max: 0.97 }
    },
    { 
      label: 'door', 
      sizeRange: { min: 0.15, max: 0.4 },
      confidenceRange: { min: 0.82, max: 0.96 }
    },
    { 
      label: 'window', 
      sizeRange: { min: 0.1, max: 0.35 },
      confidenceRange: { min: 0.8, max: 0.95 }
    }
  ];

  const startDetection = () => {
    if (!hasCameraPermission) {
      requestCameraPermission();
      return;
    }
    
    setIsDetecting(true);

    // Clear any existing detection intervals
    if (detectionInterval) {
      clearInterval(detectionInterval);
    }
    
    // Create a new detection interval with reduced latency
    const interval = window.setInterval(() => {
      // Generate more accurate mock objects with consistent positions for better testing
      const mockObjects: DetectedObject[] = [];
      
      // Generate 1-4 objects for more realistic detection
      const objectCount = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < objectCount; i++) {
        // Select a random object definition
        const definition = objectDefinitions[Math.floor(Math.random() * objectDefinitions.length)];
        
        // Calculate size within the defined range for this object type
        const widthRange = definition.sizeRange.max - definition.sizeRange.min;
        const heightRange = widthRange * (0.8 + Math.random() * 0.4); // Aspect ratio variation
        
        const width = definition.sizeRange.min + (Math.random() * widthRange);
        const height = definition.sizeRange.min + (Math.random() * heightRange);
        
        // Position with constraints to avoid edge clipping
        const x = Math.random() * (0.9 - width);
        const y = Math.random() * (0.9 - height);
        
        // Calculate distance based on object size
        const distance = calculateObjectDistance(width, height);
        
        // Calculate confidence within the defined range for this object type
        const confidenceRange = definition.confidenceRange.max - definition.confidenceRange.min;
        const confidence = definition.confidenceRange.min + (Math.random() * confidenceRange);
        
        mockObjects.push({
          id: `${definition.label}-${Date.now()}-${i}`,
          label: definition.label,
          confidence,
          boundingBox: { x, y, width, height },
          distance,
        });
      }
      
      // Apply stabilization between frames for more consistent detection
      const stabilizedObjects = stabilizeDetections(mockObjects, detectedObjects);
      setDetectedObjects(stabilizedObjects);
    }, 300); // Reduced from 500ms to 300ms for lower latency
    
    setDetectionInterval(interval as unknown as number);
  };

  const stopDetection = () => {
    setIsDetecting(false);
    
    // Clear any detection intervals
    if (detectionInterval) {
      clearInterval(detectionInterval as unknown as number);
      setDetectionInterval(null);
    }
    
    setDetectedObjects([]);
  };

  // Clean up on unmount
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

// Add type declaration for the window object
declare global {
  interface Window {
    detectionInterval: number | undefined;
  }
}
