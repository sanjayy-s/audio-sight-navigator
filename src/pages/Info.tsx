
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Volume2, Camera, Ear, HelpCircle } from 'lucide-react';
import { speakText } from '@/utils/audioFeedback';

const Info = () => {
  useEffect(() => {
    // Automatically read the page content when it loads
    speakText("Information page. Audio Sight Navigator is an application designed to help visually impaired users navigate their surroundings by detecting objects and providing audio feedback.");
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-primary-foreground p-4 shadow-md">
        <div className="container mx-auto flex items-center">
          <Link to="/">
            <Button variant="ghost" className="mr-2" size="icon">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Button>
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <HelpCircle className="w-6 h-6" />
            Information
          </h1>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 max-w-3xl">
        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-bold mb-4">About Audio Sight Navigator</h2>
            <p className="text-lg mb-4">
              Audio Sight Navigator is an application designed to help visually impaired users
              navigate their surroundings by detecting objects and providing audio feedback.
            </p>
            <Button onClick={() => speakText("Audio Sight Navigator is an application designed to help visually impaired users navigate their surroundings by detecting objects and providing audio feedback.")}>
              Listen to this section
            </Button>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">How to Use</h2>
            
            <Card className="p-4">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Camera className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Point the camera</h3>
                  <p>Hold your device and point the camera toward the direction you want to explore.</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Volume2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Listen for audio cues</h3>
                  <p>Different sounds indicate various objects and their distance from you:</p>
                  <ul className="list-disc list-inside ml-4 mt-2">
                    <li>High-pitched tones indicate close objects</li>
                    <li>Medium tones indicate objects at medium distance</li>
                    <li>Low tones indicate distant objects</li>
                  </ul>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Ear className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Voice announcements</h3>
                  <p>When objects are close, the app will speak their names to help you identify them.</p>
                </div>
              </div>
            </Card>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Accessibility Tips</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>Use headphones for better directional audio cues</li>
              <li>Adjust volume based on your environment</li>
              <li>Customize speech rate in settings for your preference</li>
              <li>Use the app in both indoor and outdoor environments</li>
            </ul>
            <Button onClick={() => speakText("Accessibility Tips: Use headphones for better directional audio cues. Adjust volume based on your environment. Customize speech rate in settings for your preference. Use the app in both indoor and outdoor environments.")} className="mt-4">
              Listen to this section
            </Button>
          </section>
        </div>
      </main>
      
      <footer className="bg-muted p-4 text-center text-sm text-muted-foreground">
        <p>Audio Sight Navigator - Enhancing mobility for visually impaired users</p>
      </footer>
    </div>
  );
};

export default Info;
