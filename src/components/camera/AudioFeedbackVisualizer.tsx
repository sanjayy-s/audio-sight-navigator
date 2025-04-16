
import React from 'react';
import { DetectedObject } from '../../contexts/DetectionContext';
import { isObjectNearby } from '../../utils/detectionUtils';

interface AudioFeedbackVisualizerProps {
  detectedObjects: DetectedObject[];
  isDetecting: boolean;
}

const AudioFeedbackVisualizer: React.FC<AudioFeedbackVisualizerProps> = ({ 
  detectedObjects, 
  isDetecting 
}) => {
  if (!isDetecting) return null;
  
  return (
    <>
      {detectedObjects.map((obj) => {
        const isWithin2Meters = isObjectNearby(obj.boundingBox.width, obj.boundingBox.height);
        
        return (
          <div 
            key={obj.id}
            className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full audio-pulse ${
              isWithin2Meters ? 'animate-pulse' : ''
            }`}
            style={{
              width: isWithin2Meters ? '60px' : '50px',
              height: isWithin2Meters ? '60px' : '50px',
              backgroundColor: isWithin2Meters ? 'rgba(239, 68, 68, 0.3)' : 
                             obj.distance === 'near' ? 'rgba(239, 68, 68, 0.2)' : 
                             obj.distance === 'medium' ? 'rgba(234, 179, 8, 0.2)' : 
                             'rgba(34, 197, 94, 0.2)',
              borderWidth: isWithin2Meters ? '3px' : '2px',
              borderStyle: 'solid',
              borderColor: isWithin2Meters ? 'rgba(239, 68, 68, 0.8)' : 
                           obj.distance === 'near' ? 'rgba(239, 68, 68, 0.6)' : 
                           obj.distance === 'medium' ? 'rgba(234, 179, 8, 0.6)' : 
                           'rgba(34, 197, 94, 0.6)'
            }}
          />
        );
      })}
    </>
  );
};

export default AudioFeedbackVisualizer;
