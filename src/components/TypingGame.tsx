import { useState, useCallback } from 'react';
import { TestSettings, TypingMode, Difficulty, TestType, TestResult } from '@/types/typing';
import { TypingTest } from './TypingTest';
import { TestSettings as TestSettingsComponent } from './TestSettings';
import { TestResults } from './TestResults';
import { Leaderboard } from './Leaderboard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Settings, Play, RotateCcw } from 'lucide-react';

export function TypingGame() {
  const [gameState, setGameState] = useState<'setup' | 'testing' | 'results'>('setup');
  const [testSettings, setTestSettings] = useState<TestSettings>({
    mode: 'normal',
    difficulty: 'medium',
    testType: 'time',
    timeLimit: 30,
    wordLimit: 50,
    soundEnabled: true
  });
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const handleStartTest = useCallback(() => {
    setGameState('testing');
  }, []);

  const handleTestComplete = useCallback((result: TestResult) => {
    setTestResult(result);
    setGameState('results');
  }, []);

  const handleRestart = useCallback(() => {
    setTestResult(null);
    setGameState('setup');
  }, []);

  const handleRetake = useCallback(() => {
    setTestResult(null);
    setGameState('testing');
  }, []);

  if (gameState === 'testing') {
    return (
      <div className="min-h-screen bg-background">
        <TypingTest 
          settings={testSettings}
          onComplete={handleTestComplete}
          onExit={handleRestart}
        />
      </div>
    );
  }

  if (gameState === 'results' && testResult) {
    return (
      <div className="min-h-screen bg-background">
        <TestResults 
          result={testResult}
          onRestart={handleRestart}
          onRetake={handleRetake}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            TypeMaster
          </h1>
          <p className="text-xl text-text-secondary">
            Improve your typing speed and accuracy
          </p>
        </header>

        <Tabs defaultValue="test" className="max-w-4xl mx-auto">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="test" className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              Test
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Leaderboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="test" className="space-y-6">
            <Card className="p-8 bg-surface border-border">
              <div className="text-center space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">Ready to type?</h2>
                  <p className="text-text-secondary">
                    Mode: <span className="text-primary font-medium capitalize">{testSettings.mode}</span>
                    {' • '}
                    Difficulty: <span className="text-primary font-medium capitalize">{testSettings.difficulty}</span>
                    {' • '}
                    {testSettings.testType === 'time' 
                      ? `${testSettings.timeLimit}s` 
                      : `${testSettings.wordLimit} words`
                    }
                  </p>
                </div>
                
                <Button 
                  onClick={handleStartTest}
                  size="lg"
                  className="bg-gradient-primary hover:bg-primary-hover text-primary-foreground font-semibold px-8 py-4 text-lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Test
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <TestSettingsComponent 
              settings={testSettings}
              onUpdate={setTestSettings}
            />
          </TabsContent>

          <TabsContent value="leaderboard">
            <Leaderboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}