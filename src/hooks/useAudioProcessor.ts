
import { useEffect } from 'react';
import { DetectedObject } from '../contexts/DetectionContext';
import { playDetectionSound, playProximityAlert } from '../utils/audioFeedback';
import { 
  filterByConfidence, 
  sortByPriority, 
  hasRequiredProperties, 
  isObjectNearby 
} from '../utils/detectionUtils';

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
    
    // Check if any objects are within the 2-meter proximity threshold
    const nearbyObjects = prioritizedObjects.filter(obj => 
      isObjectNearby(obj.boundingBox.width, obj.boundingBox.height)
    );
    
    // Play a proximity alert if objects are detected within 2 meters
    if (nearbyObjects.length > 0) {
      playProximityAlert();
    }
    
    // Also play the regular detection sounds for all objects
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
