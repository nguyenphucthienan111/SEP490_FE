import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Trophy, Users, Activity, ChevronRight, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { leagueService } from '@/services/leagueService';
import { cn } from '@/lib/utils';

// Config cơ bản — seasonId sẽ được resolve từ getVietnameseLeagues()
const LEAGUE_CONFIG = [
  { tournamentId: 626, fallbackSeasonId: 78589, name: 'V-League 1', color: '#FF4444', gradient: 'from-[#FF4444] to-[#ff8c42]', tier: 'Hạng 1', isCup: false },
  { tournamentId: 771, fallbackSeasonId: 80926, name: 'V-League 2', color: '#00D9FF', gradient: 'from-[#00D9FF] to-[#0099cc]', tier: 'Hạng 2', isCup: false },
  { tournamentId: 3087, fallbackSeasonId: 81023, name: 'Vietnam Cup', color: '#a78bfa', gradient: 'from-[#a78bfa] to-[#7c3aed]', tier: 'Cúp QG', isCup: true },
];

type LeagueInfo = {
  tournamentId: number;
  name: string;
  color: string;
  gradient: string;
  tier: string;
  teamCount: number;
  matchesPlayed: number;
  totalGoals: number;
  leader?: { name: string; points: number; logo: string; wins: number };
};

