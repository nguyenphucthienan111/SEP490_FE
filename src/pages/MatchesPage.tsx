import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Radio, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { matches, leagues } from '@/data/mockData';
import { Match } from '@/types';
import { cn } from '@/lib/utils';

function MatchCard({ match, index }: { match: Match; index: number }) {
  const isLive = match.status === 'live';
  const isCompleted = match.status === 'completed';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link to={`/matches/${match.id}`}>
        <div className={cn(
          "group glass-card rounded-2xl p-6 hover:translate-y-[-4px] hover:shadow-xl transition-all duration-300 cursor-pointer border border-transparent",
          isLive ? "border-[#FF4444]/30 hover:border-[#FF4444]/50" : "hover:border-[#00D9FF]/20"
        )}>
          {/* Match Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#A8A29E] font-label uppercase tracking-wider">
                {match.league}
              </span>
              <span className="text-xs text-[#A8A29E]">•</span>
              <span className="text-xs text-[#A8A29E]">{match.season}</span>
            </div>
            {isLive && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF4444]/20 rounded-full">
                <Radio className="w-3 h-3 text-[#FF4444] animate-pulse" />
                <span className="text-xs font-label font-semibold text-[#FF4444] uppercase">Live</span>
              </span>
            )}
            {isCompleted && (
              <span className="px-3 py-1.5 bg-white/5 rounded-full text-xs font-label text-[#A8A29E]">
                Full Time
              </span>
            )}
            {match.status === 'scheduled' && (
              <span className="px-3 py-1.5 bg-[#00D9FF]/10 rounded-full text-xs font-label text-[#00D9FF]">
                Upcoming
              </span>
            )}
          </div>

          {/* Teams */}
          <div className="flex items-center justify-between gap-6 mb-6">
            {/* Home Team */}
            <div className="flex-1">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-3">
                <span className="font-display font-bold text-xl text-white">
                  {match.homeTeam.name.charAt(0)}
                </span>
              </div>
              <h4 className="font-body font-semibold text-white text-sm">
                {match.homeTeam.name}
              </h4>
              <span className="text-xs text-[#A8A29E]">Home</span>
            </div>

            {/* Score */}
            <div className="flex flex-col items-center">
              {(isLive || isCompleted) ? (
                <div className="flex items-center gap-4">
                  <span className="font-mono-data text-4xl font-bold text-white">
                    {match.homeScore}
                  </span>
                  <span className="text-[#A8A29E] text-2xl">-</span>
                  <span className="font-mono-data text-4xl font-bold text-white">
                    {match.awayScore}
                  </span>
                </div>
              ) : (
                <div className="text-center">
                  <p className="font-mono-data text-xl text-[#00D9FF] mb-1">{match.time}</p>
                  <p className="text-xs text-[#A8A29E]">Kick-off</p>
                </div>
              )}
            </div>

            {/* Away Team */}
            <div className="flex-1 text-right">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-3 ml-auto">
                <span className="font-display font-bold text-xl text-white">
                  {match.awayTeam.name.charAt(0)}
                </span>
              </div>
              <h4 className="font-body font-semibold text-white text-sm">
                {match.awayTeam.name}
              </h4>
              <span className="text-xs text-[#A8A29E]">Away</span>
            </div>
          </div>

          {/* Match Info */}
          <div className="flex items-center justify-center gap-6 pt-4 border-t border-white/5 text-sm text-[#A8A29E]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(match.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{match.venue}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function MatchesPage() {
  const [selectedLeague, setSelectedLeague] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredMatches = matches.filter((match) => {
    const matchesLeague = selectedLeague === 'all' || match.league === selectedLeague;
    const matchesStatus = selectedStatus === 'all' || match.status === selectedStatus;
    return matchesLeague && matchesStatus;
  });

  const liveMatches = filteredMatches.filter(m => m.status === 'live');
  const otherMatches = filteredMatches.filter(m => m.status !== 'live');

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
              Match Center
            </h1>
            <p className="text-[#A8A29E] text-lg max-w-2xl">
              Live scores, results, and upcoming fixtures from Vietnamese football leagues.
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-card rounded-2xl p-4 sm:p-6 mb-8"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              {/* League Filter */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedLeague('all')}
                  className={cn(
                    "px-4 py-2.5 rounded-xl font-label text-sm font-medium transition-all duration-200",
                    selectedLeague === 'all'
                      ? "bg-[#FF4444] text-white"
                      : "bg-white/5 text-[#A8A29E] hover:bg-white/10 hover:text-white"
                  )}
                >
                  All Leagues
                </button>
                {leagues.map((league) => (
                  <button
                    key={league.id}
                    onClick={() => setSelectedLeague(league.name)}
                    className={cn(
                      "px-4 py-2.5 rounded-xl font-label text-sm font-medium transition-all duration-200",
                      selectedLeague === league.name
                        ? "bg-[#FF4444] text-white"
                        : "bg-white/5 text-[#A8A29E] hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {league.name}
                  </button>
                ))}
              </div>

              {/* Status Filter */}
              <div className="flex gap-2 sm:ml-auto">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'live', label: 'Live' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'scheduled', label: 'Upcoming' },
                ].map((status) => (
                  <button
                    key={status.value}
                    onClick={() => setSelectedStatus(status.value)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-label font-medium transition-all duration-200",
                      selectedStatus === status.value
                        ? "bg-[#00D9FF]/20 text-[#00D9FF]"
                        : "bg-white/5 text-[#A8A29E] hover:bg-white/10"
                    )}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Live Matches */}
          {liveMatches.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-12"
            >
              <div className="flex items-center gap-2 mb-6">
                <Radio className="w-5 h-5 text-[#FF4444] animate-pulse" />
                <h2 className="font-display font-bold text-xl text-white">
                  Live Now
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {liveMatches.map((match, index) => (
                  <MatchCard key={match.id} match={match} index={index} />
                ))}
              </div>
            </motion.div>
          )}

          {/* Other Matches */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <h2 className="font-display font-bold text-xl text-white mb-6">
              {selectedStatus === 'scheduled' ? 'Upcoming Matches' : 
               selectedStatus === 'completed' ? 'Recent Results' : 
               'All Matches'}
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {otherMatches.map((match, index) => (
              <MatchCard key={match.id} match={match} index={index} />
            ))}
          </div>

          {/* Empty State */}
          {filteredMatches.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-8 h-8 text-[#A8A29E]" />
              </div>
              <h3 className="font-display font-bold text-xl text-white mb-2">
                No Matches Found
              </h3>
              <p className="text-[#A8A29E]">
                Try adjusting your filters.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
