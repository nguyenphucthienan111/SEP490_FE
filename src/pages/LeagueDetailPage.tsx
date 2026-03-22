import { motion } from 'framer-motion';
import { Trophy, ArrowLeft, ExternalLink } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import React from 'react';
import { leagueService, SofascoreLeague } from '@/services/leagueService';
const LEAGUE_META: Record<number, { seasonId: number; hasStandings: boolean; cupTreeId?: number }> = {
  626:  { seasonId: 78589, hasStandings: true  }, // V-League 1
  771:  { seasonId: 80926, hasStandings: true  }, // V-League 2
  3087: { seasonId: 81023, hasStandings: false, cupTreeId: 10832297 }, // Vietnam Cup (knockout)
};

interface TeamCard {
  id: number;
  name: string;
  logo: string;
  position?: number; // only for standings leagues
}

export default function LeagueDetailPage() {
  const { leagueId } = useParams<{ leagueId: string }>();
  const tournamentId = Number(leagueId);
  const meta = LEAGUE_META[tournamentId];

  const [league, setLeague] = React.useState<SofascoreLeague | null>(null);
  const [teams, setTeams] = React.useState<TeamCard[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!tournamentId || !meta) return;
    setLoading(true);
    setError(null);

    Promise.all([
      leagueService.getVietnameseLeagues(),
      loadTeams(),
    ])
      .then(([leagues]) => {
        setLeague(leagues.find((l) => l.uniqueTournamentId === tournamentId) ?? null);
      })
      .catch(() => setError('Không thể tải dữ liệu giải đấu'))
      .finally(() => setLoading(false));
  }, [tournamentId]);

  async function loadTeams() {
    if (!meta) return;

    if (meta.hasStandings) {
      // V-League 1 & 2: get teams from standings
      const rows = await leagueService.getSofascoreStandings(tournamentId, meta.seasonId);
      setTeams(rows.map((r) => ({
        id: r.team.id,
        name: r.team.name,
        logo: r.team.logo,
        position: r.position,
      })));
    } else {
      // Vietnam Cup: extract unique teams from last-matches (multiple pages)
      const [page0, page1] = await Promise.allSettled([
        leagueService.getTournamentLastMatches(tournamentId, meta.seasonId, 0),
        leagueService.getTournamentLastMatches(tournamentId, meta.seasonId, 1),
      ]);

      const allMatches = [
        ...(page0.status === 'fulfilled' ? page0.value : []),
        ...(page1.status === 'fulfilled' ? page1.value : []),
      ];

      // Deduplicate teams by id
      const teamMap = new Map<number, TeamCard>();
      allMatches.forEach((m) => {
        const home = m.homeTeam;
        const away = m.awayTeam;
        if (!teamMap.has(home.id)) {
          teamMap.set(home.id, {
            id: home.id,
            name: home.name,
            logo: `https://api.sofascore.app/api/v1/team/${home.id}/image`,
          });
        }
        if (!teamMap.has(away.id)) {
          teamMap.set(away.id, {
            id: away.id,
            name: away.name,
            logo: `https://api.sofascore.app/api/v1/team/${away.id}/image`,
          });
        }
      });

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
                className="flex items-center gap-6 mb-10"
              >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-100 dark:from-[#FF4444]/20 to-blue-100 dark:to-[#00D9FF]/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {league?.logoUrl ? (
                    <img src={league.logoUrl} alt={league.name} className="w-14 h-14 object-contain" />
                  ) : (
                    <Trophy className="w-10 h-10 text-[#FF4444]" />
                  )}
                </div>
                <div>
                  <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-foreground mb-1">
                    {league?.name ?? 'Giải đấu'}
                  </h1>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-slate-500 dark:text-[#A8A29E] text-sm">
                      Vietnam · Mùa {league?.seasonName}
                      {!meta?.hasStandings && ' · Knockout'}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Teams Grid */}
              
              {/* Knockout Bracket — only for Cup */}
              {meta && !meta.hasStandings && meta.cupTreeId && (
                <div className="mt-10">
                  <h2 className="font-display font-bold text-xl text-slate-900 dark:text-foreground mb-6">
                    Bracket
                  </h2>
                  <div className="rounded-2xl border border-slate-200 dark:border-white/10" style={{ overflow: "hidden", height: 740}}>
                    <iframe
                      src={"https://widgets.sofascore.com/embed/unique-tournament/" + tournamentId + "/season/" + meta.seasonId + "/cuptree/" + meta.cupTreeId + "?widgetTitle=Vietnam+Cup+25%2F26&showCompetitionLogo=true&widgetTheme=light"}
                      style={{ height: 872, width: "100%", display: "block", border: 0 }}
                      scrolling="no"
                      title="Vietnam Cup Bracket"
                    />
                  </div>
                </div>
              )}
            <br/><br/>
              <div>
                <h2 className="font-display font-bold text-xl text-slate-900 dark:text-foreground mb-6">
                  Các đội tham dự {teams.length > 0 && `(${teams.length})`}
                </h2>

                {teams.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-500 dark:text-[#A8A29E]">
                    <Trophy className="w-12 h-12 mb-3 opacity-30" />
                    <p>Chưa có dữ liệu đội bóng</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {teams.map((team, index) => (                      <motion.div
                        key={team.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.04 }}
                      >
                        <a
                          href={`https://www.sofascore.com/team/football/${team.name.toLowerCase().replace(/\s+/g, '-')}/${team.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block glass-card rounded-xl p-4 hover:bg-slate-100 dark:hover:bg-white/5 hover:translate-y-[-2px] transition-all duration-200 border border-transparent hover:border-[#FF4444]/20"
                        >
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
                        </a>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
