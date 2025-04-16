
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
    
    // Play an emergency warning sound if objects are detected within 2 meters
    if (nearbyObjects.length > 0) {
      playProximityAlert();
      
      // Optional: Enhance with spoken warning for the first nearby object
      // if (nearbyObjects.length > 0) {
      //   speakText(`Warning: ${nearbyObjects[0].label} in close proximity`);
      // }
    }
    
    // Also play the regular detection sounds for all objects
    prioritizedObjects.forEach((obj, index) => {
      // Don't play regular sounds for objects that triggered emergency warning
      if (!isObjectNearby(obj.boundingBox.width, obj.boundingBox.height)) {
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
      }
    });
  }, [detectedObjects, isDetecting, isMuted]);
};
