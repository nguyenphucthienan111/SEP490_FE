import { motion } from 'framer-motion';
import { Trophy, Calendar, Users, ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { leagues, teams, matches } from '@/data/mockData';
import { cn } from '@/lib/utils';
import React from 'react';

// Mock standings data
const standings = [
  { position: 1, team: 'Hà Nội FC', played: 20, won: 14, drawn: 4, lost: 2, goalsFor: 42, goalsAgainst: 15, goalDifference: 27, points: 46, form: ['W', 'W', 'D', 'W', 'W'] },
  { position: 2, team: 'Công An Hà Nội', played: 20, won: 13, drawn: 5, lost: 2, goalsFor: 38, goalsAgainst: 16, goalDifference: 22, points: 44, form: ['W', 'D', 'W', 'W', 'D'] },
  { position: 3, team: 'Hoàng Anh Gia Lai', played: 20, won: 12, drawn: 4, lost: 4, goalsFor: 35, goalsAgainst: 20, goalDifference: 15, points: 40, form: ['W', 'L', 'W', 'W', 'D'] },
  { position: 4, team: 'Viettel FC', played: 20, won: 11, drawn: 5, lost: 4, goalsFor: 33, goalsAgainst: 22, goalDifference: 11, points: 38, form: ['D', 'W', 'W', 'L', 'W'] },
  { position: 5, team: 'Thanh Hóa FC', played: 20, won: 10, drawn: 6, lost: 4, goalsFor: 30, goalsAgainst: 21, goalDifference: 9, points: 36, form: ['D', 'D', 'W', 'W', 'L'] },
  { position: 6, team: 'SHB Đà Nẵng', played: 20, won: 9, drawn: 5, lost: 6, goalsFor: 28, goalsAgainst: 24, goalDifference: 4, points: 32, form: ['L', 'W', 'D', 'W', 'D'] },
  { position: 7, team: 'Hồ Chí Minh City', played: 20, won: 8, drawn: 6, lost: 6, goalsFor: 26, goalsAgainst: 25, goalDifference: 1, points: 30, form: ['D', 'L', 'W', 'D', 'W'] },
  { position: 8, team: 'Sông Lam Nghệ An', played: 20, won: 7, drawn: 7, lost: 6, goalsFor: 24, goalsAgainst: 24, goalDifference: 0, points: 28, form: ['D', 'D', 'L', 'W', 'D'] },
  { position: 9, team: 'Nam Định FC', played: 20, won: 6, drawn: 6, lost: 8, goalsFor: 22, goalsAgainst: 28, goalDifference: -6, points: 24, form: ['L', 'D', 'L', 'W', 'D'] },
  { position: 10, team: 'Bình Dương FC', played: 20, won: 5, drawn: 7, lost: 8, goalsFor: 20, goalsAgainst: 30, goalDifference: -10, points: 22, form: ['L', 'D', 'D', 'L', 'W'] },
  { position: 11, team: 'Hải Phòng FC', played: 20, won: 4, drawn: 5, lost: 11, goalsFor: 18, goalsAgainst: 32, goalDifference: -14, points: 17, form: ['L', 'L', 'D', 'L', 'W'] },
  { position: 12, team: 'Quảng Nam FC', played: 20, won: 2, drawn: 4, lost: 14, goalsFor: 14, goalsAgainst: 38, goalDifference: -24, points: 10, form: ['L', 'L', 'D', 'L', 'L'] },
];

export default function LeaguesPage() {
  const [selectedLeague, setSelectedLeague] = React.useState<string | null>('l1');

  const scrollToStandings = () => {
    const standingsElement = document.getElementById('standings-section');
    if (standingsElement) {
      setTimeout(() => {
        standingsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const handleLeagueClick = (leagueId: string) => {
    if (leagueId === 'l1') {
      setSelectedLeague(leagueId);
      scrollToStandings();
    } else {
      // For other leagues, just select but don't show standings
      setSelectedLeague(leagueId);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-foreground mb-3">
              Vietnamese Leagues
            </h1>
            <p className="text-slate-600 dark:text-[#A8A29E] text-lg max-w-2xl">
              Comprehensive coverage of all Vietnamese football competitions.
            </p>
          </motion.div>

          {/* Leagues Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {leagues.map((league, index) => {
              const isSelected = selectedLeague === league.id;
              
              return (
                <motion.div
                  key={league.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div 
                    onClick={() => handleLeagueClick(league.id)}
                    className={cn(
                      "group glass-card rounded-2xl p-8 hover:translate-y-[-4px] hover:shadow-xl transition-all duration-300 cursor-pointer h-full",
                      isSelected 
                        ? "border-2 border-[#FF4444] bg-red-50 dark:bg-red-500/10 shadow-lg shadow-[#FF4444]/20" 
                        : "border border-transparent hover:border-[#FF4444]/20"
                    )}
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center transition-all",
                        isSelected
                          ? "bg-gradient-to-br from-[#FF4444] to-[#FF6666] shadow-lg shadow-[#FF4444]/30"
                          : "bg-gradient-to-br from-red-200 dark:from-[#FF4444]/20 to-blue-200 dark:to-[#00D9FF]/20"
                      )}>
                        <Trophy className={cn(
                          "w-8 h-8 transition-colors",
                          isSelected ? "text-white" : "text-[#FF4444]"
                        )} />
                      </div>
                      <span className="px-4 py-1.5 rounded-full bg-blue-100 dark:bg-[#00D9FF]/10 text-[#00D9FF] text-sm font-label font-semibold">
                        {league.season}
                      </span>
                    </div>

                    <h3 className={cn(
                      "font-display font-bold text-2xl mb-2 transition-colors",
                      isSelected 
                        ? "text-[#FF4444]" 
                        : "text-slate-900 dark:text-foreground group-hover:text-[#FF4444]"
                    )}>
                      {league.name}
                    </h3>
                    <p className="text-slate-600 dark:text-[#A8A29E] mb-6">{league.country}</p>

                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-200 dark:border-white/5">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="w-4 h-4 text-slate-600 dark:text-[#A8A29E]" />
                          <span className="font-mono-data text-xl font-bold text-slate-900 dark:text-foreground">{league.teamCount}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-[#A8A29E]">Teams</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="w-4 h-4 text-slate-600 dark:text-[#A8A29E]" />
                          <span className="font-mono-data text-xl font-bold text-slate-900 dark:text-foreground">{league.matchesPlayed}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-[#A8A29E]">Matches</p>
                      </div>
                    </div>

                    {isSelected && league.id === 'l1' && (
                      <div className="mt-6 flex items-center justify-center gap-2 px-4 py-2 bg-[#FF4444] text-white rounded-lg font-label font-semibold text-sm">
                        <span>Viewing Standings</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                    {isSelected && league.id !== 'l1' && (
                      <div className="mt-6 flex items-center justify-center gap-2 px-4 py-2 bg-slate-400 text-white rounded-lg font-label font-semibold text-sm">
                        <span>No Data Available</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* V.League 1 Standings */}
          {selectedLeague === 'l1' && (
            <motion.div
              id="standings-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-16 scroll-mt-8"
            >
            <div className="glass-card rounded-2xl p-6 sm:p-8 border-2 border-[#FF4444]/20 dark:border-[#FF4444]/30">
              {/* Header with Trophy Icon */}
              <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF4444] to-[#FF6666] flex items-center justify-center shadow-lg shadow-[#FF4444]/30">
                    <Trophy className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="font-display font-extrabold text-3xl text-slate-900 dark:text-foreground mb-1">
                      V.League 1 Standings
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-[#A8A29E] font-medium">
                      Current season rankings and team performance
                    </p>
                  </div>
                </div>
                <span className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-[#00D9FF] text-white text-base font-label font-bold shadow-lg">
                  2025
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-slate-300 dark:border-white/10">
                      <th className="text-left py-4 px-3 font-label text-xs text-slate-700 dark:text-[#A8A29E] uppercase tracking-wider font-bold">Pos</th>
                      <th className="text-left py-4 px-3 font-label text-xs text-slate-700 dark:text-[#A8A29E] uppercase tracking-wider font-bold">Team</th>
                      <th className="text-center py-4 px-3 font-label text-xs text-slate-700 dark:text-[#A8A29E] uppercase tracking-wider font-bold">P</th>
                      <th className="text-center py-4 px-3 font-label text-xs text-slate-700 dark:text-[#A8A29E] uppercase tracking-wider font-bold">W</th>
                      <th className="text-center py-4 px-3 font-label text-xs text-slate-700 dark:text-[#A8A29E] uppercase tracking-wider font-bold">D</th>
                      <th className="text-center py-4 px-3 font-label text-xs text-slate-700 dark:text-[#A8A29E] uppercase tracking-wider font-bold">L</th>
                      <th className="text-center py-4 px-3 font-label text-xs text-slate-700 dark:text-[#A8A29E] uppercase tracking-wider font-bold">GF</th>
                      <th className="text-center py-4 px-3 font-label text-xs text-slate-700 dark:text-[#A8A29E] uppercase tracking-wider font-bold">GA</th>
                      <th className="text-center py-4 px-3 font-label text-xs text-slate-700 dark:text-[#A8A29E] uppercase tracking-wider font-bold">GD</th>
                      <th className="text-center py-4 px-3 font-label text-xs text-slate-700 dark:text-[#A8A29E] uppercase tracking-wider font-bold">Pts</th>
                      <th className="text-center py-4 px-3 font-label text-xs text-slate-700 dark:text-[#A8A29E] uppercase tracking-wider font-bold">Form</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((team, index) => {
                      const isTopThree = team.position <= 3;
                      const isRelegation = team.position >= 11;

                      return (
                        <motion.tr
                          key={team.position}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.3, delay: index * 0.03 }}
                          className={cn(
                            "border-b border-slate-200 dark:border-white/5 transition-colors",
                            isTopThree && "bg-green-50 dark:bg-green-500/5 hover:bg-green-100 dark:hover:bg-green-500/10",
                            isRelegation && "bg-red-50 dark:bg-red-500/5 hover:bg-red-100 dark:hover:bg-red-500/10",
                            !isTopThree && !isRelegation && "hover:bg-slate-50 dark:hover:bg-white/5"
                          )}
                        >
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "font-mono-data font-bold text-sm",
                                isTopThree && "text-green-600 dark:text-green-400",
                                isRelegation && "text-red-600 dark:text-red-400",
                                !isTopThree && !isRelegation && "text-slate-700 dark:text-slate-400"
                              )}>
                                {team.position}
                              </span>
                              {isTopThree && <TrendingUp className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />}
                              {isRelegation && <TrendingDown className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <Link 
                              to={`/teams/${teams.find(t => t.name === team.team)?.id || ''}`}
                              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                            >
                              <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-white/5 flex items-center justify-center text-xs font-display font-bold text-slate-900 dark:text-foreground border border-slate-300 dark:border-white/10">
                                {team.team.charAt(0)}
                              </div>
                              <span className="font-body font-semibold text-sm text-slate-900 dark:text-foreground hover:text-[#00D9FF] transition-colors">
                                {team.team}
                              </span>
                            </Link>
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
                            <span className="font-mono-data text-sm text-slate-700 dark:text-slate-400">{team.goalsFor}</span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="font-mono-data text-sm text-slate-700 dark:text-slate-400">{team.goalsAgainst}</span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className={cn(
                              "font-mono-data text-sm font-semibold",
                              team.goalDifference > 0 ? "text-green-600 dark:text-green-400" : 
                              team.goalDifference < 0 ? "text-red-600 dark:text-red-400" : 
                              "text-slate-700 dark:text-slate-400"
                            )}>
                              {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="font-mono-data text-sm font-bold text-slate-900 dark:text-foreground">
                              {team.points}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center justify-center gap-1">
                              {team.form.map((result, i) => (
                                <div
                                  key={i}
                                  className={cn(
                                    "w-6 h-6 rounded flex items-center justify-center text-xs font-bold",
                                    result === 'W' && "bg-green-500 text-white",
                                    result === 'D' && "bg-slate-400 text-white",
                                    result === 'L' && "bg-red-500 text-white"
                                  )}
                                >
                                  {result}
                                </div>
                              ))}
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-6 text-xs text-slate-600 dark:text-[#A8A29E]">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span>AFC Champions League</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span>Relegation Zone</span>
                </div>
                <span>•</span>
                <span>P: Played, W: Won, D: Drawn, L: Lost, GF: Goals For, GA: Goals Against, GD: Goal Difference, Pts: Points</span>
              </div>
            </div>
          </motion.div>
          )}

          {/* Teams Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display font-bold text-2xl text-foreground mb-6">
              V.League 1 Teams
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {teams.map((team, index) => (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <div className="glass-card rounded-xl p-4 hover:bg-slate-100 dark:bg-white/5 transition-colors cursor-pointer">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-3">
                      <span className="font-display font-bold text-lg text-foreground">
                        {team.name.charAt(0)}
                      </span>
                    </div>
                    <h4 className="font-body font-medium text-sm text-foreground truncate">
                      {team.name}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-[#A8A29E]">{team.league}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}
