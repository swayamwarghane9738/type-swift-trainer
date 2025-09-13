import { TypingMode, Difficulty } from '@/types/typing';

const COMMON_WORDS = {
  easy: [
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with',
    'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her',
    'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up',
    'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time',
    'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could',
    'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think'
  ],
  medium: [
    'through', 'back', 'much', 'before', 'move', 'right', 'boy', 'old', 'too', 'same', 'tell', 'does',
    'set', 'three', 'want', 'air', 'well', 'also', 'play', 'small', 'end', 'put', 'home', 'read',
    'hand', 'port', 'large', 'spell', 'add', 'even', 'land', 'here', 'must', 'big', 'high', 'such',
    'follow', 'act', 'why', 'ask', 'men', 'change', 'went', 'light', 'kind', 'off', 'need', 'house',
    'picture', 'try', 'us', 'again', 'animal', 'point', 'mother', 'world', 'near', 'build', 'self',
    'earth', 'father', 'head', 'stand', 'own', 'page', 'should', 'country', 'found', 'answer'
  ],
  hard: [
    'school', 'thought', 'still', 'learn', 'should', 'america', 'world', 'high', 'every', 'another',
    'example', 'begin', 'life', 'always', 'those', 'both', 'paper', 'together', 'got', 'group',
    'often', 'run', 'important', 'until', 'children', 'side', 'feet', 'car', 'mile', 'night',
    'walk', 'white', 'sea', 'began', 'grow', 'took', 'river', 'four', 'carry', 'state', 'once',
    'book', 'hear', 'stop', 'without', 'second', 'later', 'miss', 'idea', 'enough', 'eat', 'face',
    'watch', 'far', 'indian', 'really', 'almost', 'let', 'above', 'girl', 'sometimes', 'mountain'
  ]
};

const PUNCTUATION_CHARS = [',', '.', ';', ':', '!', '?', '"', "'"];
const NUMBER_WORDS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '-', '*', '/', '=', '(', ')'];

const FAMOUS_QUOTES = [
  "The only way to do great work is to love what you do.",
  "Innovation distinguishes between a leader and a follower.",
  "Stay hungry, stay foolish.",
  "The future belongs to those who believe in the beauty of their dreams.",
  "It is during our darkest moments that we must focus to see the light.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "The only impossible journey is the one you never begin.",
  "In the middle of difficulty lies opportunity.",
  "Believe you can and you're halfway there.",
  "The best time to plant a tree was 20 years ago. The second best time is now."
];

export function generateText(mode: TypingMode, difficulty: Difficulty, wordCount: number = 50): string {
  switch (mode) {
    case 'normal':
      return generateNormalText(difficulty, wordCount);
    case 'punctuation':
      return generatePunctuationText(difficulty, wordCount);
    case 'numbers':
      return generateNumberText(wordCount);
    case 'quotes':
      return generateQuoteText();
    case 'zen':
      return generateNormalText(difficulty, 200); // Longer text for zen mode
    default:
      return generateNormalText(difficulty, wordCount);
  }
}

function generateNormalText(difficulty: Difficulty, wordCount: number): string {
  const words = COMMON_WORDS[difficulty];
  const result: string[] = [];
  
  for (let i = 0; i < wordCount; i++) {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    result.push(randomWord);
  }
  
  return result.join(' ');
}

function generatePunctuationText(difficulty: Difficulty, wordCount: number): string {
  const words = COMMON_WORDS[difficulty];
  const result: string[] = [];
  
  for (let i = 0; i < wordCount; i++) {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    
    // Add punctuation occasionally
    if (Math.random() < 0.3) {
      const punctuation = PUNCTUATION_CHARS[Math.floor(Math.random() * PUNCTUATION_CHARS.length)];
      result.push(randomWord + punctuation);
    } else {
      result.push(randomWord);
    }
  }
  
  return result.join(' ');
}

function generateNumberText(wordCount: number): string {
  const result: string[] = [];
  
  for (let i = 0; i < wordCount; i++) {
    if (Math.random() < 0.7) {
      // Generate numbers
      const num = Math.floor(Math.random() * 1000);
      result.push(num.toString());
    } else {
      // Add operators
      const operator = NUMBER_WORDS[Math.floor(Math.random() * NUMBER_WORDS.length)];
      result.push(operator);
    }
  }
  
  return result.join(' ');
}

function generateQuoteText(): string {
  return FAMOUS_QUOTES[Math.floor(Math.random() * FAMOUS_QUOTES.length)];
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}