import { TypingStats, CharacterState } from '@/types/typing';

export function calculateWPM(charactersTyped: number, timeElapsed: number): number {
  if (timeElapsed === 0) return 0;
  const minutes = timeElapsed / 60000; // Convert ms to minutes
  return Math.round((charactersTyped / 5) / minutes);
}

export function calculateNetWPM(charactersTyped: number, errors: number, timeElapsed: number): number {
  if (timeElapsed === 0) return 0;
  const minutes = timeElapsed / 60000;
  const netCharacters = Math.max(0, charactersTyped - errors);
  return Math.round((netCharacters / 5) / minutes);
}

export function calculateAccuracy(correct: number, total: number): number {
  if (total === 0) return 100;
  return Math.round((correct / total) * 100);
}

export function calculateStats(
  characters: CharacterState[],
  currentIndex: number,
  startTime: number,
  backspaces: number,
  keyLatencies: number[]
): TypingStats {
  const now = Date.now();
  const timeElapsed = now - startTime;
  
  let correctCount = 0;
  let errorCount = 0;
  let currentStreak = 0;
  let maxStreak = 0;
  
  // Count correct/incorrect characters up to current position
  for (let i = 0; i < currentIndex; i++) {
    const char = characters[i];
    if (char.status === 'correct') {
      correctCount++;
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else if (char.status === 'incorrect') {
      errorCount++;
      currentStreak = 0;
    }
  }
  
  const charactersTyped = currentIndex;
  const accuracy = calculateAccuracy(correctCount, charactersTyped);
  const wpm = calculateWPM(charactersTyped, timeElapsed);
  const netWpm = calculateNetWPM(charactersTyped, errorCount, timeElapsed);
  
  return {
    wpm,
    netWpm,
    accuracy,
    charactersTyped,
    backspaces,
    timeElapsed,
    currentStreak,
    keyLatencies: [...keyLatencies],
    errorsCount: errorCount
  };
}

export function getAverageLatency(latencies: number[]): number {
  if (latencies.length === 0) return 0;
  const sum = latencies.reduce((acc, latency) => acc + latency, 0);
  return Math.round(sum / latencies.length);
}

export function getLatencyHistogram(latencies: number[]): Record<string, number> {
  const histogram: Record<string, number> = {};
  const buckets = ['0-50ms', '50-100ms', '100-150ms', '150-200ms', '200ms+'];
  
  buckets.forEach(bucket => histogram[bucket] = 0);
  
  latencies.forEach(latency => {
    if (latency < 50) histogram['0-50ms']++;
    else if (latency < 100) histogram['50-100ms']++;
    else if (latency < 150) histogram['100-150ms']++;
    else if (latency < 200) histogram['150-200ms']++;
    else histogram['200ms+']++;
  });
  
  return histogram;
}