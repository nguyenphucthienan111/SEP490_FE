import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, Clock, Radio, TrendingUp } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { getMatchById, players } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Mock player performances for match
const mockPerformances = [
  // Home Team - Công An Hà Nội
  { playerId: 'p1', name: 'Nguyễn Quang Hải', team: 'home', position: 'midfielder', rating: 8.7, goals: 1, assists: 1, minutesPlayed: 90 },
  { playerId: 'p2', name: 'Nguyễn Văn Toàn', team: 'home', position: 'forward', rating: 7.8, goals: 1, assists: 0, minutesPlayed: 85 },
  { playerId: 'p3', name: 'Đoàn Văn Hậu', team: 'home', position: 'defender', rating: 7.5, goals: 0, assists: 0, minutesPlayed: 90 },
  { playerId: 'p4', name: 'Đặng Văn Lâm', team: 'home', position: 'goalkeeper', rating: 7.2, goals: 0, assists: 0, minutesPlayed: 90 },
  // Away Team - Thanh Hóa FC
  { playerId: 'p5', name: 'Phan Văn Đức', team: 'away', position: 'forward', rating: 7.6, goals: 0, assists: 1, minutesPlayed: 78 },
  { playerId: 'p6', name: 'Nguyễn Tuấn Anh', team: 'away', position: 'midfielder', rating: 7.4, goals: 0, assists: 0, minutesPlayed: 90 },
  { playerId: 'p7', name: 'Bùi Tiến Dũng', team: 'away', position: 'defender', rating: 7.1, goals: 0, assists: 0, minutesPlayed: 90 },
  { playerId: 'p8', name: 'Nguyễn Văn Hoàng', team: 'away', position: 'goalkeeper', rating: 6.8, goals: 0, assists: 0, minutesPlayed: 90 },
];

const positionOrder = { forward: 1, midfielder: 2, defender: 3, goalkeeper: 4 };

