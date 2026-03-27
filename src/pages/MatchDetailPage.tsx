  import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Radio, Loader2, Users, Swords, LayoutGrid, X, Ruler, Flag, Calendar, BarChart2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { cn } from '@/lib/utils';
import { leagueService, SofascoreTeamMatch, MatchLineups, LineupPlayer, MatchStat } from '@/services/leagueService';
import { toast } from 'sonner';

function teamLogo(id: number) {
  return `https://api.sofascore.app/api/v1/team/${id}/image`;
}

function playerPhoto(id: number) {
  return `https://api.sofascore.app/api/v1/player/${id}/image`;
}

const POSITION_ORDER: Record<string, number> = { G: 0, D: 1, M: 2, F: 3 };

function posLabel(pos: string) {
  if (pos === 'G') return 'Thủ môn';
  if (pos === 'D') return 'Hậu vệ';
  if (pos === 'M') return 'Tiền vệ';
  if (pos === 'F') return 'Tiền đạo';
  return pos;
}

// ─── Player modal ─────────────────────────────────────────────────────────────
function PlayerModal({ p, onClose }: { p: LineupPlayer; onClose: () => void }) {
  const dob = p.player.dateOfBirthTimestamp
    ? new Date(p.player.dateOfBirthTimestamp * 1000)
    : null;
  const age = dob ? Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 3600 * 1000)) : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="glass-card rounded-2xl p-6 w-full max-w-sm relative"
          onClick={e => e.stopPropagation()}
        >
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
            <X className="w-4 h-4 text-slate-500 dark:text-[#A8A29E]" />
          </button>

          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-white/5 flex-shrink-0 border border-slate-200 dark:border-white/10">
              <img
                src={playerPhoto(p.player.id)}
                alt={p.player.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '';
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#00D9FF]/10 text-[#00D9FF] font-label font-semibold">
                  {posLabel(p.position)}
                </span>
                {p.captain && <span className="text-xs text-yellow-500 font-bold">Đội trưởng ©</span>}
              </div>
              <h3 className="font-display font-bold text-lg text-foreground leading-tight">{p.player.name}</h3>
              <p className="text-sm text-slate-500 dark:text-[#A8A29E]">#{p.shirtNumber}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {p.player.country?.name && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                <Flag className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 dark:text-[#A8A29E]">Quốc tịch</p>
                  <p className="text-sm font-semibold text-foreground">{p.player.country.name}</p>
                </div>
              </div>
            )}
            {age && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 dark:text-[#A8A29E]">Tuổi</p>
                  <p className="text-sm font-semibold text-foreground">{age}</p>
                </div>
              </div>
            )}
            {p.player.height && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                <Ruler className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 dark:text-[#A8A29E]">Chiều cao</p>
                  <p className="text-sm font-semibold text-foreground">{p.player.height} cm</p>
                </div>
              </div>
            )}
            {p.statistics && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                <Users className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 dark:text-[#A8A29E]">Phút thi đấu</p>
                  <p className="text-sm font-semibold text-foreground">{p.statistics.minutesPlayed}'</p>
                </div>
              </div>
            )}
          </div>

          {p.statistics && (p.statistics.goals > 0 || p.statistics.ownGoals > 0 || p.statistics.totalShots > 0) && (
            <div className="mt-3 flex gap-3">
              {p.statistics.goals > 0 && (
                <div className="flex-1 text-center p-2 rounded-xl bg-green-50 dark:bg-green-500/10">
                  <p className="font-mono-data text-xl font-bold text-green-600 dark:text-green-400">{p.statistics.goals}</p>
                  <p className="text-xs text-slate-500 dark:text-[#A8A29E]">Bàn thắng</p>
                </div>
              )}
              {p.statistics.totalShots > 0 && (
                <div className="flex-1 text-center p-2 rounded-xl bg-slate-50 dark:bg-white/5">
                  <p className="font-mono-data text-xl font-bold text-foreground">{p.statistics.totalShots}</p>
                  <p className="text-xs text-slate-500 dark:text-[#A8A29E]">Cú sút</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Formation pitch ──────────────────────────────────────────────────────────
function FormationPitch({ lineup, side, onSelect }: {
  lineup: { players: LineupPlayer[]; formation: string; playerColor: { primary: string; number: string } };
  side: 'home' | 'away';
  onSelect: (p: LineupPlayer) => void;
}) {
  const starters = lineup.players.filter(p => !p.substitute);
  const rows = lineup.formation.split('-').map(Number);
  // Build rows: GK first, then field rows
  const gk = starters.filter(p => p.position === 'G');
  const field = starters.filter(p => p.position !== 'G');

  // Distribute field players into formation rows
  const groups: LineupPlayer[][] = [gk];
  let idx = 0;
  for (const count of rows) {
    groups.push(field.slice(idx, idx + count));
    idx += count;
  }

  // Away team: reverse row order so GK is at top
  const displayGroups = side === 'away' ? [...groups].reverse() : groups;

  return (
    <div className="relative w-full rounded-xl overflow-hidden" style={{ background: 'linear-gradient(180deg, #1a4a2e 0%, #1e5c38 50%, #1a4a2e 100%)', minHeight: 320 }}>
      {/* Pitch lines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20 -translate-x-1/2" />
        <div className="absolute left-1/2 top-1/2 w-20 h-20 rounded-full border border-white/20 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute left-[15%] right-[15%] top-[5%] h-[18%] border border-white/15 rounded" />
        <div className="absolute left-[15%] right-[15%] bottom-[5%] h-[18%] border border-white/15 rounded" />
      </div>

      <div className="relative flex flex-col justify-around h-full py-3 px-2 gap-1" style={{ minHeight: 320 }}>
        {displayGroups.map((row, ri) => (
          <div key={ri} className="flex justify-around items-center">
            {row.map(p => (
              <button key={p.player.id} onClick={() => onSelect(p)} className="flex flex-col items-center gap-0.5 w-12 group">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white/30 shadow-lg overflow-hidden group-hover:scale-110 transition-transform"
                  style={{ background: `#${lineup.playerColor.primary}`, color: `#${lineup.playerColor.number}` }}
                >
                  <img
                    src={playerPhoto(p.player.id)}
                    alt={p.player.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const el = e.target as HTMLImageElement;
                      el.style.display = 'none';
                      el.parentElement!.innerHTML = `<span style="color:#${lineup.playerColor.number};font-size:11px;font-weight:700">${p.shirtNumber}</span>`;
                    }}
                  />
                </div>
                {p.captain && <span className="text-[8px] text-yellow-300 font-bold leading-none">©</span>}
                <span className="text-[9px] text-white/90 text-center leading-tight font-medium line-clamp-2 max-w-[44px] group-hover:text-yellow-300 transition-colors">
                  {p.player.shortName || p.player.name}
                </span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Player row ───────────────────────────────────────────────────────────────
function PlayerRow({ p, color, onSelect, badges }: {
  p: LineupPlayer;
  color: { primary: string; number: string };
  onSelect: (p: LineupPlayer) => void;
  badges?: { icon: string; time: string }[];
}) {
  return (
    <button onClick={() => onSelect(p)} className="w-full flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group text-left">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 overflow-hidden border border-white/20"
        style={{ background: `#${color.primary}`, color: `#${color.number}` }}
      >
        <img
          src={playerPhoto(p.player.id)}
          alt={p.player.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            const el = e.target as HTMLImageElement;
            el.style.display = 'none';
            el.parentElement!.innerHTML = `<span style="color:#${color.number};font-size:10px;font-weight:700">${p.shirtNumber}</span>`;
          }}
        />
      </div>
      <span className="font-mono-data text-xs text-slate-500 dark:text-[#A8A29E] w-5 text-right flex-shrink-0">{p.shirtNumber}</span>
      <span className="font-body text-sm text-foreground flex-1 truncate group-hover:text-[#00D9FF] transition-colors">
        {p.player.name}
        {p.captain && <span className="ml-1 text-yellow-500 text-xs">©</span>}
      </span>
      {badges && badges.length > 0 && (
        <div className="flex items-center gap-1 flex-shrink-0">
          {badges.map((b, i) => (
            <span key={i} className="text-xs leading-none" title={b.time}>{b.icon.startsWith('🔼') || b.icon.startsWith('🔽') ? b.icon.slice(0, 2) : b.icon}</span>
          ))}
        </div>
      )}
      <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-[#A8A29E] font-label flex-shrink-0">
        {posLabel(p.position)}
      </span>
    </button>
  );
}

// ─── Lineup tab content ───────────────────────────────────────────────────────
function LineupTab({ lineups, homeTeamName, awayTeamName, homeTeamId, awayTeamId, incidents }: {
  lineups: MatchLineups;
  homeTeamName: string;
  awayTeamName: string;
  homeTeamId: number;
  awayTeamId: number;
  incidents?: any[] | null;
}) {
  const [view, setView] = useState<'pitch' | 'list'>('pitch');
  const [selectedPlayer, setSelectedPlayer] = useState<LineupPlayer | null>(null);

  // Build a map: playerId → list of incident badges
  const playerEvents = new Map<number, { icon: string; time: string }[]>();
  if (incidents) {
    for (const inc of incidents) {
      if (inc.incidentType === 'period' || inc.incidentType === 'injuryTime') continue;
      const timeStr = inc.addedTime ? `${inc.time}+${inc.addedTime}'` : `${inc.time}'`;
      const addBadge = (pid: number, icon: string) => {
        if (!playerEvents.has(pid)) playerEvents.set(pid, []);
        playerEvents.get(pid)!.push({ icon, time: timeStr });
      };
      if (inc.incidentType === 'goal' && inc.player?.id) {
        addBadge(inc.player.id, inc.incidentClass === 'penalty' ? '⚽P' : inc.incidentClass === 'ownGoal' ? '⚽OG' : '⚽');
      }
      if (inc.incidentType === 'card' && inc.player?.id) {
        addBadge(inc.player.id, inc.incidentClass === 'yellow' ? '🟨' : '🟥');
      }
      if (inc.incidentType === 'substitution') {
        if (inc.playerIn?.id) addBadge(inc.playerIn.id, '🔼');
        if (inc.playerOut?.id) addBadge(inc.playerOut.id, '🔽');
      }
    }
  }

  const homeStarters = lineups.home.players.filter(p => !p.substitute).sort((a, b) => (POSITION_ORDER[a.position] ?? 9) - (POSITION_ORDER[b.position] ?? 9));
  const homeSubs = lineups.home.players.filter(p => p.substitute);
  const awayStarters = lineups.away.players.filter(p => !p.substitute).sort((a, b) => (POSITION_ORDER[a.position] ?? 9) - (POSITION_ORDER[b.position] ?? 9));
  const awaySubs = lineups.away.players.filter(p => p.substitute);

  return (
    <>
    <div>
      {/* View toggle */}
      <div className="flex items-center gap-2 mb-5">
        <button
          onClick={() => setView('pitch')}
          className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-label font-medium transition-all border',
            view === 'pitch' ? 'bg-[#00D9FF]/15 text-[#00D9FF] border-[#00D9FF]/40' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-[#A8A29E] border-transparent hover:bg-slate-200 dark:hover:bg-white/10'
          )}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          Sơ đồ
        </button>
        <button
          onClick={() => setView('list')}
          className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-label font-medium transition-all border',
            view === 'list' ? 'bg-[#00D9FF]/15 text-[#00D9FF] border-[#00D9FF]/40' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-[#A8A29E] border-transparent hover:bg-slate-200 dark:hover:bg-white/10'
          )}
        >
          <Users className="w-3.5 h-3.5" />
          Danh sách
        </button>
      </div>

      {view === 'pitch' ? (
        <div className="grid md:grid-cols-2 gap-4">
          {/* Home */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <img src={teamLogo(homeTeamId)} alt={homeTeamName} className="w-5 h-5 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <span className="font-body font-semibold text-sm text-foreground">{homeTeamName}</span>
              <span className="text-xs text-slate-500 dark:text-[#A8A29E] ml-auto">{lineups.home.formation}</span>
            </div>
            <FormationPitch lineup={lineups.home} side="home" onSelect={setSelectedPlayer} />
          </div>
          {/* Away */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <img src={teamLogo(awayTeamId)} alt={awayTeamName} className="w-5 h-5 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <span className="font-body font-semibold text-sm text-foreground">{awayTeamName}</span>
              <span className="text-xs text-slate-500 dark:text-[#A8A29E] ml-auto">{lineups.away.formation}</span>
            </div>
            <FormationPitch lineup={lineups.away} side="away" onSelect={setSelectedPlayer} />
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Home list */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src={teamLogo(homeTeamId)} alt={homeTeamName} className="w-5 h-5 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <span className="font-body font-semibold text-sm text-foreground">{homeTeamName}</span>
              <span className="text-xs text-slate-500 dark:text-[#A8A29E] ml-auto">{lineups.home.formation}</span>
            </div>
            <p className="text-xs font-label font-semibold text-slate-500 dark:text-[#A8A29E] uppercase tracking-wider mb-1 px-3">Đội hình chính</p>
            {homeStarters.map(p => <PlayerRow key={p.player.id} p={p} color={p.position === 'G' ? lineups.home.goalkeeperColor : lineups.home.playerColor} onSelect={setSelectedPlayer} badges={playerEvents.get(p.player.id)} />)}
            {homeSubs.length > 0 && (
              <>
                <p className="text-xs font-label font-semibold text-slate-500 dark:text-[#A8A29E] uppercase tracking-wider mt-4 mb-1 px-3">Dự bị</p>
                {homeSubs.map(p => <PlayerRow key={p.player.id} p={p} color={p.position === 'G' ? lineups.home.goalkeeperColor : lineups.home.playerColor} onSelect={setSelectedPlayer} badges={playerEvents.get(p.player.id)} />)}
              </>
            )}
          </div>
          {/* Away list */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src={teamLogo(awayTeamId)} alt={awayTeamName} className="w-5 h-5 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <span className="font-body font-semibold text-sm text-foreground">{awayTeamName}</span>
              <span className="text-xs text-slate-500 dark:text-[#A8A29E] ml-auto">{lineups.away.formation}</span>
            </div>
            <p className="text-xs font-label font-semibold text-slate-500 dark:text-[#A8A29E] uppercase tracking-wider mb-1 px-3">Đội hình chính</p>
            {awayStarters.map(p => <PlayerRow key={p.player.id} p={p} color={p.position === 'G' ? lineups.away.goalkeeperColor : lineups.away.playerColor} onSelect={setSelectedPlayer} badges={playerEvents.get(p.player.id)} />)}
            {awaySubs.length > 0 && (
              <>
                <p className="text-xs font-label font-semibold text-slate-500 dark:text-[#A8A29E] uppercase tracking-wider mt-4 mb-1 px-3">Dự bị</p>
                {awaySubs.map(p => <PlayerRow key={p.player.id} p={p} color={p.position === 'G' ? lineups.away.goalkeeperColor : lineups.away.playerColor} onSelect={setSelectedPlayer} badges={playerEvents.get(p.player.id)} />)}
              </>
            )}
          </div>
        </div>
      )}
    </div>
    {selectedPlayer && <PlayerModal p={selectedPlayer} onClose={() => setSelectedPlayer(null)} />}
    </>
  );
}

// ─── Stats tab ────────────────────────────────────────────────────────────────
function StatBar({ label, home, away, isPercent = false }: {
  label: string;
  home: number | null;
  away: number | null;
  isPercent?: boolean;
}) {
  if (home === null && away === null) return null;
  const h = home ?? 0;
  const a = away ?? 0;
  const total = h + a;
  const homePct = total > 0 ? (h / total) * 100 : 50;
  const awayPct = 100 - homePct;

  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-1.5">
        <span className="font-mono-data text-sm font-bold text-foreground">{isPercent ? `${h}%` : h}</span>
        <span className="text-xs font-label text-slate-500 dark:text-[#A8A29E] text-center flex-1 px-2">{label}</span>
        <span className="font-mono-data text-sm font-bold text-foreground">{isPercent ? `${a}%` : a}</span>
      </div>
      <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
        <div
          className="rounded-l-full transition-all duration-700"
          style={{ width: `${isPercent ? h : homePct}%`, background: 'linear-gradient(90deg, #00D9FF, #0099BB)' }}
        />
        <div
          className="rounded-r-full transition-all duration-700"
          style={{ width: `${isPercent ? a : awayPct}%`, background: 'linear-gradient(90deg, #FF6B35, #FF4444)' }}
        />
      </div>
    </div>
  );
}

function OverviewTab({ home, away, homeTeamName, awayTeamName, homeTeamId, awayTeamId }: {
  home: MatchStat | null;
  away: MatchStat | null;
  homeTeamName: string;
  awayTeamName: string;
  homeTeamId: number;
  awayTeamId: number;
}) {
  if (!home && !away) {
    return (
      <div className="text-center py-12 text-slate-500 dark:text-[#A8A29E]">
        <BarChart2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p>Chưa có thống kê trận đấu.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Team headers */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <img src={teamLogo(homeTeamId)} alt={homeTeamName} className="w-7 h-7 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <span className="font-body font-semibold text-sm text-[#00D9FF]">{homeTeamName}</span>
        </div>
        <span className="text-xs font-label text-slate-400 uppercase tracking-wider">Thống kê</span>
        <div className="flex items-center gap-2">
          <span className="font-body font-semibold text-sm text-[#FF4444]">{awayTeamName}</span>
          <img src={teamLogo(awayTeamId)} alt={awayTeamName} className="w-7 h-7 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </div>
      </div>

      {/* Stats */}
      <StatBar label="Kiểm soát bóng" home={home?.possession ?? null} away={away?.possession ?? null} isPercent />
      <StatBar label="Cú sút" home={home?.shots ?? null} away={away?.shots ?? null} />
      <StatBar label="Sút trúng đích" home={home?.shotsOnTarget ?? null} away={away?.shotsOnTarget ?? null} />
      <StatBar label="Sút trong vòng cấm" home={home?.shotsInsideBox ?? null} away={away?.shotsInsideBox ?? null} />
      <StatBar label="Sút ngoài vòng cấm" home={home?.shotsOutsideBox ?? null} away={away?.shotsOutsideBox ?? null} />
      <StatBar label="Sút bị chặn" home={home?.shotsBlocked ?? null} away={away?.shotsBlocked ?? null} />
      <StatBar label="Cứu thua" home={home?.saves ?? null} away={away?.saves ?? null} />
      <StatBar label="Phạt góc" home={home?.corners ?? null} away={away?.corners ?? null} />
      <StatBar label="Phạm lỗi" home={home?.fouls ?? null} away={away?.fouls ?? null} />
      <StatBar label="Thẻ vàng" home={home?.yellowCards ?? null} away={away?.yellowCards ?? null} />
      <StatBar label="Thẻ đỏ" home={home?.redCards ?? null} away={away?.redCards ?? null} />


    </div>
  );
}

// ─── Full Stats tab ───────────────────────────────────────────────────────────
function FullStatsTab({ home, away, homeTeamName, awayTeamName, homeTeamId, awayTeamId }: {
  home: MatchStat | null;
  away: MatchStat | null;
  homeTeamName: string;
  awayTeamName: string;
  homeTeamId: number;
  awayTeamId: number;
}) {
  if (!home && !away) {
    return (
      <div className="text-center py-12 text-slate-500 dark:text-[#A8A29E]">
        <BarChart2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p>Chưa có thống kê trận đấu.</p>
      </div>
    );
  }

  const Section = ({ title }: { title: string }) => (
    <div className="text-xs font-label font-bold text-slate-400 dark:text-[#A8A29E] uppercase tracking-widest mb-3 mt-6 first:mt-0">
      {title}
    </div>
  );

  return (
    <div>
      {/* Team headers */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <img src={teamLogo(homeTeamId)} alt={homeTeamName} className="w-7 h-7 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <span className="font-body font-semibold text-sm text-[#00D9FF]">{homeTeamName}</span>
        </div>
        <span className="text-xs font-label text-slate-400 uppercase tracking-wider">Thống kê</span>
        <div className="flex items-center gap-2">
          <span className="font-body font-semibold text-sm text-[#FF4444]">{awayTeamName}</span>
          <img src={teamLogo(awayTeamId)} alt={awayTeamName} className="w-7 h-7 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </div>
      </div>

      <Section title="Tổng quan" />
      <StatBar label="Kiểm soát bóng" home={home?.possession ?? null} away={away?.possession ?? null} isPercent />
      <StatBar label="Cú sút" home={home?.shots ?? null} away={away?.shots ?? null} />
      <StatBar label="Sút trúng đích" home={home?.shotsOnTarget ?? null} away={away?.shotsOnTarget ?? null} />
      <StatBar label="Cứu thua" home={home?.saves ?? null} away={away?.saves ?? null} />
      <StatBar label="Phạt góc" home={home?.corners ?? null} away={away?.corners ?? null} />
      <StatBar label="Việt vị" home={home?.offsides ?? null} away={away?.offsides ?? null} />
      <StatBar label="xG (Bàn thắng kỳ vọng)" home={home?.expectedGoals ? Number(home.expectedGoals) : null} away={away?.expectedGoals ? Number(away.expectedGoals) : null} />

      <Section title="Tấn công" />
      <StatBar label="Sút trong vòng cấm" home={home?.shotsInsideBox ?? null} away={away?.shotsInsideBox ?? null} />
      <StatBar label="Sút ngoài vòng cấm" home={home?.shotsOutsideBox ?? null} away={away?.shotsOutsideBox ?? null} />
      <StatBar label="Sút bị chặn" home={home?.shotsBlocked ?? null} away={away?.shotsBlocked ?? null} />

      <Section title="Chuyền bóng" />
      <StatBar label="Chuyền chính xác" home={home?.passesAccuracy ?? null} away={away?.passesAccuracy ?? null} />
      <StatBar label="Chuyền then chốt" home={home?.passesKey ?? null} away={away?.passesKey ?? null} />

      <Section title="Phòng thủ" />
      <StatBar label="Tắc bóng" home={home?.tacklesWon ?? null} away={away?.tacklesWon ?? null} />
      <StatBar label="Cắt bóng" home={home?.interceptions ?? null} away={away?.interceptions ?? null} />
      <StatBar label="Phá bóng" home={home?.clearances ?? null} away={away?.clearances ?? null} />

      <Section title="Kỷ luật" />
      <StatBar label="Phạm lỗi" home={home?.fouls ?? null} away={away?.fouls ?? null} />
      <StatBar label="Thẻ vàng" home={home?.yellowCards ?? null} away={away?.yellowCards ?? null} />
      <StatBar label="Thẻ đỏ" home={home?.redCards ?? null} away={away?.redCards ?? null} />
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
type TabId = 'overview' | 'info' | 'lineup';

export default function MatchDetailPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const eventId = Number(matchId);

  const [match, setMatch] = useState<SofascoreTeamMatch | null>(null);
  const [lineups, setLineups] = useState<MatchLineups | null>(null);
  const [incidents, setIncidents] = useState<any[] | null>(null);
  const [matchStats, setMatchStats] = useState<{ home: MatchStat | null; away: MatchStat | null }>({ home: null, away: null });
  const [loading, setLoading] = useState(true);
  const [lineupLoading, setLineupLoading] = useState(false);
  const [incidentsLoading, setIncidentsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  useEffect(() => {
    window.scrollTo(0, 0);

    // Preload stats + teams in background immediately (warm up cache)
    const CACHE_TTL = 30 * 60 * 1000;
    const now = Date.now();

    function getCachedData(key: string) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (now - parsed.ts > CACHE_TTL) { localStorage.removeItem(key); return null; }
        return parsed.data;
      } catch { return null; }
    }
    function setCacheData(key: string, data: unknown) {
      try { localStorage.setItem(key, JSON.stringify({ data, ts: now })); } catch { /* quota */ }
    }

    if (!getCachedData('match-statistics')) {
      leagueService.getMatchStatistics().then(d => setCacheData('match-statistics', d)).catch(() => {});
    }
    if (!getCachedData('teams')) {
      leagueService.getAllTeams().then(d => setCacheData('teams', d)).catch(() => {});
    }

    const load = async () => {
      setLoading(true);
      try {
        // 1. Try sessionStorage cache first
        const cached = sessionStorage.getItem('sofascore-matches');
        if (cached) {
          const all: SofascoreTeamMatch[] = JSON.parse(cached);
          const found = all.find(m => m.id === eventId);
          if (found) { setMatch(found); setLoading(false); loadMatchStats(found.homeTeam.id, found.awayTeam.id); return; }
        }
        // 2. Not found — fetch all leagues in parallel
        const LEAGUES = [
          { tournamentId: 626, seasonId: 78589 },
          { tournamentId: 771, seasonId: 80926 },
          { tournamentId: 3087, seasonId: 81023 },
        ];
        const fetchAll = async (fetcher: (page: number) => Promise<{ events: SofascoreTeamMatch[]; hasNextPage: boolean }>) => {
          const all: SofascoreTeamMatch[] = [];
          let page = 0;
          let hasNext = true;
          while (hasNext) {
            const { events, hasNextPage } = await fetcher(page);
            all.push(...events);
            hasNext = hasNextPage;
            page++;
          }
          return all;
        };

        // Fetch all leagues in parallel instead of sequential
        const leagueResults = await Promise.all(
          LEAGUES.map(league => Promise.all([
            fetchAll(p => leagueService.getTournamentLastMatches(league.tournamentId, league.seasonId, p)),
            fetchAll(p => leagueService.getTournamentNextMatches(league.tournamentId, league.seasonId, p)),
          ]))
        );
        const allMatches: SofascoreTeamMatch[] = leagueResults.flatMap(([last, next]) => [...last, ...next]);

        try { sessionStorage.setItem('sofascore-matches', JSON.stringify(allMatches)); } catch { /* ignore */ }

        const found = allMatches.find(m => m.id === eventId);
        if (found) {
          setMatch(found);
          loadMatchStats(found.homeTeam.id, found.awayTeam.id);
        }
      } catch { /* ignore */ }
      setLoading(false);
    };
    load();
  }, [eventId]);

  const loadMatchStats = async (homeSofaId: number, awaySofaId: number) => {
    try {
      const CACHE_TTL = 30 * 60 * 1000;
      const now = Date.now();

      function getCachedData(key: string) {
        try {
          const raw = localStorage.getItem(key);
          if (!raw) return null;
          const parsed = JSON.parse(raw);
          if (now - parsed.ts > CACHE_TTL) { localStorage.removeItem(key); return null; }
          return parsed.data;
        } catch { return null; }
      }
      function setCacheData(key: string, data: unknown) {
        try { localStorage.setItem(key, JSON.stringify({ data, ts: now })); } catch { /* quota */ }
      }

      const [allStats, dbTeams] = await Promise.all([
        (async () => {
          const cached = getCachedData('match-statistics');
          if (cached) return cached as MatchStat[];
          const data = await leagueService.getMatchStatistics();
          setCacheData('match-statistics', data);
          return data;
        })(),
        (async () => {
          const cached = getCachedData('teams');
          if (cached) return cached as any[];
          const data = await leagueService.getAllTeams();
          setCacheData('teams', data);
          return data;
        })(),
      ]);

      const homeDbTeam = dbTeams.find((t: any) => t.apiTeamId === homeSofaId);
      const awayDbTeam = dbTeams.find((t: any) => t.apiTeamId === awaySofaId);
      if (!homeDbTeam || !awayDbTeam) return;

      const homeStats = allStats.filter((s: MatchStat) => s.teamId === homeDbTeam.teamId && s.possession !== null);
      const awayStats = allStats.filter((s: MatchStat) => s.teamId === awayDbTeam.teamId && s.possession !== null);

      const homeMatchIds = new Set(homeStats.map((s: MatchStat) => s.matchId));
      const awayMatchIds = new Set(awayStats.map((s: MatchStat) => s.matchId));
      const commonMatchId = [...homeMatchIds].find(id => awayMatchIds.has(id));

      if (commonMatchId) {
        const home = homeStats.find((s: MatchStat) => s.matchId === commonMatchId) ?? null;
        const away = awayStats.find((s: MatchStat) => s.matchId === commonMatchId) ?? null;
        setMatchStats({ home, away });
      }
    } catch (e) {}
  };

  const loadLineups = async () => {
    if (lineups) return;
    setLineupLoading(true);
    try {
      const data = await leagueService.getLineups(eventId);
      setLineups(data);
    } catch {
      toast.error('Không thể tải đội hình');
    } finally {
      setLineupLoading(false);
    }
  };

  const loadIncidents = async () => {
    if (incidents) return;
    setIncidentsLoading(true);
    try {
      const data = await leagueService.getIncidents(eventId);
      // Sort by time ascending (earliest first), periods last
      const sorted = (data?.incidents ?? []).sort((a: any, b: any) => {
        if (a.incidentType === 'period' && b.incidentType !== 'period') return 1;
        if (a.incidentType !== 'period' && b.incidentType === 'period') return -1;
        return (a.time ?? 0) - (b.time ?? 0) || (a.addedTime ?? 0) - (b.addedTime ?? 0);
      });
      setIncidents(sorted);
    } catch {
      toast.error('Không thể tải diễn biến');
    } finally {
      setIncidentsLoading(false);
    }
  };

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    if (tab === 'lineup') loadLineups();
    if (tab === 'info') loadIncidents();
  };

  // Auto-load incidents when match is ready
  useEffect(() => {
    if (match && activeTab === 'info') loadIncidents();
  }, [match]);

  const isLive = match?.status.type === 'inprogress';
  const isFinished = match?.status.type === 'finished';
  const date = match ? new Date(match.startTimestamp * 1000) : null;

  const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Tổng quan', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'info',     label: 'Diễn biến', icon: <Swords className="w-4 h-4" /> },
    { id: 'lineup',   label: 'Đội hình',  icon: <Users className="w-4 h-4" /> },
  ];

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-[#00D9FF] animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
            <Link to="/matches" className="inline-flex items-center gap-2 text-slate-600 dark:text-[#A8A29E] hover:text-foreground transition-colors mb-8">
              <ArrowLeft className="w-4 h-4" />
              <span className="font-label text-sm font-medium">Quay lại lịch thi đấu</span>
            </Link>
          </motion.div>

          {/* Match header card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card rounded-3xl p-6 sm:p-10 mb-6"
          >
            {/* Round + status */}
            <div className="flex items-center justify-center gap-3 mb-6 flex-wrap">
              {match?.roundInfo?.round && (
                <span className="text-sm text-slate-500 dark:text-[#A8A29E] font-label uppercase tracking-wider font-semibold">
                  Vòng {match.roundInfo.round}
                </span>
              )}
              {isLive && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF4444]/20 rounded-full">
                  <Radio className="w-3 h-3 text-[#FF4444] animate-pulse" />
                  <span className="text-xs font-label font-semibold text-[#FF4444] uppercase">Trực tiếp</span>
                </span>
              )}
              {isFinished && (
                <span className="px-3 py-1.5 bg-slate-200 dark:bg-white/5 rounded-full text-sm font-label text-slate-600 dark:text-[#A8A29E] font-semibold">Kết thúc</span>
              )}
              {!isLive && !isFinished && (
                <span className="px-3 py-1.5 bg-[#00D9FF]/10 rounded-full text-sm font-label text-[#00D9FF] font-semibold">Sắp diễn ra</span>
              )}
            </div>

            {/* Teams + score */}
            <div className="flex items-center justify-center gap-6 sm:gap-12 mb-8">
              {/* Home */}
              <div className="flex-1 flex flex-col items-center gap-3">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-white/10">
                  {match && (
                    <img src={teamLogo(match.homeTeam.id)} alt={match.homeTeam.name}
                      className="w-14 h-14 sm:w-16 sm:h-16 object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  )}
                </div>
                <h3 className="font-display font-bold text-base sm:text-lg text-foreground text-center leading-tight">
                  {match?.homeTeam.name ?? '—'}
                </h3>
                <span className="text-xs text-slate-500 dark:text-[#A8A29E]">Chủ nhà</span>
              </div>

              {/* Score / time */}
              <div className="flex flex-col items-center gap-2">
                {(isLive || isFinished) && match ? (
                  <div className="flex items-center gap-3 sm:gap-5">
                    <span className="font-mono-data text-5xl sm:text-6xl font-bold text-foreground">{match.homeScore.current}</span>
                    <span className="text-slate-400 text-3xl">-</span>
                    <span className="font-mono-data text-5xl sm:text-6xl font-bold text-foreground">{match.awayScore.current}</span>
                  </div>
                ) : (
                  <p className="font-mono-data text-2xl sm:text-3xl text-[#00D9FF]">
                    {date?.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) ?? '--:--'}
                  </p>
                )}
                {date && (
                  <p className="text-sm text-slate-500 dark:text-[#A8A29E]">
                    {date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                )}
              </div>

              {/* Away */}
              <div className="flex-1 flex flex-col items-center gap-3">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-white/10">
                  {match && (
                    <img src={teamLogo(match.awayTeam.id)} alt={match.awayTeam.name}
                      className="w-14 h-14 sm:w-16 sm:h-16 object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  )}
                </div>
                <h3 className="font-display font-bold text-base sm:text-lg text-foreground text-center leading-tight">
                  {match?.awayTeam.name ?? '—'}
                </h3>
                <span className="text-xs text-slate-500 dark:text-[#A8A29E]">Khách</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-t border-slate-200 dark:border-white/10 pt-4 -mb-2">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-label font-semibold transition-all',
                    activeTab === tab.id
                      ? 'bg-[#00D9FF]/15 text-[#00D9FF]'
                      : 'text-slate-500 dark:text-[#A8A29E] hover:text-foreground hover:bg-slate-100 dark:hover:bg-white/5'
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Tab content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="glass-card rounded-2xl p-6 sm:p-8"
          >
            {activeTab === 'info' && (
              incidentsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-10 h-10 text-[#00D9FF] animate-spin" />
                </div>
              ) : incidents && incidents.filter(i => i.incidentType !== 'period' && i.incidentType !== 'injuryTime').length > 0 ? (
                <div>
                  <h3 className="font-display font-bold text-lg text-foreground mb-5 flex items-center gap-2">
                    <Swords className="w-5 h-5 text-[#FF4444]" />
                    Diễn biến trận đấu
                  </h3>
                  {/* Period separators + events */}
                  {(() => {
                    const all = incidents ?? [];
                    const periods = all.filter(i => i.incidentType === 'period');
                    const events = all.filter(i => i.incidentType !== 'period' && i.incidentType !== 'injuryTime');

                    // Group events by period
                    const ht = periods.find(p => p.text === 'HT');
                    const ft = periods.find(p => p.text === 'FT');
                    const firstHalf = events.filter(e => (e.time ?? 0) <= 45);
                    const secondHalf = events.filter(e => (e.time ?? 0) > 45);

                    const renderEvent = (inc: any, idx: number) => {
                      const isHome = inc.isHome === true;
                      const timeStr = inc.addedTime ? `${inc.time}+${inc.addedTime}'` : `${inc.time}'`;

                      let icon = '•';
                      let label = '';
                      let colorCls = 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10';
                      let textCls = 'text-foreground';

                      if (inc.incidentType === 'goal') {
                        icon = inc.incidentClass === 'penalty' ? '⚽' : inc.incidentClass === 'ownGoal' ? '⚽' : '⚽';
                        label = inc.incidentClass === 'penalty' ? 'Penalty' : inc.incidentClass === 'ownGoal' ? 'Phản lưới' : 'Bàn thắng';
                        colorCls = 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20';
                        textCls = 'text-green-700 dark:text-green-400';
                      } else if (inc.incidentType === 'card') {
                        icon = inc.incidentClass === 'yellow' ? '🟨' : inc.incidentClass === 'yellowRed' ? '🟨🟥' : '🟥';
                        label = inc.incidentClass === 'yellow' ? 'Thẻ vàng' : inc.incidentClass === 'yellowRed' ? 'Thẻ vàng/đỏ' : 'Thẻ đỏ';
                        colorCls = inc.incidentClass === 'yellow'
                          ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20'
                          : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20';
                        textCls = inc.incidentClass === 'yellow' ? 'text-amber-700 dark:text-amber-400' : 'text-red-700 dark:text-red-400';
                      } else if (inc.incidentType === 'substitution') {
                        icon = '🔄';
                        label = 'Thay người';
                      } else if (inc.incidentType === 'varDecision') {
                        icon = '📺';
                        label = 'VAR';
                      }

                      const playerName = inc.player?.shortName || inc.player?.name || '';
                      const scoreLine = inc.homeScore != null ? `${inc.homeScore} - ${inc.awayScore}` : null;

                      return (
                        <div key={inc.id ?? idx} className={`flex items-center gap-2 ${isHome ? 'flex-row' : 'flex-row-reverse'}`}>
                          <div className={`flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border ${colorCls} ${isHome ? 'justify-start' : 'justify-end'}`}>
                            <span className="text-base leading-none flex-shrink-0">{icon}</span>
                            <div className={`flex flex-col ${isHome ? 'items-start' : 'items-end'} min-w-0`}>
                              <span className={`text-xs font-semibold ${textCls}`}>{label}</span>
                              {/* Goal: scorer name */}
                              {inc.incidentType === 'goal' && (inc.player?.name || inc.player?.shortName) && (
                                <span className="text-xs text-slate-600 dark:text-[#A8A29E] truncate max-w-[120px]">
                                  {inc.player.shortName || inc.player.name}
                                  {inc.incidentClass === 'penalty' && ' (P)'}
                                  {inc.incidentClass === 'ownGoal' && ' (OG)'}
                                </span>
                              )}
                              {/* Card: player name */}
                              {inc.incidentType === 'card' && (inc.player?.name || inc.player?.shortName) && (
                                <span className="text-xs text-slate-600 dark:text-[#A8A29E] truncate max-w-[120px]">
                                  {inc.player.shortName || inc.player.name}
                                </span>
                              )}
                              {/* Substitution: out → in */}
                              {inc.incidentType === 'substitution' && (
                                <div className={`flex flex-col text-xs text-slate-600 dark:text-[#A8A29E] ${isHome ? 'items-start' : 'items-end'}`}>
                                  {inc.playerOut && (
                                    <span className="flex items-center gap-1">
                                      <span className="text-red-400">▼</span>
                                      <span className="truncate max-w-[100px]">{inc.playerOut.shortName || inc.playerOut.name}</span>
                                    </span>
                                  )}
                                  {inc.playerIn && (
                                    <span className="flex items-center gap-1">
                                      <span className="text-green-400">▲</span>
                                      <span className="truncate max-w-[100px]">{inc.playerIn.shortName || inc.playerIn.name}</span>
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            {scoreLine && (
                              <span className="ml-auto font-mono-data text-xs font-bold text-foreground flex-shrink-0">{scoreLine}</span>
                            )}
                          </div>
                          {/* Time */}
                          <div className="w-14 flex-shrink-0 flex justify-center">
                            <span className="px-2 py-1 rounded-lg bg-slate-200 dark:bg-white/10 text-xs font-mono-data font-bold text-slate-700 dark:text-slate-300">
                              {timeStr}
                            </span>
                          </div>
                          <div className="flex-1" />
                        </div>
                      );
                    };

                    return (
                      <div className="space-y-2 relative">
                        {/* Center line */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 dark:bg-white/10 -translate-x-1/2 pointer-events-none" />

                        {firstHalf.length > 0 && firstHalf.map((inc, i) => renderEvent(inc, i))}

                        {ht && (
                          <div className="flex justify-center py-2">
                            <span className="px-4 py-1.5 rounded-full bg-slate-200 dark:bg-white/10 text-xs font-label font-bold text-slate-600 dark:text-[#A8A29E] uppercase tracking-wider">
                              Hiệp 1 kết thúc — {ht.homeScore} : {ht.awayScore}
                            </span>
                          </div>
                        )}

                        {secondHalf.length > 0 && secondHalf.map((inc, i) => renderEvent(inc, i + 100))}

                        {ft && (
                          <div className="flex justify-center py-2">
                            <span className="px-4 py-1.5 rounded-full bg-[#FF4444]/10 text-xs font-label font-bold text-[#FF4444] uppercase tracking-wider">
                              Kết thúc — {ft.homeScore} : {ft.awayScore}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              ) : incidents ? (
                <div className="text-center py-12 text-slate-500 dark:text-[#A8A29E]">
                  <Swords className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p>Chưa có diễn biến trận đấu.</p>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 dark:text-[#A8A29E]">
                  <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin opacity-40" />
                </div>
              )
            )}

            {activeTab === 'lineup' && (
              lineupLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-10 h-10 text-[#00D9FF] animate-spin" />
                </div>
              ) : lineups ? (
                <LineupTab
                  lineups={lineups}
                  homeTeamName={match?.homeTeam.name ?? 'Chủ nhà'}
                  awayTeamName={match?.awayTeam.name ?? 'Khách'}
                  homeTeamId={match?.homeTeam.id ?? 0}
                  awayTeamId={match?.awayTeam.id ?? 0}
                  incidents={incidents}
                />
              ) : (
                <div className="text-center py-16 text-slate-500 dark:text-[#A8A29E]">
                  <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p>Chưa có thông tin đội hình.</p>
                </div>
              )
            )}

            {activeTab === 'overview' && (
              <OverviewTab
                home={(isFinished || isLive) ? matchStats.home : null}
                away={(isFinished || isLive) ? matchStats.away : null}
                homeTeamName={match?.homeTeam.name ?? 'Chủ nhà'}
                awayTeamName={match?.awayTeam.name ?? 'Khách'}
                homeTeamId={match?.homeTeam.id ?? 0}
                awayTeamId={match?.awayTeam.id ?? 0}
              />
            )}
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}
