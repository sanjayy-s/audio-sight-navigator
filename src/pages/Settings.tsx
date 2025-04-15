
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings as SettingsIcon } from 'lucide-react';
import SettingsPanel from '@/components/SettingsPanel';
import { speakText } from '@/utils/audioFeedback';

const Settings = () => {
  React.useEffect(() => {
    // Announce the page when it loads for better accessibility
    speakText("Settings page. Customize your audio and detection preferences here.");
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
            <SettingsIcon className="w-6 h-6" />
            Settings
          </h1>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4">
        <div className="max-w-md mx-auto">
          <SettingsPanel />
          
          <div className="mt-8">
            <Button
              onClick={() => speakText("Settings page. Customize your audio and detection preferences here.")}
              className="w-full"
              variant="outline"
            >
              Read this page aloud
            </Button>
          </div>
        </div>
      </main>
      
      <footer className="bg-muted p-4 text-center text-sm text-muted-foreground">
        <p>Audio Sight Navigator - Enhancing mobility for visually impaired users</p>
      </footer>
    </div>
  );
};

export default Settings;
