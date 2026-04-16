import { useEffect, useState, useRef } from 'react';
import { AdminLayout } from './AdminLayout';
import { apiClient } from '@/services/api';
import { cn } from '@/lib/utils';
import { Loader2, CreditCard, Users, TrendingUp, ChevronLeft, ChevronRight, Search, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// ─── Types ────────────────────────────────────────────────────────────────────
interface AdminPayment {
  paymentId: string;
  paymentCode: string;
  planCode: string;
  planName: string;
  amount: number;
  status: string;
  createdAt: string;
  paidAt: string | null;
  userId?: string | null;
  userName?: string | null;
  userEmail?: string | null;
}

interface AdminSubscription {
  subscriptionId: string;
  userId: string;
  userEmail?: string | null;
  userName?: string | null;
  planCode: string;
  planName: string;
  status: string;
  startedAt: string;
  expiresAt: string | null;
}

interface AdminStats {
  totalRevenue: number;
  totalPayments: number;
  paidPayments: number;
  pendingPayments: number;
  activeSubscriptions: number;
  byPlan: { planCode: string; planName: string; count: number; revenue: number }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(s: string | null) {
  if (!s) return '—';
  return new Date(s.endsWith('Z') ? s : s + 'Z').toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function fmtMoney(n: number) {
  return n.toLocaleString('vi-VN') + ' ₫';
}

const STATUS_PAYMENT: Record<string, { label: string; cls: string }> = {
  Paid:      { label: 'Đã thanh toán', cls: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' },
  Pending:   { label: 'Chờ thanh toán', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' },
  Expired:   { label: 'Hết hạn', cls: 'bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400' },
  Cancelled: { label: 'Đã hủy', cls: 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' },
};

const STATUS_SUB: Record<string, { label: string; cls: string }> = {
  Active:   { label: 'Đang hoạt động', cls: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' },
  Inactive: { label: 'Không hoạt động', cls: 'bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400' },
  Expired:  { label: 'Hết hạn', cls: 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' },
};

const PLAN_NAME_VI: Record<string, string> = {
  TRIAL:            'Gói dùng thử',
  MONTHLY:          'Gói tháng',
  QUARTERLY:        'Gói quý',
  TOPUP_AI_VIDEO:   'Nạp AI Video',
  TOPUP_FORUM_POST: 'Nạp bài đăng',
  TOPUP_AI_MATCH:   'Nạp AI Phân tích',
};

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', color)}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-xs text-slate-500 dark:text-[#A8A29E] font-label">{label}</p>
        <p className="font-display font-bold text-xl text-foreground leading-tight">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ page, total, pageSize, onChange }: { page: number; total: number; pageSize: number; onChange: (p: number) => void }) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  // Build page number list with ellipsis
  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-between mt-4 px-1">
      <span className="text-xs text-slate-400">
        {total} kết quả · Trang {page}/{totalPages}
      </span>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(page - 1)} disabled={page <= 1}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-30 transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="w-8 text-center text-sm text-slate-400">…</span>
          ) : (
            <button key={`page-${p}`} onClick={() => onChange(p as number)}
              className={cn('w-8 h-8 rounded-lg text-sm font-semibold transition-colors',
                p === page
                  ? 'bg-[#00D9FF] text-black'
                  : 'hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-[#A8A29E]'
              )}>
              {p}
            </button>
          )
        )}
        <button onClick={() => onChange(page + 1)} disabled={page >= totalPages}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-30 transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Custom date input dd/mm/yyyy ─────────────────────────────────────────────
function DateInput({ value, onChange, min }: { value: string; onChange: (v: string) => void; min?: string }) {
  const [dd, setDd] = useState('');
  const [mm, setMm] = useState('');
  const [yyyy, setYyyy] = useState('');
  const mmRef = useRef<HTMLInputElement>(null);
  const yyyyRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!value) { setDd(''); setMm(''); setYyyy(''); return; }
    const [y, mo, d] = value.split('-');
    setDd(d ?? ''); setMm(mo ?? ''); setYyyy(y ?? '');
  }, [value]);

  const emit = (d: string, m: string, y: string) => {
    if (d.length === 2 && m.length === 2 && y.length === 4) {
      const iso = `${y}-${m}-${d}`;
      const dt = new Date(iso);
      if (!isNaN(dt.getTime())) onChange(iso);
    } else if (!d && !m && !y) {
      onChange('');
    }
  };

  const inputCls = "bg-transparent text-sm text-foreground focus:outline-none text-center";

  return (
    <div className="flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
      <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mr-0.5" />
      <input value={dd} placeholder="dd" maxLength={2} className={inputCls} style={{ width: 20 }}
        onChange={e => { const v = e.target.value.replace(/\D/g, ''); setDd(v); if (v.length === 2) mmRef.current?.focus(); emit(v, mm, yyyy); }} />
      <span className="text-slate-400 text-sm leading-none">/</span>
      <input ref={mmRef} value={mm} placeholder="mm" maxLength={2} className={inputCls} style={{ width: 20 }}
        onChange={e => { const v = e.target.value.replace(/\D/g, ''); setMm(v); if (v.length === 2) yyyyRef.current?.focus(); emit(dd, v, yyyy); }} />
      <span className="text-slate-400 text-sm leading-none">/</span>
      <input ref={yyyyRef} value={yyyy} placeholder="yyyy" maxLength={4} className={inputCls} style={{ width: 36 }}
        onChange={e => { const v = e.target.value.replace(/\D/g, ''); setYyyy(v); emit(dd, mm, v); }} />
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
type TabId = 'stats' | 'payments' | 'subscriptions';

export default function AdminSubscriptionsPage() {
  const [tab, setTab] = useState<TabId>('stats');

  // Stats
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Payments
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [payTotal, setPayTotal] = useState(0);
  const [payPage, setPayPage] = useState(1);
  const [payStatus, setPayStatus] = useState('');
  const [payPlan, setPayPlan] = useState('');
  const [payDateFrom, setPayDateFrom] = useState('');
  const [payDateTo, setPayDateTo] = useState('');
  const [payLoading, setPayLoading] = useState(false);
  const PAGE_SIZE = 10;

  // Subscriptions
  const [subs, setSubs] = useState<AdminSubscription[]>([]);
  const [subTotal, setSubTotal] = useState(0);
  const [subPage, setSubPage] = useState(1);
  const [subStatus, setSubStatus] = useState('');
  const [subDateFrom, setSubDateFrom] = useState('');
  const [subDateTo, setSubDateTo] = useState('');
  const [subLoading, setSubLoading] = useState(false);

  // ── Loaders ──────────────────────────────────────────────────────────────
  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const res = await apiClient.get<any>('/api/subscriptions/admin/stats');
      // Normalize — map mọi field name có thể từ API
      const normalized: AdminStats = {
        totalRevenue:        res.totalRevenue  ?? 0,
        totalPayments:       (res.totalPaid ?? 0) + (res.totalPending ?? 0) + (res.totalCancelled ?? 0),
        paidPayments:        res.totalPaid     ?? 0,
        pendingPayments:     res.totalPending  ?? 0,
        activeSubscriptions: res.totalActive   ?? 0,
        byPlan: (() => {
          const raw = res.revenueByPlan ?? res.byPlan ?? [];
          const arr: any[] = Array.isArray(raw) ? raw : (raw?.$values ?? []);
          return arr.map((p: any) => ({
            planCode: p.planCode ?? p.code ?? '',
            planName: p.planName ?? p.name ?? p.planCode ?? '',
            count:    p.count    ?? p.total ?? p.totalPaid ?? 0,
            revenue:  p.revenue  ?? p.totalRevenue ?? 0,
          }));
        })(),
      };
      setStats(normalized);
    } catch { toast.error('Không thể tải thống kê'); }
    finally { setStatsLoading(false); }
  };

  // ── User map (userId → {name, email}) ────────────────────────────────────
  const userMapRef = useRef<Map<string, { name: string; email: string }>>(new Map());
  const userMapLoadedRef = useRef(false);

  const ensureUserMap = async (): Promise<Map<string, { name: string; email: string }>> => {
    if (userMapLoadedRef.current) return userMapRef.current;
    try {
      const res = await apiClient.get<any>('/api/auth/admin/users?page=1&pageSize=1000');
      const data = (res as any).data ?? res;
      const items: any[] = data.items ?? data.$values ?? (Array.isArray(data) ? data : []);
      const map = new Map<string, { name: string; email: string }>();
      for (const u of items) {
        const id = u.userId ?? u.id ?? u.Id;
        if (id) map.set(String(id), { name: u.fullName ?? u.username ?? u.userName ?? '', email: u.email ?? '' });
      }
      userMapRef.current = map;
      userMapLoadedRef.current = true;
      return map;
    } catch { return userMapRef.current; }
  };

  const normalizePayment = (p: any, umap: Map<string, { name: string; email: string }>): AdminPayment => {
    const uid = p.userId ?? p.user?.id ?? p.user?.userId ?? null;
    const fromMap = uid ? umap.get(String(uid)) : null;
    return {
      paymentId:   p.paymentId   ?? p.id ?? '',
      paymentCode: p.paymentCode ?? p.code ?? '',
      planCode:    p.planCode    ?? '',
      planName:    p.planName    ?? p.planCode ?? '',
      amount:      p.amount      ?? 0,
      status:      p.status      ?? '',
      createdAt:   p.createdAt   ?? '',
      paidAt:      p.paidAt      ?? null,
      userId:      uid,
      userName:    fromMap?.name  ?? p.userName  ?? p.username  ?? p.fullName  ?? p.user?.userName ?? p.user?.fullName ?? null,
      userEmail:   fromMap?.email ?? p.userEmail ?? p.email     ?? p.user?.email ?? null,
    };
  };

  const normalizeSub = (s: any, umap: Map<string, { name: string; email: string }>): AdminSubscription => {
    const uid = s.userId ?? s.user?.id ?? s.user?.userId ?? null;
    const fromMap = uid ? umap.get(String(uid)) : null;
    return {
      subscriptionId: s.subscriptionId ?? s.id ?? '',
      userId:         uid ?? '',
      planCode:       s.planCode ?? '',
      planName:       s.planName ?? s.planCode ?? '',
      status:         s.status   ?? '',
      startedAt:      s.startedAt ?? s.startDate ?? s.createdAt ?? '',
      expiresAt:      s.expiresAt ?? s.endDate   ?? s.expiredAt ?? null,
      userName:    fromMap?.name  ?? s.userName  ?? s.username  ?? s.fullName  ?? s.user?.userName ?? s.user?.fullName ?? null,
      userEmail:   fromMap?.email ?? s.userEmail ?? s.email     ?? s.user?.email ?? null,
    };
  };

  const loadPayments = async (page = payPage, status = payStatus, plan = payPlan, dateFrom = payDateFrom, dateTo = payDateTo) => {
    setPayLoading(true);
    try {
      const [umap, res] = await Promise.all([
        ensureUserMap(),
        (async () => {
          const params = new URLSearchParams({ page: '1', pageSize: '1000' });
          if (status) params.set('status', status);
          if (plan) params.set('planCode', plan);
          return apiClient.get<any>(`/api/subscriptions/admin/payments?${params}`);
        })(),
      ]);
      let raw: any[] = Array.isArray(res) ? res : (res?.items ?? res?.data ?? res?.$values ?? []);

      // Client-side date filter (VN timezone UTC+7)
      if (dateFrom) {
        const from = new Date(dateFrom + 'T00:00:00+07:00').getTime();
        raw = raw.filter(p => {
          const d = p.createdAt ? new Date(p.createdAt.endsWith('Z') ? p.createdAt : p.createdAt + 'Z').getTime() : 0;
          return d >= from;
        });
      }
      if (dateTo) {
        const to = new Date(dateTo + 'T23:59:59+07:00').getTime();
        raw = raw.filter(p => {
          const d = p.createdAt ? new Date(p.createdAt.endsWith('Z') ? p.createdAt : p.createdAt + 'Z').getTime() : 0;
          return d <= to;
        });
      }

      const total = raw.length;
      const start = (page - 1) * PAGE_SIZE;
      const paged = raw.slice(start, start + PAGE_SIZE);
      setPayments(paged.map(p => normalizePayment(p, umap)));
      setPayTotal(total);
    } catch { toast.error('Không thể tải giao dịch'); }
    finally { setPayLoading(false); }
  };

  const loadSubs = async (page = subPage, status = subStatus, dateFrom = subDateFrom, dateTo = subDateTo) => {
    setSubLoading(true);
    try {
      const [umap, res] = await Promise.all([
        ensureUserMap(),
        (async () => {
          const params = new URLSearchParams({ page: '1', pageSize: '1000' });
          if (status) params.set('status', status);
          return apiClient.get<any>(`/api/subscriptions/admin/subscriptions?${params}`);
        })(),
      ]);
      let raw: any[] = Array.isArray(res) ? res : (res?.items ?? res?.data ?? res?.$values ?? []);

      // Client-side date filter on startedAt (VN UTC+7)
      if (dateFrom) {
        const from = new Date(dateFrom + 'T00:00:00+07:00').getTime();
        raw = raw.filter(s => {
          const d = s.startedAt ? new Date(s.startedAt.endsWith('Z') ? s.startedAt : s.startedAt + 'Z').getTime() : 0;
          return d >= from;
        });
      }
      if (dateTo) {
        const to = new Date(dateTo + 'T23:59:59+07:00').getTime();
        raw = raw.filter(s => {
          const d = s.startedAt ? new Date(s.startedAt.endsWith('Z') ? s.startedAt : s.startedAt + 'Z').getTime() : 0;
          return d <= to;
        });
      }

      const total = raw.length;
      const start = (page - 1) * PAGE_SIZE;
      const paged = raw.slice(start, start + PAGE_SIZE);
      setSubs(paged.map(s => normalizeSub(s, umap)));
      setSubTotal(total);
    } catch { toast.error('Không thể tải gói đăng ký'); }
    finally { setSubLoading(false); }
  };

  // ── Effects ───────────────────────────────────────────────────────────────
  useEffect(() => { loadStats(); }, []);
  useEffect(() => { if (tab === 'payments') loadPayments(1, payStatus, payPlan); }, [tab]);
  useEffect(() => { if (tab === 'subscriptions') loadSubs(1, subStatus); }, [tab]);

  const handlePayFilter = () => { setPayPage(1); loadPayments(1, payStatus, payPlan); };
  const handleSubFilter = () => { setSubPage(1); loadSubs(1, subStatus); };

  const TABS: { id: TabId; label: string }[] = [
    { id: 'stats',         label: 'Thống kê' },
    { id: 'payments',      label: 'Giao dịch' },
    { id: 'subscriptions', label: 'Gói đăng ký' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-2xl text-foreground">Quản lý thanh toán</h1>
            <p className="text-sm text-slate-500 dark:text-[#A8A29E] mt-1">Giao dịch, gói đăng ký và doanh thu</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 dark:bg-white/5 rounded-xl p-1 w-fit">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn('px-5 py-2 rounded-lg text-sm font-semibold transition-all',
                tab === t.id ? 'bg-white dark:bg-white/15 text-foreground shadow-sm' : 'text-slate-500 dark:text-[#A8A29E] hover:text-foreground'
              )}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── STATS TAB ── */}
        {tab === 'stats' && (
          statsLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-[#00D9FF] animate-spin" /></div>
          ) : stats ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={TrendingUp} label="Tổng doanh thu" value={fmtMoney(stats.totalRevenue)} color="bg-green-500" />
                <StatCard icon={CreditCard} label="Đã thanh toán" value={String(stats.paidPayments)} color="bg-[#00D9FF]" />
                <StatCard icon={Users} label="Đang hoạt động" value={String(stats.activeSubscriptions)} color="bg-purple-500" />
                <StatCard icon={CreditCard} label="Chờ thanh toán" value={String(stats.pendingPayments)} color="bg-amber-500" />
              </div>

              {stats.byPlan && stats.byPlan.length > 0 && (
                <div className="glass-card rounded-2xl p-6">
                  <h2 className="font-display font-bold text-base text-foreground mb-4">Theo gói</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-white/10">
                          <th className="text-left py-2 px-3 text-xs font-label text-slate-500 dark:text-[#A8A29E] uppercase tracking-wider">Gói</th>
                          <th className="text-right py-2 px-3 text-xs font-label text-slate-500 dark:text-[#A8A29E] uppercase tracking-wider">Số lượng</th>
                          <th className="text-right py-2 px-3 text-xs font-label text-slate-500 dark:text-[#A8A29E] uppercase tracking-wider">Doanh thu</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {stats.byPlan.map(p => (
                          <tr key={p.planCode} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                            <td className="py-3 px-3 font-semibold text-foreground">{PLAN_NAME_VI[p.planCode] ?? p.planName ?? p.planCode}</td>
                            <td className="py-3 px-3 text-right font-mono-data text-foreground">{p.count}</td>
                            <td className="py-3 px-3 text-right font-mono-data text-green-600 dark:text-green-400 font-semibold">{fmtMoney(p.revenue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400">Không có dữ liệu</div>
          )
        )}

        {/* ── PAYMENTS TAB ── */}
        {tab === 'payments' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">              <select value={payStatus} onChange={e => { setPayStatus(e.target.value); loadPayments(1, e.target.value, payPlan, payDateFrom, payDateTo); }}
                className="px-3 py-2 rounded-lg bg-card border border-slate-200 dark:border-white/10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/40 h-10">
                <option value="">Tất cả trạng thái</option>
                <option value="Paid">Đã thanh toán</option>
                <option value="Pending">Chờ thanh toán</option>
                <option value="Expired">Hết hạn</option>
                <option value="Cancelled">Đã hủy</option>
              </select>
              <select value={payPlan} onChange={e => { setPayPlan(e.target.value); loadPayments(1, payStatus, e.target.value, payDateFrom, payDateTo); }}
                className="px-3 py-2 rounded-lg bg-card border border-slate-200 dark:border-white/10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/40 h-10">
                <option value="">Tất cả gói</option>
                <option value="TRIAL">Dùng thử</option>
                <option value="MONTHLY">Hàng tháng</option>
                <option value="QUARTERLY">Hàng quý</option>
                <option value="TOPUP_AI_VIDEO">Nạp thêm AI Video</option>
                <option value="TOPUP_FORUM_POST">Nạp thêm bài đăng</option>
                <option value="TOPUP_AI_MATCH">Nạp thêm AI Phân tích</option>
              </select>
              <div className="flex items-center gap-2 px-3 h-10 rounded-lg bg-card border border-slate-200 dark:border-white/10">
                <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <input type="date" value={payDateFrom}
                  onChange={e => { setPayDateFrom(e.target.value); if (payDateTo && e.target.value > payDateTo) setPayDateTo(''); loadPayments(1, payStatus, payPlan, e.target.value, payDateTo); }}
                  className="text-sm bg-transparent text-foreground focus:outline-none w-32" />
                <span className="text-slate-400">—</span>
                <input type="date" value={payDateTo} min={payDateFrom || undefined}
                  onChange={e => { setPayDateTo(e.target.value); loadPayments(1, payStatus, payPlan, payDateFrom, e.target.value); }}
                  className="text-sm bg-transparent text-foreground focus:outline-none w-32" />
              </div>
              {(payStatus || payPlan || payDateFrom || payDateTo) && (
                <Button variant="ghost" size="sm" onClick={() => { setPayStatus(''); setPayPlan(''); setPayDateFrom(''); setPayDateTo(''); loadPayments(1, '', '', '', ''); }}
                  className="text-slate-400 hover:text-red-400">
                  Xóa lọc
                </Button>
              )}
            </div>

            <div className="bg-card border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden">
              {payLoading ? (
                <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-[#00D9FF] animate-spin" /></div>
              ) : payments.length === 0 ? (
                <div className="text-center py-16 text-slate-400">Không có giao dịch</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                      <tr>
                        {['Mã GD', 'Người dùng', 'Gói', 'Số tiền', 'Trạng thái', 'Ngày tạo', 'Ngày thanh toán'].map(h => (
                          <th key={h} className="text-left py-3 px-4 text-xs font-label text-slate-500 dark:text-[#A8A29E] uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {payments.map(p => {
                        const st = STATUS_PAYMENT[p.status] ?? { label: p.status, cls: 'bg-slate-100 text-slate-500' };
                        return (
                          <tr key={p.paymentId} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                            <td className="py-3 px-4 font-mono-data text-xs text-slate-500 dark:text-[#A8A29E]">{p.paymentCode}</td>
                            <td className="py-3 px-4">
                              <p className="font-semibold text-foreground truncate max-w-[140px]">{p.userName ?? '—'}</p>
                              <p className="text-xs text-slate-400 truncate max-w-[140px]">{p.userEmail ?? ''}</p>
                            </td>
                            <td className="py-3 px-4 text-foreground">{PLAN_NAME_VI[p.planCode] ?? p.planName ?? p.planCode}</td>
                            <td className="py-3 px-4 font-mono-data font-semibold text-green-600 dark:text-green-400 whitespace-nowrap">{fmtMoney(p.amount)}</td>
                            <td className="py-3 px-4">
                              <span className={cn('px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap', st.cls)}>{st.label}</span>
                            </td>
                            <td className="py-3 px-4 text-xs text-slate-500 dark:text-[#A8A29E] whitespace-nowrap">{fmtDate(p.createdAt)}</td>
                            <td className="py-3 px-4 text-xs text-slate-500 dark:text-[#A8A29E] whitespace-nowrap">{fmtDate(p.paidAt)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="px-4 pb-4">
                <Pagination page={payPage} total={payTotal} pageSize={PAGE_SIZE}
                  onChange={p => { setPayPage(p); loadPayments(p, payStatus, payPlan, payDateFrom, payDateTo); }} />
              </div>
            </div>
          </div>
        )}

        {/* ── SUBSCRIPTIONS TAB ── */}
        {tab === 'subscriptions' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <select value={subStatus} onChange={e => { setSubStatus(e.target.value); loadSubs(1, e.target.value, subDateFrom, subDateTo); }}
                className="px-3 py-2 rounded-lg bg-card border border-slate-200 dark:border-white/10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/40 h-10">
                <option value="">Tất cả trạng thái</option>
                <option value="Active">Đang hoạt động</option>
                <option value="Inactive">Không hoạt động</option>
                <option value="Expired">Hết hạn</option>
              </select>
              {subStatus && (
                <Button variant="ghost" size="sm" onClick={() => { setSubStatus(''); loadSubs(1, '', subDateFrom, subDateTo); }}
                  className="text-slate-400 hover:text-red-400">
                  Xóa lọc
                </Button>
              )}
            </div>

            <div className="glass-card rounded-2xl overflow-hidden">
              {subLoading ? (
                <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-[#00D9FF] animate-spin" /></div>
              ) : subs.length === 0 ? (
                <div className="text-center py-16 text-slate-400">Không có gói đăng ký</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                      <tr>
                        {['Người dùng', 'Gói', 'Trạng thái', 'Bắt đầu', 'Hết hạn'].map(h => (
                          <th key={h} className="text-left py-3 px-4 text-xs font-label text-slate-500 dark:text-[#A8A29E] uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {subs.map(s => {
                        const st = STATUS_SUB[s.status] ?? { label: s.status, cls: 'bg-slate-100 text-slate-500' };
                        return (
                          <tr key={s.subscriptionId} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                            <td className="py-3 px-4">
                              <p className="font-semibold text-foreground truncate max-w-[160px]">{s.userName ?? '—'}</p>
                              <p className="text-xs text-slate-400 truncate max-w-[160px]">{s.userEmail ?? ''}</p>
                            </td>
                            <td className="py-3 px-4 text-foreground">{PLAN_NAME_VI[s.planCode] ?? s.planName ?? s.planCode}</td>
                            <td className="py-3 px-4">
                              <span className={cn('px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap', st.cls)}>{st.label}</span>
                            </td>
                            <td className="py-3 px-4 text-xs text-slate-500 dark:text-[#A8A29E] whitespace-nowrap">{fmtDate(s.startedAt)}</td>
                            <td className="py-3 px-4 text-xs text-slate-500 dark:text-[#A8A29E] whitespace-nowrap">{fmtDate(s.expiresAt)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="px-4 pb-4">
                <Pagination page={subPage} total={subTotal} pageSize={PAGE_SIZE}
                  onChange={p => { setSubPage(p); loadSubs(p, subStatus, subDateFrom, subDateTo); }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
