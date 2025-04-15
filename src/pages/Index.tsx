
import React, { useEffect } from 'react';
import { useDetection } from '@/contexts/DetectionContext';
import Camera from '@/components/Camera';
import { Button } from '@/components/ui/button';
import { Volume2, Settings, Info, ArrowLeft } from 'lucide-react';
import { playDetectionSound, speakText, initializeAudio } from '@/utils/audioFeedback';
import { Link } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const { detectedObjects, hasCameraPermission, requestCameraPermission } = useDetection();
  const { toast } = useToast();

  // Initialize audio on first user interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      initializeAudio();
      document.removeEventListener('click', handleFirstInteraction);
      speakText("THIRD EYE ready. Press the eye button to start detection.");
    };
    
    document.addEventListener('click', handleFirstInteraction);
    
    return () => {
      document.removeEventListener('click', handleFirstInteraction);
    };
  }, []);

  // Play sounds when objects are detected
  useEffect(() => {
    if (detectedObjects.length > 0) {
      detectedObjects.forEach(object => {
        playDetectionSound(
          object.label, 
          object.distance,
          { duration: object.distance === 'near' ? 400 : 200 }
        );
        
        // Speak the detected object if it's near
        if (object.distance === 'near') {
          speakText(`${object.label} nearby`);
        }
      });
    }
  }, [detectedObjects]);

  // Check camera permissions on initial load
  useEffect(() => {
    if (hasCameraPermission === null) {
      requestCameraPermission().then(granted => {
        if (granted) {
          toast({
            title: "Camera access granted",
            description: "You can now start detecting objects around you.",
          });
        }
      });
    }
  }, [hasCameraPermission, requestCameraPermission, toast]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-primary-foreground p-4 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/welcome">
              <Button variant="ghost" className="mr-2" size="icon">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back to Welcome</span>
              </Button>
            </Link>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Volume2 className="w-6 h-6" />
              THIRD EYE
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/settings">
              <Button size="icon" variant="ghost">
                <Settings className="w-5 h-5" />
                <span className="sr-only">Settings</span>
              </Button>
            </Link>
            <Link to="/info">
              <Button size="icon" variant="ghost">
                <Info className="w-5 h-5" />
                <span className="sr-only">Information</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 max-w-4xl">
        <div className="grid gap-8">
          <section aria-labelledby="camera-section">
            <h2 id="camera-section" className="sr-only">Camera View</h2>
            <Camera />
          </section>

          <section aria-labelledby="detection-status">
            <h2 id="detection-status" className="text-xl font-semibold mb-2">Detection Status</h2>
            <div className="bg-card p-4 rounded-lg shadow-sm">
              {detectedObjects.length > 0 ? (
                <ul className="space-y-2">
                  {detectedObjects.map(object => (
                    <li key={object.id} className="flex items-center justify-between">
                      <span className="font-medium">{object.label}</span>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          object.distance === 'near' ? 'bg-red-100 text-red-800' : 
                          object.distance === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-green-100 text-green-800'
                        }`}>
                          {object.distance}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {Math.round(object.confidence * 100)}%
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No objects detected yet. Press the eye button to start detection.</p>
              )}
            </div>
          </section>
        </div>
      </main>
      
      <footer className="bg-muted p-4 text-center text-sm text-muted-foreground">
        <p>THIRD EYE - Enhancing mobility for visually impaired users</p>
      </footer>
    </div>
  );
};

export default Index;
