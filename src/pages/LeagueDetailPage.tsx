import { motion } from 'framer-motion';
import { Trophy, ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import React from 'react';
import { leagueService, SofascoreLeague, SofascoreTeamMatch } from '@/services/leagueService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StandingsTable } from '@/components/standings/StandingsTable';

// Season IDs per tournament per year
const SEASONS: Record<number, { label: string; seasonId: number; cupTreeId?: number }[]> = {
  626: [ // V-League 1
    { label: '2022',  seasonId: 40370 },
    { label: '2023',  seasonId: 48065 },
    { label: '23/24', seasonId: 55929 },
    { label: '24/25', seasonId: 65000 },
    { label: '25/26', seasonId: 78589 },
  ],
  771: [ // V-League 2
    { label: '2022',  seasonId: 40372 },
    { label: '2023',  seasonId: 49233 },
    { label: '23/24', seasonId: 55936 },
    { label: '24/25', seasonId: 66978 },
    { label: '25/26', seasonId: 80926 },
  ],
  3087: [ // Vietnam Cup
    { label: '2022',  seasonId: 40371, cupTreeId: 25925    },
    { label: '2023',  seasonId: 49235, cupTreeId: 30719    },
    { label: '23/24', seasonId: 55819, cupTreeId: 1559115  },
    { label: '24/25', seasonId: 66925, cupTreeId: 10823415 },
    { label: '25/26', seasonId: 81023, cupTreeId: 10832297 },
  ],
};

const HAS_STANDINGS: Record<number, boolean> = {
  626: true,
  771: true,
  3087: false,
};

interface TeamCard {
  id: number;
  name: string;
  logo: string;
  position?: number;
}

export default function LeagueDetailPage() {
  const { leagueId } = useParams<{ leagueId: string }>();
  const tournamentId = Number(leagueId);
  const seasons = SEASONS[tournamentId] ?? [];
  const hasStandings = HAS_STANDINGS[tournamentId] ?? true;

  // Default to last season (most recent)
  const [selectedSeasonIdx, setSelectedSeasonIdx] = React.useState(seasons.length - 1);
  const selectedSeason = seasons[selectedSeasonIdx];

  const [activeTab, setActiveTab] = React.useState<'standings' | 'teams'>('standings');

  const [league, setLeague] = React.useState<SofascoreLeague | null>(null);
  const [teams, setTeams] = React.useState<TeamCard[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [teamsLoading, setTeamsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  // Map sofascore team id → internal teamId
  const [sofaToInternal, setSofaToInternal] = React.useState<Map<number, number>>(new Map());

  // Load league info + internal team map once
  React.useEffect(() => {
    if (!tournamentId || seasons.length === 0) return;
    Promise.all([
      leagueService.getVietnameseLeagues(),
      leagueService.getAllTeams().catch(() => [] as any[]),
    ]).then(([leagues, allTeams]) => {
      setLeague(leagues.find((l) => l.uniqueTournamentId === tournamentId) ?? null);
      const map = new Map<number, number>();
      (allTeams as any[]).forEach((t) => {
        // BE may return PascalCase or camelCase
        const sofaId = t.apiTeamId ?? t.ApiTeamId;
        const internalId = t.teamId ?? t.TeamId;
        if (sofaId && internalId) map.set(sofaId, internalId);
      });
      setSofaToInternal(map);
    })
    .catch(() => setError('Không thể tải dữ liệu giải đấu'))
    .finally(() => setLoading(false));
  }, [tournamentId]);

  // Load teams whenever season changes
  React.useEffect(() => {
    if (!selectedSeason) return;
    setTeamsLoading(true);
    loadTeams(selectedSeason.seasonId).finally(() => setTeamsLoading(false));
  }, [selectedSeasonIdx, tournamentId]);

  async function loadTeams(seasonId: number) {
    setTeams([]);
    if (hasStandings) {
      const rows = await leagueService.getSofascoreStandings(tournamentId, seasonId);
      setTeams(rows.map((r) => ({
        id: r.team.id,
        name: r.team.name,
        logo: r.team.logo,
        position: r.position,
      })));
    } else {
      // For cup tournaments: fetch last + next matches to collect all teams
      const teamMap = new Map<number, TeamCard>();
      const addTeams = (matches: SofascoreTeamMatch[]) => {
        matches.forEach((m) => {
          [m.homeTeam, m.awayTeam].forEach((t) => {
            if (!teamMap.has(t.id)) teamMap.set(t.id, { id: t.id, name: t.name, logo: `https://api.sofascore.app/api/v1/team/${t.id}/image` });
          });
        });
      };

      for (let page = 0; page <= 5; page++) {
        try {
          const res = await leagueService.getTournamentLastMatches(tournamentId, seasonId, page);
          const arr = res.events ?? [];
          if (arr.length === 0) break;
          addTeams(arr);
          if (!res.hasNextPage) break;
        } catch { break; }
      }
      for (let page = 0; page <= 5; page++) {
        try {
          const res = await leagueService.getTournamentNextMatches(tournamentId, seasonId, page);
          const arr = res.events ?? [];
          if (arr.length === 0) break;
          addTeams(arr);
          if (!res.hasNextPage) break;
        } catch { break; }
      }
      setTeams(Array.from(teamMap.values()).sort((a, b) => a.name.localeCompare(b.name)));
    }
  }

  return (
    <MainLayout>
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <Link
            to="/leagues"
            className="inline-flex items-center gap-2 text-slate-500 dark:text-[#A8A29E] hover:text-[#FF4444] transition-colors mb-8 text-sm font-medium"
          >
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
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-6 mb-8"
              >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-100 dark:from-[#FF4444]/20 to-blue-100 dark:to-[#00D9FF]/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {league?.logoUrl ? (
                    <img src={league.logoUrl} alt={league.name} className="w-14 h-14 object-contain" />
                  ) : (
                    <Trophy className="w-10 h-10 text-[#FF4444]" />
                  )}
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

              {/* Season Dropdown */}
              {seasons.length > 0 && (
                <div className="mb-8 w-40">
                  <Select
                    value={String(selectedSeasonIdx)}
                    onValueChange={(val) => setSelectedSeasonIdx(Number(val))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn mùa" />
                    </SelectTrigger>
                    <SelectContent>
                      {seasons.map((s, idx) => (
                        <SelectItem key={s.seasonId} value={String(idx)}>
                          Mùa {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Tabs — only for leagues with standings */}
              {hasStandings && (
                <div className="flex gap-1 mb-6 border-b border-slate-200 dark:border-white/10">
                  {(['standings', 'teams'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-5 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                        activeTab === tab
                          ? 'border-[#FF4444] text-[#FF4444]'
                          : 'border-transparent text-slate-500 dark:text-[#A8A29E] hover:text-slate-900 dark:hover:text-foreground'
                      }`}
                    >
                      {tab === 'standings' ? 'Bảng xếp hạng' : 'Đội tham dự'}
                    </button>
                  ))}
                </div>
              )}

              {/* Knockout Bracket — only for Cup */}
              {!hasStandings && selectedSeason?.cupTreeId && (
                <div className="mt-2 mb-10">
                  <h2 className="font-display font-bold text-xl text-slate-900 dark:text-foreground mb-6">
                    Bracket
                  </h2>
                  <div className="rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden" style={{ overflow: 'hidden', height: 740 }}>
                    <iframe
                      src={`https://widgets.sofascore.com/embed/unique-tournament/${tournamentId}/season/${selectedSeason.seasonId}/cuptree/${selectedSeason.cupTreeId}?widgetTitle=Vietnam+Cup+${encodeURIComponent(selectedSeason.label)}&showCompetitionLogo=true&widgetTheme=light`}
                      style={{ width: '100%', display: 'block', border: 0, minHeight: 872 }}
                      title="Vietnam Cup Bracket"
                    />
                  </div>
                </div>
              )}

              {/* Standings Tab */}
              {hasStandings && activeTab === 'standings' && (
                <div className="glass-card rounded-2xl p-4 sm:p-6">
                  <StandingsTable
                    league={{
                      name: league?.name ?? '',
                      tournamentId,
                      seasonId: selectedSeason?.seasonId ?? 0,
                      season: selectedSeason?.label ?? '',
                    }}
                  />
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
                    <p>Chưa có dữ liệu đội bóng cho mùa này</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {teams.map((team, index) => {
                      const internalId = sofaToInternal.get(team.id);
                      const cardContent = (
                        <>
                          <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-3 mx-auto overflow-hidden">
                            {team.logo ? (
                              <img
                                src={team.logo}
                                alt={team.name}
                                className="w-11 h-11 object-contain"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                              />
                            ) : (
                              <span className="font-display font-bold text-xl text-foreground">
                                {team.name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <h4 className="font-body font-semibold text-sm text-center text-slate-900 dark:text-foreground truncate" title={team.name}>
                            {team.name}
                          </h4>
                          {team.position && (
                            <p className="text-xs text-center text-slate-500 dark:text-[#A8A29E] mt-0.5">
                              #{team.position}
                            </p>
                          )}
                        </>
                      );
                      const cardClass = "block glass-card rounded-xl p-4 hover:bg-slate-100 dark:hover:bg-white/5 hover:translate-y-[-2px] transition-all duration-200 border border-transparent hover:border-[#FF4444]/20";
                      return (
                        <motion.div
                          key={team.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: index * 0.04 }}
                        >
                          {internalId ? (
                            <Link to={`/teams/${internalId}`} className={cardClass}>
                              {cardContent}
                            </Link>
                          ) : (
                            <a
                              href={`https://www.sofascore.com/team/football/${team.name.toLowerCase().replace(/\s+/g, '-')}/${team.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={cardClass}
                            >
                              {cardContent}
                            </a>
                          )}
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
