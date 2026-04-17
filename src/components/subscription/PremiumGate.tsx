import { Link } from "react-router-dom";
import { Lock, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: React.ReactNode;
  locked: boolean;
  message?: string;
  compact?: boolean;
}

export function PremiumGate({ children, locked, message, compact = false }: Props) {
  const isAdmin = (() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user?.roles?.some((r: string) => r.toLowerCase() === 'admin') ?? false;
    } catch { return false; }
  })();

  if (!locked || isAdmin) return <>{children}</>;

  if (compact) {
    return (
      <div className="relative">
        <div className="pointer-events-none select-none blur-sm opacity-40">{children}</div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Link to="/pricing">
            <Button size="sm" className="bg-gradient-to-r from-[#FF4444] to-[#FF6B6B] text-white gap-1.5 shadow-lg">
              <Lock className="w-3.5 h-3.5" />
              Nâng cấp Premium
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden min-h-[200px]">
      {/* Placeholder blur content */}
      <div className="pointer-events-none select-none blur-sm opacity-30">
        {children ?? (
          <div className="space-y-3 p-4">
            {[1,2,3].map(i => (
              <div key={i} className="h-14 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
            ))}
          </div>
        )}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-transparent via-background/60 to-background/90 p-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF4444]/20 to-[#FF6B6B]/20 border border-[#FF4444]/30 flex items-center justify-center mb-3">
          <Crown className="w-7 h-7 text-[#FF4444]" />
        </div>
        <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-1">Tính năng Premium</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-4 max-w-xs">
          {message ?? "Đăng ký gói Premium để xem nội dung này."}
        </p>
        <Link to="/pricing">
          <Button className="bg-gradient-to-r from-[#FF4444] to-[#FF6B6B] text-white gap-2">
            <Crown className="w-4 h-4" />
            Xem các gói Premium
          </Button>
        </Link>
      </div>
    </div>
  );
}
