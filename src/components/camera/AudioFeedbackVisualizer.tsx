
import React from 'react';
import { DetectedObject } from '../../contexts/DetectionContext';

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
      {detectedObjects.map((obj) => (
        <div 
          key={obj.id}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full audio-pulse"
          style={{
            width: '50px',
            height: '50px',
            backgroundColor: obj.distance === 'near' ? 'rgba(239, 68, 68, 0.2)' : 
                            obj.distance === 'medium' ? 'rgba(234, 179, 8, 0.2)' : 
                            'rgba(34, 197, 94, 0.2)',
            borderWidth: '2px',
            borderStyle: 'solid',
            borderColor: obj.distance === 'near' ? 'rgba(239, 68, 68, 0.6)' : 
                          obj.distance === 'medium' ? 'rgba(234, 179, 8, 0.6)' : 
                          'rgba(34, 197, 94, 0.6)'
          }}
        />
      ))}
    </>
  );
};

export default AudioFeedbackVisualizer;
