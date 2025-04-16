import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  calculateObjectDistance, 
  stabilizeDetections, 
  filterOutOfFrameObjects, 
  removeDuplicateDetections 
} from '../utils/detectionUtils';

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
  
  const lastDetectionTimestamp = useRef<number>(0);
  const persistedObjects = useRef<DetectedObject[]>([]);
  const generationCount = useRef<number>(0);
  
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

  const objectDefinitions = [
    { 
      label: 'person', 
      sizeRange: { min: 0.1, max: 0.4 },
      confidenceRange: { min: 0.85, max: 0.98 },
      spawnChance: 0.6
    },
    { 
      label: 'chair', 
      sizeRange: { min: 0.05, max: 0.2 },
      confidenceRange: { min: 0.82, max: 0.95 },
      spawnChance: 0.4
    },
    { 
      label: 'table', 
      sizeRange: { min: 0.1, max: 0.3 },
      confidenceRange: { min: 0.8, max: 0.95 },
      spawnChance: 0.3
    },
    { 
      label: 'cup', 
      sizeRange: { min: 0.02, max: 0.08 },
      confidenceRange: { min: 0.75, max: 0.92 },
      spawnChance: 0.2
    },
    { 
      label: 'book', 
      sizeRange: { min: 0.02, max: 0.1 },
      confidenceRange: { min: 0.78, max: 0.94 },
      spawnChance: 0.2
    },
    { 
      label: 'phone', 
      sizeRange: { min: 0.01, max: 0.06 },
      confidenceRange: { min: 0.8, max: 0.96 },
      spawnChance: 0.2
    },
    { 
      label: 'laptop', 
      sizeRange: { min: 0.08, max: 0.25 },
      confidenceRange: { min: 0.85, max: 0.97 },
      spawnChance: 0.3
    },
    { 
      label: 'door', 
      sizeRange: { min: 0.15, max: 0.4 },
      confidenceRange: { min: 0.82, max: 0.96 },
      spawnChance: 0.3
    },
    { 
      label: 'window', 
      sizeRange: { min: 0.1, max: 0.35 },
      confidenceRange: { min: 0.8, max: 0.95 },
      spawnChance: 0.3
    }
  ];

  const startDetection = () => {
    if (!hasCameraPermission) {
      requestCameraPermission();
      return;
    }
    
    setIsDetecting(true);
    
    persistedObjects.current = [];
    generationCount.current = 0;
    lastDetectionTimestamp.current = 0;

    if (detectionInterval) {
      clearInterval(detectionInterval);
    }
    
    const interval = window.setInterval(() => {
      const now = Date.now();
      
      if (now - lastDetectionTimestamp.current < 200) {
        return;
      }
      
      lastDetectionTimestamp.current = now;
      
      generationCount.current += 1;
      
      let mockObjects: DetectedObject[] = [...persistedObjects.current].map(obj => {
        const xMove = (Math.random() - 0.5) * 0.02;
        const yMove = (Math.random() - 0.5) * 0.02;
        
        return {
          ...obj,
          id: `${obj.label}-${Date.now()}-${Math.random()}`,
          boundingBox: {
            ...obj.boundingBox,
            x: Math.min(Math.max(0, obj.boundingBox.x + xMove), 1 - obj.boundingBox.width),
            y: Math.min(Math.max(0, obj.boundingBox.y + yMove), 1 - obj.boundingBox.height)
          }
        };
      });
      
      if (generationCount.current % 3 === 0) {
        const newObjectCount = Math.floor(Math.random() * 3);
        
        for (let i = 0; i < newObjectCount; i++) {
          const possibleDefinitions = objectDefinitions.filter(def => 
            Math.random() < def.spawnChance
          );
          
          if (possibleDefinitions.length === 0) continue;
          
          const definition = possibleDefinitions[Math.floor(Math.random() * possibleDefinitions.length)];
          
          const widthRange = definition.sizeRange.max - definition.sizeRange.min;
          const heightRange = widthRange * (0.8 + Math.random() * 0.4);
          
          const width = definition.sizeRange.min + (Math.random() * widthRange);
          const height = definition.sizeRange.min + (Math.random() * heightRange);
          
          const x = Math.random() * (0.9 - width);
          const y = Math.random() * (0.9 - height);
          
          const distance = calculateObjectDistance(width, height);
          
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
      }
      
      mockObjects = filterOutOfFrameObjects(mockObjects);
      
      mockObjects = removeDuplicateDetections(mockObjects);
      
      mockObjects = mockObjects.filter(() => Math.random() > 0.1);
      
      const stabilizedObjects = stabilizeDetections(mockObjects, persistedObjects.current);
      
      persistedObjects.current = stabilizedObjects;
      
      setDetectedObjects(stabilizedObjects);
    }, 300);
    
    setDetectionInterval(interval as unknown as number);
  };

  const stopDetection = () => {
    setIsDetecting(false);
    
    if (detectionInterval) {
      clearInterval(detectionInterval as unknown as number);
      setDetectionInterval(null);
    }
    
    persistedObjects.current = [];
    setDetectedObjects([]);
  };

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
