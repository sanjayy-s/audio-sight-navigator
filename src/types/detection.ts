
export interface DetectedObject {
  id: string;
  label: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  distance: 'near' | 'medium' | 'far';
}

export interface DetectionContextType {
  isDetecting: boolean;
  startDetection: () => void;
  stopDetection: () => void;
  detectedObjects: DetectedObject[];
  isCameraReady: boolean;
  hasCameraPermission: boolean | null;
  requestCameraPermission: () => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

export interface ObjectDefinition {
  label: string;
  sizeRange: {
    min: number;
    max: number;
  };
  confidenceRange: {
    min: number;
    max: number;
  };
  spawnChance: number;
}
