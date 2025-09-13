import { useState, useEffect } from 'react';
import { LeaderboardEntry, TypingMode, Difficulty } from '@/types/typing';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trophy, Medal, Award, Filter, RotateCcw } from 'lucide-react';

const MODE_FILTERS: { value: TypingMode | 'all'; label: string }[] = [
  { value: 'all', label: 'All Modes' },
  { value: 'normal', label: 'Normal' },
  { value: 'punctuation', label: 'Punctuation' },
  { value: 'numbers', label: 'Numbers' },
  { value: 'quotes', label: 'Quotes' },
  { value: 'custom', label: 'Custom' },
  { value: 'zen', label: 'Zen' },
  { value: 'hard', label: 'Hard' }
];

const DIFFICULTY_FILTERS: { value: Difficulty | 'all'; label: string }[] = [
  { value: 'all', label: 'All Difficulties' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' }
];

export function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<LeaderboardEntry[]>([]);
  const [modeFilter, setModeFilter] = useState<TypingMode | 'all'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'all'>('all');
  const [sortBy, setSortBy] = useState<'wpm' | 'netWpm' | 'accuracy'>('netWpm');

  // Load leaderboard data
  useEffect(() => {
    const loadLeaderboard = () => {
      const storedData = localStorage.getItem('typemaster-leaderboard');
      if (storedData) {
        const parsed = JSON.parse(storedData);
        const entriesWithDates = parsed.map((entry: any) => ({
          ...entry,
          createdAt: new Date(entry.createdAt)
        }));
        setEntries(entriesWithDates);
      }
    };

    loadLeaderboard();
    
    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'typemaster-leaderboard') {
        loadLeaderboard();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...entries];

    // Apply mode filter
    if (modeFilter !== 'all') {
      filtered = filtered.filter(entry => entry.mode === modeFilter);
    }

    // Apply difficulty filter
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(entry => entry.difficulty === difficultyFilter);
    }

    // Sort entries
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'wpm':
          return b.wpm - a.wpm;
        case 'netWpm':
          return b.netWpm - a.netWpm;
        case 'accuracy':
          if (b.accuracy === a.accuracy) {
            return b.netWpm - a.netWpm; // Secondary sort by net WPM
          }
          return b.accuracy - a.accuracy;
        default:
          return b.netWpm - a.netWpm;
      }
    });

    setFilteredEntries(filtered);
  }, [entries, modeFilter, difficultyFilter, sortBy]);

  const handleClearLeaderboard = () => {
    if (window.confirm('Are you sure you want to clear all leaderboard data?')) {
      localStorage.removeItem('typemaster-leaderboard');
      setEntries([]);
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-5 h-5 text-warning" />;
      case 1:
        return <Medal className="w-5 h-5 text-text-secondary" />;
      case 2:
        return <Award className="w-5 h-5 text-accent" />;
      default:
        return <span className="w-5 text-center text-text-muted">{index + 1}</span>;
    }
  };

  const getModeColor = (mode: TypingMode) => {
    const colors = {
      normal: 'bg-primary/20 text-primary',
      punctuation: 'bg-accent/20 text-accent',
      numbers: 'bg-warning/20 text-warning',
      quotes: 'bg-success/20 text-success',
      custom: 'bg-secondary/20 text-secondary-foreground',
      zen: 'bg-purple-500/20 text-purple-400',
      hard: 'bg-error/20 text-error'
    };
    return colors[mode] || colors.normal;
  };

  if (entries.length === 0) {
    return (
      <Card className="p-8 text-center bg-surface border-border">
        <Trophy className="w-16 h-16 mx-auto mb-4 text-text-muted" />
        <h3 className="text-lg font-semibold mb-2">No scores yet</h3>
        <p className="text-text-secondary">
          Complete a typing test to see your scores here!
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-6 bg-surface border-border">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4" />
          <h3 className="font-semibold">Filters</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-text-secondary mb-2 block">Mode</label>
            <div className="flex flex-wrap gap-2">
              {MODE_FILTERS.map((mode) => (
                <Button
                  key={mode.value}
                  variant={modeFilter === mode.value ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setModeFilter(mode.value)}
                >
                  {mode.label}
                </Button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="text-sm text-text-secondary mb-2 block">Difficulty</label>
            <div className="flex flex-wrap gap-2">
              {DIFFICULTY_FILTERS.map((difficulty) => (
                <Button
                  key={difficulty.value}
                  variant={difficultyFilter === difficulty.value ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setDifficultyFilter(difficulty.value)}
                >
                  {difficulty.label}
                </Button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="text-sm text-text-secondary mb-2 block">Sort by</label>
            <div className="flex gap-2">
              <Button
                variant={sortBy === 'netWpm' ? "default" : "secondary"}
                size="sm"
                onClick={() => setSortBy('netWpm')}
              >
                Net WPM
              </Button>
              <Button
                variant={sortBy === 'wpm' ? "default" : "secondary"}
                size="sm"
                onClick={() => setSortBy('wpm')}
              >
                Raw WPM
              </Button>
              <Button
                variant={sortBy === 'accuracy' ? "default" : "secondary"}
                size="sm"
                onClick={() => setSortBy('accuracy')}
              >
                Accuracy
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Leaderboard Table */}
      <Card className="bg-surface border-border">
        <div className="p-6 border-b border-border">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Leaderboard</h3>
              <p className="text-sm text-text-secondary">
                Showing {filteredEntries.length} of {entries.length} scores
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearLeaderboard}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-text-secondary">
              No scores match the current filters.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>Username</TableHead>
                <TableHead className="text-right">WPM</TableHead>
                <TableHead className="text-right">Net WPM</TableHead>
                <TableHead className="text-right">Accuracy</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((entry, index) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <div className="flex items-center justify-center">
                      {getRankIcon(index)}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {entry.username}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {entry.wpm}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {entry.netWpm}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {entry.accuracy}%
                  </TableCell>
                  <TableCell>
                    <Badge className={getModeColor(entry.mode)}>
                      {entry.mode}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {entry.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm text-text-secondary">
                    {entry.createdAt.toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}