// Mock standings data
const mockStandings = [
  { position: 1, team: 'Hà Nội FC', played: 20, won: 14, drawn: 4, lost: 2, gf: 42, ga: 15, gd: 27, points: 46 },
  { position: 2, team: 'Công An Hà Nội', played: 20, won: 13, drawn: 5, lost: 2, gf: 38, ga: 16, gd: 22, points: 44 },
  { position: 3, team: 'Hoàng Anh Gia Lai', played: 20, won: 11, drawn: 6, lost: 3, gf: 35, ga: 20, gd: 15, points: 39 },
  { position: 4, team: 'Viettel FC', played: 20, won: 10, drawn: 7, lost: 3, gf: 32, ga: 18, gd: 14, points: 37 },
  { position: 5, team: 'Thanh Hóa FC', played: 20, won: 9, drawn: 5, lost: 6, gf: 28, ga: 24, gd: 4, points: 32 },
  { position: 6, team: 'Sài Gòn FC', played: 20, won: 8, drawn: 6, lost: 6, gf: 26, ga: 22, gd: 4, points: 30 },
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

  // Sort players by team and position
  const homePlayers = mockPerformances
    .filter(p => p.team === 'home')
    .sort((a, b) => positionOrder[a.position] - positionOrder[b.position]);
  
  const awayPlayers = mockPerformances
    .filter(p => p.team === 'away')
    .sort((a, b) => positionOrder[a.position] - positionOrder[b.position]);

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
            <Link to="/matches" className="inline-flex items-center gap-2 text-slate-700 dark:text-[#A8A29E] hover:text-slate-900 dark:hover:text-foreground transition-colors mb-8">
              <ArrowLeft className="w-4 h-4" />
              <span className="font-label text-sm font-medium">Back to Matches</span>
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
              <span className="text-sm text-slate-700 dark:text-[#A8A29E] font-label uppercase tracking-wider font-semibold">
                {match.league}
              </span>
              <span className="text-slate-400 dark:text-[#A8A29E]">•</span>
              <span className="text-sm text-slate-700 dark:text-[#A8A29E] font-medium">{match.season}</span>
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
                <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-slate-200 dark:bg-white/5 flex items-center justify-center mb-4 mx-auto border border-slate-300 dark:border-white/10">
                  <span className="font-display font-bold text-2xl sm:text-4xl text-slate-900 dark:text-foreground">
                    {match.homeTeam.name.charAt(0)}
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg sm:text-xl text-slate-900 dark:text-foreground mb-1">
                  {match.homeTeam.name}
                </h3>
                <span className="text-sm text-slate-600 dark:text-[#A8A29E] font-medium">Home</span>
              </div>

              {/* Score */}
              <div className="flex flex-col items-center">
                {(isLive || isCompleted) ? (
                  <div className="flex items-center gap-4 sm:gap-6">
                    <span className="font-mono-data text-5xl sm:text-7xl font-bold text-slate-900 dark:text-foreground">
                      {match.homeScore}
                    </span>
                    <span className="text-slate-400 dark:text-[#A8A29E] text-3xl sm:text-4xl">-</span>
                    <span className="font-mono-data text-5xl sm:text-7xl font-bold text-slate-900 dark:text-foreground">
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
                  <span className="mt-4 px-4 py-2 bg-slate-200 dark:bg-white/5 rounded-full text-sm font-label text-slate-700 dark:text-[#A8A29E] font-semibold">
                    Full Time
                  </span>
                )}
              </div>

              {/* Away Team */}
              <div className="flex-1 text-center">
                <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-slate-200 dark:bg-white/5 flex items-center justify-center mb-4 mx-auto border border-slate-300 dark:border-white/10">
                  <span className="font-display font-bold text-2xl sm:text-4xl text-slate-900 dark:text-foreground">
                    {match.awayTeam.name.charAt(0)}
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg sm:text-xl text-slate-900 dark:text-foreground mb-1">
                  {match.awayTeam.name}
                </h3>
                <span className="text-sm text-slate-600 dark:text-[#A8A29E] font-medium">Away</span>
              </div>
            </div>

            {/* Match Info */}
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center justify-center gap-6 sm:gap-10 text-sm text-slate-700 dark:text-[#A8A29E] font-medium flex-wrap">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(match.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{match.time}</span>
                </div>
              </div>
              
              {/* Stadium Info */}
              {match.stadium && (
                <Link 
                  to={`/stadiums/${match.stadium.id}`}
                  className="mt-2 px-6 py-4 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors block"
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-[#00D9FF]" />
                    <span className="font-display font-bold text-slate-900 dark:text-foreground">
                      {match.stadium.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-4 text-xs text-slate-600 dark:text-[#A8A29E]">
                    <span>{match.stadium.city}</span>
                    <span>•</span>
                    <span>Sức chứa: {match.stadium.capacity.toLocaleString()}</span>
                    <span>•</span>
                    <span className="capitalize">{match.stadium.surface === 'grass' ? 'Cỏ tự nhiên' : match.stadium.surface === 'artificial' ? 'Cỏ nhân tạo' : 'Cỏ lai'}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 mt-2 text-xs text-[#00D9FF]">
                    <span>Xem chi tiết sân</span>
                    <ArrowLeft className="w-3 h-3 rotate-180" />
                  </div>
                </Link>
              )}
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
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-foreground mb-6">
                Player Performances
              </h3>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Home Team */}
                <div>
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-300 dark:border-white/10">
                    <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-white/5 flex items-center justify-center border border-slate-300 dark:border-white/10">
                      <span className="font-display font-bold text-lg text-slate-900 dark:text-foreground">
                        {match.homeTeam.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-lg text-slate-900 dark:text-foreground">
                        {match.homeTeam.name}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-[#A8A29E]">Home Team</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {homePlayers.map((perf, index) => (
                      <motion.div
                        key={perf.playerId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors border border-slate-200 dark:border-white/5"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <Link to={`/players/${perf.playerId}`} className="flex items-center gap-3 group flex-1">
                            <div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-white/5 flex items-center justify-center border border-slate-300 dark:border-white/10">
                              <span className="font-display font-bold text-sm text-slate-900 dark:text-foreground">
                                {perf.name.charAt(0)}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-body font-semibold text-slate-900 dark:text-foreground group-hover:text-[#00D9FF] transition-colors truncate">
                                {perf.name}
                              </p>
                              <span className={cn(
                                "inline-flex px-2 py-0.5 rounded-md text-xs font-label font-semibold uppercase tracking-wider border mt-1",
                                perf.position === 'forward' && 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30',
                                perf.position === 'midfielder' && 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-cyan-500/20 dark:text-cyan-400 dark:border-cyan-500/30',
                                perf.position === 'defender' && 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30',
                                perf.position === 'goalkeeper' && 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30'
                              )}>
                                {perf.position === 'forward' ? 'FW' : perf.position === 'midfielder' ? 'MF' : perf.position === 'defender' ? 'DF' : 'GK'}
                              </span>
                            </div>
                          </Link>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "font-mono-data text-2xl font-bold",
                              perf.rating >= 8 ? "text-green-600 dark:text-green-400" :
                              perf.rating >= 7 ? "text-[#00D9FF]" :
                              "text-amber-600 dark:text-amber-400"
                            )}>
                              {perf.rating.toFixed(1)}
                            </span>
                            {perf.rating >= 8 && <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-600 dark:text-[#A8A29E]">Goals:</span>
                            <span className="font-mono-data font-bold text-slate-900 dark:text-foreground">
                              {perf.goals > 0 ? perf.goals : '-'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-600 dark:text-[#A8A29E]">Assists:</span>
                            <span className="font-mono-data font-bold text-slate-900 dark:text-foreground">
                              {perf.assists > 0 ? perf.assists : '-'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 ml-auto">
                            <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-[#A8A29E]" />
                            <span className="font-mono-data text-slate-700 dark:text-[#A8A29E]">
                              {perf.minutesPlayed}'
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Away Team */}
                <div>
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-300 dark:border-white/10">
                    <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-white/5 flex items-center justify-center border border-slate-300 dark:border-white/10">
                      <span className="font-display font-bold text-lg text-slate-900 dark:text-foreground">
                        {match.awayTeam.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-lg text-slate-900 dark:text-foreground">
                        {match.awayTeam.name}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-[#A8A29E]">Away Team</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {awayPlayers.map((perf, index) => (
                      <motion.div
                        key={perf.playerId}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors border border-slate-200 dark:border-white/5"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <Link to={`/players/${perf.playerId}`} className="flex items-center gap-3 group flex-1">
                            <div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-white/5 flex items-center justify-center border border-slate-300 dark:border-white/10">
                              <span className="font-display font-bold text-sm text-slate-900 dark:text-foreground">
                                {perf.name.charAt(0)}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-body font-semibold text-slate-900 dark:text-foreground group-hover:text-[#00D9FF] transition-colors truncate">
                                {perf.name}
                              </p>
                              <span className={cn(
                                "inline-flex px-2 py-0.5 rounded-md text-xs font-label font-semibold uppercase tracking-wider border mt-1",
                                perf.position === 'forward' && 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30',
                                perf.position === 'midfielder' && 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-cyan-500/20 dark:text-cyan-400 dark:border-cyan-500/30',
                                perf.position === 'defender' && 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30',
                                perf.position === 'goalkeeper' && 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30'
                              )}>
                                {perf.position === 'forward' ? 'FW' : perf.position === 'midfielder' ? 'MF' : perf.position === 'defender' ? 'DF' : 'GK'}
                              </span>
                            </div>
                          </Link>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "font-mono-data text-2xl font-bold",
                              perf.rating >= 8 ? "text-green-600 dark:text-green-400" :
                              perf.rating >= 7 ? "text-[#00D9FF]" :
                              "text-amber-600 dark:text-amber-400"
                            )}>
                              {perf.rating.toFixed(1)}
                            </span>
                            {perf.rating >= 8 && <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-600 dark:text-[#A8A29E]">Goals:</span>
                            <span className="font-mono-data font-bold text-slate-900 dark:text-foreground">
                              {perf.goals > 0 ? perf.goals : '-'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-600 dark:text-[#A8A29E]">Assists:</span>
                            <span className="font-mono-data font-bold text-slate-900 dark:text-foreground">
                              {perf.assists > 0 ? perf.assists : '-'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 ml-auto">
                            <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-[#A8A29E]" />
                            <span className="font-mono-data text-slate-700 dark:text-[#A8A29E]">
                              {perf.minutesPlayed}'
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* League Standings */}
          {(isLive || isCompleted) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="glass-card rounded-2xl p-6 sm:p-8 mt-8"
            >
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-foreground mb-6">
                League Standings
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-300 dark:border-white/10">
                      <th className="text-left py-3 px-3 font-label text-xs text-slate-700 dark:text-[#A8A29E] uppercase tracking-wider font-bold">Pos</th>
                      <th className="text-left py-3 px-3 font-label text-xs text-slate-700 dark:text-[#A8A29E] uppercase tracking-wider font-bold">Team</th>
                      <th className="text-center py-3 px-3 font-label text-xs text-slate-700 dark:text-[#A8A29E] uppercase tracking-wider font-bold">P</th>
                      <th className="text-center py-3 px-3 font-label text-xs text-slate-700 dark:text-[#A8A29E] uppercase tracking-wider font-bold">W</th>
                      <th className="text-center py-3 px-3 font-label text-xs text-slate-700 dark:text-[#A8A29E] uppercase tracking-wider font-bold">D</th>
                      <th className="text-center py-3 px-3 font-label text-xs text-slate-700 dark:text-[#A8A29E] uppercase tracking-wider font-bold">L</th>
                      <th className="text-center py-3 px-3 font-label text-xs text-slate-700 dark:text-[#A8A29E] uppercase tracking-wider font-bold">GF</th>
                      <th className="text-center py-3 px-3 font-label text-xs text-slate-700 dark:text-[#A8A29E] uppercase tracking-wider font-bold">GA</th>
                      <th className="text-center py-3 px-3 font-label text-xs text-slate-700 dark:text-[#A8A29E] uppercase tracking-wider font-bold">GD</th>
                      <th className="text-center py-3 px-3 font-label text-xs text-slate-700 dark:text-[#A8A29E] uppercase tracking-wider font-bold">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockStandings.map((team) => {
                      const isHomeTeam = team.team === match.homeTeam.name;
                      const isAwayTeam = team.team === match.awayTeam.name;
                      const isHighlighted = isHomeTeam || isAwayTeam;

                      return (
                        <tr
                          key={team.position}
                          className={cn(
                            "border-b border-slate-200 dark:border-white/5 transition-colors",
                            isHighlighted 
                              ? "bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20" 
                              : "hover:bg-slate-50 dark:hover:bg-white/5"
                          )}
                        >
                          <td className="py-3 px-3">
                            <span className={cn(
                              "font-mono-data font-bold text-sm",
                              isHighlighted ? "text-[#00D9FF]" : "text-slate-700 dark:text-slate-400"
                            )}>
                              {team.position}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-display font-bold",
                                isHighlighted 
                                  ? "bg-blue-100 dark:bg-blue-500/20 text-[#00D9FF] border border-blue-200 dark:border-blue-500/30" 
                                  : "bg-slate-200 dark:bg-white/5 text-slate-900 dark:text-foreground border border-slate-300 dark:border-white/10"
                              )}>
                                {team.team.charAt(0)}
                              </div>
                              <span className={cn(
                                "font-body font-semibold text-sm",
                                isHighlighted ? "text-slate-900 dark:text-[#00D9FF]" : "text-slate-900 dark:text-foreground"
                              )}>
                                {team.team}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="font-mono-data text-sm text-slate-700 dark:text-slate-400">{team.played}</span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="font-mono-data text-sm text-slate-700 dark:text-slate-400">{team.won}</span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="font-mono-data text-sm text-slate-700 dark:text-slate-400">{team.drawn}</span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="font-mono-data text-sm text-slate-700 dark:text-slate-400">{team.lost}</span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="font-mono-data text-sm text-slate-700 dark:text-slate-400">{team.gf}</span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="font-mono-data text-sm text-slate-700 dark:text-slate-400">{team.ga}</span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className={cn(
                              "font-mono-data text-sm font-semibold",
                              team.gd > 0 ? "text-green-600 dark:text-green-400" : 
                              team.gd < 0 ? "text-red-600 dark:text-red-400" : 
                              "text-slate-700 dark:text-slate-400"
                            )}>
                              {team.gd > 0 ? '+' : ''}{team.gd}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="font-mono-data text-sm font-bold text-slate-900 dark:text-foreground">
                              {team.points}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex items-center gap-4 text-xs text-slate-600 dark:text-[#A8A29E]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-blue-100 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30"></div>
                  <span>Teams in this match</span>
                </div>
                <span>•</span>
                <span>P: Played, W: Won, D: Drawn, L: Lost, GF: Goals For, GA: Goals Against, GD: Goal Difference, Pts: Points</span>
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
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-foreground mb-2">
                Match Not Started Yet
              </h3>
              <p className="text-slate-700 dark:text-[#A8A29E] mb-6">
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
