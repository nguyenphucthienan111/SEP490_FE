import { motion } from 'framer-motion';
import { Trophy, Calendar, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { leagues, teams } from '@/data/mockData';
import { cn } from '@/lib/utils';
import React from 'react';
import { leagueService, League, Team, SofascoreStandingRow } from '@/services/leagueService';
import { FormCell } from '@/components/standings/FormCell';
import { toast } from 'sonner';

const VIETNAM_LEAGUES = [
  { name: 'V-League 1', tournamentId: 626, seasonId: 78589, season: '25/26' },
  { name: 'V-League 2', tournamentId: 771, seasonId: 80926, season: '25/26' },
];

export default function LeaguesPage() {
  const [apiLeagues, setApiLeagues] = React.useState<League[]>([]);
  const [apiTeams, setApiTeams] = React.useState<Team[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Standings state
  const [activeStandingsIndex, setActiveStandingsIndex] = React.useState(0);
  const [standingsData, setStandingsData] = React.useState<Record<number, SofascoreStandingRow[]>>({});
  const [standingsLoading, setStandingsLoading] = React.useState(false);
  const [standingsError, setStandingsError] = React.useState<string | null>(null);

  const activeLeague = VIETNAM_LEAGUES[activeStandingsIndex];

  React.useEffect(() => {
    loadData();
  }, []);

  // Load standings when tab changes
  React.useEffect(() => {
    const { tournamentId, seasonId } = activeLeague;
    if (standingsData[tournamentId]) return; // already cached
    setStandingsLoading(true);
    setStandingsError(null);
    leagueService
      .getSofascoreStandings(tournamentId, seasonId)
      .then((rows) => setStandingsData((prev) => ({ ...prev, [tournamentId]: rows })))
      .catch(() => setStandingsError('Không thể tải bảng xếp hạng'))
      .finally(() => setStandingsLoading(false));
  }, [activeStandingsIndex]);

  const currentRows = standingsData[activeLeague.tournamentId] ?? [];

  const loadData = async () => {
    setIsLoading(true);
    try {
      const leagues = await leagueService.getLeagues();
      setApiLeagues(leagues);
      const vLeague1 = leagues.find(l => l.leagueId === 1);
      if (vLeague1) {
        const teams = await leagueService.getTeams(vLeague1.leagueId);
        setApiTeams(teams);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Không thể tải dữ liệu');
    } finally {
      setIsLoading(false);
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
              
              return (
                <motion.div
                  key={leagueId}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="group glass-card rounded-2xl p-8 hover:translate-y-[-4px] hover:shadow-xl transition-all duration-300 h-full border border-transparent hover:border-[#FF4444]/20">
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all overflow-hidden bg-gradient-to-br from-red-200 dark:from-[#FF4444]/20 to-blue-200 dark:to-[#00D9FF]/20">
                        {isApiLeague && league.logoUrl ? (
                          <img src={league.logoUrl} alt={league.leagueName} className="w-12 h-12 object-contain" />
                        ) : (
                          <Trophy className="w-8 h-8 text-[#FF4444]" />
                        )}
                      </div>
                      <span className="px-4 py-1.5 rounded-full bg-blue-100 dark:bg-[#00D9FF]/10 text-[#00D9FF] text-sm font-label font-semibold">
                        {isApiLeague ? '25/26' : league.season}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-2xl mb-2 text-slate-900 dark:text-foreground group-hover:text-[#FF4444] transition-colors">
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
                  </div>
                </motion.div>
              );
            })}
            </div>
          )}

          {/* Standings Section */}
          <motion.div
            id="standings-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <div className="glass-card rounded-2xl p-6 sm:p-8 border-2 border-[#FF4444]/20 dark:border-[#FF4444]/30">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-5 border-b-2 border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF4444] to-[#FF6666] flex items-center justify-center shadow-lg shadow-[#FF4444]/30">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-display font-extrabold text-2xl text-slate-900 dark:text-foreground">
                      Bảng xếp hạng
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-[#A8A29E]">Mùa giải 25/26</p>
                  </div>
                </div>
                <span className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-500 to-[#00D9FF] text-white text-sm font-bold shadow">
                  25/26
                </span>
              </div>

              {/* League Tabs */}
              <div className="flex gap-1 mb-6 border-b border-slate-200 dark:border-white/10">
                {VIETNAM_LEAGUES.map((league, index) => (
                  <button
                    key={league.tournamentId}
                    onClick={() => setActiveStandingsIndex(index)}
                    className={cn(
                      'px-4 py-2.5 text-sm font-semibold transition-colors relative whitespace-nowrap',
                      activeStandingsIndex === index
                        ? 'text-[#FF4444]'
                        : 'text-slate-500 dark:text-[#A8A29E] hover:text-slate-900 dark:hover:text-foreground'
                    )}
                  >
                    {league.name}
                    {activeStandingsIndex === index && (
                      <motion.div
                        layoutId="standings-tab-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF4444]"
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Table Content */}
              {standingsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-10 h-10 border-4 border-[#FF4444] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : standingsError || currentRows.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-500 dark:text-[#A8A29E]">
                  <Trophy className="w-12 h-12 mb-3 opacity-30" />
                  <p>{standingsError || 'Chưa có dữ liệu bảng xếp hạng'}</p>
                </div>
              ) : (
                <motion.div
                  key={activeLeague.tournamentId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-slate-300 dark:border-white/10">
                          {['POS', 'ĐỘI', 'P', 'W', 'D', 'L', 'GF', 'GA', 'GD', 'PTS', 'LAST 5'].map((h) => (
                            <th
                              key={h}
                              className={cn(
                                'py-4 px-3 font-label text-xs text-slate-700 dark:text-[#A8A29E] uppercase tracking-wider font-bold',
                                h === 'ĐỘI' ? 'text-left' : 'text-center'
                              )}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {currentRows.map((row, index) => {
                          const total = currentRows.length;
                          const isTop = row.position <= 3;
                          const isRel = row.position > total - 2;
                          const gd = row.scoresFor - row.scoresAgainst;
                          return (
                            <motion.tr
                              key={row.id}
                              initial={{ opacity: 0, x: -16 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.25, delay: index * 0.025 }}
                              className={cn(
                                'border-b border-slate-200 dark:border-white/5 transition-colors',
                                isTop && 'bg-green-50 dark:bg-green-500/5 hover:bg-green-100 dark:hover:bg-green-500/10',
                                isRel && 'bg-red-50 dark:bg-red-500/5 hover:bg-red-100 dark:hover:bg-red-500/10',
                                !isTop && !isRel && 'hover:bg-slate-50 dark:hover:bg-white/5'
                              )}
                            >
                              <td className="py-3 px-3">
                                <div className="flex items-center gap-1.5">
                                  <span className={cn(
                                    'font-mono-data font-bold text-sm',
                                    isTop && 'text-green-600 dark:text-green-400',
                                    isRel && 'text-red-600 dark:text-red-400',
                                    !isTop && !isRel && 'text-slate-700 dark:text-slate-400'
                                  )}>
                                    {row.position}
                                  </span>
                                  {isTop && <TrendingUp className="w-3.5 h-3.5 text-green-500" />}
                                  {isRel && <TrendingDown className="w-3.5 h-3.5 text-red-500" />}
                                </div>
                              </td>
                              <td className="py-3 px-3">
                                <div className="flex items-center gap-2">
                                  {row.team.logo ? (
                                    <img src={row.team.logo} alt={row.team.name} className="w-7 h-7 object-contain rounded"
                                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                  ) : (
                                    <div className="w-7 h-7 rounded bg-slate-200 dark:bg-white/10 flex items-center justify-center text-xs font-bold">
                                      {row.team.name.charAt(0)}
                                    </div>
                                  )}
                                  <span className="font-body font-semibold text-sm text-slate-900 dark:text-foreground">
                                    {row.team.name}
                                  </span>
                                </div>
                              </td>
                              {[row.matches, row.wins, row.draws, row.losses, row.scoresFor, row.scoresAgainst].map((val, i) => (
                                <td key={i} className="py-3 px-3 text-center">
                                  <span className="font-mono-data text-sm text-slate-700 dark:text-slate-400">{val}</span>
                                </td>
                              ))}
                              <td className="py-3 px-3 text-center">
                                <span className={cn(
                                  'font-mono-data text-sm font-semibold',
                                  gd > 0 ? 'text-green-600 dark:text-green-400' : gd < 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-400'
                                )}>
                                  {gd > 0 ? '+' : ''}{gd}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span className="font-mono-data text-sm font-bold text-slate-900 dark:text-foreground">
                                  {row.points}
                                </span>
                              </td>
                              <td className="py-3 px-3">
                                <FormCell teamId={row.team.id} teamName={row.team.name} />
                              </td>
                            </motion.tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-5 text-xs text-slate-500 dark:text-[#A8A29E]">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                      <span>Thăng hạng / Dự AFC</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                      <span>Xuống hạng</span>
                    </div>
                    <span className="ml-auto">P: Trận | W: Thắng | D: Hòa | L: Thua | GF/GA: Bàn thắng/thua | GD: Hiệu số | PTS: Điểm</span>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

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
