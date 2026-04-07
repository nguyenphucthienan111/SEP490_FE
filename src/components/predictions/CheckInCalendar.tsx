import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Flame, Trophy, Star, Loader2, CheckCircle2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { checkInService, CheckInStatusDto } from "@/services/checkInService";
import { toast } from "sonner";

const DAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const MONTHS = ["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6","Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"];

function toVNDate(d: Date) {
  return new Date(d.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
}

export default function CheckInCalendar({ onCheckedIn }: { onCheckedIn?: () => void } = {}) {
  const [status, setStatus] = useState<CheckInStatusDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  const load = useCallback(async () => {
    try {
      const s = await checkInService.getStatus();
      setStatus(s);
    } catch { /* not logged in */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCheckIn = async () => {
    setChecking(true);
    try {
      const result = await checkInService.checkIn();
      if (result.alreadyCheckedIn) {
        toast.info("Bạn đã điểm danh hôm nay rồi!");
      } else {
        toast.success(`Điểm danh thành công! +${result.pointsEarned} điểm 🎉`);
        onCheckedIn?.();
      }
      await load();
    } catch (e: any) {
      toast.error(e.message || "Lỗi điểm danh");
    } finally {
      setChecking(false);
    }
  };

  const now = toVNDate(new Date());
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();

  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const checkedSet = new Set(
    (status?.checkedDatesThisMonth ?? []).map(d => {
      const parts = d.split("-");
      return parseInt(parts[2], 10); // day number
    })
  );

  const streak = status?.currentStreak ?? 0;
  const totalPts = status?.totalCheckInPoints ?? 0;
  const checkedToday = status?.checkedInToday ?? false;

  return (
    <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#00D9FF]" />
            <span className="font-display font-bold text-white text-lg">{MONTHS[month]} {year}</span>
          </div>
          <Button
            size="sm"
            onClick={handleCheckIn}
            disabled={checking || checkedToday}
            className={`font-semibold transition-all ${checkedToday
              ? "bg-green-600/20 text-green-400 border border-green-500/30 cursor-default"
              : "bg-gradient-to-r from-[#FF4444] to-[#FF6B6B] text-white hover:opacity-90"}`}
          >
            {checking
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : checkedToday
              ? <><CheckCircle2 className="w-4 h-4 mr-1" />Đã điểm danh</>
              : "⚽ Điểm danh"}
          </Button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-800 rounded-xl p-3 text-center">
            <Flame className="w-5 h-5 mx-auto mb-1 text-orange-400" />
            <p className="text-xl font-bold text-white">{streak}</p>
            <p className="text-xs font-medium text-slate-200 mt-0.5">Chuỗi ngày</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-3 text-center">
            <Star className="w-5 h-5 mx-auto mb-1 text-yellow-400" />
            <p className="text-xl font-bold text-[#00D9FF]">{totalPts}</p>
            <p className="text-xs font-medium text-slate-200 mt-0.5">Điểm điểm danh</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-3 text-center">
            <Trophy className="w-5 h-5 mx-auto mb-1 text-amber-400" />
            <p className="text-xs font-medium text-slate-200 mt-1">Ngày 1-5: <span className="font-bold text-white">+1đ</span></p>
            <p className="text-xs font-medium text-slate-200">Ngày 6+: <span className="font-bold text-[#00D9FF]">+2đ</span></p>
          </div>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[#00D9FF]" /></div>
        ) : (
          <>
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {DAYS.map(d => (
                <div key={d} className="text-center text-xs font-semibold text-slate-400 py-1">{d}</div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for first day offset */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isToday = day === today;
                const isChecked = checkedSet.has(day);
                const isPast = day < today;

                return (
                  <motion.div
                    key={day}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.01 }}
                    className={`
                      relative aspect-square flex items-center justify-center rounded-lg text-sm font-semibold transition-all
                      ${isToday ? "ring-2 ring-[#FF4444]" : ""}
                      ${isChecked
                        ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30"
                        : isPast
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-400"
                        : isToday
                        ? "bg-[#FF4444]/10 text-[#FF4444]"
                        : "bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400"}
                    `}
                  >
                    {isChecked ? "⚽" : day}
                    {isToday && !isChecked && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#FF4444] rounded-full" />
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Streak info */}
            {streak > 0 && (
              <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
                <p className="text-sm text-center text-slate-700 dark:text-slate-300">
                  <Flame className="w-4 h-4 inline text-orange-400 mr-1" />
                  {streak <= 5
                    ? <span>Chuỗi <span className="font-bold text-orange-500 dark:text-orange-400">{streak}</span> ngày · Còn <span className="font-bold text-slate-800 dark:text-white">{5 - streak + 1}</span> ngày để nhận <span className="font-bold text-[#00B8D4] dark:text-[#00D9FF]">+2đ/ngày</span></span>
                    : <span>Chuỗi <span className="font-bold text-orange-500 dark:text-orange-400">{streak}</span> ngày 🔥 · Đang nhận <span className="font-bold text-[#00B8D4] dark:text-[#00D9FF]">+2đ/ngày</span></span>
                  }
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
