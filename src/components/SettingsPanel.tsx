
import React, { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { setGlobalVolume, speakText } from '@/utils/audioFeedback';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const SettingsPanel: React.FC = () => {
  const [volume, setVolume] = useState(0.5);
  const [speakObjects, setSpeakObjects] = useState(true);
  const [beepFrequency, setBeepFrequency] = useState('medium');
  const [speechRate, setSpeechRate] = useState(1);
  
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setGlobalVolume(newVolume);
    
    // Provide audio feedback for the new volume level
    if (newVolume > 0) {
      speakText("Volume set to " + Math.round(newVolume * 100) + " percent", 1, 1);
    }
  };
  
  const handleSpeechRateChange = (value: number[]) => {
    const newRate = value[0];
    setSpeechRate(newRate);
    
    // Provide audio feedback for the new speech rate
    speakText("Speech rate example", newRate, 1);
  };

  const handleSpeakObjectsToggle = (checked: boolean) => {
    setSpeakObjects(checked);
    
    // Provide audio feedback
    if (checked) {
      speakText("Object announcement enabled");
    } else {
      speakText("Object announcement disabled");
    }
  };

  const handleBeepFrequencyChange = (value: string) => {
    setBeepFrequency(value);
    
    // Provide audio feedback
    speakText(`Beep frequency set to ${value}`);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>
          Customize your audio feedback preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="volume">Volume</Label>
            <span>{Math.round(volume * 100)}%</span>
          </div>
          <Slider
            id="volume"
            min={0}
            max={1}
            step={0.05}
            value={[volume]}
            onValueChange={handleVolumeChange}
            aria-label="Volume"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="speech-rate">Speech Rate</Label>
            <span>{speechRate.toFixed(1)}x</span>
          </div>
          <Slider
            id="speech-rate"
            min={0.5}
            max={2}
            step={0.1}
            value={[speechRate]}
            onValueChange={handleSpeechRateChange}
            aria-label="Speech Rate"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="speak-objects">Speak Object Names</Label>
          <Switch
            id="speak-objects"
            checked={speakObjects}
            onCheckedChange={handleSpeakObjectsToggle}
            aria-label="Speak Object Names"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="beep-frequency">Beep Frequency</Label>
          <Select
            value={beepFrequency}
            onValueChange={handleBeepFrequencyChange}
          >
            <SelectTrigger id="beep-frequency">
              <SelectValue placeholder="Select a frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default SettingsPanel;
