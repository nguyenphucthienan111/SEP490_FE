import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, X, ChevronDown } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { players, getPlayerById } from '@/data/mockData';
import { Player } from '@/types';
import { cn } from '@/lib/utils';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend
} from 'recharts';

function PlayerSelector({ 
  selectedPlayer, 
  onSelect, 
  excludeId,
  label 
}: { 
  selectedPlayer: Player | null;
  onSelect: (player: Player) => void;
  excludeId?: string;
  label: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredPlayers = players.filter(p => 
    p.id !== excludeId &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      <p className="text-xs text-slate-600 dark:text-[#A8A29E] uppercase tracking-wider mb-2 font-label">{label}</p>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full glass-card rounded-xl p-4 flex items-center gap-4 hover:bg-slate-100 dark:bg-white/5 transition-colors"
      >
        {selectedPlayer ? (
          <>
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 overflow-hidden flex-shrink-0">
              <img
                src={selectedPlayer.photoUrl}
                alt={selectedPlayer.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-foreground">{selectedPlayer.name}</p>
              <p className="text-xs text-slate-600 dark:text-[#A8A29E]">{selectedPlayer.team}</p>
            </div>
          </>
        ) : (
          <div className="flex-1 text-left">
            <p className="text-slate-600 dark:text-[#A8A29E]">Select a player...</p>
          </div>
        )}
        <ChevronDown className={cn(
          "w-5 h-5 text-slate-600 dark:text-[#A8A29E] transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 top-full mt-2 left-0 right-0 glass-card rounded-xl overflow-hidden border border-slate-200 dark:border-white/10"
          >
            <div className="p-3 border-b border-slate-200 dark:border-white/5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 dark:text-[#A8A29E]" />
                <input
                  type="text"
                  placeholder="Search players..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-foreground text-sm placeholder-[#A8A29E] focus:outline-none focus:border-[#00D9FF]/50"
                />
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {filteredPlayers.map((player) => (
                <button
                  key={player.id}
                  onClick={() => {
                    onSelect(player);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-100 dark:bg-white/5 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 overflow-hidden">
                    <img
                      src={player.photoUrl}
                      alt={player.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm text-foreground">{player.name}</p>
                    <p className="text-xs text-slate-600 dark:text-[#A8A29E]">{player.team}</p>
                  </div>
                  <span className="font-mono-data text-sm text-[#00D9FF]">
                    {player.rating.toFixed(1)}
                  </span>
                </button>
              ))}
              {filteredPlayers.length === 0 && (
                <p className="p-4 text-center text-sm text-slate-600 dark:text-[#A8A29E]">No players found</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ComparePage() {
  const [searchParams] = useSearchParams();
  const [player1, setPlayer1] = useState<Player | null>(null);
  const [player2, setPlayer2] = useState<Player | null>(null);

  useEffect(() => {
    const p1Id = searchParams.get('player1');
    if (p1Id) {
      const p = getPlayerById(p1Id);
      if (p) setPlayer1(p);
    }
  }, [searchParams]);

  const getRadarData = () => {
    if (!player1 || !player2) return [];
    
    return [
      { 
        stat: 'Goals', 
        player1: Math.min(player1.stats.goals * 5, 100), 
        player2: Math.min(player2.stats.goals * 5, 100) 
      },
      { 
        stat: 'Assists', 
        player1: Math.min(player1.stats.assists * 7, 100), 
        player2: Math.min(player2.stats.assists * 7, 100) 
      },
      { 
        stat: 'Pass Accuracy', 
        player1: player1.stats.passAccuracy, 
        player2: player2.stats.passAccuracy 
      },
      { 
        stat: 'Matches', 
        player1: Math.min(player1.stats.matches * 4, 100), 
        player2: Math.min(player2.stats.matches * 4, 100) 
      },
      { 
        stat: 'Minutes', 
        player1: Math.min(player1.stats.minutesPlayed / 25, 100), 
        player2: Math.min(player2.stats.minutesPlayed / 25, 100) 
      },
      { 
        stat: 'Rating', 
        player1: player1.rating * 10, 
        player2: player2.rating * 10 
      },
    ];
  };

  const getComparisonStats = () => {
    if (!player1 || !player2) return [];
    
    return [
      { label: 'Rating', p1: player1.rating, p2: player2.rating, format: 'rating' },
      { label: 'Goals', p1: player1.stats.goals, p2: player2.stats.goals, format: 'number' },
      { label: 'Assists', p1: player1.stats.assists, p2: player2.stats.assists, format: 'number' },
      { label: 'Matches', p1: player1.stats.matches, p2: player2.stats.matches, format: 'number' },
      { label: 'Minutes Played', p1: player1.stats.minutesPlayed, p2: player2.stats.minutesPlayed, format: 'number' },
      { label: 'Pass Accuracy', p1: player1.stats.passAccuracy, p2: player2.stats.passAccuracy, format: 'percent' },
      { label: 'Yellow Cards', p1: player1.stats.yellowCards, p2: player2.stats.yellowCards, format: 'number', lowerBetter: true },
    ];
  };

  return (
    <MainLayout>
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Link to="/players" className="inline-flex items-center gap-2 text-slate-600 dark:text-[#A8A29E] hover:text-foreground transition-colors mb-8">
              <ArrowLeft className="w-4 h-4" />
              <span className="font-label text-sm">Back to Players</span>
            </Link>
          </motion.div>

          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="font-display font-extrabold text-4xl text-foreground mb-2">
              Player Comparison
            </h1>
            <p className="text-slate-600 dark:text-[#A8A29E]">
              Compare statistics and performance metrics between two players.
            </p>
          </motion.div>

          {/* Player Selectors */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid md:grid-cols-2 gap-8 mb-12"
          >
            <PlayerSelector
              selectedPlayer={player1}
              onSelect={setPlayer1}
              excludeId={player2?.id}
              label="Player 1"
            />
            <PlayerSelector
              selectedPlayer={player2}
              onSelect={setPlayer2}
              excludeId={player1?.id}
              label="Player 2"
            />
          </motion.div>

          {/* Comparison Content */}
          {player1 && player2 ? (
            <>
              {/* Radar Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="glass-card rounded-2xl p-6 mb-8"
              >
                <h3 className="font-display font-bold text-xl text-foreground mb-6 text-center">
                  Performance Comparison
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={getRadarData()}>
                      <PolarGrid stroke="rgba(255,255,255,0.1)" />
                      <PolarAngleAxis 
                        dataKey="stat" 
                        tick={{ fill: '#A8A29E', fontSize: 12 }}
                      />
                      <PolarRadiusAxis 
                        angle={30} 
                        domain={[0, 100]}
                        tick={{ fill: '#A8A29E', fontSize: 10 }}
                      />
                      <Radar
                        name={player1.name}
                        dataKey="player1"
                        stroke="#FF4444"
                        fill="#FF4444"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                      <Radar
                        name={player2.name}
                        dataKey="player2"
                        stroke="#00D9FF"
                        fill="#00D9FF"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                      <Legend 
                        wrapperStyle={{ paddingTop: '20px' }}
                        formatter={(value) => <span className="text-foreground text-sm">{value}</span>}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Stats Comparison */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="glass-card rounded-2xl p-6"
              >
                <h3 className="font-display font-bold text-xl text-foreground mb-6">
                  Detailed Statistics
                </h3>

                <div className="space-y-6">
                  {getComparisonStats().map((stat, index) => {
                    const p1Better = stat.lowerBetter ? stat.p1 < stat.p2 : stat.p1 > stat.p2;
                    const p2Better = stat.lowerBetter ? stat.p2 < stat.p1 : stat.p2 > stat.p1;
                    const isEqual = stat.p1 === stat.p2;

                    return (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.05 }}
                        className="grid grid-cols-3 gap-4 items-center py-4 border-b border-slate-200 dark:border-white/5 last:border-0"
                      >
                        {/* Player 1 Value */}
                        <div className={cn(
                          "text-left",
                          p1Better && !isEqual && "text-green-400",
                          !p1Better && !isEqual && "text-slate-600 dark:text-[#A8A29E]"
                        )}>
                          <span className="font-mono-data text-xl font-bold">
                            {stat.format === 'rating' ? stat.p1.toFixed(1) :
                             stat.format === 'percent' ? `${stat.p1}%` :
                             stat.p1.toLocaleString()}
                          </span>
                        </div>

                        {/* Stat Label */}
                        <div className="text-center">
                          <span className="text-sm text-slate-600 dark:text-[#A8A29E]">{stat.label}</span>
                        </div>

                        {/* Player 2 Value */}
                        <div className={cn(
                          "text-right",
                          p2Better && !isEqual && "text-green-400",
                          !p2Better && !isEqual && "text-slate-600 dark:text-[#A8A29E]"
                        )}>
                          <span className="font-mono-data text-xl font-bold">
                            {stat.format === 'rating' ? stat.p2.toFixed(1) :
                             stat.format === 'percent' ? `${stat.p2}%` :
                             stat.p2.toLocaleString()}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card rounded-2xl p-12 text-center"
            >
              <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-slate-600 dark:text-[#A8A29E]" />
              </div>
              <h3 className="font-display font-bold text-xl text-foreground mb-2">
                Select Two Players to Compare
              </h3>
              <p className="text-slate-600 dark:text-[#A8A29E] max-w-md mx-auto">
                Use the dropdowns above to select two players and see a detailed comparison of their statistics and performance metrics.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
