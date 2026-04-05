import React from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { leagueService, SofascoreTeamMatch } from "@/services/leagueService";

interface Props { tournamentId: number; seasonId: number; }

const CARD_H = 62;
const SLOT_H = 96;
const COL_W = 220;
const HEADER_H = 40;
const GAP_W = 48;

type Slot = SofascoreTeamMatch | null;
interface Column { label: string; slots: Slot[]; }

function teamLogo(id: number) {
  return `https://api.sofascore.app/api/v1/team/${id}/image`;
}

function MatchCard({ h, a, matchId, empty }: {
  h?: { id?: number; name?: string; score?: number | null; pen?: number | null; win: boolean };
  a?: { id?: number; name?: string; score?: number | null; pen?: number | null; win: boolean };
  matchId?: number; empty?: boolean;
}) {
  const navigate = useNavigate();
  if (empty) {
    return <div className="rounded-lg border border-dashed border-slate-300 dark:border-white/15 opacity-40" style={{ height: CARD_H }} />;
  }
  const row = (t: typeof h, border: boolean) => (
    <div className={cn("flex items-center gap-2 px-3", t!.win && "bg-green-50 dark:bg-green-500/10", border && "border-b border-slate-100 dark:border-white/5")} style={{ height: CARD_H / 2 }}>
      {t!.id
        ? <img src={teamLogo(t!.id)} alt="" className="w-5 h-5 object-contain flex-shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        : <div className="w-5 h-5 flex-shrink-0" />}
      <span className={cn("text-xs flex-1 truncate", t!.win ? "font-bold text-slate-900 dark:text-white" : "text-slate-500 dark:text-[#A8A29E]")}>{t!.name ?? "TBD"}</span>
      <span className={cn("font-mono text-sm text-right font-bold whitespace-nowrap", t!.win ? "text-slate-900 dark:text-white" : "text-slate-400")}>
        {t!.score != null
          ? t!.pen != null ? `${t!.score} (${t!.pen})` : `${t!.score}`
          : (t!.name ? "-" : "")}
      </span>
    </div>
  );
  const card = (
    <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 hover:border-[#FF4444]/40 transition-colors bg-white dark:bg-white/5" style={{ height: CARD_H }}>
      {row(h, true)}{row(a, false)}
    </div>
  );
  return matchId
    ? <div onClick={() => navigate(`/matches/${matchId}`)} className="cursor-pointer">{card}</div>
    : card;
}

const ROUND_LABELS: Record<string, string> = {
  "Round 1": "Vong 1",
  "Round of 16": "Vòng 1/8",
  "Quarterfinal": "Tứ kết",
  "Semifinal": "Bán kết",
  "Final": "Chung kết",
};

function parseCupTrees(data: any, allMatches: SofascoreTeamMatch[]): Column[] {
  const trees = data?.cupTrees ?? [];
  if (!trees.length) return [];
  const tree = trees[0];
  const rounds: any[] = tree.rounds ?? [];
  if (!rounds.length) return [];

  const sortedRounds = [...rounds].sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));

  // Build match lookup from allMatches by event id
  const matchById = new Map<number, SofascoreTeamMatch>();
  allMatches.forEach(m => matchById.set(m.id, m));

  // Sort each round's blocks by order
  const orderedBlocks: any[][] = sortedRounds.map((round: any) =>
    [...(round.blocks ?? [])].sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
  );

  // Reorder earlier rounds to match the sourceBlockId chain from later rounds
  for (let ri = sortedRounds.length - 2; ri >= 0; ri--) {
    const nextBlocks = orderedBlocks[ri + 1];
    const sourceOrder: number[] = [];
    nextBlocks.forEach((nb: any) => {
      const seen = new Set<number>();
      (nb.participants ?? []).forEach((p: any) => {
        if (p.sourceBlockId && !seen.has(p.sourceBlockId)) {
          seen.add(p.sourceBlockId);
          sourceOrder.push(p.sourceBlockId);
        }
      });
    });
    if (sourceOrder.length > 0) {
      const cur = orderedBlocks[ri];
      const reordered: any[] = [];
      sourceOrder.forEach((bid: number) => {
        const b = cur.find((cb: any) => cb.blockId === bid);
        if (b) reordered.push(b);
      });
      cur.forEach((b: any) => { if (!reordered.find((rb: any) => rb.blockId === b.blockId)) reordered.push(b); });
      orderedBlocks[ri] = reordered;
    }
  }

  // Build columns — use block data directly (teams + scores from participants)
  const columns: Column[] = sortedRounds.map((round: any, ri: number) => {
    const slots: Slot[] = orderedBlocks[ri].map((block: any) => {
      const participants: any[] = block.participants ?? [];
      if (participants.length < 2) return null;

      const p0 = participants.find((p: any) => p.order === 1) ?? participants[0];
      const p1 = participants.find((p: any) => p.order === 2) ?? participants[1];

      // Try to find the actual match event from DB
      const eventIds: number[] = block.events ?? [];
      const foundMatch = eventIds.map(id => matchById.get(id)).find(Boolean);

      // Extract scores from cuptrees block — homeTeamScore/awayTeamScore format: "1" or "1 (3)" (score + penalty)
      const parseScore = (s: string | null | undefined): { score: number | null; pen: number | null } => {
        if (s == null) return { score: null, pen: null };
        const m = String(s).match(/^(\d+)(?:\s*\((\d+)\))?/);
        if (!m) return { score: null, pen: null };
        return { score: parseInt(m[1]), pen: m[2] != null ? parseInt(m[2]) : null };
      };
      const h0 = parseScore(block.homeTeamScore);
      const h1 = parseScore(block.awayTeamScore);
      const p0Score = h0.score;
      const p1Score = h1.score;
      const p0Pen = h0.pen;
      const p1Pen = h1.pen;

      const eventId = eventIds[0] ?? block.id;
      const baseMatch = foundMatch ?? {
        id: eventId,
        homeTeam: { id: p0.team?.id ?? 0, name: p0.team?.name ?? 'TBD' },
        awayTeam: { id: p1.team?.id ?? 0, name: p1.team?.name ?? 'TBD' },
        homeScore: { current: p0Score ?? 0 },
        awayScore: { current: p1Score ?? 0 },
        startTimestamp: block.seriesStartDateTimestamp ?? 0,
        status: { type: block.finished ? 'finished' : 'notstarted' },
        roundInfo: { round: round.order ?? 0 },
      } as SofascoreTeamMatch;

      // Override with cuptrees scores (more accurate — separates penalty)
      return {
        ...baseMatch,
        homeScore: { current: p0Score ?? baseMatch.homeScore.current, display: p0Score ?? undefined, penalties: p0Pen },
        awayScore: { current: p1Score ?? baseMatch.awayScore.current, display: p1Score ?? undefined, penalties: p1Pen },
      } as SofascoreTeamMatch;
    });
    const desc: string = round.description ?? `Round ${round.order}`;
    return { label: ROUND_LABELS[desc] ?? desc, slots };
  });

  // Filter out early rounds — only keep from Round of 16 (8 slots) onwards
  const filtered = columns.filter(col => col.slots.length <= 8);

  // Rotate columns so visual order matches Sofascore widget
  filtered.forEach((col) => {
    const n = col.slots.length;
    const half = Math.floor(n / 2);
    if (half > 0) {
      col.slots = [...col.slots.slice(half), ...col.slots.slice(0, half)];
    }
  });

  return filtered;
}

