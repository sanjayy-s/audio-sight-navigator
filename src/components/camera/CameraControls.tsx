
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Volume2, VolumeX } from 'lucide-react';

interface CameraControlsProps {
  isDetecting: boolean;
  isMuted: boolean;
  isLoading: boolean;
  hasCameraPermission: boolean | null;
  onToggleDetection: () => void;
  onToggleMute: () => void;
}

const CameraControls: React.FC<CameraControlsProps> = ({
  isDetecting,
  isMuted,
  isLoading,
  hasCameraPermission,
  onToggleDetection,
  onToggleMute
}) => {
  return (
    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
      <Button
        onClick={onToggleDetection}
        className="rounded-full w-12 h-12 flex items-center justify-center"
        disabled={isLoading || hasCameraPermission === false}
        size="icon"
        variant={isDetecting ? "destructive" : "default"}
      >
        {isDetecting ? <EyeOff size={20} /> : <Eye size={20} />}
      </Button>
      
      <Button
        onClick={onToggleMute}
        className="rounded-full w-12 h-12 flex items-center justify-center"
        size="icon"
        variant="outline"
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </Button>
    </div>
  );
};

export default CameraControls;
