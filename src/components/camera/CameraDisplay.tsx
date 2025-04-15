
import React, { useRef, useEffect, useState } from 'react';
import { filterByConfidence, sortByPriority, hasRequiredProperties } from '../../utils/detectionUtils';
import { DetectedObject } from '../../contexts/DetectionContext';

interface CameraDisplayProps {
  videoStream: MediaStream | null;
  detectedObjects: DetectedObject[];
  isLoading: boolean;
}

const CameraDisplay: React.FC<CameraDisplayProps> = ({
  videoStream,
  detectedObjects,
  isLoading
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [frameProcessing, setFrameProcessing] = useState(false);

  useEffect(() => {
    if (videoStream && videoRef.current) {
      videoRef.current.srcObject = videoStream;
      videoRef.current.play().catch(error => {
        console.error('Error playing video:', error);
      });
    }
  }, [videoStream]);

  useEffect(() => {
    if (!canvasRef.current || !videoRef.current || frameProcessing) return;
    
    const processFrame = () => {
      if (!canvasRef.current || !videoRef.current || !detectedObjects.length) return;
      
      setFrameProcessing(true);
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;
      
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      const highConfidenceObjects = filterByConfidence(detectedObjects);
      
      const filteredObjects = highConfidenceObjects.filter(hasRequiredProperties);
      const prioritizedObjects = sortByPriority(filteredObjects);
      
      prioritizedObjects.forEach(obj => {
        const { x, y, width, height } = obj.boundingBox;
        const canvasWidth = canvasRef.current!.width;
        const canvasHeight = canvasRef.current!.height;
        
        let color = '';
        switch (obj.distance) {
          case 'near':
            color = 'red';
            break;
          case 'medium':
            color = 'yellow';
            break;
          case 'far':
            color = 'green';
            break;
        }
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.strokeRect(
          x * canvasWidth,
          y * canvasHeight,
          width * canvasWidth,
          height * canvasHeight
        );
        
        ctx.shadowColor = 'black';
        ctx.shadowBlur = 4;
        ctx.fillStyle = color;
        ctx.font = 'bold 16px Arial';
        const text = `${obj.label} (${Math.round(obj.confidence * 100)}%)`;
        
        const textMeasure = ctx.measureText(text);
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(
          x * canvasWidth,
          (y * canvasHeight) - 20,
          textMeasure.width + 6,
          20
        );
        
        ctx.fillStyle = color;
        ctx.fillText(
          text,
          (x * canvasWidth) + 3,
          (y * canvasHeight) - 5
        );
        ctx.shadowBlur = 0;
      });
      
      setFrameProcessing(false);
    };
    
    processFrame();
    
    if (detectedObjects.length > 0) {
      const frameId = requestAnimationFrame(processFrame);
      return () => cancelAnimationFrame(frameId);
    }
  }, [detectedObjects, frameProcessing]);

  return (
    <div className="relative aspect-video w-full bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        autoPlay
        muted
      />
      
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
      />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
};

export default CameraDisplay;
