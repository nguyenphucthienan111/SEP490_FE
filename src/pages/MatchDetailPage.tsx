import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, Clock, Radio, TrendingUp, TrendingDown, Users, Swords } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ApiMatch, Team, Standing, MatchEvent, leagueService } from '@/services/leagueService';

function getMatchStatus(status: string): 'live' | 'completed' | 'scheduled' {
  const s = status.toLowerCase();
  if (s.includes('live') || s.includes('progress') || s.includes('halftime')) return 'live';
  if (s.includes('finished') || s.includes('completed') || s.includes('ft')) return 'completed';
  return 'scheduled';
}

export default function MatchDetailPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const [match, setMatch] = useState<ApiMatch | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      window.scrollTo(0, 0);
      try {
        const t = localStorage.getItem('teams');
        if (t) setTeams(JSON.parse(t));
      } catch (e) {}
      try {
        const st = localStorage.getItem('standings');
        if (st) setStandings(JSON.parse(st));
      } catch (e) {}
      try {
        const cached = localStorage.getItem('match-events');
        if (cached) {
          const all: MatchEvent[] = JSON.parse(cached);
          setEvents(all.filter(e => e.matchId === Number(matchId)));
        } else {
          const data = await leagueService.getMatchEvents();
          localStorage.setItem('match-events', JSON.stringify(data));
          setEvents(data.filter(e => e.matchId === Number(matchId)));
        }
      } catch (e) {}
      try {
        const m = localStorage.getItem('matches');
        if (m) {
          const all: ApiMatch[] = JSON.parse(m);
          setMatch(all.find(x => x.matchId === Number(matchId)) ?? null);
        }
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, [matchId]);

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#00D9FF] border-t-transparent rounded-full animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (!match) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="font-display font-bold text-2xl text-foreground mb-4">Không tìm thấy trận đấu</h2>
            <Link to="/matches">
              <Button variant="outline" className="border-[#00D9FF] text-[#00D9FF]">Quay lại lịch thi đấu</Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  const status = getMatchStatus(match.status);
  const isLive = status === 'live';
  const isCompleted = status === 'completed';
  const homeTeam = teams.find(t => t.teamId === match.homeTeamId);
  const awayTeam = teams.find(t => t.teamId === match.awayTeamId);
  const homeName = homeTeam?.teamName ?? `Đội ${match.homeTeamId}`;
  const awayName = awayTeam?.teamName ?? `Đội ${match.awayTeamId}`;
  const dateStr = new Date(match.matchDate).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const latestSeasonId = standings.length > 0
    ? Math.max(...standings.filter(s => s.leagueId === match.leagueId).map(s => s.seasonId))
    : null;
  const leagueStandings = latestSeasonId
    ? [...standings.filter(s => s.leagueId === match.leagueId && s.seasonId === latestSeasonId)].sort((a, b) => a.rank - b.rank)
    : [];

  return (
    <MainLayout>
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
            <Link to="/matches" className="inline-flex items-center gap-2 text-slate-700 dark:text-[#A8A29E] hover:text-foreground transition-colors mb-8">
              <ArrowLeft className="w-4 h-4" />
              <span className="font-label text-sm font-medium">Quay lại lịch thi đấu</span>
            </Link>
          </motion.div>

          {/* Match Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card rounded-3xl p-6 sm:p-10 mb-8"
          >
            <div className="flex items-center justify-center gap-4 mb-8 flex-wrap">
              <span className="text-sm text-slate-700 dark:text-[#A8A29E] font-label uppercase tracking-wider font-semibold">{match.round}</span>
              {isLive && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF4444]/20 rounded-full">
                  <Radio className="w-3 h-3 text-[#FF4444] animate-pulse" />
                  <span className="text-xs font-label font-semibold text-[#FF4444] uppercase">Trực tiếp</span>
                </span>
              )}
              {isCompleted && (
                <span className="px-3 py-1.5 bg-slate-200 dark:bg-white/5 rounded-full text-sm font-label text-slate-700 dark:text-[#A8A29E] font-semibold">Kết thúc</span>
              )}
            </div>

            <div className="flex items-center justify-center gap-8 sm:gap-16 mb-8">
              <div className="flex-1 text-center">
                <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-slate-200 dark:bg-white/5 flex items-center justify-center mb-4 mx-auto border border-slate-300 dark:border-white/10 overflow-hidden">
                  {homeTeam?.logoUrl
                    ? <img src={homeTeam.logoUrl} alt={homeName} className="w-16 h-16 sm:w-20 sm:h-20 object-contain" />
                    : <span className="font-display font-bold text-2xl sm:text-4xl text-foreground">{homeName.charAt(0)}</span>
                  }
                </div>
                <h3 className="font-display font-bold text-lg sm:text-xl text-foreground mb-1">{homeName}</h3>
                <span className="text-sm text-slate-600 dark:text-[#A8A29E]">Chủ nhà</span>
              </div>

              <div className="flex flex-col items-center">
                {(isLive || isCompleted) ? (
                  <div className="flex items-center gap-4 sm:gap-6">
                    <span className="font-mono-data text-5xl sm:text-7xl font-bold text-foreground">{match.homeGoals ?? 0}</span>
                    <span className="text-slate-400 dark:text-[#A8A29E] text-3xl sm:text-4xl">-</span>
                    <span className="font-mono-data text-5xl sm:text-7xl font-bold text-foreground">{match.awayGoals ?? 0}</span>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="font-mono-data text-3xl text-[#00D9FF] mb-2">{match.kickOffTime}</p>
                    <p className="text-sm text-slate-600 dark:text-[#A8A29E]">Giờ đá</p>
                  </div>
                )}
              </div>

              <div className="flex-1 text-center">
                <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-slate-200 dark:bg-white/5 flex items-center justify-center mb-4 mx-auto border border-slate-300 dark:border-white/10 overflow-hidden">
                  {awayTeam?.logoUrl
                    ? <img src={awayTeam.logoUrl} alt={awayName} className="w-16 h-16 sm:w-20 sm:h-20 object-contain" />
                    : <span className="font-display font-bold text-2xl sm:text-4xl text-foreground">{awayName.charAt(0)}</span>
                  }
                </div>
                <h3 className="font-display font-bold text-lg sm:text-xl text-foreground mb-1">{awayName}</h3>
                <span className="text-sm text-slate-600 dark:text-[#A8A29E]">Khách</span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center justify-center gap-6 sm:gap-10 text-sm text-slate-700 dark:text-[#A8A29E] font-medium flex-wrap">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{dateStr}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{match.kickOffTime}</span>
                </div>
              </div>
              {match.venue && (
                <div className="mt-2 px-6 py-4 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 w-full max-w-md">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-[#00D9FF]" />
                    <span className="font-display font-bold text-foreground">{match.venue}</span>
                  </div>
                  {match.attendance != null && (
                    <div className="flex items-center justify-center gap-2 text-xs text-slate-600 dark:text-[#A8A29E] mt-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>Khán giả: {match.attendance.toLocaleString('vi-VN')}</span>
                    </div>
                  )}
                </div>
              )}
              {match.refereeName && (
                <p className="text-sm text-slate-600 dark:text-[#A8A29E]">
                  Trọng tài: <span className="font-semibold text-foreground">{match.refereeName}</span>
                </p>
              )}
            </div>
          </motion.div>

          {/* Match Events */}
          {events.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="glass-card rounded-2xl p-6 sm:p-8 mb-8"
            >
              <h3 className="font-display font-bold text-xl text-foreground mb-6 flex items-center gap-2">
                <Swords className="w-5 h-5 text-[#FF4444]" />
                Diễn biến trận đấu
              </h3>
              <div className="relative">
                {/* Center line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 dark:bg-white/10 -translate-x-1/2" />
                <div className="space-y-3">
                  {[...events].sort((a, b) => a.eventTime - b.eventTime).map(ev => {
                    const isHome = ev.teamId === match.homeTeamId;
                    const isGoal = ev.eventType === 'Goal';
                    const isCard = ev.eventType === 'Card';
                    const isSubst = ev.eventType === 'subst';
                    const isYellow = ev.detail === 'Yellow Card';
                    const isRed = ev.detail === 'Red Card';
                    const isPenalty = ev.detail === 'Penalty';
                    const timeStr = ev.extraTime ? `${ev.eventTime}+${ev.extraTime}'` : `${ev.eventTime}'`;

                    const icon = isGoal
                      ? (isPenalty ? '⚽ P' : '⚽')
                      : isCard
                      ? (isYellow ? '🟨' : '🟥')
                      : isSubst ? '🔄' : '•';

                    const colorClass = isGoal
                      ? 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20'
                      : isCard && isRed
                      ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20'
                      : isCard && isYellow
                      ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20'
                      : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10';

                    return (
                      <div key={ev.eventId} className={`flex items-center gap-3 ${isHome ? 'flex-row' : 'flex-row-reverse'}`}>
                        {/* Event card */}
                        <div className={`flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl border ${colorClass} ${isHome ? 'justify-start' : 'justify-end'}`}>
                          <span className="text-base leading-none">{icon}</span>
                          <div className={`flex flex-col ${isHome ? 'items-start' : 'items-end'}`}>
                            <span className="text-xs font-semibold text-slate-900 dark:text-foreground">
                              {isGoal ? (isPenalty ? 'Bàn thắng (Penalty)' : 'Bàn thắng') : isCard ? (isYellow ? 'Thẻ vàng' : 'Thẻ đỏ') : isSubst ? 'Thay người' : ev.detail}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-[#A8A29E]">
                              {isHome ? homeName : awayName}
                            </span>
                          </div>
                        </div>
                        {/* Time badge */}
                        <div className="w-14 flex-shrink-0 flex items-center justify-center">
                          <span className="px-2 py-1 rounded-lg bg-slate-200 dark:bg-white/10 text-xs font-mono-data font-bold text-slate-700 dark:text-slate-300">
                            {timeStr}
                          </span>
                        </div>
                        {/* Spacer for opposite side */}
                        <div className="flex-1" />
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* League Standings */}
          {leagueStandings.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass-card rounded-2xl p-6 sm:p-8"
            >
              <h3 className="font-display font-bold text-xl text-foreground mb-6">Bảng xếp hạng</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-300 dark:border-white/10">
                      {['Pos', 'Đội', 'P', 'W', 'D', 'L', 'GF', 'GA', 'GD', 'Pts'].map(h => (
                        <th key={h} className={cn("py-3 px-3 font-label text-xs text-slate-700 dark:text-[#A8A29E] uppercase tracking-wider font-bold", h === 'Đội' ? 'text-left' : 'text-center')}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {leagueStandings.map((s, index) => {
                      const team = teams.find(t => t.teamId === s.teamId);
                      const name = team?.teamName ?? `Đội ${s.teamId}`;
                      const isHighlighted = s.teamId === match.homeTeamId || s.teamId === match.awayTeamId;
                      const total = leagueStandings.length;
                      const isTop3 = s.rank <= 3;
                      const isRelegation = s.rank > total - 3;
                      return (
                        <motion.tr
                          key={s.standingId}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.3, delay: index * 0.03 }}
                          className={cn(
                            "border-b border-slate-200 dark:border-white/5 transition-colors",
                            isHighlighted && "bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20",
                            !isHighlighted && isTop3 && "bg-green-50 dark:bg-green-500/5 hover:bg-green-100 dark:hover:bg-green-500/10",
                            !isHighlighted && isRelegation && "bg-red-50 dark:bg-red-500/5 hover:bg-red-100 dark:hover:bg-red-500/10",
                            !isHighlighted && !isTop3 && !isRelegation && "hover:bg-slate-50 dark:hover:bg-white/5"
                          )}
                        >
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1">
                              <span className={cn("font-mono-data font-bold text-sm",
                                isHighlighted ? "text-[#00D9FF]" :
                                isTop3 ? "text-green-600 dark:text-green-400" :
                                isRelegation ? "text-red-600 dark:text-red-400" :
                                "text-slate-700 dark:text-slate-400"
                              )}>{s.rank}</span>
                              {!isHighlighted && isTop3 && <TrendingUp className="w-3 h-3 text-green-500" />}
                              {!isHighlighted && isRelegation && <TrendingDown className="w-3 h-3 text-red-500" />}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <Link to={`/teams/${s.teamId}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                              {team?.logoUrl
                                ? <div className="w-7 h-7 rounded overflow-hidden flex-shrink-0"><img src={team.logoUrl} alt={name} className="w-full h-full object-contain" /></div>
                                : <div className="w-7 h-7 rounded bg-slate-200 dark:bg-white/5 flex items-center justify-center text-xs font-bold text-foreground flex-shrink-0">{name.charAt(0)}</div>
                              }
                              <span className={cn("font-body font-semibold text-sm", isHighlighted ? "text-[#00D9FF]" : "text-foreground")}>{name}</span>
                            </Link>
                          </td>
                          {[s.played, s.win, s.draw, s.loss, s.goalsFor, s.goalsAgainst].map((v, i) => (
                            <td key={i} className="py-3 px-3 text-center">
                              <span className="font-mono-data text-sm text-slate-700 dark:text-slate-400">{v}</span>
                            </td>
                          ))}
                          <td className="py-3 px-3 text-center">
                            <span className={cn("font-mono-data text-sm font-semibold",
                              s.goalDifference > 0 ? "text-green-600 dark:text-green-400" :
                              s.goalDifference < 0 ? "text-red-600 dark:text-red-400" :
                              "text-slate-700 dark:text-slate-400"
                            )}>{s.goalDifference > 0 ? '+' : ''}{s.goalDifference}</span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="font-mono-data text-sm font-bold text-foreground">{s.points}</span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
