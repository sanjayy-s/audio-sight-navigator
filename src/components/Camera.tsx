import React, { useRef, useEffect, useState } from 'react';
import { useDetection } from '../contexts/DetectionContext';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Volume2, VolumeX } from 'lucide-react';
import { filterByConfidence, sortByPriority, hasRequiredProperties } from '../utils/detectionUtils';
import { playDetectionSound } from '../utils/audioFeedback';

const Camera: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [frameProcessing, setFrameProcessing] = useState(false);

  const { 
    isDetecting,
    startDetection,
    stopDetection,
    hasCameraPermission,
    requestCameraPermission,
    detectedObjects,
    isLoading
  } = useDetection();

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
          
          if (videoRef.current) {
            videoRef.current.srcObject = videoStream;
            await videoRef.current.play();
          }
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
      
      const prioritizedObjects = sortByPriority(highConfidenceObjects);
      
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

  useEffect(() => {
    if (!isDetecting || isMuted || detectedObjects.length === 0) return;
    
    const highConfidenceObjects = filterByConfidence(detectedObjects);
    
    const prioritizedObjects = sortByPriority(highConfidenceObjects);
    
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
        <div className="bg-destructive/10 p-4 rounded-md mb-4 text-center">
          <p className="text-destructive font-medium">
            Camera access is required for this app to function.
            Please enable camera permissions and refresh the page.
          </p>
          <Button 
            onClick={() => requestCameraPermission()}
            className="mt-2"
          >
            Request Camera Access
          </Button>
        </div>
      )}
      
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
        
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
          <Button
            onClick={handleToggleDetection}
            className="rounded-full w-12 h-12 flex items-center justify-center"
            disabled={isLoading || hasCameraPermission === false}
            size="icon"
            variant={isDetecting ? "destructive" : "default"}
          >
            {isDetecting ? <EyeOff size={20} /> : <Eye size={20} />}
          </Button>
          
          <Button
            onClick={toggleMute}
            className="rounded-full w-12 h-12 flex items-center justify-center"
            size="icon"
            variant="outline"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </Button>
        </div>
      </div>

      {isDetecting && detectedObjects.map((obj) => (
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
    </div>
  );
};

export default Camera;
