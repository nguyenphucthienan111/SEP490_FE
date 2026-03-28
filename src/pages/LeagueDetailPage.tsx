import { motion } from 'framer-motion';
import { Trophy, ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import React from 'react';
import { leagueService, SofascoreLeague, Team, SofascoreTeamMatch } from '@/services/leagueService';
import { cn } from '@/lib/utils';

const SEASONS: Record<number, { label: string; seasonId: number; cupTreeId?: number }[]> = {
  626: [
    { label: '2022',  seasonId: 40370 },
    { label: '2023',  seasonId: 48065 },
    { label: '23/24', seasonId: 55929 },
    { label: '24/25', seasonId: 65000 },
    { label: '25/26', seasonId: 78589 },
  ],
  771: [
    { label: '2022',  seasonId: 40372 },
    { label: '2023',  seasonId: 49233 },
    { label: '23/24', seasonId: 55936 },
    { label: '24/25', seasonId: 66978 },
    { label: '25/26', seasonId: 80926 },
  ],
  3087: [
    { label: '2022',  seasonId: 40371,  cupTreeId: 25925    },
    { label: '2023',  seasonId: 49235,  cupTreeId: 30719    },
    { label: '23/24', seasonId: 55819,  cupTreeId: 1559115  },
    { label: '24/25', seasonId: 66925,  cupTreeId: 10823415 },
    { label: '25/26', seasonId: 81023,  cupTreeId: 10832297 },
  ],
};

const HAS_STANDINGS: Record<number, boolean> = { 626: true, 771: true, 3087: false };

interface TeamCard {
  sofaId: number;
  dbTeamId?: number;
  name: string;
  logo: string;
  position?: number;
}

export default function LeagueDetailPage() {
  const { leagueId } = useParams<{ leagueId: string }>();
  const tournamentId = Number(leagueId);
  const seasons = SEASONS[tournamentId] ?? [];
  const hasStandings = HAS_STANDINGS[tournamentId] ?? true;

  const [selectedSeasonIdx, setSelectedSeasonIdx] = React.useState(seasons.length - 1);
  const selectedSeason = seasons[selectedSeasonIdx];
  const [activeTab, setActiveTab] = React.useState<'standings' | 'teams'>('standings');

  const [league, setLeague] = React.useState<SofascoreLeague | null>(null);
  const [dbTeams, setDbTeams] = React.useState<Team[]>([]);
  const [teams, setTeams] = React.useState<TeamCard[]>([]);
  const [standingsRows, setStandingsRows] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [teamsLoading, setTeamsLoading] = React.useState(false);
  const [standingsLoading, setStandingsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Load league info + DB teams once
  React.useEffect(() => {
    if (!tournamentId || seasons.length === 0) return;
    Promise.all([
      leagueService.getLeagues(),          // DB — fast
      loadDbTeams(),
    ])
      .then(([leagues, allDbTeams]) => {
        // Map DB league to SofascoreLeague shape for header display
        const dbLeague = leagues.find(l => l.apiLeagueId === tournamentId);
        if (dbLeague) {
          setLeague({
            name: dbLeague.leagueName,
            uniqueTournamentId: tournamentId,
            currentSeasonId: selectedSeason?.seasonId ?? 0,
            seasonName: '',
            url: '',
            logoUrl: dbLeague.logoUrl || `https://api.sofascore.app/api/v1/unique-tournament/${tournamentId}/image/dark`,
          });
        }
        setDbTeams(allDbTeams);
        if (hasStandings && selectedSeason) {
          setStandingsLoading(true);
          leagueService.getHybridStandings(tournamentId, selectedSeason.seasonId)
            .then(rows => setStandingsRows(rows))
            .catch(() => setStandingsRows([]))
            .finally(() => setStandingsLoading(false));
        }
        if (!hasStandings && selectedSeason) {
          setTeamsLoading(true);
          loadTeams(selectedSeason.seasonId, allDbTeams).finally(() => setTeamsLoading(false));
        }
      })
      .catch(() => setError('Không thể tải dữ liệu giải đấu'))
      .finally(() => setLoading(false));
  }, [tournamentId]);

  async function loadDbTeams(): Promise<Team[]> {
    try {
      // Always fetch fresh to ensure apiTeamId is up to date
      const data = await leagueService.getTeams();
      localStorage.setItem('teams', JSON.stringify(data));
      return data;
    } catch {
      // Fallback to cache
      try {
        const cached = localStorage.getItem('teams');
        if (cached) return JSON.parse(cached);
      } catch { }
      return [];
    }
  }

  const getDbTeamId = (sofaId: number, teams: Team[] = dbTeams) =>
    teams.find(t => t.apiTeamId === sofaId)?.teamId;

  // Reload when season changes (after initial load)
  React.useEffect(() => {
    if (!selectedSeason || !dbTeams.length) return;
    if (hasStandings) {
      setStandingsLoading(true);
      leagueService.getHybridStandings(tournamentId, selectedSeason.seasonId)
        .then(rows => setStandingsRows(rows))
        .catch(() => setStandingsRows([]))
        .finally(() => setStandingsLoading(false));
    } else {
      setTeamsLoading(true);
      loadTeams(selectedSeason.seasonId, dbTeams).finally(() => setTeamsLoading(false));
    }
  }, [selectedSeasonIdx]);

  // Reload teams tab when switching to it
  React.useEffect(() => {
    if (activeTab !== 'teams' || !selectedSeason || !dbTeams.length) return;
    setTeamsLoading(true);
    loadTeams(selectedSeason.seasonId, dbTeams).finally(() => setTeamsLoading(false));
  }, [activeTab]);

  async function loadTeams(seasonId: number, allDbTeams: Team[] = dbTeams) {
    setTeams([]);
    if (hasStandings) {
      const rows = await leagueService.getHybridStandings(tournamentId, seasonId);
      setTeams(rows.map(r => ({
        sofaId: r.team.id,
        dbTeamId: r.team.dbTeamId || getDbTeamId(r.team.id, allDbTeams),
        name: r.team.name,
        logo: r.team.logo,
        position: r.position,
      })));
    } else {
      const teamMap = new Map<number, TeamCard>();
      const addTeams = (matches: SofascoreTeamMatch[]) => {
        matches.forEach(m => {
          [m.homeTeam, m.awayTeam].forEach(t => {
            if (!teamMap.has(t.id)) teamMap.set(t.id, {
              sofaId: t.id,
              dbTeamId: getDbTeamId(t.id, allDbTeams),
              name: t.name,
              logo: `https://api.sofascore.app/api/v1/team/${t.id}/image`,
            });
          });
        });
      };
      for (let page = 0; page <= 5; page++) {
        try {
          const res = await leagueService.getTournamentLastMatches(tournamentId, seasonId, page);
          if (!res.events.length) break;
          addTeams(res.events);
          if (!res.hasNextPage) break;
        } catch { break; }
      }
      setTeams(Array.from(teamMap.values()).sort((a, b) => a.name.localeCompare(b.name)));
    }
  }

  const cardClass = "block glass-card rounded-xl p-4 hover:bg-slate-100 dark:hover:bg-white/5 hover:translate-y-[-2px] transition-all duration-200 border border-transparent hover:border-[#FF4444]/20";

  return (
    <MainLayout>
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <Link to="/leagues" className="inline-flex items-center gap-2 text-slate-500 dark:text-[#A8A29E] hover:text-[#FF4444] transition-colors mb-8 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            Quay lại giải đấu
          </Link>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-12 h-12 border-4 border-[#FF4444] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-500 dark:text-[#A8A29E]">
              <Trophy className="w-12 h-12 mb-3 opacity-30" />
              <p>{error}</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-100 dark:from-[#FF4444]/20 to-blue-100 dark:to-[#00D9FF]/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {league?.logoUrl
                    ? <img src={league.logoUrl} alt={league.name} className="w-14 h-14 object-contain" />
                    : <Trophy className="w-10 h-10 text-[#FF4444]" />}
                </div>
                <div className="flex-1">
                  <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-foreground mb-1">
                    {league?.name ?? 'Giải đấu'}
                  </h1>
                  <span className="text-slate-500 dark:text-[#A8A29E] text-sm">
                    Vietnam{!hasStandings && ' · Knockout'}
                  </span>
                </div>
              </motion.div>

              {/* Season selector */}
              {seasons.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-8">
                  {seasons.map((s, idx) => (
                    <button key={s.seasonId} onClick={() => setSelectedSeasonIdx(idx)}
                      className={cn("px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                        idx === selectedSeasonIdx
                          ? "bg-[#FF4444] text-white"
                          : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-[#A8A29E] hover:bg-slate-200 dark:hover:bg-white/10"
                      )}>
                      Mùa {s.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Tabs */}
              {hasStandings && (
                <div className="flex gap-1 mb-6 border-b border-slate-200 dark:border-white/10">
                  {(['standings', 'teams'] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      className={cn("px-5 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px",
                        activeTab === tab
                          ? "border-[#FF4444] text-[#FF4444]"
                          : "border-transparent text-slate-500 dark:text-[#A8A29E] hover:text-slate-900 dark:hover:text-foreground"
                      )}>
                      {tab === 'standings' ? 'Bảng xếp hạng' : 'Đội tham dự'}
                    </button>
                  ))}
                </div>
              )}

              {/* Cup Bracket */}
              {!hasStandings && selectedSeason?.cupTreeId && (
                <div className="mb-10">
                  <h2 className="font-display font-bold text-xl text-slate-900 dark:text-foreground mb-4">Bracket</h2>

                  {/* Round labels as a step indicator */}
                  <div className="flex items-center gap-1 mb-4 flex-wrap">
                    {[
                      { label: 'Vòng 1/8', color: 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-[#A8A29E] border-slate-200 dark:border-white/10' },
                      { label: 'Tứ kết',   color: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20' },
                      { label: 'Bán kết',  color: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/20' },
                      { label: 'Chung kết',color: 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' },
                    ].map(({ label, color }, i, arr) => (
                      <React.Fragment key={label}>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${color}`}>
                          {label}
                        </span>
                        {i < arr.length - 1 && (
                          <span className="text-slate-500 dark:text-slate-400 text-sm font-bold">→</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden" style={{ height: 740 }}>
                    <iframe
                      src={`https://widgets.sofascore.com/embed/unique-tournament/${tournamentId}/season/${selectedSeason.seasonId}/cuptree/${selectedSeason.cupTreeId}?widgetTitle=Vietnam+Cup+${encodeURIComponent(selectedSeason.label)}&showCompetitionLogo=true&widgetTheme=light`}
                      style={{ width: '100%', display: 'block', border: 0, minHeight: 872 }}
                      title="Vietnam Cup Bracket"
                    />
                  </div>
                </div>
              )}

              {/* Standings */}
              {hasStandings && activeTab === 'standings' && (
                <div className="glass-card rounded-2xl p-4 sm:p-6">
                  {standingsLoading ? (
                    <div className="flex items-center justify-center py-16">
                      <div className="w-10 h-10 border-4 border-[#FF4444] border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : standingsRows.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-500 dark:text-[#A8A29E]">
                      <Trophy className="w-12 h-12 mb-3 opacity-30" />
                      <p>Chưa có dữ liệu bảng xếp hạng</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b-2 border-slate-300 dark:border-white/10">
                            {['POS', 'ĐỘI', 'P', 'W', 'D', 'L', 'GF', 'GA', 'GD', 'PTS'].map(h => (
                              <th key={h} className={cn("py-4 px-3 font-label text-xs text-slate-700 dark:text-[#A8A29E] uppercase tracking-wider font-bold", h === 'ĐỘI' ? 'text-left' : 'text-center')}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {standingsRows.map((row, index) => {
                            const total = standingsRows.length;
                            const isTop = row.position <= 3;
                            const isRel = row.position > total - 2;
                            const gd = row.scoresFor - row.scoresAgainst;
                            const dbId = getDbTeamId(row.team.id, dbTeams);
                            return (
                              <motion.tr key={row.id}
                                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.25, delay: index * 0.025 }}
                                className={cn("border-b border-slate-200 dark:border-white/5 transition-colors",
                                  isTop && "bg-green-50 dark:bg-green-500/5 hover:bg-green-100 dark:hover:bg-green-500/10",
                                  isRel && "bg-red-50 dark:bg-red-500/5 hover:bg-red-100 dark:hover:bg-red-500/10",
                                  !isTop && !isRel && "hover:bg-slate-50 dark:hover:bg-white/5"
                                )}>
                                <td className="py-3 px-3">
                                  <div className="flex items-center gap-1.5">
                                    <span className={cn("font-mono-data font-bold text-sm",
                                      isTop && "text-green-600 dark:text-green-400",
                                      isRel && "text-red-600 dark:text-red-400",
                                      !isTop && !isRel && "text-slate-700 dark:text-slate-400"
                                    )}>{row.position}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-3">
                                  {(() => {
                                    const logo = row.team.logo
                                      ? <img src={row.team.logo} alt={row.team.name} className="w-7 h-7 object-contain rounded" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                      : <div className="w-7 h-7 rounded bg-slate-200 dark:bg-white/10 flex items-center justify-center text-xs font-bold">{row.team.name.charAt(0)}</div>;
                                    const nameEl = <span className="font-body font-semibold text-sm text-slate-900 dark:text-foreground hover:text-[#00D9FF] transition-colors">{row.team.name}</span>;
                                    return dbId ? (
                                      <Link to={`/teams/${dbId}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                                        {logo}{nameEl}
                                      </Link>
                                    ) : (
                                      <a href={`https://www.sofascore.com/team/football/${row.team.name.toLowerCase().replace(/\s+/g, '-')}/${row.team.id}`}
                                        target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                                        {logo}{nameEl}
                                      </a>
                                    );
                                  })()}
                                </td>
                                {[row.matches, row.wins, row.draws, row.losses, row.scoresFor, row.scoresAgainst].map((val, i) => (
                                  <td key={i} className="py-3 px-3 text-center">
                                    <span className="font-mono-data text-sm text-slate-700 dark:text-slate-400">{val}</span>
                                  </td>
                                ))}
                                <td className="py-3 px-3 text-center">
                                  <span className={cn("font-mono-data text-sm font-semibold",
                                    gd > 0 ? "text-green-600 dark:text-green-400" : gd < 0 ? "text-red-600 dark:text-red-400" : "text-slate-700 dark:text-slate-400"
                                  )}>{gd > 0 ? '+' : ''}{gd}</span>
                                </td>
                                <td className="py-3 px-3 text-center">
                                  <span className="font-mono-data text-sm font-bold text-slate-900 dark:text-foreground">{row.points}</span>
                                </td>
                              </motion.tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Teams Grid */}
              {(!hasStandings || activeTab === 'teams') && (
                <div>
                  <h2 className="font-display font-bold text-xl text-slate-900 dark:text-foreground mb-6">
                    Các đội tham dự {!teamsLoading && teams.length > 0 && `(${teams.length})`}
                  </h2>
                  {teamsLoading ? (
                    <div className="flex items-center justify-center py-16">
                      <div className="w-8 h-8 border-4 border-[#FF4444] border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : teams.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-500 dark:text-[#A8A29E]">
                      <Trophy className="w-12 h-12 mb-3 opacity-30" />
                      <p>Chưa có dữ liệu đội bóng</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {teams.map((team, index) => {
                        const inner = (
                          <>
                            <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-3 mx-auto overflow-hidden">
                              {team.logo
                                ? <img src={team.logo} alt={team.name} className="w-11 h-11 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                : <span className="font-display font-bold text-xl text-foreground">{team.name.charAt(0)}</span>
                              }
                            </div>
                            <h4 className="font-body font-semibold text-sm text-center text-slate-900 dark:text-foreground truncate" title={team.name}>{team.name}</h4>
                            {team.position && <p className="text-xs text-center text-slate-500 dark:text-[#A8A29E] mt-0.5">#{team.position}</p>}
                          </>
                        );
                        return (
                          <motion.div key={team.sofaId} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: index * 0.04 }}>
                            {team.dbTeamId
                              ? <Link to={`/teams/${team.dbTeamId}`} className={cardClass}>{inner}</Link>
                              : <a href={`https://www.sofascore.com/team/football/${team.name.toLowerCase().replace(/\s+/g, '-')}/${team.sofaId}`} target="_blank" rel="noopener noreferrer" className={cardClass}>{inner}</a>
                            }
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
