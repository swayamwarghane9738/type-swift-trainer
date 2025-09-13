export interface TypingStats {
  wpm: number;
  netWpm: number;
  accuracy: number;
  charactersTyped: number;
  backspaces: number;
  timeElapsed: number;
  currentStreak: number;
  keyLatencies: number[];
  errorsCount: number;
}

export interface TestResult extends TypingStats {
  mode: TypingMode;
  difficulty: Difficulty;
  textLength: number;
  completedAt: Date;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  wpm: number;
  netWpm: number;
  accuracy: number;
  mode: TypingMode;
  difficulty: Difficulty;
  createdAt: Date;
}

export type TypingMode = 
  | 'normal'
  | 'punctuation' 
  | 'numbers'
  | 'quotes'
  | 'custom'
  | 'zen'
  | 'hard';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type TestType = 'time' | 'words';

export interface TestSettings {
  mode: TypingMode;
  difficulty: Difficulty;
  testType: TestType;
  timeLimit: number; // seconds
  wordLimit: number;
  customText?: string;
  soundEnabled: boolean;
}

export interface CharacterState {
  char: string;
  status: 'untyped' | 'correct' | 'incorrect' | 'current';
  timestamp?: number;
}

export interface TypingState {
  text: string;
  characters: CharacterState[];
  currentIndex: number;
  isActive: boolean;
  isComplete: boolean;
  startTime?: number;
  endTime?: number;
  stats: TypingStats;
}