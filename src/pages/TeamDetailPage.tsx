import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Users, Trophy, Calendar, TrendingUp } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { getTeamById, players, matches } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function TeamDetailPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const team = getTeamById(teamId || '');

  if (!team) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center py-20">
          <div className="text-center">
            <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-foreground mb-4">
              Không tìm thấy câu lạc bộ
            </h2>
            <Link to="/leagues">
              <Button variant="outline" className="border-[#00D9FF] text-[#00D9FF]">
                Quay lại
              </Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Get team players
  const teamPlayers = players.filter(p => p.team === team.name);

  // Get team matches
  const teamMatches = matches.filter(
    m => m.homeTeam.id === team.id || m.awayTeam.id === team.id
  );
  const upcomingMatches = teamMatches.filter(m => m.status === 'scheduled');
  const recentMatches = teamMatches
    .filter(m => m.status === 'completed')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Calculate stats
  const completedMatches = teamMatches.filter(m => m.status === 'completed');
  const wins = completedMatches.filter(m => {
    if (m.homeTeam.id === team.id) return (m.homeScore || 0) > (m.awayScore || 0);
    return (m.awayScore || 0) > (m.homeScore || 0);
  }).length;
  const draws = completedMatches.filter(m => m.homeScore === m.awayScore).length;
  const losses = completedMatches.length - wins - draws;

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
            <Link to="/leagues" className="inline-flex items-center gap-2 text-slate-700 dark:text-[#A8A29E] hover:text-slate-900 dark:hover:text-foreground transition-colors mb-8">
              <ArrowLeft className="w-4 h-4" />
              <span className="font-label text-sm font-medium">Quay lại</span>
            </Link>
          </motion.div>

          {/* Team Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card rounded-3xl p-6 sm:p-10 mb-8"
          >
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-slate-200 dark:bg-white/5 flex items-center justify-center border-2 border-slate-300 dark:border-white/10">
                <span className="font-display font-bold text-5xl sm:text-6xl text-slate-900 dark:text-foreground">
                  {team.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h1 className="font-display font-bold text-4xl sm:text-5xl text-slate-900 dark:text-foreground mb-2">
                  {team.name}
                </h1>
                <p className="text-lg text-slate-700 dark:text-[#A8A29E] font-label uppercase tracking-wider font-semibold">
                  {team.league}
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
                <Trophy className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                <p className="font-mono-data text-3xl font-bold text-slate-900 dark:text-foreground mb-1">
                  {wins}
                </p>
                <p className="text-xs text-slate-600 dark:text-[#A8A29E] font-label uppercase tracking-wider font-semibold">
                  Thắng
                </p>
              </div>

              <div className="text-center p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center mx-auto mb-2">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">=</span>
                </div>
                <p className="font-mono-data text-3xl font-bold text-slate-900 dark:text-foreground mb-1">
                  {draws}
                </p>
                <p className="text-xs text-slate-600 dark:text-[#A8A29E] font-label uppercase tracking-wider font-semibold">
                  Hòa
                </p>
              </div>

              <div className="text-center p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
                <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-500/20 flex items-center justify-center mx-auto mb-2">
                  <span className="text-red-600 dark:text-red-400 font-bold text-xl">×</span>
                </div>
                <p className="font-mono-data text-3xl font-bold text-slate-900 dark:text-foreground mb-1">
                  {losses}
                </p>
                <p className="text-xs text-slate-600 dark:text-[#A8A29E] font-label uppercase tracking-wider font-semibold">
                  Thua
                </p>
              </div>

              <div className="text-center p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
                <Users className="w-8 h-8 text-[#00D9FF] mx-auto mb-2" />
                <p className="font-mono-data text-3xl font-bold text-slate-900 dark:text-foreground mb-1">
                  {teamPlayers.length}
                </p>
                <p className="text-xs text-slate-600 dark:text-[#A8A29E] font-label uppercase tracking-wider font-semibold">
                  Cầu thủ
                </p>
              </div>
            </div>
          </motion.div>

          {/* Home Stadium */}
          {team.homeStadium && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="glass-card rounded-2xl p-6 sm:p-8 mb-8"
            >
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-foreground mb-6">
                Sân vận động
              </h3>
              <Link
                to={`/stadiums/${team.homeStadium.id}`}
                className="block p-6 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#00D9FF]/20 to-[#FF4444]/20 flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-[#00D9FF]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-display font-bold text-lg text-slate-900 dark:text-foreground mb-1">
                      {team.homeStadium.name}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-[#A8A29E] mb-2">
                      {team.homeStadium.city}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-[#A8A29E]">
                      <span>Sức chứa: {team.homeStadium.capacity.toLocaleString()}</span>
                      <span>•</span>
                      <span>{team.homeStadium.surface === 'grass' ? 'Cỏ tự nhiên' : team.homeStadium.surface === 'artificial' ? 'Cỏ nhân tạo' : 'Cỏ lai'}</span>
                    </div>
                  </div>
                  <ArrowLeft className="w-5 h-5 text-[#00D9FF] rotate-180" />
                </div>
              </Link>
            </motion.div>
          )}

          {/* Squad */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-card rounded-2xl p-6 sm:p-8 mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-foreground">
                Đội hình
              </h3>
              <Link to="/players" className="text-[#00D9FF] hover:underline text-sm font-label font-semibold">
                Xem tất cả
              </Link>
            </div>

            {teamPlayers.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {teamPlayers.map((player) => (
                  <Link
                    key={player.id}
                    to={`/players/${player.id}`}
                    className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors group"
                  >
                    <div className="w-14 h-14 rounded-xl bg-slate-200 dark:bg-white/5 flex items-center justify-center border border-slate-300 dark:border-white/10">
                      <span className="font-display font-bold text-xl text-slate-900 dark:text-foreground">
                        {player.number}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-body font-semibold text-slate-900 dark:text-foreground group-hover:text-[#00D9FF] transition-colors truncate">
                        {player.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn(
                          "inline-flex px-2 py-0.5 rounded-md text-xs font-label font-semibold uppercase tracking-wider border",
                          player.position === 'forward' && 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30',
                          player.position === 'midfielder' && 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-cyan-500/20 dark:text-cyan-400 dark:border-cyan-500/30',
                          player.position === 'defender' && 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30',
                          player.position === 'goalkeeper' && 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30'
                        )}>
                          {player.position === 'forward' ? 'FW' : player.position === 'midfielder' ? 'MF' : player.position === 'defender' ? 'DF' : 'GK'}
                        </span>
                        <span className="font-mono-data text-sm font-bold text-[#00D9FF]">
                          {player.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-16 h-16 text-slate-400 dark:text-[#A8A29E] mx-auto mb-3" />
                <p className="text-slate-600 dark:text-[#A8A29E]">
                  Chưa có thông tin cầu thủ
                </p>
              </div>
            )}
          </motion.div>

          {/* Upcoming Matches */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass-card rounded-2xl p-6 sm:p-8 mb-8"
          >
            <h3 className="font-display font-bold text-xl text-slate-900 dark:text-foreground mb-6">
              Trận đấu sắp tới
            </h3>
            {upcomingMatches.length > 0 ? (
              <div className="space-y-4">
                {upcomingMatches.map((match) => (
                  <Link
                    key={match.id}
                    to={`/matches/${match.id}`}
                    className="block p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-4 flex-1 min-w-[200px]">
                        <div className="text-center min-w-[80px]">
                          <p className="text-xs text-slate-600 dark:text-[#A8A29E] mb-1">
                            {new Date(match.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                          </p>
                          <p className="font-mono-data text-lg text-[#00D9FF] font-bold">
                            {match.time}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 flex-1">
                          <div className="text-right flex-1">
                            <p className={cn(
                              "font-body font-semibold",
                              match.homeTeam.id === team.id ? "text-[#00D9FF]" : "text-slate-900 dark:text-foreground"
                            )}>
                              {match.homeTeam.name}
                            </p>
                          </div>
                          <span className="text-slate-400 dark:text-[#A8A29E] font-bold">vs</span>
                          <div className="text-left flex-1">
                            <p className={cn(
                              "font-body font-semibold",
                              match.awayTeam.id === team.id ? "text-[#00D9FF]" : "text-slate-900 dark:text-foreground"
                            )}>
                              {match.awayTeam.name}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-500 dark:text-[#A8A29E]" />
                        <span className="text-sm text-slate-600 dark:text-[#A8A29E]">
                          {match.venue}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-16 h-16 text-slate-400 dark:text-[#A8A29E] mx-auto mb-3" />
                <p className="text-slate-600 dark:text-[#A8A29E]">
                  Chưa có trận đấu sắp tới
                </p>
              </div>
            )}
          </motion.div>

          {/* Recent Matches */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass-card rounded-2xl p-6 sm:p-8"
          >
            <h3 className="font-display font-bold text-xl text-slate-900 dark:text-foreground mb-6">
              Kết quả gần đây
            </h3>
            {recentMatches.length > 0 ? (
              <div className="space-y-4">
                {recentMatches.map((match) => {
                  const isHomeTeam = match.homeTeam.id === team.id;
                  const teamScore = isHomeTeam ? match.homeScore : match.awayScore;
                  const opponentScore = isHomeTeam ? match.awayScore : match.homeScore;
                  const result = teamScore! > opponentScore! ? 'win' : teamScore === opponentScore ? 'draw' : 'loss';

                  return (
                    <Link
                      key={match.id}
                      to={`/matches/${match.id}`}
                      className="block p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-4 flex-1 min-w-[200px]">
                          <div className="text-center min-w-[80px]">
                            <p className="text-xs text-slate-600 dark:text-[#A8A29E]">
                              {new Date(match.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 flex-1">
                            <div className="text-right flex-1">
                              <p className={cn(
                                "font-body font-semibold",
                                match.homeTeam.id === team.id ? "text-[#00D9FF]" : "text-slate-900 dark:text-foreground"
                              )}>
                                {match.homeTeam.name}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono-data text-xl font-bold text-slate-900 dark:text-foreground">
                                {match.homeScore}
                              </span>
                              <span className="text-slate-400 dark:text-[#A8A29E]">-</span>
                              <span className="font-mono-data text-xl font-bold text-slate-900 dark:text-foreground">
                                {match.awayScore}
                              </span>
                            </div>
                            <div className="text-left flex-1">
                              <p className={cn(
                                "font-body font-semibold",
                                match.awayTeam.id === team.id ? "text-[#00D9FF]" : "text-slate-900 dark:text-foreground"
                              )}>
                                {match.awayTeam.name}
                              </p>
                            </div>
                          </div>
                        </div>
                        <span className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-label font-semibold uppercase",
                          result === 'win' && "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400",
                          result === 'draw' && "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400",
                          result === 'loss' && "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400"
                        )}>
                          {result === 'win' ? 'Thắng' : result === 'draw' ? 'Hòa' : 'Thua'}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="w-16 h-16 text-slate-400 dark:text-[#A8A29E] mx-auto mb-3" />
                <p className="text-slate-600 dark:text-[#A8A29E]">
                  Chưa có kết quả trận đấu
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}
