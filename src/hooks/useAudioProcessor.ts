
import { useEffect } from 'react';
import { DetectedObject } from '../contexts/DetectionContext';
import { playDetectionSound } from '../utils/audioFeedback';
import { filterByConfidence, sortByPriority, hasRequiredProperties } from '../utils/detectionUtils';

export const useAudioProcessor = (
  detectedObjects: DetectedObject[],
  isDetecting: boolean,
  isMuted: boolean
) => {
  useEffect(() => {
    if (!isDetecting || isMuted || detectedObjects.length === 0) return;
    
    const highConfidenceObjects = filterByConfidence(detectedObjects);
    
    const filteredObjects = highConfidenceObjects.filter(hasRequiredProperties);
    const prioritizedObjects = sortByPriority(filteredObjects);
    
    prioritizedObjects.forEach((obj, index) => {
      const delay = index * 150;
      setTimeout(() => {
        playDetectionSound(
          obj.label, 
          obj.distance,
          { 
            duration: obj.distance === 'near' ? 400 : 200,
            volume: obj.confidence
          }
        );
      }, delay);
    });
  }, [detectedObjects, isDetecting, isMuted]);
};
