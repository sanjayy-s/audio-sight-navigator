
import { useState, useRef } from 'react';
import { DetectedObject } from '../types/detection';
import { 
  stabilizeDetections, 
  filterOutOfFrameObjects, 
  removeDuplicateDetections 
} from '../utils/detectionUtils';
import { simulateDetection } from '../services/mockDetectionService';

export const useDetectionState = () => {
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
      
      // Use the simulation service to generate mock objects
      let mockObjects = simulateDetection(persistedObjects.current, generationCount.current);
      
      // Apply filters and stabilizers
      mockObjects = filterOutOfFrameObjects(mockObjects);
      mockObjects = removeDuplicateDetections(mockObjects);
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

  return {
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
  };
};
