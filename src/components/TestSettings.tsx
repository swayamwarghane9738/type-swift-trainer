import { useState } from 'react';
import { TestSettings as Settings, TypingMode, Difficulty, TestType } from '@/types/typing';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

interface TestSettingsProps {
  settings: Settings;
  onUpdate: (settings: Settings) => void;
}

const MODES: { value: TypingMode; label: string; description: string }[] = [
  { value: 'normal', label: 'Normal', description: 'Common English words' },
  { value: 'punctuation', label: 'Punctuation', description: 'Words with punctuation marks' },
  { value: 'numbers', label: 'Numbers', description: 'Numbers and mathematical symbols' },
  { value: 'quotes', label: 'Quotes', description: 'Famous quotes and sayings' },
  { value: 'custom', label: 'Custom', description: 'Type your own text' },
  { value: 'zen', label: 'Zen', description: 'Infinite typing with no timer' },
  { value: 'hard', label: 'Hard Mode', description: 'Backspace disabled' }
];

const DIFFICULTIES: { value: Difficulty; label: string; description: string }[] = [
  { value: 'easy', label: 'Easy', description: 'Short, common words' },
  { value: 'medium', label: 'Medium', description: 'Mixed difficulty words' },
  { value: 'hard', label: 'Hard', description: 'Long, complex words' }
];

const TIME_OPTIONS = [15, 30, 60, 120];
const WORD_OPTIONS = [25, 50, 100, 200];

export function TestSettings({ settings, onUpdate }: TestSettingsProps) {
  const [customText, setCustomText] = useState(settings.customText || '');

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    onUpdate({ ...settings, [key]: value });
  };

  const handleCustomTextChange = (text: string) => {
    setCustomText(text);
    updateSetting('customText', text);
  };

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <Card className="p-6 bg-surface border-border">
        <h3 className="text-lg font-semibold mb-4">Test Mode</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {MODES.map((mode) => (
            <Button
              key={mode.value}
              variant={settings.mode === mode.value ? "default" : "secondary"}
              onClick={() => updateSetting('mode', mode.value)}
              className="h-auto p-4 flex flex-col items-start"
            >
              <div className="font-medium">{mode.label}</div>
              <div className="text-xs text-text-secondary mt-1">
                {mode.description}
              </div>
            </Button>
          ))}
        </div>
      </Card>

      {/* Custom Text Input */}
      {settings.mode === 'custom' && (
        <Card className="p-6 bg-surface border-border">
          <h3 className="text-lg font-semibold mb-4">Custom Text</h3>
          <div className="space-y-2">
            <Label htmlFor="custom-text">Enter your text:</Label>
            <Textarea
              id="custom-text"
              value={customText}
              onChange={(e) => handleCustomTextChange(e.target.value)}
              placeholder="Type or paste your custom text here..."
              className="min-h-[120px] bg-background border-border focus:border-primary"
            />
            <p className="text-sm text-text-secondary">
              {customText.length} characters
            </p>
          </div>
        </Card>
      )}

      {/* Difficulty Selection */}
      {settings.mode !== 'custom' && settings.mode !== 'numbers' && (
        <Card className="p-6 bg-surface border-border">
          <h3 className="text-lg font-semibold mb-4">Difficulty</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {DIFFICULTIES.map((difficulty) => (
              <Button
                key={difficulty.value}
                variant={settings.difficulty === difficulty.value ? "default" : "secondary"}
                onClick={() => updateSetting('difficulty', difficulty.value)}
                className="h-auto p-4 flex flex-col items-start"
              >
                <div className="font-medium">{difficulty.label}</div>
                <div className="text-xs text-text-secondary mt-1">
                  {difficulty.description}
                </div>
              </Button>
            ))}
          </div>
        </Card>
      )}

      {/* Test Length */}
      {settings.mode !== 'zen' && (
        <Card className="p-6 bg-surface border-border">
          <h3 className="text-lg font-semibold mb-4">Test Length</h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Button
                variant={settings.testType === 'time' ? "default" : "secondary"}
                onClick={() => updateSetting('testType', 'time')}
              >
                Time-based
              </Button>
              <Button
                variant={settings.testType === 'words' ? "default" : "secondary"}
                onClick={() => updateSetting('testType', 'words')}
              >
                Word-based
              </Button>
            </div>

            {settings.testType === 'time' ? (
              <div className="flex gap-2">
                {TIME_OPTIONS.map((time) => (
                  <Button
                    key={time}
                    variant={settings.timeLimit === time ? "default" : "secondary"}
                    onClick={() => updateSetting('timeLimit', time)}
                    size="sm"
                  >
                    {time}s
                  </Button>
                ))}
              </div>
            ) : (
              <div className="flex gap-2">
                {WORD_OPTIONS.map((words) => (
                  <Button
                    key={words}
                    variant={settings.wordLimit === words ? "default" : "secondary"}
                    onClick={() => updateSetting('wordLimit', words)}
                    size="sm"
                  >
                    {words} words
                  </Button>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Additional Options */}
      <Card className="p-6 bg-surface border-border">
        <h3 className="text-lg font-semibold mb-4">Options</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sound-toggle">Sound Effects</Label>
              <p className="text-sm text-text-secondary">
                Play sounds for correct and incorrect keystrokes
              </p>
            </div>
            <Switch
              id="sound-toggle"
              checked={settings.soundEnabled}
              onCheckedChange={(checked) => updateSetting('soundEnabled', checked)}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}