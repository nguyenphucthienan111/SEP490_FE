import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, Clock, Radio, TrendingUp } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { getMatchById, players } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Mock player performances for match
const mockPerformances = [
  { playerId: 'p1', name: 'Nguyễn Quang Hải', position: 'midfielder', rating: 8.7, goals: 1, assists: 1, minutesPlayed: 90 },
  { playerId: 'p2', name: 'Nguyễn Văn Toàn', position: 'forward', rating: 7.8, goals: 1, assists: 0, minutesPlayed: 85 },
  { playerId: 'p3', name: 'Đoàn Văn Hậu', position: 'defender', rating: 7.5, goals: 0, assists: 0, minutesPlayed: 90 },
  { playerId: 'p4', name: 'Đặng Văn Lâm', position: 'goalkeeper', rating: 7.2, goals: 0, assists: 0, minutesPlayed: 90 },
  { playerId: 'p5', name: 'Phan Văn Đức', position: 'forward', rating: 7.6, goals: 0, assists: 1, minutesPlayed: 78 },
  { playerId: 'p6', name: 'Nguyễn Tuấn Anh', position: 'midfielder', rating: 7.4, goals: 0, assists: 0, minutesPlayed: 90 },
];

export default function MatchDetailPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const match = getMatchById(matchId || '');

  if (!match) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="font-display font-bold text-2xl text-foreground mb-4">Match Not Found</h2>
            <Link to="/matches">
              <Button variant="outline" className="border-[#00D9FF] text-[#00D9FF]">
                Back to Matches
              </Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  const isLive = match.status === 'live';
  const isCompleted = match.status === 'completed';

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
            <Link to="/matches" className="inline-flex items-center gap-2 text-slate-600 dark:text-[#A8A29E] hover:text-foreground transition-colors mb-8">
              <ArrowLeft className="w-4 h-4" />
              <span className="font-label text-sm">Back to Matches</span>
            </Link>
          </motion.div>

          {/* Match Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card rounded-3xl p-6 sm:p-10 mb-8"
          >
            {/* Status & League */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className="text-sm text-slate-600 dark:text-[#A8A29E] font-label uppercase tracking-wider">
                {match.league}
              </span>
              <span className="text-slate-600 dark:text-[#A8A29E]">•</span>
              <span className="text-sm text-slate-600 dark:text-[#A8A29E]">{match.season}</span>
              {isLive && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF4444]/20 rounded-full ml-4">
                  <Radio className="w-3 h-3 text-[#FF4444] animate-pulse" />
                  <span className="text-xs font-label font-semibold text-[#FF4444] uppercase">Live</span>
                </span>
              )}
            </div>

            {/* Teams & Score */}
            <div className="flex items-center justify-center gap-8 sm:gap-16 mb-8">
              {/* Home Team */}
              <div className="flex-1 text-center">
                <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4 mx-auto">
                  <span className="font-display font-bold text-2xl sm:text-4xl text-foreground">
                    {match.homeTeam.name.charAt(0)}
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg sm:text-xl text-foreground mb-1">
                  {match.homeTeam.name}
                </h3>
                <span className="text-sm text-slate-600 dark:text-[#A8A29E]">Home</span>
              </div>

              {/* Score */}
              <div className="flex flex-col items-center">
                {(isLive || isCompleted) ? (
                  <div className="flex items-center gap-4 sm:gap-6">
                    <span className="font-mono-data text-5xl sm:text-7xl font-bold text-foreground">
                      {match.homeScore}
                    </span>
                    <span className="text-slate-600 dark:text-[#A8A29E] text-3xl sm:text-4xl">-</span>
                    <span className="font-mono-data text-5xl sm:text-7xl font-bold text-foreground">
                      {match.awayScore}
                    </span>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="font-mono-data text-3xl text-[#00D9FF] mb-2">{match.time}</p>
                    <p className="text-sm text-slate-600 dark:text-[#A8A29E]">Kick-off</p>
                  </div>
                )}
                {isCompleted && (
                  <span className="mt-4 px-4 py-2 bg-slate-100 dark:bg-white/5 rounded-full text-sm font-label text-slate-600 dark:text-[#A8A29E]">
                    Full Time
                  </span>
                )}
              </div>

              {/* Away Team */}
              <div className="flex-1 text-center">
                <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4 mx-auto">
                  <span className="font-display font-bold text-2xl sm:text-4xl text-foreground">
                    {match.awayTeam.name.charAt(0)}
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg sm:text-xl text-foreground mb-1">
                  {match.awayTeam.name}
                </h3>
                <span className="text-sm text-slate-600 dark:text-[#A8A29E]">Away</span>
              </div>
            </div>

            {/* Match Info */}
            <div className="flex items-center justify-center gap-6 sm:gap-10 text-sm text-slate-600 dark:text-[#A8A29E]">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(match.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{match.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{match.venue}</span>
              </div>
            </div>
          </motion.div>

          {/* Player Performances */}
          {(isLive || isCompleted) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass-card rounded-2xl p-6 sm:p-8"
            >
              <h3 className="font-display font-bold text-xl text-foreground mb-6">
                Player Performances
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/10">
                      <th className="text-left py-4 px-3 font-label text-xs text-slate-600 dark:text-[#A8A29E] uppercase tracking-wider">Player</th>
                      <th className="text-center py-4 px-3 font-label text-xs text-slate-600 dark:text-[#A8A29E] uppercase tracking-wider">Position</th>
                      <th className="text-center py-4 px-3 font-label text-xs text-slate-600 dark:text-[#A8A29E] uppercase tracking-wider">Rating</th>
                      <th className="text-center py-4 px-3 font-label text-xs text-slate-600 dark:text-[#A8A29E] uppercase tracking-wider">Goals</th>
                      <th className="text-center py-4 px-3 font-label text-xs text-slate-600 dark:text-[#A8A29E] uppercase tracking-wider">Assists</th>
                      <th className="text-center py-4 px-3 font-label text-xs text-slate-600 dark:text-[#A8A29E] uppercase tracking-wider">Minutes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockPerformances.map((perf, index) => (
                      <motion.tr
                        key={perf.playerId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="border-b border-slate-200 dark:border-white/5 hover:bg-muted transition-colors"
                      >
                        <td className="py-4 px-3">
                          <Link to={`/players/${perf.playerId}`} className="flex items-center gap-3 group">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                              <span className="font-display font-bold text-sm text-foreground">
                                {perf.name.charAt(0)}
                              </span>
                            </div>
                            <span className="font-body font-medium text-foreground group-hover:text-[#00D9FF] transition-colors">
                              {perf.name}
                            </span>
                          </Link>
                        </td>
                        <td className="py-4 px-3 text-center">
                          <span className={cn(
                            "inline-flex px-2.5 py-0.5 rounded-full text-xs font-label font-semibold uppercase tracking-wider border",
                            perf.position === 'forward' && 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30',
                            perf.position === 'midfielder' && 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-cyan-500/20 dark:text-cyan-400 dark:border-cyan-500/30',
                            perf.position === 'defender' && 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30',
                            perf.position === 'goalkeeper' && 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30'
                          )}>
                            {perf.position}
                          </span>
                        </td>
                        <td className="py-4 px-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className={cn(
                              "font-mono-data text-lg font-bold",
                              perf.rating >= 8 ? "text-green-400" :
                              perf.rating >= 7 ? "text-[#00D9FF]" :
                              "text-amber-400"
                            )}>
                              {perf.rating.toFixed(1)}
                            </span>
                            {perf.rating >= 8 && <TrendingUp className="w-4 h-4 text-green-400" />}
                          </div>
                        </td>
                        <td className="py-4 px-3 text-center">
                          <span className="font-mono-data text-foreground">
                            {perf.goals > 0 ? perf.goals : '-'}
                          </span>
                        </td>
                        <td className="py-4 px-3 text-center">
                          <span className="font-mono-data text-foreground">
                            {perf.assists > 0 ? perf.assists : '-'}
                          </span>
                        </td>
                        <td className="py-4 px-3 text-center">
                          <span className="font-mono-data text-slate-600 dark:text-[#A8A29E]">
                            {perf.minutesPlayed}'
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Upcoming Match Message */}
          {match.status === 'scheduled' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass-card rounded-2xl p-8 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-[#00D9FF]/10 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-[#00D9FF]" />
              </div>
              <h3 className="font-display font-bold text-xl text-foreground mb-2">
                Match Not Started Yet
              </h3>
              <p className="text-slate-600 dark:text-[#A8A29E] mb-6">
                Player performances will be available after the match begins.
              </p>
              <Link to="/matches">
                <Button className="bg-[#00D9FF] hover:bg-[#00E8FF] text-foreground font-label font-semibold px-6 h-10 rounded-xl">
                  View Other Matches
                </Button>
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
