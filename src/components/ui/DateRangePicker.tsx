import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, X } from 'lucide-react';

interface DateRangePickerProps {
  from: string; // yyyy-mm-dd
  to: string;   // yyyy-mm-dd
  onApply: (from: string, to: string) => void;
  onClear: () => void;
}

const MONTHS_VN = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];
const DAYS_VN = ['CN','T2','T3','T4','T5','T6','T7'];

function toISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function fmtDisplay(iso: string) {
  if (!iso) return '';
  const [y,m,d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export function DateRangePicker({ from, to, onApply, onClear }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [selecting, setSelecting] = useState<'from' | 'to'>('from');
  const [tempFrom, setTempFrom] = useState(from);
  const [tempTo, setTempTo] = useState(to);
  const [hovered, setHovered] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTempFrom(from); setTempTo(to);
  }, [from, to]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getDaysInMonth = (y: number, m: number) => new Date(y, m+1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y-1); }
    else setViewMonth(m => m-1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y+1); }
    else setViewMonth(m => m+1);
  };

  const handleDayClick = (iso: string) => {
    if (selecting === 'from') {
      setTempFrom(iso);
      setTempTo('');
      setSelecting('to');
    } else {
      if (iso < tempFrom) {
        setTempTo(tempFrom);
        setTempFrom(iso);
      } else {
        setTempTo(iso);
      }
      setSelecting('from');
    }
  };

  const isInRange = (iso: string) => {
    const end = hovered && selecting === 'to' ? hovered : tempTo;
    if (!tempFrom || !end) return false;
    const [f, t] = tempFrom <= end ? [tempFrom, end] : [end, tempFrom];
    return iso > f && iso < t;
  };

  const days = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const displayLabel = from && to
    ? `${fmtDisplay(from)} – ${fmtDisplay(to)}`
    : from ? `Từ ${fmtDisplay(from)}`
    : to ? `Đến ${fmtDisplay(to)}`
    : 'Chọn khoảng ngày';

  return (
    <div ref={ref} className="relative inline-block">
      <button onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border transition-all ${from || to ? 'border-[#FF4444] bg-[#FF4444]/10 text-[#FF4444]' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400'}`}>
        <CalendarDays className="w-3.5 h-3.5" />
        {displayLabel}
        {(from || to) && (
          <span onClick={e => { e.stopPropagation(); onClear(); setTempFrom(''); setTempTo(''); }}
            className="ml-1 hover:text-red-500">
            <X className="w-3 h-3" />
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-4 w-64">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <button onClick={prevMonth} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <ChevronLeft className="w-4 h-4 text-slate-500" />
            </button>
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              {MONTHS_VN[viewMonth]} {viewYear}
            </span>
            <button onClick={nextMonth} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS_VN.map(d => (
              <div key={d} className="text-center text-[10px] font-semibold text-slate-400 py-1">{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-y-0.5">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: days }).map((_, i) => {
              const day = i + 1;
              const iso = `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
              const isFrom = iso === tempFrom;
              const isTo = iso === tempTo;
              const inRange = isInRange(iso);
              const isHovered = iso === hovered && selecting === 'to';
              return (
                <button key={day}
                  onClick={() => handleDayClick(iso)}
                  onMouseEnter={() => setHovered(iso)}
                  onMouseLeave={() => setHovered('')}
                  className={`text-[11px] py-1 rounded-lg transition-all font-medium
                    ${isFrom || isTo ? 'bg-[#FF4444] text-white' : ''}
                    ${inRange ? 'bg-[#FF4444]/15 text-[#FF4444] rounded-none' : ''}
                    ${isHovered && !isFrom && !isTo ? 'bg-[#FF4444]/20 text-[#FF4444]' : ''}
                    ${!isFrom && !isTo && !inRange && !isHovered ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800' : ''}
                  `}>
                  {day}
                </button>
              );
            })}
          </div>

          {/* Hint */}
          <p className="text-[10px] text-slate-400 text-center mt-2">
            {selecting === 'from' ? 'Chọn ngày bắt đầu' : 'Chọn ngày kết thúc'}
          </p>

          {/* Input display */}
          <div className="flex gap-1 mt-3 items-center">
            <div className="flex-1 text-[11px] px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-center truncate">
              {tempFrom ? fmtDisplay(tempFrom) : 'dd/mm/yyyy'}
            </div>
            <span className="text-xs text-slate-400 flex-shrink-0">–</span>
            <div className="flex-1 text-[11px] px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-center truncate">
              {tempTo ? fmtDisplay(tempTo) : 'dd/mm/yyyy'}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-3">
            <button onClick={() => { setTempFrom(''); setTempTo(''); setSelecting('from'); onClear(); }}
              className="flex-1 py-1.5 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors">
              Xóa
            </button>
            <button onClick={() => { if (tempFrom || tempTo) { onApply(tempFrom, tempTo); setOpen(false); } }}
              disabled={!tempFrom && !tempTo}
              className="flex-1 py-1.5 rounded-xl text-xs font-medium bg-[#FF4444] text-white hover:bg-[#e03333] disabled:opacity-40 transition-colors">
              Áp dụng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
