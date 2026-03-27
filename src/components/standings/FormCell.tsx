import React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { leagueService, SofascoreTeamMatch } from '@/services/leagueService';

interface FormCellProps {
  teamId: number;
  teamName: string;
}

function getResult(match: SofascoreTeamMatch, teamId: number): 'W' | 'D' | 'L' {
  const isHome = match.homeTeam.id === teamId;
  const gs = isHome ? match.homeScore.current : match.awayScore.current;
  const ga = isHome ? match.awayScore.current : match.homeScore.current;
  if (gs > ga) return 'W';
  if (gs < ga) return 'L';
  return 'D';
}

function formatDate(ts: number) {
  return new Date(ts * 1000).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

interface TooltipData {
  label: string;
  date: string;
  rect: DOMRect;
}

export function FormCell({ teamId }: FormCellProps) {
  const [matches, setMatches] = React.useState<SofascoreTeamMatch[] | null>(null);
  const [tooltip, setTooltip] = React.useState<TooltipData | null>(null);

  React.useEffect(() => {
    leagueService.getTeamLastMatchesFromDb(teamId).then((data) => {
      const finished = data
        .filter((m) => m.status?.type === 'finished' || m.status?.type === 'ended'
          || m.status?.type === 'afterextratime' || m.status?.type === 'afterpenalties')
        .sort((a, b) => a.startTimestamp - b.startTimestamp)
        .slice(-5);
      setMatches(finished);
    }).catch(() => setMatches([]));
  }, [teamId]);

  if (!matches) {
    return (
      <div className="flex items-center justify-center gap-1">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-6 h-6 rounded bg-slate-200 dark:bg-white/10 animate-pulse" />
        ))}
      </div>
    );
  }

  if (matches.length === 0) {
    return <span className="text-xs text-slate-400">-</span>;
  }

  return (
    <div className="flex items-center justify-center gap-1">
      {matches.map((match) => {
        const result = getResult(match, teamId);
        const label = `${match.homeTeam.name} ${match.homeScore.current}-${match.awayScore.current} ${match.awayTeam.name}`;
        const date = formatDate(match.startTimestamp);

        return (
          <a
            key={match.id}
            href={`/matches/${match.id}`}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={(e) => {
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
              setTooltip({ label, date, rect });
            }}
            onMouseLeave={() => setTooltip(null)}
            className={cn(
              'w-6 h-6 rounded flex items-center justify-center text-xs font-bold transition-transform hover:scale-110',
              result === 'W' && 'bg-green-500 text-white',
              result === 'D' && 'bg-slate-400 text-white',
              result === 'L' && 'bg-red-500 text-white'
            )}
          >
            {result}
          </a>
        );
      })}

      {tooltip && createPortal(
        <TooltipPopup tooltip={tooltip} />,
        document.body
      )}
    </div>
  );
}

function TooltipPopup({ tooltip }: { tooltip: TooltipData }) {
  const { label, date, rect } = tooltip;
  const tooltipWidth = 240;
  const gap = 8;

  // Tính vị trí: hiện phía trên ô, căn giữa theo ô
  let left = rect.left + rect.width / 2 - tooltipWidth / 2;
  const top = rect.top - gap;

  // Clamp để không tràn ra ngoài viewport
  left = Math.max(8, Math.min(left, window.innerWidth - tooltipWidth - 8));

  return (
    <div
      className="fixed z-[9999] pointer-events-none"
      style={{ left, top, transform: 'translateY(-100%)' }}
    >
      <div
        className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl border border-white/10"
        style={{ width: tooltipWidth }}
      >
        <p className="font-semibold leading-snug">{label}</p>
        <p className="text-slate-400 mt-0.5">{date}</p>
        <p className="text-slate-500 text-[10px] mt-1">↗ Click để xem chi tiết trận đấu</p>
      </div>
    </div>
  );
}
