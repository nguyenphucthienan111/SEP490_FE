import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Radio, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { leagueService, SofascoreTeamMatch } from '@/services/leagueService';
import { cn } from '@/lib/utils';

const LEAGUES = [
  { tournamentId: 626, seasonId: 78589, name: 'V-League 1', color: '#FF4444' },
  { tournamentId: 771, seasonId: 80926, name: 'V-League 2', color: '#00D9FF' },
];

function teamLogo(id: number) {
  return `https://api.sofascore.app/api/v1/team/${id}/image`;
}

function MatchRow({ match, index }: { match: SofascoreTeamMatch; index: number }) {
  const isLive = match.status.type === 'inprogress';
  const isFinished = match.status.type === 'finished';
  const date = new Date(match.startTimestamp * 1000);
  const homeWin = isFinished && match.homeScore.current > match.awayScore.current;
  const awayWin = isFinished && match.awayScore.current > match.homeScore.current;

  const dateStr = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const shortDate = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}>
      <Link to={`/matches/${match.id}`}>
        <div className={cn(
          'group flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 cursor-pointer',
          isLive
            ? 'border-[#FF4444]/30 bg-[#FF4444]/5 hover:bg-[#FF4444]/8'
            : 'border-border bg-card hover:bg-muted/50 hover:border-foreground/15'
        )}>
          {/* Status / Date */}
          <div className="w-20 flex-shrink-0 text-center">
            {isLive ? (
              <div className="flex flex-col items-center gap-0.5">
                <Radio className="w-3 h-3 text-[#FF4444] animate-pulse" />
                <span className="text-[9px] font-black text-[#FF4444] uppercase tracking-wider">Live</span>
              </div>
            ) : isFinished ? (
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[9px] text-muted-foreground font-semibold">FT</span>
                <span className="text-[9px] font-mono-data text-muted-foreground/70">{shortDate}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[9px] font-mono-data font-bold text-[#00D9FF]">{timeStr}</span>
                <span className="text-[9px] text-muted-foreground font-mono-data">{shortDate}</span>
              </div>
            )}
          </div>

          {/* Home */}
          <div className="flex-1 flex items-center gap-2.5 justify-end min-w-0">
            <span className={cn(
              'text-sm font-semibold truncate text-right transition-colors',
              isFinished && !homeWin ? 'text-muted-foreground' : 'text-foreground group-hover:text-[#00D9FF]'
            )}>
              {match.homeTeam.name}
            </span>
            <div className="w-8 h-8 rounded-xl bg-muted border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
              <img src={teamLogo(match.homeTeam.id)} alt="" className="w-5 h-5 object-contain"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
          </div>

          {/* Score */}
          <div className="flex-shrink-0 w-16 flex flex-col items-center justify-center">
            {(isFinished || isLive) ? (
              <div className="flex items-center gap-1">
                <span className={cn('font-mono-data text-lg font-black',
                  homeWin ? 'text-foreground' : isLive ? 'text-[#FF4444]' : 'text-muted-foreground')}>
                  {match.homeScore.current}
                </span>
                <span className="text-muted-foreground/30 text-sm font-bold">-</span>
                <span className={cn('font-mono-data text-lg font-black',
                  awayWin ? 'text-foreground' : isLive ? 'text-[#FF4444]' : 'text-muted-foreground')}>
                  {match.awayScore.current}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-muted-foreground/30">vs</span>
                <span className="text-[9px] text-muted-foreground font-mono-data mt-0.5">{shortDate}</span>
              </div>
            )}
          </div>

          {/* Away */}
          <div className="flex-1 flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-muted border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
              <img src={teamLogo(match.awayTeam.id)} alt="" className="w-5 h-5 object-contain"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
            <span className={cn(
              'text-sm font-semibold truncate transition-colors',
              isFinished && !awayWin ? 'text-muted-foreground' : 'text-foreground group-hover:text-[#00D9FF]'
            )}>
              {match.awayTeam.name}
            </span>
          </div>

          {/* Round */}
          <div className="w-10 flex-shrink-0 text-right">
            <span className="text-[9px] text-muted-foreground/60 font-semibold">
              {match.roundInfo?.round ? `V${match.roundInfo.round}` : ''}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

type LeagueMatches = {
  name: string;
  color: string;
  round: number | null;
  matches: SofascoreTeamMatch[];
};

function getLatestRoundMatches(all: SofascoreTeamMatch[]): { round: number | null; matches: SofascoreTeamMatch[] } {
  const live = all.filter(m => m.status.type === 'inprogress');
  const finished = all.filter(m => m.status.type === 'finished');
  const latestRound = finished.reduce((max, m) => Math.max(max, m.roundInfo?.round ?? 0), 0);
  const roundMatches = latestRound > 0
    ? finished.filter(m => m.roundInfo?.round === latestRound)
    : finished.sort((a, b) => b.startTimestamp - a.startTimestamp).slice(0, 10);
  return { round: latestRound || null, matches: [...live, ...roundMatches] };
}

export function MatchCenter() {
  const [leagueData, setLeagueData] = useState<LeagueMatches[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const results: LeagueMatches[] = [];
      for (const l of LEAGUES) {
        try {
          const data = await leagueService.getAllMatchesFromDb(l.tournamentId, l.seasonId);
          const mapped: SofascoreTeamMatch[] = data.map((m: any) => ({
            id: m.apiFixtureId ?? m.matchId,
            homeTeam: { id: m.homeTeam?.apiTeamId ?? 0, name: m.homeTeam?.teamName ?? '' },
            awayTeam: { id: m.awayTeam?.apiTeamId ?? 0, name: m.awayTeam?.teamName ?? '' },
            homeScore: { current: m.homeGoals ?? 0 },
            awayScore: { current: m.awayGoals ?? 0 },
            startTimestamp: m.matchDate
              ? Math.floor(new Date(m.matchDate.endsWith('Z') ? m.matchDate : m.matchDate + 'Z').getTime() / 1000)
              : 0,
            status: { type: m.status ?? 'notstarted' },
            roundInfo: m.round ? { round: Number(m.round) } : undefined,
          }));
          const { round, matches } = getLatestRoundMatches(mapped);
          results.push({ name: l.name, color: l.color, round, matches });
        } catch {
          results.push({ name: l.name, color: l.color, round: null, matches: [] });
        }
      }
      setLeagueData(results);
      setLoading(false);
    };
    load();
  }, []);

  const current = leagueData[activeTab];

  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-6 rounded-full bg-gradient-to-b from-[#FF4444] to-[#00D9FF]" />
              <span className="text-xs font-label font-bold text-[#00D9FF] uppercase tracking-widest">Trận đấu</span>
            </div>
            <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-foreground">
              Kết quả gần đây
            </h2>
          </div>
          <Link to="/matches" className="flex items-center gap-2 text-sm font-semibold text-[#00D9FF] hover:text-foreground transition-colors group">
            Xem tất cả
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* League tabs */}
        <div className="flex gap-2 mb-6">
          {LEAGUES.map((l, i) => (
            <button key={l.tournamentId} onClick={() => setActiveTab(i)}
              className={cn(
                'px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200',
                activeTab === i ? 'text-white shadow-lg' : 'text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80'
              )}
              style={activeTab === i ? { backgroundColor: l.color, boxShadow: `0 6px 20px ${l.color}30` } : {}}>
              {l.name}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-2">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-14 rounded-2xl bg-muted border border-border animate-pulse" />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={activeTab}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              {!current || current.matches.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Không có dữ liệu</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {current.matches.map((m, i) => <MatchRow key={m.id} match={m} index={i} />)}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}
