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
function PlayerModal({ p, eventId, matchStatsMap, onClose }: { p: LineupPlayer; eventId: number; matchStatsMap?: Map<number, any>; onClose: () => void }) {
  const isGK = p.position === 'G';
  const [statTab, setStatTab] = useState<'shot' | 'pass' | 'drib' | 'def' | 'gk'>(isGK ? 'gk' : 'shot');
  const [extraStats, setExtraStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      if (!p.player.id) return;
      // matchStatsMap đã được LineupTab sync sẵn — dùng trực tiếp
      if (matchStatsMap && matchStatsMap.has(p.player.id)) {
        setExtraStats(matchStatsMap.get(p.player.id));
      }
    };
    fetchStats();
  }, [p.player.id, matchStatsMap]);
  // Merge lineup stats + detailed stats, map both DB field names and Sofascore field names
  const raw = extraStats ?? {};
  const isDbData = matchStatsMap?.has(p.player.id) && extraStats === matchStatsMap.get(p.player.id);
  const s = {
    goals:               p.statistics?.goals              ?? raw.goals,
    ownGoals:            p.statistics?.ownGoals            ?? raw.ownGoals,
    minutesPlayed:       p.statistics?.minutesPlayed       ?? raw.minutes         ?? raw.minutesPlayed,
    totalShots:          p.statistics?.totalShots          ?? raw.shots           ?? raw.totalShots,
    rating:              p.statistics?.rating              ?? (raw.rating != null ? Number(raw.rating) : undefined),
    assists:             p.statistics?.assists             ?? raw.assists,
    yellowCards:         p.statistics?.yellowCards         ?? raw.yellowCards,
    redCards:            p.statistics?.redCards            ?? raw.redCards,
    shotsOnTarget:       p.statistics?.shotsOnTarget       ?? raw.shotsOnTarget   ?? raw.onTargetScoringAttempt,
    blockedShots:        p.statistics?.blockedShots        ?? raw.blocks          ?? raw.blockedScoringAttempt,
    bigChancesCreated:   p.statistics?.bigChancesCreated   ?? raw.bigChanceCreated,
    bigChancesMissed:    p.statistics?.bigChancesMissed    ?? raw.bigChanceMissed,
    keyPasses:           p.statistics?.keyPasses           ?? raw.passesKey       ?? raw.keyPass,
    accuratePasses:      p.statistics?.accuratePasses      ?? (isDbData && raw.passes && raw.passesAccuracy ? Math.round(raw.passes * raw.passesAccuracy / 100) : null) ?? raw.accuratePass,
    totalPasses:         p.statistics?.totalPasses         ?? raw.passes          ?? raw.totalPass,
    accurateLongBalls:   p.statistics?.accurateLongBalls   ?? raw.accurateLongBalls,
    totalLongBalls:      p.statistics?.totalLongBalls      ?? raw.totalLongBalls,
    accurateCrosses:     p.statistics?.accurateCrosses     ?? raw.accurateCrosses ?? raw.accurateCross,
    totalCrosses:        p.statistics?.totalCrosses        ?? raw.totalCrosses    ?? raw.totalCross,
    dribbleAttempts:     p.statistics?.dribbleAttempts     ?? raw.dribblesAttempted ?? raw.attemptedDribbles,
    successfulDribbles:  p.statistics?.successfulDribbles  ?? raw.dribblesSuccess ?? raw.wonDribble,
    tackles:             p.statistics?.tackles             ?? raw.tackles         ?? raw.totalTackle,
    interceptions:       p.statistics?.interceptions       ?? raw.interceptions   ?? raw.interceptionWon,
    clearances:          p.statistics?.clearances          ?? raw.clearances      ?? raw.totalClearance,
    aerialDuelsWon:      p.statistics?.aerialDuelsWon      ?? raw.aerialDuelsWon  ?? raw.aerialWon,
    aerialDuelsTotal:    p.statistics?.aerialDuelsTotal    ?? (raw.aerialDuelsWon != null && raw.aerialDuelsLost != null ? raw.aerialDuelsWon + raw.aerialDuelsLost : null),
    groundDuelsWon:      raw.groundDuelsWon,
    groundDuelsTotal:    raw.groundDuelsWon != null && raw.groundDuelsLost != null ? raw.groundDuelsWon + raw.groundDuelsLost : null,
    foulsCommitted:      p.statistics?.foulsCommitted      ?? raw.foulsCommitted  ?? raw.foulCommitted,
    wasFouled:           p.statistics?.wasFouled           ?? raw.wasFouled,
    possessionLost:      p.statistics?.possessionLost      ?? raw.possessionLost,
    touches:             p.statistics?.touches             ?? raw.touches,
    // GK stats — DB field names match model
    saves:               raw.saves,
    savesInsideBox:      raw.savesInsideBox,
    punches:             raw.punches,
    runsOut:             raw.runsOut             ?? raw.totalKeeperSweeper,
    runsOutSuccessful:   raw.runsOutSuccessful   ?? raw.keeperSweeper,
    highClaims:          raw.highClaims          ?? raw.goodHighClaim,
    goalsConceded:       raw.goalsConceded,
    penaltiesSaved:      raw.penaltiesSaved       ?? raw.penaltySave,
  };
  const hasAnyStats = p.statistics != null || extraStats != null;
  const rating = s?.rating;

  const ratingColor = rating == null ? '#6b7280'
    : rating >= 8 ? '#22c55e'
    : rating >= 7 ? '#84cc16'
    : rating >= 6 ? '#eab308'
    : '#ef4444';

  const statSections: Record<string, { label: string; rows: { label: string; val: number | string | undefined | null }[] }> = {
    shot: {
      label: 'Sút',
      rows: [
        { label: 'Bàn thắng', val: s?.goals },
        { label: 'Tổng cú sút', val: s?.totalShots },
        { label: 'Sút trúng đích', val: s?.shotsOnTarget },
        { label: 'Sút bị chặn', val: s?.blockedShots },
        { label: 'Cơ hội lớn bỏ lỡ', val: s?.bigChancesMissed },
      ],
    },
    pass: {
      label: 'Chuyền',
      rows: [
        { label: 'Kiến tạo', val: s?.assists },
        { label: 'Chuyền chính xác', val: s?.accuratePasses != null && s?.totalPasses != null ? `${s.accuratePasses}/${s.totalPasses}` : s?.accuratePasses },
        { label: 'Chuyền dài chính xác', val: s?.accurateLongBalls != null && s?.totalLongBalls != null ? `${s.accurateLongBalls}/${s.totalLongBalls}` : undefined },
        { label: 'Tạt bóng chính xác', val: s?.accurateCrosses != null && s?.totalCrosses != null ? `${s.accurateCrosses}/${s.totalCrosses}` : undefined },
        { label: 'Chuyền then chốt', val: s?.keyPasses },
        { label: 'Cơ hội lớn tạo ra', val: s?.bigChancesCreated },
      ],
    },
    drib: {
      label: 'Rê bóng',
      rows: [
        { label: 'Rê bóng thành công', val: s?.successfulDribbles != null && s?.dribbleAttempts != null ? `${s.successfulDribbles}/${s.dribbleAttempts}` : s?.successfulDribbles },
        { label: 'Chạm bóng', val: s?.touches },
        { label: 'Mất bóng', val: s?.possessionLost },
        { label: 'Bị phạm lỗi', val: s?.wasFouled },
        { label: 'Phạm lỗi', val: s?.foulsCommitted },
      ],
    },
    def: {
      label: 'Phòng thủ',
      rows: [
        { label: 'Tắc bóng', val: s?.tackles },
        { label: 'Cắt bóng', val: s?.interceptions },
        { label: 'Phá bóng', val: s?.clearances },
        { label: 'Tranh chấp thành công trên không', val: s?.aerialDuelsWon != null && s?.aerialDuelsTotal != null ? `${s.aerialDuelsWon}/${s.aerialDuelsTotal}` : undefined },
        { label: 'Tranh chấp thành công dưới đất', val: s?.groundDuelsWon != null && s?.groundDuelsTotal != null ? `${s.groundDuelsWon}/${s.groundDuelsTotal}` : s?.groundDuelsWon != null ? String(s.groundDuelsWon) : undefined },
        { label: 'Thẻ vàng', val: s?.yellowCards },
        { label: 'Thẻ đỏ', val: s?.redCards },
      ],
    },
    gk: {
      label: 'Thủ môn',
      rows: [
        { label: 'Cứu thua', val: s?.saves },
        { label: 'Cứu thua trong vòng cấm', val: s?.savesInsideBox },
        { label: 'Thủng lưới', val: s?.goalsConceded },
        { label: 'Cản phá penalty', val: s?.penaltiesSaved },
        { label: 'Đấm bóng', val: s?.punches },
        { label: 'Ra khỏi khung thành', val: s?.runsOut != null && s?.runsOutSuccessful != null ? `${s.runsOutSuccessful}/${s.runsOut}` : s?.runsOut },
        { label: 'Bắt bóng bổng', val: s?.highClaims },
      ],
    },
  };

  const visibleTabs = isGK
    ? (['gk', 'shot', 'pass', 'def'] as const)
    : (['shot', 'pass', 'drib', 'def'] as const);

  const activeRows = statSections[statTab]?.rows.filter(r => r.val != null && r.val !== undefined) ?? [];

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
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 16 }}
          transition={{ type: 'spring', damping: 22, stiffness: 320 }}
          className="glass-card rounded-2xl w-full max-w-sm relative overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-slate-100 dark:border-white/10">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-white/5 flex-shrink-0 border border-slate-200 dark:border-white/10">
              <img
                src={playerPhoto(p.player.id)}
                alt={p.player.name}
                className="w-full h-full object-cover object-top"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#00D9FF]/10 text-[#00D9FF] font-semibold">
                  {posLabel(p.position)}
                </span>
                {p.captain && <span className="text-xs text-yellow-500 font-bold">© Đội trưởng</span>}
              </div>
              <h3 className="font-display font-bold text-base text-foreground leading-tight truncate">{p.player.name}</h3>
              <p className="text-xs text-slate-500 dark:text-[#A8A29E]">#{p.shirtNumber}{p.player.country?.name ? ` · ${p.player.country.name}` : ''}</p>
            </div>
            {/* Rating */}
            {rating != null && (
              <div className="flex flex-col items-center flex-shrink-0">
                <span className="font-mono-data text-2xl font-black leading-none" style={{ color: ratingColor }}>{rating.toFixed(1)}</span>
                <span className="text-[9px] text-slate-400 mt-0.5 uppercase tracking-wide">Rating</span>
              </div>
            )}
            <button onClick={onClose} className="ml-1 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors flex-shrink-0">
              <X className="w-4 h-4 text-slate-500 dark:text-[#A8A29E]" />
            </button>
          </div>

          {/* Quick info row */}
          <div className="flex divide-x divide-slate-100 dark:divide-white/10 border-b border-slate-100 dark:border-white/10">
            {s.minutesPlayed != null && (
              <div className="flex-1 flex flex-col items-center py-2.5">
                <span className="font-mono-data font-bold text-base text-foreground">{s.minutesPlayed}'</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Phút</span>
              </div>
            )}
            {s.goals != null && (
              <div className="flex-1 flex flex-col items-center py-2.5">
                <span className="font-mono-data font-bold text-base text-foreground">{s.goals}</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Bàn thắng</span>
              </div>
            )}
            {s.assists != null && (
              <div className="flex-1 flex flex-col items-center py-2.5">
                <span className="font-mono-data font-bold text-base text-foreground">{s.assists}</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Kiến tạo</span>
              </div>
            )}
            {s.totalShots != null && (
              <div className="flex-1 flex flex-col items-center py-2.5">
                <span className="font-mono-data font-bold text-base text-foreground">{s.totalShots}</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Cú sút</span>
              </div>
            )}
          </div>

          {/* Stat tabs */}
          {hasAnyStats && (
            <div className="p-4">
              <div className="flex gap-1 bg-slate-100 dark:bg-white/5 rounded-lg p-1 mb-3">
                {visibleTabs.map(tab => (
                  <button key={tab} onClick={() => setStatTab(tab)}
                    className={cn('flex-1 py-1.5 rounded-md text-[11px] font-semibold transition-all',
                      statTab === tab
                        ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-foreground shadow-sm'
                        : 'text-slate-500 dark:text-[#A8A29E] hover:text-slate-700 dark:hover:text-foreground'
                    )}>
                    {statSections[tab].label}
                  </button>
                ))}
              </div>

              {loadingStats ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-5 h-5 text-[#00D9FF] animate-spin" />
                </div>
              ) : activeRows.length > 0 ? (
                <div className="space-y-2">
                  {activeRows.map(row => (
                    <div key={row.label} className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-white/5 last:border-0">
                      <span className="text-xs text-slate-500 dark:text-[#A8A29E]">{row.label}</span>
                      <span className="font-mono-data text-sm font-semibold text-foreground">{row.val}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-xs text-slate-400 py-4">Không có dữ liệu</p>
              )}
            </div>
          )}

          {/* Link to player page — chỉ hiện khi player đã sync vào DB */}
          {(() => {
            // apiPlayerId chỉ có khi x.Player được Include thành công
            // Nếu null nghĩa là player chưa sync → ẩn link tránh 404
            const dbPlayerId = extraStats?.playerId;
            const hasApiPlayerId = extraStats?.apiPlayerId != null;
            if (!dbPlayerId || !hasApiPlayerId) return null;
            return (
              <div className="px-4 pb-4">
                <a href={`/players/${dbPlayerId}`}
                  className="block w-full text-center py-2 rounded-xl bg-[#00D9FF]/10 text-[#00D9FF] text-xs font-semibold hover:bg-[#00D9FF]/20 transition-colors">
                  Xem trang cầu thủ →
                </a>
              </div>
            );
          })()}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Formation pitch ──────────────────────────────────────────────────────────
function PitchSVG() {
  return (
    <svg viewBox="0 0 100 160" className="absolute inset-0 w-full h-full" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      {/* Grass stripes */}
      {[0,1,2,3,4,5,6,7].map(i => (
        <rect key={i} x="0" y={i*20} width="100" height="20" fill={i%2===0 ? 'rgba(255,255,255,0.03)' : 'transparent'} />
      ))}
      {/* Outer border */}
      <rect x="2" y="2" width="96" height="156" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.6" />
      {/* Halfway line */}
      <line x1="2" y1="80" x2="98" y2="80" stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" />
      {/* Center circle */}
      <circle cx="50" cy="80" r="14" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" />
      {/* Center dot */}
      <circle cx="50" cy="80" r="0.8" fill="rgba(255,255,255,0.4)" />
      {/* Top penalty area */}
      <rect x="20" y="2" width="60" height="26" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="0.5" />
      {/* Top goal area */}
      <rect x="33" y="2" width="34" height="10" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="0.5" />
      {/* Top goal */}
      <rect x="40" y="0.5" width="20" height="3" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.6" />
      {/* Top penalty spot */}
      <circle cx="50" cy="20" r="0.8" fill="rgba(255,255,255,0.35)" />
      {/* Top penalty arc */}
      <path d="M 36 28 A 14 14 0 0 1 64 28" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="0.5" />
      {/* Bottom penalty area */}
      <rect x="20" y="132" width="60" height="26" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="0.5" />
      {/* Bottom goal area */}
      <rect x="33" y="148" width="34" height="10" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="0.5" />
      {/* Bottom goal */}
      <rect x="40" y="156.5" width="20" height="3" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.6" />
      {/* Bottom penalty spot */}
      <circle cx="50" cy="140" r="0.8" fill="rgba(255,255,255,0.35)" />
      {/* Bottom penalty arc */}
      <path d="M 36 132 A 14 14 0 0 0 64 132" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="0.5" />
      {/* Corner arcs */}
      <path d="M 2 6 A 4 4 0 0 1 6 2" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
      <path d="M 94 2 A 4 4 0 0 1 98 6" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
      <path d="M 2 154 A 4 4 0 0 0 6 158" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
      <path d="M 98 154 A 4 4 0 0 1 94 158" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
    </svg>
  );
}

function PlayerPin({ p, color, onSelect, events }: {
  p: LineupPlayer;
  color: { primary: string; number: string };
  onSelect: (p: LineupPlayer) => void;
  events?: { icon: string; time: string }[];
}) {
  const [imgOk, setImgOk] = useState(true);
  const hasGoal = events?.some(e => e.icon.startsWith('⚽'));
  const hasYellow = events?.some(e => e.icon === '🟨');
  const hasRed = events?.some(e => e.icon === '🟥');
  const hasSub = events?.some(e => e.icon.startsWith('🔼') || e.icon.startsWith('🔽'));
  const rating = p.statistics?.rating;

  return (
    <button onClick={() => onSelect(p)} className="flex flex-col items-center gap-0.5 group" style={{ width: 52 }}>
      <div className="relative">
        {/* Avatar circle */}
        <div
          className="w-9 h-9 rounded-full overflow-hidden border-2 shadow-lg group-hover:scale-110 transition-transform duration-150 flex items-center justify-center text-xs font-bold"
          style={{ borderColor: `#${color.primary}`, background: `#${color.primary}`, color: `#${color.number}` }}
        >
          {imgOk ? (
            <img
              src={playerPhoto(p.player.id)}
              alt={p.player.name}
              className="w-full h-full object-cover object-top"
              onError={() => setImgOk(false)}
            />
          ) : (
            <span style={{ color: `#${color.number}`, fontSize: 11, fontWeight: 700 }}>{p.shirtNumber}</span>
          )}
        </div>

        {/* Captain badge */}
        {p.captain && (
          <span className="absolute -top-1 -left-1 w-3.5 h-3.5 rounded-full bg-yellow-400 flex items-center justify-center text-[7px] font-black text-yellow-900 leading-none shadow">C</span>
        )}

        {/* Rating badge */}
        {rating != null && (
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1 py-px rounded text-[8px] font-bold leading-none shadow"
            style={{ background: rating >= 7 ? '#22c55e' : rating >= 6 ? '#eab308' : '#ef4444', color: '#fff', minWidth: 20, textAlign: 'center' }}>
            {rating.toFixed(1)}
          </span>
        )}

        {/* Event icons */}
        {(hasGoal || hasYellow || hasRed || hasSub) && (
          <div className="absolute -top-1 -right-1 flex gap-px">
            {hasGoal && <span className="text-[9px] leading-none drop-shadow">⚽</span>}
            {hasRed && <span className="text-[9px] leading-none drop-shadow">🟥</span>}
            {hasYellow && !hasRed && <span className="text-[9px] leading-none drop-shadow">🟨</span>}
            {hasSub && <span className="text-[9px] leading-none drop-shadow">{events?.find(e => e.icon.startsWith('🔼')) ? '🔼' : '🔽'}</span>}
          </div>
        )}
      </div>

      {/* Name */}
      <span className="text-[9px] text-white/90 text-center leading-tight font-medium max-w-[50px] truncate group-hover:text-yellow-300 transition-colors mt-1">
        {p.player.shortName || p.player.name.split(' ').slice(-1)[0]}
      </span>
    </button>
  );
}

function FormationPitch({ lineup, side, onSelect, playerEvents }: {
  lineup: { players: LineupPlayer[]; formation: string; playerColor: { primary: string; number: string }; goalkeeperColor: { primary: string; number: string } };
  side: 'home' | 'away';
  onSelect: (p: LineupPlayer) => void;
  playerEvents?: Map<number, { icon: string; time: string }[]>;
}) {
  const starters = lineup.players.filter(p => !p.substitute);
  const rows = lineup.formation.split('-').map(Number);
  const gk = starters.filter(p => p.position === 'G');
  const field = starters.filter(p => p.position !== 'G');

  const groups: LineupPlayer[][] = [gk];
  let idx = 0;
  for (const count of rows) {
    groups.push(field.slice(idx, idx + count));
    idx += count;
  }

  const displayGroups = side === 'away' ? [...groups].reverse() : groups;

  return (
    <div className="relative w-full rounded-xl overflow-hidden select-none"
      style={{ background: 'linear-gradient(180deg, #1b5e35 0%, #1e6b3c 30%, #1e6b3c 70%, #1b5e35 100%)', aspectRatio: '10/16', minHeight: 340 }}>
      <PitchSVG />
      <div className="absolute inset-0 flex flex-col justify-around py-4 px-1">
        {displayGroups.map((row, ri) => (
          <div key={ri} className="flex justify-around items-center">
            {row.map(p => (
              <PlayerPin
                key={p.player.id}
                p={p}
                color={p.position === 'G' ? lineup.goalkeeperColor : lineup.playerColor}
                onSelect={onSelect}
                events={playerEvents?.get(p.player.id)}
              />
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
function LineupTab({ lineups, homeTeamName, awayTeamName, homeTeamId, awayTeamId, incidents, eventId }: {
  lineups: MatchLineups;
  homeTeamName: string;
  awayTeamName: string;
  homeTeamId: number;
  awayTeamId: number;
  incidents?: any[] | null;
  eventId: number;
}) {
  const [view, setView] = useState<'pitch' | 'list'>('pitch');
  const [selectedPlayer, setSelectedPlayer] = useState<LineupPlayer | null>(null);
  // Pre-fetch all player match stats from DB once — keyed by apiPlayerId
  const [matchStatsMap, setMatchStatsMap] = useState<Map<number, any>>(new Map());
  const [statsSyncing, setStatsSyncing] = useState(false);

  useEffect(() => {
    if (!eventId) return;
    const loadStats = async () => {
      // Try DB first
      const rows = await leagueService.getPlayerMatchStatsByMatch(eventId).catch(() => [] as any[]);
      if (rows.length > 0) {
        const map = new Map<number, any>();
        for (const r of rows) { if (r.apiPlayerId) map.set(r.apiPlayerId, r); }
        setMatchStatsMap(map);
        return;
      }
      // DB empty — trigger sync in background
      setStatsSyncing(true);
      try {
        await fetch(`/api/SofascoreHybrid/sync-player-match-stats-by-match?apiFixtureId=${eventId}`, { method: 'POST' });
        const synced = await leagueService.getPlayerMatchStatsByMatch(eventId).catch(() => [] as any[]);
        const map = new Map<number, any>();
        for (const r of synced) { if (r.apiPlayerId) map.set(r.apiPlayerId, r); }
        setMatchStatsMap(map);
      } catch { /* ignore */ }
      setStatsSyncing(false);
    };
    loadStats();
  }, [eventId]);

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
            <FormationPitch lineup={lineups.home} side="home" onSelect={setSelectedPlayer} playerEvents={playerEvents} />
          </div>
          {/* Away */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <img src={teamLogo(awayTeamId)} alt={awayTeamName} className="w-5 h-5 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <span className="font-body font-semibold text-sm text-foreground">{awayTeamName}</span>
              <span className="text-xs text-slate-500 dark:text-[#A8A29E] ml-auto">{lineups.away.formation}</span>
            </div>
            <FormationPitch lineup={lineups.away} side="away" onSelect={setSelectedPlayer} playerEvents={playerEvents} />
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
    {selectedPlayer && <PlayerModal p={selectedPlayer} eventId={eventId} matchStatsMap={matchStatsMap} onClose={() => setSelectedPlayer(null)} />}
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
    } catch (err) {
      console.error('[Lineup] Failed to load:', err);
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
                  eventId={match?.id ?? 0}
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
