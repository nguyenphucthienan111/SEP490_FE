import { motion } from 'framer-motion';
import { Trophy, Calendar, Users, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { leagues, teams } from '@/data/mockData';
import { cn } from '@/lib/utils';
import React from 'react';
import { leagueService, League, Team, Standing } from '@/services/leagueService';
import { toast } from 'sonner';

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
  const [apiLeagues, setApiLeagues] = React.useState<League[]>([]);
  const [apiTeams, setApiTeams] = React.useState<Team[]>([]);
  const [apiStandings, setApiStandings] = React.useState<Standing[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedSeason] = React.useState(13); // Season 13 = 2024

  React.useEffect(() => {
    // Fetch leagues and teams on mount
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Fetch leagues
      const leagues = await leagueService.getLeagues();
      setApiLeagues(leagues);
      
      // Find V.League 1 (leagueId: 1 based on the API response)
      const vLeague1 = leagues.find(l => l.leagueId === 1);
      if (vLeague1) {
        // Fetch teams for V.League 1
        const teams = await leagueService.getTeams(vLeague1.leagueId);
        setApiTeams(teams);
        
        // Fetch standings for V.League 1
        try {
          const standings = await leagueService.getStandings(vLeague1.leagueId, selectedSeason);
          setApiStandings(standings);
        } catch (error) {
          console.error('Failed to load standings:', error);
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Không thể tải dữ liệu');
    } finally {
      setIsLoading(false);
    }
  };

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
            <div>
              <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-slate-900 dark:text-foreground mb-3">
                Giải đấu Việt Nam
              </h1>
              <p className="text-slate-600 dark:text-[#A8A29E] text-lg max-w-2xl">
                Thông tin đầy đủ về các giải đấu bóng đá Việt Nam
              </p>
            </div>
          </motion.div>

          {/* Leagues Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12 mb-16">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-[#00D9FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-600 dark:text-[#A8A29E]">Đang tải dữ liệu...</p>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {(apiLeagues.length > 0 ? apiLeagues : leagues).map((league, index) => {
              const isApiLeague = 'leagueId' in league;
              const leagueId = isApiLeague ? `api-${league.leagueId}` : league.id;
              const isSelected = selectedLeague === leagueId || (selectedLeague === 'l1' && isApiLeague && league.leagueId === 1);
              
              return (
                <motion.div
                  key={leagueId}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div 
                    onClick={() => handleLeagueClick(isApiLeague && league.leagueId === 1 ? 'l1' : leagueId)}
                    className={cn(
                      "group glass-card rounded-2xl p-8 hover:translate-y-[-4px] hover:shadow-xl transition-all duration-300 cursor-pointer h-full",
                      isSelected 
                        ? "border-2 border-[#FF4444] bg-red-50 dark:bg-red-500/10 shadow-lg shadow-[#FF4444]/20" 
                        : "border border-transparent hover:border-[#FF4444]/20"
                    )}
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center transition-all overflow-hidden",
                        isSelected
                          ? "bg-gradient-to-br from-[#FF4444] to-[#FF6666] shadow-lg shadow-[#FF4444]/30"
                          : "bg-gradient-to-br from-red-200 dark:from-[#FF4444]/20 to-blue-200 dark:to-[#00D9FF]/20"
                      )}>
                        {isApiLeague && league.logoUrl ? (
                          <img src={league.logoUrl} alt={league.leagueName} className="w-12 h-12 object-contain" />
                        ) : (
                          <Trophy className={cn(
                            "w-8 h-8 transition-colors",
                            isSelected ? "text-white" : "text-[#FF4444]"
                          )} />
                        )}
                      </div>
                      <span className="px-4 py-1.5 rounded-full bg-blue-100 dark:bg-[#00D9FF]/10 text-[#00D9FF] text-sm font-label font-semibold">
                        {isApiLeague ? '2024' : league.season}
                      </span>
                    </div>

                    <h3 className={cn(
                      "font-display font-bold text-2xl mb-2 transition-colors",
                      isSelected 
                        ? "text-[#FF4444]" 
                        : "text-slate-900 dark:text-foreground group-hover:text-[#FF4444]"
                    )}>
                      {isApiLeague ? league.leagueName : league.name}
                    </h3>
                    <p className="text-slate-600 dark:text-[#A8A29E] mb-6">
                      {isApiLeague ? (league.country || 'Vietnam') : league.country}
                    </p>

                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-200 dark:border-white/5">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="w-4 h-4 text-slate-600 dark:text-[#A8A29E]" />
                          <span className="font-mono-data text-xl font-bold text-slate-900 dark:text-foreground">
                            {isApiLeague ? (league.teams?.length || 0) : league.teamCount}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-[#A8A29E]">Đội</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="w-4 h-4 text-slate-600 dark:text-[#A8A29E]" />
                          <span className="font-mono-data text-xl font-bold text-slate-900 dark:text-foreground">
                            {isApiLeague ? '-' : league.matchesPlayed}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-[#A8A29E]">Trận đấu</p>
                      </div>
                    </div>

                    {isSelected && (isApiLeague && league.leagueId === 1 || leagueId === 'l1') && (
                      <div className="mt-6 flex items-center justify-center gap-2 px-4 py-2 bg-[#FF4444] text-white rounded-lg font-label font-semibold text-sm">
                        <span>Đang xem bảng xếp hạng</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                    {isSelected && !(isApiLeague && league.leagueId === 1 || leagueId === 'l1') && (
                      <div className="mt-6 flex items-center justify-center gap-2 px-4 py-2 bg-slate-400 text-white rounded-lg font-label font-semibold text-sm">
                        <span>Chưa có dữ liệu</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
            </div>
          )}

          {/* V.League 1 Standings */}
          {selectedLeague === 'l1' && (
            <motion.div
              id="standings-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-16"
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
                      Bảng xếp hạng V.League 1
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-[#A8A29E] font-medium">
                      Xếp hạng và thành tích các đội
                    </p>
                  </div>
                </div>
                <span className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-[#00D9FF] text-white text-base font-label font-bold shadow-lg">
                  2024
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-slate-300 dark:border-white/10">
                      <th className="text-left py-4 px-3 font-label text-xs text-slate-700 dark:text-[#A8A29E] uppercase tracking-wider font-bold">POS</th>
                      <th className="text-left py-4 px-3 font-label text-xs text-slate-700 dark:text-[#A8A29E] uppercase tracking-wider font-bold">TEAM</th>
                      <th className="text-center py-4 px-3 font-label text-xs text-slate-700 dark:text-[#A8A29E] uppercase tracking-wider font-bold">P</th>
                      <th className="text-center py-4 px-3 font-label text-xs text-slate-700 dark:text-[#A8A29E] uppercase tracking-wider font-bold">W</th>
                      <th className="text-center py-4 px-3 font-label text-xs text-slate-700 dark:text-[#A8A29E] uppercase tracking-wider font-bold">D</th>
                      <th className="text-center py-4 px-3 font-label text-xs text-slate-700 dark:text-[#A8A29E] uppercase tracking-wider font-bold">L</th>
                      <th className="text-center py-4 px-3 font-label text-xs text-slate-700 dark:text-[#A8A29E] uppercase tracking-wider font-bold">GF</th>
                      <th className="text-center py-4 px-3 font-label text-xs text-slate-700 dark:text-[#A8A29E] uppercase tracking-wider font-bold">GA</th>
                      <th className="text-center py-4 px-3 font-label text-xs text-slate-700 dark:text-[#A8A29E] uppercase tracking-wider font-bold">GD</th>
                      <th className="text-center py-4 px-3 font-label text-xs text-slate-700 dark:text-[#A8A29E] uppercase tracking-wider font-bold">PTS</th>
                      <th className="text-center py-4 px-3 font-label text-xs text-slate-700 dark:text-[#A8A29E] uppercase tracking-wider font-bold">FORM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(apiStandings.length > 0 ? apiStandings : apiTeams.length > 0 ? [...apiTeams].sort((a, b) => a.teamId - b.teamId) : standings).map((item, index) => {
                      const isApiStanding = 'standingId' in item;
                      const isApiTeam = !isApiStanding && 'teamId' in item;
                      
                      const position = isApiStanding ? (item as Standing).rank : isApiTeam ? (index + 1) : (item as any).position;
                      const teamName = isApiStanding ? (item as Standing).team.teamName : isApiTeam ? (item as Team).teamName : (item as any).team;
                      const teamLogo = isApiStanding ? (item as Standing).team.logoUrl : isApiTeam ? (item as Team).logoUrl : null;
                      const teamId = isApiStanding ? (item as Standing).team.teamId : isApiTeam ? (item as Team).teamId : null;
                      
                      const played = isApiStanding ? (item as Standing).played : isApiTeam ? 0 : (item as any).played;
                      const won = isApiStanding ? (item as Standing).win : isApiTeam ? 0 : (item as any).won;
                      const drawn = isApiStanding ? (item as Standing).draw : isApiTeam ? 0 : (item as any).drawn;
                      const lost = isApiStanding ? (item as Standing).loss : isApiTeam ? 0 : (item as any).lost;
                      const goalsFor = isApiStanding ? (item as Standing).goalsFor : isApiTeam ? 0 : (item as any).goalsFor;
                      const goalsAgainst = isApiStanding ? (item as Standing).goalsAgainst : isApiTeam ? 0 : (item as any).goalsAgainst;
                      const goalDifference = isApiStanding ? (item as Standing).goalDifference : isApiTeam ? 0 : (item as any).goalDifference;
                      const points = isApiStanding ? (item as Standing).points : isApiTeam ? 0 : (item as any).points;
                      const form = isApiStanding ? (item as Standing).form.split('') : isApiTeam ? [] : (item as any).form;
                      
                      const totalTeams = apiStandings.length > 0 ? apiStandings.length : apiTeams.length > 0 ? apiTeams.length : standings.length;
                      const isTopThree = position <= 3;
                      const isRelegation = position > (totalTeams - 3);

                      return (
                        <motion.tr
                          key={isApiStanding ? (item as Standing).standingId : isApiTeam ? (item as Team).teamId : (item as any).position}
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
                                {position}
                              </span>
                              {isTopThree && <TrendingUp className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />}
                              {isRelegation && <TrendingDown className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <Link 
                              to={teamId ? `/teams/${teamId}` : `/teams/${teams.find(t => t.name === teamName)?.id || ''}`}
                              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                            >
                              {teamLogo ? (
                                <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center border border-slate-300 dark:border-white/10">
                                  <img src={teamLogo} alt={teamName} className="w-7 h-7 object-contain" />
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-white/5 flex items-center justify-center text-xs font-display font-bold text-slate-900 dark:text-foreground border border-slate-300 dark:border-white/10">
                                  {teamName.charAt(0)}
                                </div>
                              )}
                              <span className="font-body font-semibold text-sm text-slate-900 dark:text-foreground hover:text-[#00D9FF] transition-colors">
                                {teamName}
                              </span>
                            </Link>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="font-mono-data text-sm text-slate-700 dark:text-slate-400">
                              {played}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="font-mono-data text-sm text-slate-700 dark:text-slate-400">
                              {won}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="font-mono-data text-sm text-slate-700 dark:text-slate-400">
                              {drawn}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="font-mono-data text-sm text-slate-700 dark:text-slate-400">
                              {lost}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="font-mono-data text-sm text-slate-700 dark:text-slate-400">
                              {goalsFor}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="font-mono-data text-sm text-slate-700 dark:text-slate-400">
                              {goalsAgainst}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className={cn(
                              "font-mono-data text-sm font-semibold",
                              goalDifference > 0 ? "text-green-600 dark:text-green-400" : 
                              goalDifference < 0 ? "text-red-600 dark:text-red-400" : 
                              "text-slate-700 dark:text-slate-400"
                            )}>
                              {(goalDifference > 0 ? '+' : '') + goalDifference}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="font-mono-data text-sm font-bold text-slate-900 dark:text-foreground">
                              {points}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center justify-center gap-1">
                              {form.length > 0 ? (
                                form.map((result: string, i: number) => (
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
                                ))
                              ) : (
                                <span className="text-xs text-slate-400 dark:text-slate-500">-</span>
                              )}
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
                  <span>Khu vực xuống hạng</span>
                </div>
                <span>•</span>
                <span>P: Played, W: Won, D: Drawn, L: Lost, GF: Goals For, GA: Goals Against, GD: Goal Difference, PTS: Points</span>
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-2xl text-foreground">
                V.League 1 Teams {apiTeams.length > 0 && `(${apiTeams.length})`}
              </h2>
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-[#FF4444] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (apiTeams && apiTeams.length > 0) ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {apiTeams.map((team, index) => (
                  <motion.div
                    key={team.teamId}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Link to={`/teams/${team.teamId}`}>
                      <div className="glass-card rounded-xl p-4 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-3 overflow-hidden">
                          {team.logoUrl ? (
                            <img src={team.logoUrl} alt={team.teamName} className="w-10 h-10 object-contain" />
                          ) : (
                            <span className="font-display font-bold text-lg text-foreground">
                              {team.teamName.charAt(0)}
                            </span>
                          )}
                        </div>
                        <h4 className="font-body font-medium text-sm text-foreground truncate" title={team.teamName}>
                          {team.teamName}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-[#A8A29E]">
                          V.League 1
                        </p>
                        {team.founded && (
                          <p className="text-xs text-slate-500 dark:text-[#A8A29E] mt-1">
                            Thành lập: {team.founded}
                          </p>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {teams && teams.map((team, index) => (
                  <motion.div
                    key={team.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <div className="glass-card rounded-xl p-4 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer">
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
            )}
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}
