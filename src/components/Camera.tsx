
import React, { useState, useEffect } from 'react';
import { useDetection } from '../contexts/DetectionContext';
import { useAudioProcessor } from '../hooks/useAudioProcessor';
import CameraDisplay from './camera/CameraDisplay';
import CameraControls from './camera/CameraControls';
import PermissionRequest from './camera/PermissionRequest';
import AudioFeedbackVisualizer from './camera/AudioFeedbackVisualizer';

const Camera: React.FC = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const { 
    isDetecting,
    startDetection,
    stopDetection,
    hasCameraPermission,
    requestCameraPermission,
    detectedObjects,
    isLoading
  } = useDetection();

  // Process audio feedback
  useAudioProcessor(detectedObjects, isDetecting, isMuted);

  useEffect(() => {
    const setupCamera = async () => {
      if (hasCameraPermission && !stream) {
        try {
          const videoStream = await navigator.mediaDevices.getUserMedia({
            video: { 
              facingMode: 'environment',
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          });
          
          setStream(videoStream);
        } catch (error) {
          console.error('Error accessing camera:', error);
        }
      }
    };

    setupCamera();
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [hasCameraPermission, stream]);

  const handleToggleDetection = () => {
    if (isDetecting) {
      stopDetection();
    } else {
      if (hasCameraPermission) {
        startDetection();
      } else {
        requestCameraPermission().then(granted => {
          if (granted) {
            startDetection();
          }
        });
      }
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {hasCameraPermission === false && (
        <PermissionRequest onRequestPermission={requestCameraPermission} />
      )}
      
      <div className="relative">
        <CameraDisplay 
          videoStream={stream}
          detectedObjects={detectedObjects}
          isLoading={isLoading}
        />
        
        <CameraControls 
          isDetecting={isDetecting}
          isMuted={isMuted}
          isLoading={isLoading}
          hasCameraPermission={hasCameraPermission}
          onToggleDetection={handleToggleDetection}
          onToggleMute={toggleMute}
        />
      </div>

      <AudioFeedbackVisualizer 
        detectedObjects={detectedObjects}
        isDetecting={isDetecting}
      />
    </div>
  );
};

export default Camera;
