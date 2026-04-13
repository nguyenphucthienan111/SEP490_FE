import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Target, FileText, ArrowUpRight, TrendingUp, CreditCard, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { apiClient } from '@/services/api';
import { contestService } from '@/services/contestService';

export default function AdminDashboard() {
  const [userCount, setUserCount] = useState<number | null>(null);
  const [contestCount, setContestCount] = useState<number | null>(null);
  const [income, setIncome] = useState<any>(null);

  useEffect(() => {
    apiClient.get<any>('/api/auth/admin/users?page=1&pageSize=1')
      .then(res => { const d = (res as any).data ?? res; setUserCount(d.total ?? null); })
      .catch(() => {});
    contestService.getOpen()
      .then(c => setContestCount(Array.isArray(c) ? c.length : null))
      .catch(() => {});
    apiClient.get<any>('/api/Admin/incomeDashboard')
      .then(res => {
        const d = (res as any).data ?? res;
        // Flatten nested structure for easier access
        setIncome({
          earnedToday: d?.earningsByPeriod?.today ?? 0,
          earnedThisWeek: d?.earningsByPeriod?.thisWeek ?? 0,
          earnedThisMonth: d?.earningsByPeriod?.thisMonth ?? 0,
          totalEarned: d?.summary?.totalEarned ?? 0,
          successfulPayments: d?.summary?.successfulPayments ?? 0,
          pendingPayments: d?.summary?.pendingPayments ?? 0,
          paymentSuccessRate: d?.summary?.paymentSuccessRate ?? 0,
          earningsByPlan: d?.earningsByPlan ?? [],
        });
      })
      .catch(() => {});
  }, []);

  const fmtVnd = (n: number) => n?.toLocaleString('vi-VN') + 'đ';

  const stats = [
    { label: 'Người dùng', value: userCount, icon: Users, href: '/admin/users', color: 'text-[#00D9FF]', bg: 'bg-[#00D9FF]/10' },
    { label: 'Cuộc thi dự đoán', value: contestCount, icon: Target, href: '/admin/predictions', color: 'text-[#FF4444]', bg: 'bg-[#FF4444]/10' },
    { label: 'Diễn đàn', value: null, icon: FileText, href: '/admin/forum', color: 'text-[#a78bfa]', bg: 'bg-[#a78bfa]/10' },
  ];

  const quickActions = [
    { label: 'Quản lý người dùng', href: '/admin/users', icon: Users },
    { label: 'Tạo cuộc thi dự đoán', href: '/admin/predictions', icon: Target },
    { label: 'Quản lý diễn đàn', href: '/admin/forum', icon: FileText },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display font-extrabold text-2xl text-foreground mb-1">Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-[#A8A29E]">Tổng quan hệ thống quản trị</p>
        </motion.div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-5">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Link to={s.href}>
                <div className="glass-card rounded-2xl p-6 hover:translate-y-[-2px] hover:shadow-lg transition-all duration-200 group">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center`}>
                      <s.icon className={`w-5 h-5 ${s.color}`} />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-foreground transition-colors" />
                  </div>
                  <p className="font-mono-data text-3xl font-bold text-foreground mb-1">
                    {s.value != null ? s.value : '—'}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-[#A8A29E] group-hover:text-foreground transition-colors">{s.label}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Revenue section */}
        {income && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
            <h2 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />Doanh thu
            </h2>

            {/* Revenue cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Hôm nay', value: income.earnedToday ?? 0, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                { label: 'Tuần này', value: income.earnedThisWeek ?? 0, color: 'text-[#00D9FF]', bg: 'bg-[#00D9FF]/10' },
                { label: 'Tháng này', value: income.earnedThisMonth ?? 0, color: 'text-[#FF4444]', bg: 'bg-[#FF4444]/10' },
                { label: 'Tổng cộng', value: income.totalEarned ?? 0, color: 'text-[#a78bfa]', bg: 'bg-[#a78bfa]/10' },
              ].map((r, i) => (
                <div key={r.label} className="glass-card rounded-2xl p-5">
                  <div className={`w-9 h-9 rounded-xl ${r.bg} flex items-center justify-center mb-3`}>
                    <TrendingUp className={`w-4 h-4 ${r.color}`} />
                  </div>
                  <p className={`font-bold text-lg ${r.color}`}>{fmtVnd(r.value)}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{r.label}</p>
                </div>
              ))}
            </div>

            {/* Payment stats */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="font-bold text-xl text-foreground">{income.successfulPayments ?? 0}</p>
                  <p className="text-xs text-slate-500">Thanh toán thành công</p>
                </div>
              </div>
              <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="font-bold text-xl text-foreground">{income.pendingPayments ?? 0}</p>
                  <p className="text-xs text-slate-500">Đang chờ thanh toán</p>
                </div>
              </div>
              <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#00D9FF]/10 flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-5 h-5 text-[#00D9FF]" />
                </div>
                <div>
                  <p className="font-bold text-xl text-foreground">{income.paymentSuccessRate?.toFixed(1) ?? 0}%</p>
                  <p className="text-xs text-slate-500">Tỉ lệ thành công</p>
                </div>
              </div>
            </div>

            {/* Earnings by plan */}
            {income.earningsByPlan?.length > 0 && (
              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5">
                  <p className="font-semibold text-sm text-foreground">Doanh thu theo gói</p>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-white/5">
                  {income.earningsByPlan.map((p: any) => (
                    <div key={p.plan} className="flex items-center justify-between px-5 py-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{p.plan}</p>
                        <p className="text-xs text-slate-400">{p.paymentCount} giao dịch</p>
                      </div>
                      <p className="font-bold text-sm text-emerald-500">{fmtVnd(p.totalAmount)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <h2 className="font-display font-bold text-lg text-foreground mb-4">Truy cập nhanh</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {quickActions.map((a) => (
              <Link key={a.label} to={a.href}>
                <div className="glass-card rounded-xl p-4 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors flex items-center gap-3 group">
                  <div className="w-9 h-9 rounded-lg bg-[#00D9FF]/10 flex items-center justify-center flex-shrink-0">
                    <a.icon className="w-4 h-4 text-[#00D9FF]" />
                  </div>
                  <span className="text-sm font-medium text-foreground group-hover:text-[#00D9FF] transition-colors">{a.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
