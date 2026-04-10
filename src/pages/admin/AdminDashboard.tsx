import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Target, FileText, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { apiClient } from '@/services/api';
import { contestService } from '@/services/contestService';

export default function AdminDashboard() {
  const [userCount, setUserCount] = useState<number | null>(null);
  const [contestCount, setContestCount] = useState<number | null>(null);

  useEffect(() => {
    apiClient.get<any>('/api/auth/admin/users?page=1&pageSize=1')
      .then(res => { const d = (res as any).data ?? res; setUserCount(d.total ?? null); })
      .catch(() => {});
    contestService.getOpen()
      .then(c => setContestCount(Array.isArray(c) ? c.length : null))
      .catch(() => {});
  }, []);

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

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
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