export function LeagueGrid() {
  const [leagues, setLeagues] = useState<LeagueInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Lấy currentSeasonId từ API để luôn dùng mùa mới nhất
        let seasonMap: Record<number, number> = {};
        try {
          const sfLeagues = await leagueService.getVietnameseLeagues();
          sfLeagues.forEach(l => { seasonMap[l.uniqueTournamentId] = l.currentSeasonId; });
        } catch {}

        const results = await Promise.allSettled(
          LEAGUE_CONFIG.map(async l => {
            const seasonId = seasonMap[l.tournamentId] ?? l.fallbackSeasonId;

            if (l.isCup) {
              // Cup không có standings — lấy data từ DB matches
              try {
                const matches = await leagueService.getAllMatchesFromDb(l.tournamentId, seasonId);
                // Chỉ lấy vòng knockout (loại bỏ vòng loại sơ bộ — round có số nhỏ hoặc null)
                const knockoutKeywords = ['16', '8', 'quarter', 'semi', 'final', 'tứ', 'bán', 'chung'];
                const knockoutMatches = matches.filter((m: any) => {
                  const r = (m.round ?? '').toString().toLowerCase();
                  return knockoutKeywords.some(k => r.includes(k));
                });
                // Nếu không detect được keyword thì lấy tất cả finished
                const relevantMatches = knockoutMatches.length > 0 ? knockoutMatches : matches;
                const finished = relevantMatches.filter((m: any) =>
                  m.status === 'finished' || (m.homeGoals != null && m.awayGoals != null)
                );
                const teamIds = new Set<number>();
                relevantMatches.forEach((m: any) => {
                  if (m.homeTeam?.teamId) teamIds.add(m.homeTeam.teamId);
                  if (m.awayTeam?.teamId) teamIds.add(m.awayTeam.teamId);
                });
                const totalGoals = finished.reduce((s: number, m: any) =>
                  s + (m.homeGoals ?? 0) + (m.awayGoals ?? 0), 0
                );
                return {
                  tournamentId: l.tournamentId,
                  name: l.name, color: l.color, gradient: l.gradient, tier: l.tier,
                  teamCount: teamIds.size,
                  matchesPlayed: finished.length,
                  totalGoals,
                  // Placeholder leader để card bằng chiều cao với V-League
                  leader: { name: 'Knockout · Loại trực tiếp', points: 0, logo: '', wins: finished.length },
                } as LeagueInfo;
              } catch {
                return {
                  tournamentId: l.tournamentId, name: l.name, color: l.color, gradient: l.gradient, tier: l.tier,
                  teamCount: 0, matchesPlayed: 0, totalGoals: 0,
                  leader: { name: 'Knockout · Loại trực tiếp', points: 0, logo: '', wins: 0 },
                } as LeagueInfo;
              }
            }

            // League thường — dùng standings
            const standings = await leagueService.getHybridStandings(l.tournamentId, seasonId);
            const leader = standings[0];
            const totalGoals = standings.reduce((s, r) => s + r.scoresFor, 0);
            return {
              tournamentId: l.tournamentId,
              name: l.name, color: l.color, gradient: l.gradient, tier: l.tier,
              teamCount: standings.length,
              matchesPlayed: standings.reduce((s, r) => s + r.matches, 0) / 2,
              totalGoals,
              leader: leader ? { name: leader.team.name, points: leader.points, logo: leader.team.logo, wins: leader.wins } : undefined,
            } as LeagueInfo;
          })
        );
        setLeagues(results.filter(r => r.status === 'fulfilled').map(r => (r as PromiseFulfilledResult<LeagueInfo>).value));
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-14">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-6 rounded-full bg-gradient-to-b from-[#FF4444] to-[#00D9FF]" />
              <span className="text-xs font-label font-bold text-[#00D9FF] uppercase tracking-widest">Giải đấu</span>
            </div>
            <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-foreground mb-2">
              Các giải bóng đá<br />
              <span className="text-gradient">Việt Nam</span>
            </h2>
          </div>
          <Link to="/leagues" className="flex items-center gap-2 text-sm font-semibold text-[#00D9FF] hover:text-foreground transition-colors group">
            Xem tất cả giải đấu
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {loading ? (
          <div className="grid sm:grid-cols-3 gap-6">
            {[0, 1, 2].map(i => (
              <div key={i} className="h-64 rounded-3xl bg-muted border border-border animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {leagues.map((league, index) => (
              <motion.div key={league.tournamentId}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.12 }}>
                <Link to={`/leagues/${league.tournamentId}`}>
                  <div className="group relative rounded-3xl overflow-hidden border border-border bg-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 20px 60px ${league.color}20`)}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = '')}>
                    {/* Top gradient bar */}
                    <div className={cn('h-1 w-full bg-gradient-to-r', league.gradient)} />

                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-5">
                        <div>
                          <span className="text-[10px] font-label font-bold uppercase tracking-widest mb-1 block"
                            style={{ color: league.color }}>{league.tier}</span>
                          <h3 className="font-display font-bold text-xl text-foreground group-hover:text-[#00D9FF] transition-colors">
                            {league.name}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">Việt Nam · 2025/26</p>
                        </div>
                        <div className="w-11 h-11 rounded-2xl flex items-center justify-center border"
                          style={{ backgroundColor: `${league.color}15`, borderColor: `${league.color}30` }}>
                          <Trophy className="w-5 h-5" style={{ color: league.color }} />
                        </div>
                      </div>

                      {/* Leader / Cup format */}
                      {league.leader && (
                        <div className="flex items-center gap-3 p-3 rounded-2xl mb-5 bg-muted border border-border">
                          {league.leader.logo ? (
                            <div className="w-8 h-8 rounded-xl bg-background flex items-center justify-center overflow-hidden flex-shrink-0 border border-border">
                              <img src={league.leader.logo} alt="" className="w-6 h-6 object-contain"
                                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border"
                              style={{ backgroundColor: `${league.color}15`, borderColor: `${league.color}30` }}>
                              <Trophy className="w-4 h-4" style={{ color: league.color }} />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate">{league.leader.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {league.leader.points > 0 ? `${league.leader.wins} thắng` : `${league.leader.wins} trận đã đấu`}
                            </p>
                          </div>
                          {league.leader.points > 0 && (
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" style={{ color: league.color }} />
                              <span className="font-mono-data text-sm font-black" style={{ color: league.color }}>
                                {league.leader.points}
                              </span>
                              <span className="text-[10px] text-muted-foreground">pts</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Stats row */}
                      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
                        {[
                          { icon: Users, label: 'Đội', value: league.teamCount },
                          { icon: Activity, label: 'Trận', value: Math.round(league.matchesPlayed) },
                          { icon: Trophy, label: 'Bàn thắng', value: league.totalGoals },
                        ].map(s => (
                          <div key={s.label} className="text-center">
                            <p className="font-mono-data text-lg font-bold text-foreground">{s.value}</p>
                            <p className="text-[10px] text-muted-foreground">{s.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="w-4 h-4" style={{ color: league.color }} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