export function KnockoutBracket({ tournamentId, seasonId }: Props) {
  const [columns, setColumns] = React.useState<Column[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);

    const cacheKey = `cuptrees-${tournamentId}-${seasonId}`;

    const load = async () => {
      // 1. Load matches from DB (fast)
      const dbMatches = await leagueService.getAllMatchesFromDb(tournamentId, seasonId).catch(() => [] as any[]);
      const allMatches: SofascoreTeamMatch[] = dbMatches.map((m: any) => ({
        id: m.apiFixtureId,
        homeTeam: { id: m.homeTeam?.apiTeamId ?? 0, name: m.homeTeam?.teamName ?? '' },
        awayTeam: { id: m.awayTeam?.apiTeamId ?? 0, name: m.awayTeam?.teamName ?? '' },
        homeScore: { current: m.homeGoals ?? 0, penalties: m.homePenalties ?? null },
        awayScore: { current: m.awayGoals ?? 0, penalties: m.awayPenalties ?? null },
        startTimestamp: m.matchDate ? new Date(m.matchDate.endsWith('Z') ? m.matchDate : m.matchDate + 'Z').getTime() / 1000 : 0,
        status: { type: m.status === 'FT' || m.status === 'finished' ? 'finished' : 'notstarted' },
        roundInfo: { round: parseInt(m.round) || 0 },
      }));

      // 2. Load cuptrees — try sessionStorage cache first
      let cupTreesData: any = null;
      try {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) cupTreesData = JSON.parse(cached);
      } catch { /* ignore */ }

      if (!cupTreesData) {
        try {
          cupTreesData = await leagueService.getTournamentCupTrees(tournamentId, seasonId);
          sessionStorage.setItem(cacheKey, JSON.stringify(cupTreesData));
        } catch { /* ignore */ }
      }

      // 3. Parse bracket
      if (cupTreesData) {
        const parsed = parseCupTrees(cupTreesData, allMatches);
        if (parsed.length > 0) { setColumns(parsed); setLoading(false); return; }
      }

      // 4. Fallback: build from DB matches by round
      const byRound: Record<number, SofascoreTeamMatch[]> = {};
      allMatches.forEach((m) => {
        const rn = m.roundInfo?.round ?? 0;
        if (rn > 0) { if (!byRound[rn]) byRound[rn] = []; if (!byRound[rn].find((x) => x.id === m.id)) byRound[rn].push(m); }
      });
      const roundNums = Object.keys(byRound).map(Number).sort((a, b) => a - b);
      const LABELS: Record<number, string> = { 5: "Vòng 1/8", 27: "Tứ kết", 28: "Bán kết", 29: "Chung kết" };
      const cols: Column[] = [];
      roundNums.filter(rn => rn >= 5).forEach((rn, idx) => {
        const matches = byRound[rn].sort((a, b) => a.id - b.id);
        const totalSlots = idx === 0 ? matches.length : Math.ceil(cols[idx - 1].slots.length / 2);
        const slots: Slot[] = Array(totalSlots).fill(null);
        matches.forEach((m, j) => { if (j < totalSlots) slots[j] = m; });
        cols.push({ label: LABELS[rn] ?? `Round ${rn}`, slots });
      });
      setColumns(cols);
      setLoading(false);
    };

    load().catch(() => setLoading(false));
  }, [tournamentId, seasonId]);

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <div className="w-10 h-10 border-4 border-[#FF4444] border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (columns.length === 0) return (
    <div className="flex flex-col items-center justify-center py-12 text-slate-500 dark:text-[#A8A29E]">
      <p>Chua co du lieu bracket</p>
    </div>
  );

  const maxSlots = columns[0].slots.length;
  const totalH = maxSlots * SLOT_H;

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex items-start" style={{ minHeight: totalH + HEADER_H }}>
        {columns.map((col, colIdx) => {
          const slotCount = col.slots.length;
          const slotH = totalH / slotCount;
          const nextCol = columns[colIdx + 1];
          return (
            <React.Fragment key={colIdx}>
              <div className="flex-shrink-0" style={{ width: COL_W }}>
                <div className="flex items-center justify-center border-b border-slate-200 dark:border-white/10" style={{ height: HEADER_H }}>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#A8A29E]">{col.label}</span>
                </div>
                <div className="relative" style={{ height: totalH }}>
                  {col.slots.map((match, i) => {
                    const top = i * slotH + (slotH - CARD_H) / 2;
                    if (!match) return (
                      <div key={`tbd-${i}`} className="absolute w-full px-1" style={{ top }}><MatchCard empty /></div>
                    );
                    // Use display score (excludes penalties) if available, fallback to current
                    const hs = match.homeScore?.display ?? match.homeScore?.current ?? null;
                    const as_ = match.awayScore?.display ?? match.awayScore?.current ?? null;
                    const hpen = match.homeScore?.penalties ?? null;
                    const apen = match.awayScore?.penalties ?? null;
                    const fin = match.status?.type === "finished";
                    // Winner determined by penalties if scores are equal
                    const hw = fin && hs !== null && as_ !== null && (hs > as_ || (hs === as_ && hpen !== null && apen !== null && hpen > apen));
                    const aw = fin && hs !== null && as_ !== null && (as_ > hs || (hs === as_ && hpen !== null && apen !== null && apen > hpen));
                    return (
                      <div key={match.id} className="absolute w-full px-1" style={{ top }}>
                        <MatchCard matchId={match.id}
                          h={{ id: match.homeTeam.id, name: match.homeTeam.name, score: hs, pen: hpen, win: hw }}
                          a={{ id: match.awayTeam.id, name: match.awayTeam.name, score: as_, pen: apen, win: aw }} />
                      </div>
                    );
                  })}
                </div>
              </div>
              {nextCol && (() => {
                const nextSlotCount = nextCol.slots.length;
                const nextSlotH = totalH / nextSlotCount;
                const xMid = GAP_W / 2;
                return (
                  <svg className="flex-shrink-0 text-slate-300 dark:text-white/20" width={GAP_W} height={totalH + HEADER_H} style={{ overflow: "visible" }}>
                    {Array.from({ length: nextSlotCount }).map((_, i) => {
                      const srcA = i * 2; const srcB = i * 2 + 1; const hasB = srcB < slotCount;
                      const yA = HEADER_H + srcA * slotH + slotH / 2;
                      const yB = hasB ? HEADER_H + srcB * slotH + slotH / 2 : yA;
                      const yMid = (yA + yB) / 2;
                      const yT = HEADER_H + i * nextSlotH + nextSlotH / 2;
                      return (
                        <g key={i} stroke="currentColor" strokeWidth={1.5} fill="none">
                          <line x1={0} y1={yA} x2={xMid} y2={yA} />
                          {hasB && <line x1={0} y1={yB} x2={xMid} y2={yB} />}
                          {hasB && <line x1={xMid} y1={yA} x2={xMid} y2={yB} />}
                          <line x1={xMid} y1={yMid} x2={GAP_W} y2={yMid} />
                          {Math.abs(yT - yMid) > 1 && <line x1={GAP_W} y1={yMid} x2={GAP_W} y2={yT} />}
                        </g>
                      );
                    })}
                  </svg>
                );
              })()}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}