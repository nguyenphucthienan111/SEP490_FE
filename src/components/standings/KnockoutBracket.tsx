import React from "react";
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
  h?: { id?: number; name?: string; score?: number | null; win: boolean };
  a?: { id?: number; name?: string; score?: number | null; win: boolean };
  matchId?: number; empty?: boolean;
}) {
  if (empty) {
    return <div className="rounded-lg border border-dashed border-slate-300 dark:border-white/15 opacity-40" style={{ height: CARD_H }} />;
  }
  const row = (t: typeof h, border: boolean) => (
    <div className={cn("flex items-center gap-2 px-3", t!.win && "bg-green-50 dark:bg-green-500/10", border && "border-b border-slate-100 dark:border-white/5")} style={{ height: CARD_H / 2 }}>
      {t!.id
        ? <img src={teamLogo(t!.id)} alt="" className="w-5 h-5 object-contain flex-shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        : <div className="w-5 h-5 flex-shrink-0" />}
      <span className={cn("text-xs flex-1 truncate", t!.win ? "font-bold text-slate-900 dark:text-white" : "text-slate-500 dark:text-[#A8A29E]")}>{t!.name ?? "TBD"}</span>
      <span className={cn("font-mono text-sm w-5 text-right font-bold", t!.win ? "text-slate-900 dark:text-white" : "text-slate-400")}>
        {t!.score != null ? t!.score : (t!.name ? "-" : "")}
      </span>
    </div>
  );
  const card = (
    <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 hover:border-[#FF4444]/40 transition-colors bg-white dark:bg-white/5" style={{ height: CARD_H }}>
      {row(h, true)}{row(a, false)}
    </div>
  );
  return matchId
    ? <a href={`https://www.sofascore.com/football/match/${matchId}`} target="_blank" rel="noopener noreferrer">{card}</a>
    : card;
}

const ROUND_LABELS: Record<string, string> = {
  "Round 1": "Vong 1",
  "Round of 16": "Vong 1/8",
  "Quarterfinal": "Tu ket",
  "Semifinal": "Ban ket",
  "Final": "Chung ket",
};

function parseCupTrees(data: any, allMatches: SofascoreTeamMatch[]): Column[] {
  const trees = data?.cupTrees ?? [];
  if (!trees.length) return [];
  const tree = trees[0];
  const rounds: any[] = tree.rounds ?? [];
  if (!rounds.length) return [];

  const sortedRounds = [...rounds].sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));

  // Sort each round's blocks by order initially
  const orderedBlocks: any[][] = sortedRounds.map((round: any) =>
    [...(round.blocks ?? [])].sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
  );

  // Reorder earlier rounds to match the sourceBlockId chain from later rounds (working backwards)
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

  // Build columns
  const columns: Column[] = sortedRounds.map((round: any, ri: number) => {
    const slots: Slot[] = orderedBlocks[ri].map((block: any) => {
      const participants: any[] = block.participants ?? [];
      const teamIds = new Set(participants.map((p: any) => p.team?.id).filter(Boolean));
      if (teamIds.size < 2) return null;
      return allMatches.find((m) => teamIds.has(m.homeTeam.id) && teamIds.has(m.awayTeam.id)) ?? null;
    });
    const desc: string = round.description ?? `Round ${round.order}`;
    return { label: ROUND_LABELS[desc] ?? desc, slots };
  });

  // Sofascore displays the bracket rotated by N/2 (bottom half first, then top half).
  // Apply this rotation consistently to all columns so visual order and connector lines match.
  columns.forEach((col) => {
    const n = col.slots.length;
    const half = Math.floor(n / 2);
    if (half > 0) {
      col.slots = [...col.slots.slice(half), ...col.slots.slice(0, half)];
    }
  });

  return columns;
}

export function KnockoutBracket({ tournamentId, seasonId }: Props) {
  const [columns, setColumns] = React.useState<Column[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      leagueService.getTournamentCupTrees(tournamentId, seasonId),
      leagueService.getTournamentLastMatches(tournamentId, seasonId, 0),
      leagueService.getTournamentLastMatches(tournamentId, seasonId, 1),
      leagueService.getTournamentNextMatches(tournamentId, seasonId, 0),
    ]).then(([cupTreesResult, ...matchResults]) => {
      const allMatches: SofascoreTeamMatch[] = [];
      matchResults.forEach((r) => { if (r.status === "fulfilled") allMatches.push(...(r.value as SofascoreTeamMatch[])); });
      if (cupTreesResult.status === "fulfilled" && cupTreesResult.value) {
        const parsed = parseCupTrees(cupTreesResult.value, allMatches);
        if (parsed.length > 0) { setColumns(parsed); return; }
      }
      // Fallback: build from round numbers
      const byRound: Record<number, SofascoreTeamMatch[]> = {};
      allMatches.forEach((m) => {
        const rn = (m as any).roundInfo?.round ?? 0;
        if (rn > 0) { if (!byRound[rn]) byRound[rn] = []; if (!byRound[rn].find((x) => x.id === m.id)) byRound[rn].push(m); }
      });
      const roundNums = Object.keys(byRound).map(Number).sort((a, b) => a - b);
      const LABELS: Record<number, string> = { 1: "Vong 1", 5: "Vong 1/8", 27: "Tu ket", 28: "Ban ket", 29: "Chung ket" };
      const cols: Column[] = [];
      roundNums.forEach((rn, idx) => {
        const matches = byRound[rn].sort((a, b) => a.id - b.id);
        const totalSlots = idx === 0 ? matches.length : Math.ceil(cols[idx - 1].slots.length / 2);
        const slots: Slot[] = Array(totalSlots).fill(null);
        matches.forEach((m, j) => { if (j < totalSlots) slots[j] = m; });
        cols.push({ label: LABELS[rn] ?? `Round ${rn}`, slots });
      });
      setColumns(cols);
    }).finally(() => setLoading(false));
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
                    const fin = match.status?.type === "finished";
                    const hs = match.homeScore?.current ?? null;
                    const as_ = match.awayScore?.current ?? null;
                    const hw = fin && hs !== null && as_ !== null && hs > as_;
                    const aw = fin && hs !== null && as_ !== null && as_ > hs;
                    return (
                      <div key={match.id} className="absolute w-full px-1" style={{ top }}>
                        <MatchCard matchId={match.id}
                          h={{ id: match.homeTeam.id, name: match.homeTeam.name, score: hs, win: hw }}
                          a={{ id: match.awayTeam.id, name: match.awayTeam.name, score: as_, win: aw }} />
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