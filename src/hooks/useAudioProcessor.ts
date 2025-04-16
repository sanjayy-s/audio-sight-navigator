import { useEffect, useRef } from 'react';
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
  // Use a ref to keep track of previously announced objects
  const announcedObjectsRef = useRef<Set<string>>(new Set());
  
  // Reset announced objects when detection stops
  useEffect(() => {
    if (!isDetecting) {
      announcedObjectsRef.current.clear();
    }
  }, [isDetecting]);

  useEffect(() => {
    if (!isDetecting || isMuted || detectedObjects.length === 0) return;
    
    const highConfidenceObjects = filterByConfidence(detectedObjects);
    const filteredObjects = highConfidenceObjects.filter(hasRequiredProperties);
    const prioritizedObjects = sortByPriority(filteredObjects);
    
    // Check if any objects are within the 2-meter proximity threshold
    const nearbyObjects = prioritizedObjects.filter(obj => 
      isObjectNearby(obj.boundingBox.width, obj.boundingBox.height)
    );
    
    // Keep track of newly detected objects in this frame
    const newlyDetectedObjects: DetectedObject[] = [];
    
    // Identify which objects are new and haven't been announced yet
    prioritizedObjects.forEach(obj => {
      const objectKey = `${obj.label}-${Math.round(obj.boundingBox.x * 100)}-${Math.round(obj.boundingBox.y * 100)}`;
      
      if (!announcedObjectsRef.current.has(objectKey)) {
        announcedObjectsRef.current.add(objectKey);
        newlyDetectedObjects.push(obj);
        
        // Auto-clear objects from the announced set after 3 seconds
        // This allows re-announcing if the same object appears later
        setTimeout(() => {
          announcedObjectsRef.current.delete(objectKey);
        }, 3000);
      }
    });
    
    // Play an emergency warning sound if NEW objects are detected within 2 meters
    const newNearbyObjects = newlyDetectedObjects.filter(obj => 
      isObjectNearby(obj.boundingBox.width, obj.boundingBox.height)
    );
    
    if (newNearbyObjects.length > 0) {
      playProximityAlert();
    }
    
    // Only play detection sounds for newly detected objects
    newlyDetectedObjects.forEach((obj, index) => {
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
