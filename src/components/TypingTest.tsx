import { useState, useEffect, useCallback, useRef } from 'react';
import { TestSettings, TypingState, CharacterState, TestResult } from '@/types/typing';
import { generateText } from '@/utils/textGenerator';
import { calculateStats } from '@/utils/typingCalculations';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { X, RotateCcw, Pause, Play } from 'lucide-react';

interface TypingTestProps {
  settings: TestSettings;
  onComplete: (result: TestResult) => void;
  onExit: () => void;
}

export function TypingTest({ settings, onComplete, onExit }: TypingTestProps) {
  const [typingState, setTypingState] = useState<TypingState>(() => {
    const text = settings.mode === 'custom' && settings.customText 
      ? settings.customText 
      : generateText(settings.mode, settings.difficulty, settings.wordLimit);
    
    return {
      text,
      characters: text.split('').map(char => ({ char, status: 'untyped' })),
      currentIndex: 0,
      isActive: false,
      isComplete: false,
      stats: {
        wpm: 0,
        netWpm: 0,
        accuracy: 100,
        charactersTyped: 0,
        backspaces: 0,
        timeElapsed: 0,
        currentStreak: 0,
        keyLatencies: [],
        errorsCount: 0
      }
    };
  });

  const [isPaused, setIsPaused] = useState(false);
  const [backspaceCount, setBackspaceCount] = useState(0);
  const [keyLatencies, setKeyLatencies] = useState<number[]>([]);
  const lastKeyTime = useRef<number>(0);
  const testRef = useRef<HTMLDivElement>(null);

  const timeRemaining = settings.testType === 'time' && typingState.startTime
    ? Math.max(0, settings.timeLimit * 1000 - typingState.stats.timeElapsed)
    : 0;

  const wordsRemaining = settings.testType === 'words'
    ? Math.max(0, settings.wordLimit - Math.floor(typingState.currentIndex / 5))
    : 0;

  const progress = settings.testType === 'time'
    ? ((settings.timeLimit * 1000 - timeRemaining) / (settings.timeLimit * 1000)) * 100
    : (typingState.currentIndex / typingState.text.length) * 100;

  // Timer effect
  useEffect(() => {
    if (!typingState.isActive || isPaused || typingState.isComplete) return;

    const interval = setInterval(() => {
      setTypingState(prev => {
        if (!prev.startTime) return prev;
        
        const newStats = calculateStats(
          prev.characters,
          prev.currentIndex,
          prev.startTime,
          backspaceCount,
          keyLatencies
        );

        // Check if time limit reached
        if (settings.testType === 'time' && newStats.timeElapsed >= settings.timeLimit * 1000) {
          const result: TestResult = {
            ...newStats,
            mode: settings.mode,
            difficulty: settings.difficulty,
            textLength: prev.text.length,
            completedAt: new Date()
          };
          setTimeout(() => onComplete(result), 100);
          return { ...prev, isComplete: true, stats: newStats };
        }

        return { ...prev, stats: newStats };
      });
    }, 100);

    return () => clearInterval(interval);
  }, [typingState.isActive, isPaused, typingState.isComplete, settings, backspaceCount, keyLatencies, onComplete]);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (typingState.isComplete || isPaused) return;

    // Prevent paste
    if (event.ctrlKey || event.metaKey) return;

    const now = Date.now();
    if (lastKeyTime.current > 0) {
      const latency = now - lastKeyTime.current;
      setKeyLatencies(prev => [...prev, latency]);
    }
    lastKeyTime.current = now;

    const key = event.key;

    if (key === 'Backspace') {
      if (settings.mode === 'hard') return; // Backspace disabled in hard mode
      
      event.preventDefault();
      setBackspaceCount(prev => prev + 1);
      
      setTypingState(prev => {
        if (prev.currentIndex <= 0) return prev;
        
        const newIndex = prev.currentIndex - 1;
        const newCharacters = [...prev.characters];
        newCharacters[newIndex] = { ...newCharacters[newIndex], status: 'untyped' };
        
        return { ...prev, currentIndex: newIndex, characters: newCharacters };
      });
      return;
    }

    if (key.length !== 1) return; // Only handle printable characters
    
    event.preventDefault();

    setTypingState(prev => {
      const { currentIndex, characters, text } = prev;
      
      if (currentIndex >= text.length) return prev;

      // Start the test on first keystroke
      const startTime = prev.startTime || now;
      const isActive = true;

      const expectedChar = text[currentIndex];
      const isCorrect = key === expectedChar;
      
      const newCharacters = [...characters];
      newCharacters[currentIndex] = {
        ...newCharacters[currentIndex],
        status: isCorrect ? 'correct' : 'incorrect',
        timestamp: now
      };

      // Mark next character as current
      const newIndex = currentIndex + 1;
      if (newIndex < text.length) {
        newCharacters[newIndex] = { ...newCharacters[newIndex], status: 'current' };
      }

      // Check if test is complete
      const isComplete = settings.testType === 'words' 
        ? newIndex >= text.length
        : false;

      if (isComplete) {
        const finalStats = calculateStats(newCharacters, newIndex, startTime, backspaceCount, keyLatencies);
        const result: TestResult = {
          ...finalStats,
          mode: settings.mode,
          difficulty: settings.difficulty,
          textLength: text.length,
          completedAt: new Date()
        };
        setTimeout(() => onComplete(result), 100);
      }

      return {
        ...prev,
        currentIndex: newIndex,
        characters: newCharacters,
        startTime,
        isActive,
        isComplete
      };
    });
  }, [typingState.isComplete, isPaused, settings, backspaceCount, keyLatencies, onComplete]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Focus management
  useEffect(() => {
    if (testRef.current && !isPaused) {
      testRef.current.focus();
    }
  }, [isPaused]);

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleRestart = () => {
    const text = settings.mode === 'custom' && settings.customText 
      ? settings.customText 
      : generateText(settings.mode, settings.difficulty, settings.wordLimit);
    
    setTypingState({
      text,
      characters: text.split('').map((char, index) => ({ 
        char, 
        status: index === 0 ? 'current' : 'untyped' 
      })),
      currentIndex: 0,
      isActive: false,
      isComplete: false,
      stats: {
        wpm: 0,
        netWpm: 0,
        accuracy: 100,
        charactersTyped: 0,
        backspaces: 0,
        timeElapsed: 0,
        currentStreak: 0,
        keyLatencies: [],
        errorsCount: 0
      }
    });
    setIsPaused(false);
    setBackspaceCount(0);
    setKeyLatencies([]);
    lastKeyTime.current = 0;
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={onExit}
            >
              <X className="w-4 h-4 mr-2" />
              Exit
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePause}
            >
              {isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRestart}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Restart
            </Button>
          </div>

          <div className="text-text-secondary text-sm">
            {settings.testType === 'time' 
              ? `${Math.ceil(timeRemaining / 1000)}s remaining`
              : `${wordsRemaining} words remaining`
            }
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <Progress value={progress} className="h-2" />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 text-center bg-surface border-border">
            <div className="text-2xl font-bold text-primary stat-number">
              {typingState.stats.wpm}
            </div>
            <div className="text-sm text-text-secondary">WPM</div>
          </Card>
          <Card className="p-4 text-center bg-surface border-border">
            <div className="text-2xl font-bold text-accent stat-number">
              {typingState.stats.accuracy}%
            </div>
            <div className="text-sm text-text-secondary">Accuracy</div>
          </Card>
          <Card className="p-4 text-center bg-surface border-border">
            <div className="text-2xl font-bold text-success stat-number">
              {typingState.stats.currentStreak}
            </div>
            <div className="text-sm text-text-secondary">Streak</div>
          </Card>
          <Card className="p-4 text-center bg-surface border-border">
            <div className="text-2xl font-bold text-warning stat-number">
              {Math.round(typingState.stats.timeElapsed / 1000)}s
            </div>
            <div className="text-sm text-text-secondary">Time</div>
          </Card>
        </div>

        {/* Typing Area */}
        <Card className="p-8 bg-surface border-border">
          <div
            ref={testRef}
            tabIndex={0}
            className="typing-text text-2xl leading-relaxed focus:outline-none"
            style={{ wordWrap: 'break-word' }}
          >
            {typingState.characters.map((char, index) => (
              <span
                key={index}
                className={`
                  ${char.status === 'correct' ? 'char-correct' : ''}
                  ${char.status === 'incorrect' ? 'char-incorrect' : ''}
                  ${char.status === 'current' ? 'char-current' : ''}
                  ${char.status === 'untyped' ? 'char-untyped' : ''}
                `}
              >
                {char.char === ' ' ? '\u00A0' : char.char}
              </span>
            ))}
            {typingState.currentIndex < typingState.characters.length && (
              <span className="cursor inline-block"></span>
            )}
          </div>
        </Card>

        {/* Instructions */}
        <div className="text-center mt-6 text-text-secondary">
          {!typingState.isActive && !isPaused && (
            <p>Start typing to begin the test</p>
          )}
          {isPaused && (
            <p>Test paused - press Resume to continue</p>
          )}
          {settings.mode === 'hard' && (
            <p className="text-warning">Hard Mode: Backspace is disabled</p>
          )}
        </div>
      </div>
    </div>
  );
}