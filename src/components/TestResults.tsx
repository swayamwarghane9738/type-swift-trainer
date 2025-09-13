import { useState } from 'react';
import { TestResult } from '@/types/typing';
import { getAverageLatency, getLatencyHistogram } from '@/utils/typingCalculations';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Trophy, 
  Target, 
  Clock, 
  Zap, 
  TrendingUp, 
  RotateCcw, 
  Play, 
  Save,
  Download
} from 'lucide-react';

interface TestResultsProps {
  result: TestResult;
  onRestart: () => void;
  onRetake: () => void;
}

export function TestResults({ result, onRestart, onRetake }: TestResultsProps) {
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const avgLatency = getAverageLatency(result.keyLatencies);
  const latencyHistogram = getLatencyHistogram(result.keyLatencies);

  const handleSubmitScore = async () => {
    if (!username.trim()) {
      toast({
        title: "Username required",
        description: "Please enter a username to submit your score.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Store in localStorage for now (would be Supabase in real implementation)
      const leaderboardEntry = {
        id: Date.now().toString(),
        username: username.trim(),
        wpm: result.wpm,
        netWpm: result.netWpm,
        accuracy: result.accuracy,
        mode: result.mode,
        difficulty: result.difficulty,
        createdAt: result.completedAt
      };

      const existingScores = JSON.parse(localStorage.getItem('typemaster-leaderboard') || '[]');
      existingScores.push(leaderboardEntry);
      localStorage.setItem('typemaster-leaderboard', JSON.stringify(existingScores));

      toast({
        title: "Score submitted!",
        description: "Your score has been added to the leaderboard.",
      });
    } catch (error) {
      toast({
        title: "Error submitting score",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportResults = () => {
    const csvData = [
      ['Metric', 'Value'],
      ['WPM', result.wpm.toString()],
      ['Net WPM', result.netWpm.toString()],
      ['Accuracy', `${result.accuracy}%`],
      ['Characters Typed', result.charactersTyped.toString()],
      ['Backspaces', result.backspaces.toString()],
      ['Time Elapsed', `${Math.round(result.timeElapsed / 1000)}s`],
      ['Errors', result.errorsCount.toString()],
      ['Average Latency', `${avgLatency}ms`],
      ['Mode', result.mode],
      ['Difficulty', result.difficulty],
      ['Completed At', result.completedAt.toISOString()]
    ];

    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `typing-test-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Results exported",
      description: "Your test results have been downloaded as a CSV file.",
    });
  };

  const getWpmColor = (wpm: number) => {
    if (wpm >= 70) return 'text-success';
    if (wpm >= 40) return 'text-warning';
    return 'text-error';
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 95) return 'text-success';
    if (accuracy >= 80) return 'text-warning';
    return 'text-error';
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Test Complete!</h1>
          <p className="text-text-secondary">
            Great job! Here are your typing results.
          </p>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 text-center bg-surface border-border">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-primary" />
            <div className={`text-3xl font-bold ${getWpmColor(result.wpm)}`}>
              {result.wpm}
            </div>
            <div className="text-sm text-text-secondary">WPM</div>
          </Card>

          <Card className="p-6 text-center bg-surface border-border">
            <Target className="w-8 h-8 mx-auto mb-2 text-accent" />
            <div className={`text-3xl font-bold ${getAccuracyColor(result.accuracy)}`}>
              {result.accuracy}%
            </div>
            <div className="text-sm text-text-secondary">Accuracy</div>
          </Card>

          <Card className="p-6 text-center bg-surface border-border">
            <Clock className="w-8 h-8 mx-auto mb-2 text-warning" />
            <div className="text-3xl font-bold text-warning">
              {Math.round(result.timeElapsed / 1000)}s
            </div>
            <div className="text-sm text-text-secondary">Time</div>
          </Card>

          <Card className="p-6 text-center bg-surface border-border">
            <Zap className="w-8 h-8 mx-auto mb-2 text-success" />
            <div className="text-3xl font-bold text-success">
              {result.netWpm}
            </div>
            <div className="text-sm text-text-secondary">Net WPM</div>
          </Card>
        </div>

        {/* Detailed Stats */}
        <Card className="p-6 mb-8 bg-surface border-border">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Detailed Statistics
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <Label className="text-text-secondary">Characters Typed</Label>
              <div className="text-2xl font-semibold">{result.charactersTyped}</div>
            </div>
            <div>
              <Label className="text-text-secondary">Backspaces</Label>
              <div className="text-2xl font-semibold">{result.backspaces}</div>
            </div>
            <div>
              <Label className="text-text-secondary">Errors</Label>
              <div className="text-2xl font-semibold text-error">{result.errorsCount}</div>
            </div>
            <div>
              <Label className="text-text-secondary">Best Streak</Label>
              <div className="text-2xl font-semibold text-success">{result.currentStreak}</div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-text-secondary mb-2 block">Test Configuration</Label>
              <div className="space-y-2">
                <Badge variant="secondary" className="mr-2">
                  Mode: {result.mode}
                </Badge>
                <Badge variant="secondary" className="mr-2">
                  Difficulty: {result.difficulty}
                </Badge>
                <Badge variant="secondary">
                  Length: {result.textLength} chars
                </Badge>
              </div>
            </div>

            <div>
              <Label className="text-text-secondary mb-2 block">
                Keystroke Timing (Average: {avgLatency}ms)
              </Label>
              <div className="space-y-1 text-sm">
                {Object.entries(latencyHistogram).map(([range, count]) => (
                  <div key={range} className="flex justify-between">
                    <span>{range}:</span>
                    <span>{count} keys</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Submit to Leaderboard */}
        <Card className="p-6 mb-8 bg-surface border-border">
          <h3 className="text-lg font-semibold mb-4">Submit to Leaderboard</h3>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                maxLength={20}
                className="bg-background border-border"
              />
            </div>
            <Button 
              onClick={handleSubmitScore}
              disabled={isSubmitting || !username.trim()}
              className="self-end"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Submitting...' : 'Submit Score'}
            </Button>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={onRetake}
            size="lg"
            className="bg-gradient-primary hover:bg-primary-hover text-primary-foreground"
          >
            <Play className="w-5 h-5 mr-2" />
            Take Test Again
          </Button>
          <Button
            variant="secondary"
            onClick={onRestart}
            size="lg"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            New Test
          </Button>
          <Button
            variant="secondary"
            onClick={handleExportResults}
            size="lg"
          >
            <Download className="w-5 h-5 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>
    </div>
  );
}