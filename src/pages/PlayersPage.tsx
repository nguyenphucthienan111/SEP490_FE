import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, SlidersHorizontal, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { players, teams } from '@/data/mockData';
import { Position, Player } from '@/types';
import { cn } from '@/lib/utils';

const positions: { value: Position | 'all'; label: string }[] = [
  { value: 'all', label: 'All Positions' },
  { value: 'forward', label: 'Forwards' },
  { value: 'midfielder', label: 'Midfielders' },
  { value: 'defender', label: 'Defenders' },
  { value: 'goalkeeper', label: 'Goalkeepers' },
];

function PlayerCard({ player, index }: { player: Player; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link to={`/players/${player.id}`}>
        <div className="group glass-card rounded-2xl overflow-hidden hover:translate-y-[-4px] hover:shadow-xl transition-all duration-300 cursor-pointer border border-transparent hover:border-[#FF4444]/20">
          {/* Player Header */}
          <div className="relative h-28 bg-gradient-to-br from-[#1A0F2E] to-[#0A1628] p-4">
            <div className="absolute top-4 left-4">
              <span className="font-mono-data text-5xl font-extralight text-white/10">
                #{player.number}
              </span>
            </div>
            <div className="absolute top-4 right-4 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-green-400" />
              <span className="text-xs text-green-400 font-mono-data">+0.1</span>
            </div>
            <div className="absolute -bottom-8 right-4 w-16 h-16 rounded-xl overflow-hidden border-3 border-[#0A1628] bg-white/5">
              <img
                src={player.photoUrl}
                alt={player.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Player Info */}
          <div className="p-5 pt-3">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0 pr-3">
                <h3 className="font-display font-bold text-base text-white truncate group-hover:text-[#FF4444] transition-colors">
                  {player.name}
                </h3>
                <p className="text-xs text-[#A8A29E] truncate">{player.team}</p>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-mono-data text-xl font-bold text-white">
                  {player.rating.toFixed(1)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <span className={cn(
                "inline-flex px-2.5 py-0.5 rounded-full text-xs font-label font-semibold uppercase tracking-wider border",
                player.position === 'forward' && 'position-forward',
                player.position === 'midfielder' && 'position-midfielder',
                player.position === 'defender' && 'position-defender',
                player.position === 'goalkeeper' && 'position-goalkeeper'
              )}>
                {player.position}
              </span>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5">
              <div className="text-center">
                <p className="font-mono-data text-sm font-semibold text-[#00D9FF]">
                  {player.stats.goals}
                </p>
                <p className="text-xs text-[#A8A29E]">Goals</p>
              </div>
              <div className="text-center">
                <p className="font-mono-data text-sm font-semibold text-[#00D9FF]">
                  {player.stats.assists}
                </p>
                <p className="text-xs text-[#A8A29E]">Assists</p>
              </div>
              <div className="text-center">
                <p className="font-mono-data text-sm font-semibold text-[#00D9FF]">
                  {player.stats.matches}
                </p>
                <p className="text-xs text-[#A8A29E]">Matches</p>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function PlayersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<Position | 'all'>('all');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');

  const filteredPlayers = players.filter((player) => {
    const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          player.team.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPosition = selectedPosition === 'all' || player.position === selectedPosition;
    const matchesTeam = selectedTeam === 'all' || player.team === selectedTeam;
    return matchesSearch && matchesPosition && matchesTeam;
  });

  return (
    <MainLayout>
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-white mb-3">
              Player Database
            </h1>
            <p className="text-[#A8A29E] text-lg max-w-2xl">
              Explore comprehensive performance data and ratings for players across Vietnamese football leagues.
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-card rounded-2xl p-4 sm:p-6 mb-8"
          >
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A8A29E]" />
                <input
                  type="text"
                  placeholder="Search players or teams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-[#A8A29E] focus:outline-none focus:border-[#00D9FF]/50 transition-colors"
                />
              </div>

              {/* Position Filter */}
              <div className="flex flex-wrap gap-2">
                {positions.map((pos) => (
                  <button
                    key={pos.value}
                    onClick={() => setSelectedPosition(pos.value)}
                    className={cn(
                      "px-4 py-2.5 rounded-xl font-label text-sm font-medium transition-all duration-200",
                      selectedPosition === pos.value
                        ? "bg-[#FF4444] text-white"
                        : "bg-white/5 text-[#A8A29E] hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Team Filter */}
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
              <button
                onClick={() => setSelectedTeam('all')}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-label font-medium transition-all duration-200",
                  selectedTeam === 'all'
                    ? "bg-[#00D9FF]/20 text-[#00D9FF]"
                    : "bg-white/5 text-[#A8A29E] hover:bg-white/10"
                )}
              >
                All Teams
              </button>
              {teams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => setSelectedTeam(team.name)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-label font-medium transition-all duration-200",
                    selectedTeam === team.name
                      ? "bg-[#00D9FF]/20 text-[#00D9FF]"
                      : "bg-white/5 text-[#A8A29E] hover:bg-white/10"
                  )}
                >
                  {team.name}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Results Count */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6 flex items-center justify-between"
          >
            <p className="text-sm text-[#A8A29E]">
              Showing <span className="font-mono-data text-white">{filteredPlayers.length}</span> players
            </p>
          </motion.div>

          {/* Players Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPlayers.map((player, index) => (
              <PlayerCard key={player.id} player={player} index={index} />
            ))}
          </div>

          {/* Empty State */}
          {filteredPlayers.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-[#A8A29E]" />
              </div>
              <h3 className="font-display font-bold text-xl text-white mb-2">
                No Players Found
              </h3>
              <p className="text-[#A8A29E]">
                Try adjusting your filters or search query.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
