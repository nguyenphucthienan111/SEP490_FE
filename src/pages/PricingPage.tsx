import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Crown, Loader2, Star, Calendar, History, ChevronDown, ChevronUp, Video, FileText, Plus, BarChart2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { apiClient } from '@/services/api';
import { subscriptionService, SubscriptionStatus, PaymentInfo } from '@/services/subscriptionService';
import { invalidateSubscriptionCache } from '@/hooks/useSubscription';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';

interface Plan {
  code: string;
  name: string;
  description: string;
  price: number;
  durationDays: number;
}

const PLAN_META: Record<string, {
  icon: React.ReactNode;
  color: string;
  border: string;
  badge?: string;
  features: string[];
  popular?: boolean;
}> = {
  TRIAL: {
    icon: <Star className="w-5 h-5" />,
    color: 'from-slate-500/10 to-transparent',
    border: 'border-slate-400/40',
    features: [
      'Xem thống kê chi tiết cầu thủ',
      'Lịch sử chuyển nhượng',
      'Phân tích phong độ qua các mùa',
      'So sánh cầu thủ đầy đủ',
      '1 lượt AI Video Analysis',
      '2 bài đăng diễn đàn',
      'AI Chat không giới hạn',
      '10 lượt AI Phân tích trận/cầu thủ/ngày',
      '10 lượt AI Phân tích bài viết (Extension)',
    ],
  },
  MONTHLY: {
    icon: <Zap className="w-5 h-5" />,
    color: 'from-[#00D9FF]/20 to-transparent',
    border: 'border-[#00D9FF]/30',
    features: [
      'Tất cả tính năng Trial',
      '15 lượt AI Video Analysis',
      '15 bài đăng diễn đàn',
      'AI Chat không giới hạn',
      '20 lượt AI Phân tích trận/cầu thủ/ngày',
      '30 lượt AI Phân tích bài viết (Extension)',
      'So sánh chi tiết cầu thủ',
      'Phân tích phong độ qua các mùa',
      'Lịch sử chuyển nhượng',
    ],
  },
  QUARTERLY: {
    icon: <Crown className="w-5 h-5" />,
    color: 'from-[#FF4444]/20 to-transparent',
    border: 'border-[#FF4444]/40',
    badge: 'Tiết kiệm nhất',
    popular: true,
    features: [
      'Tất cả tính năng Monthly',
      '45 lượt AI Video Analysis',
      '50 bài đăng diễn đàn',
      'AI Chat không giới hạn',
      '30 lượt AI Phân tích trận/cầu thủ/ngày',
      '100 lượt AI Phân tích bài viết (Extension)',
      'So sánh chi tiết cầu thủ',
      'Truy cập sớm tính năng mới',
      'Tiết kiệm ~16% so với Gói Tháng',
    ],
  },
};

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paying, setPaying] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [payments, setPayments] = useState<PaymentInfo[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('accessToken');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setIsAdmin(user?.roles?.some((r: string) => r.toLowerCase() === 'admin') ?? false);
    }
  }, [isLoggedIn]);

  // Plan upgrade order
  const PLAN_ORDER: Record<string, number> = { TRIAL: 1, MONTHLY: 2, QUARTERLY: 3 };
  const canUpgrade = (planCode: string) => {
    if (!subscription?.isActive) return true;
    return (PLAN_ORDER[planCode] ?? 0) > (PLAN_ORDER[subscription.planCode ?? ''] ?? 0);
  };

  const getButtonLabel = (planCode: string) => {
    if (!subscription?.isActive) return 'Đăng ký ngay';
    if (subscription.planCode === planCode) return '✓ Đang sử dụng';
    if (canUpgrade(planCode)) return '⬆ Nâng cấp';
    return 'Đã có gói cao hơn';
  };

  const isButtonDisabled = (planCode: string) => {
    if (paying) return true;
    if (!subscription?.isActive) return false;
    if (subscription.planCode === planCode) return true;
    return !canUpgrade(planCode);
  };

  const fmtDate = (iso: string | null) => {
    if (!iso) return '';
    const d = new Date(iso.endsWith('Z') ? iso : iso + 'Z');
    return d.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const daysLeft = (iso: string | null) => {
    if (!iso) return 0;
    const exp = new Date(iso.endsWith('Z') ? iso : iso + 'Z').getTime();
    return Math.max(0, Math.ceil((exp - Date.now()) / 86400000));
  };

  useEffect(() => {
    apiClient.get<any>('/api/subscriptions/plans')
      .then(res => {
        const data: Plan[] = Array.isArray(res) ? res : res?.data ?? res ?? [];
        setPlans(data);
      })
      .catch(() => toast.error('Không thể tải gói đăng ký'))
      .finally(() => setLoading(false));

    if (isLoggedIn) {
      subscriptionService.getMySubscription()
        .then(setSubscription)
        .catch(() => {});
      subscriptionService.getMyPayments()
        .then(data => setPayments((data as any)?.data ?? data ?? []))
        .catch(() => {});
    }
  }, []);

  const handleSubscribe = async (planCode: string) => {
    if (!isLoggedIn) { navigate('/login'); return; }
    if (isAdmin) { toast.error('Admin không thể mua gói đăng ký'); return; }
    setPaying(planCode);
    try {
      const payment = await subscriptionService.createPayment(planCode);
      invalidateSubscriptionCache();
      navigate(`/payment/${payment.paymentCode}`);
    } catch (e: any) {
      toast.error(e?.message || 'Không thể tạo đơn thanh toán');
    } finally {
      setPaying(null);
    }
  };

  const fmtPrice = (price: number) =>
    price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

  const perDay = (price: number, days: number) =>
    Math.round(price / days).toLocaleString('vi-VN') + 'đ/ngày';

  return (
    <MainLayout>
      <div className="min-h-screen py-16">
        <div className="container mx-auto px-4 max-w-6xl">

          {/* Hero */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF4444]/10 border border-[#FF4444]/20 text-[#FF4444] text-xs font-bold uppercase tracking-wider mb-5">
              <Star className="w-3.5 h-3.5" />Premium
            </div>
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-slate-900 dark:text-foreground mb-4 leading-tight">
              Nâng cấp trải nghiệm<br />
              <span className="bg-gradient-to-r from-[#FF4444] to-[#00D9FF] bg-clip-text text-transparent">bóng đá của bạn</span>
            </h1>
            <p className="text-slate-500 dark:text-[#A8A29E] text-lg max-w-xl mx-auto">
              Truy cập đầy đủ thống kê, phân tích chuyên sâu và dự đoán kết quả với gói Premium.
            </p>
          </motion.div>

          {/* Subscription status banner */}
          {isLoggedIn && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 space-y-3">

              {/* Active plan */}
              {subscription?.isActive && (
                <div className="glass-card rounded-2xl p-5 border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                      <Crown className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">{subscription.planName} đang hoạt động</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        Hết hạn: {fmtDate(subscription.expiresAt)}
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold">
                          Còn {daysLeft(subscription.expiresAt)} ngày
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment history */}
              {payments.length > 0 && (
                <div className="glass-card rounded-2xl overflow-hidden border border-slate-200 dark:border-white/[0.08]">
                  <button onClick={() => setShowHistory(v => !v)}
                    className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4 text-[#00D9FF]" />
                      <span className="font-semibold text-sm text-slate-900 dark:text-foreground">Lịch sử thanh toán</span>
                      <span className="text-xs text-slate-400">({payments.length} giao dịch)</span>
                    </div>
                    {showHistory ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  {showHistory && (
                    <div className="divide-y divide-slate-100 dark:divide-white/5 border-t border-slate-100 dark:border-white/5">
                      {payments.map((p: any) => {
                        const statusMap: Record<string, { label: string; cls: string }> = {
                          Paid:      { label: 'Thành công', cls: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10' },
                          Pending:   { label: 'Chờ TT',     cls: 'text-amber-600 bg-amber-50 dark:bg-amber-500/10' },
                          Cancelled: { label: 'Đã huỷ',     cls: 'text-slate-400 bg-slate-100 dark:bg-white/5' },
                          Expired:   { label: 'Hết hạn',    cls: 'text-red-400 bg-red-50 dark:bg-red-500/10' },
                        };
                        const s = statusMap[p.status] ?? statusMap.Cancelled;
                        return (
                          <div key={p.paymentId} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-semibold text-slate-900 dark:text-foreground">{p.planName}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${s.cls}`}>{s.label}</span>
                              </div>
                              <p className="text-xs text-slate-400 mt-0.5">{fmtDate(p.createdAt)}</p>
                            </div>
                            <span className="font-mono-data font-bold text-sm text-slate-900 dark:text-foreground flex-shrink-0">
                              {p.amount.toLocaleString('vi-VN')}đ
                            </span>
                            {p.status === 'Pending' && (
                              <Link to={`/payment/${p.paymentCode}`}
                                className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold hover:bg-amber-100 transition-colors">
                                Thanh toán
                              </Link>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Plans */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 text-[#00D9FF] animate-spin" />
            </div>
          ) : (
            <div className="grid sm:grid-cols-3 gap-6 mb-12">
              {plans.filter(p => !p.code.startsWith('TOPUP_')).map((plan, i) => {
                const meta = PLAN_META[plan.code] ?? {
                  icon: <Zap className="w-5 h-5" />,
                  color: 'from-slate-500/10 to-transparent',
                  border: 'border-slate-300/30',
                  badge: undefined as string | undefined,
                  popular: false,
                  features: [plan.description],
                };
                const isSelected = selectedPlan === plan.code;
                return (
                  <motion.div
                    key={plan.code}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => setSelectedPlan(plan.code)}
                    className={cn(
                      'relative glass-card rounded-3xl p-7 cursor-pointer transition-all duration-300 border-2 flex flex-col',
                      isSelected ? meta.border + ' scale-[1.02] shadow-xl' : 'border-transparent hover:border-white/20',
                      meta.popular && !isSelected && 'ring-1 ring-[#FF4444]/30'
                    )}
                  >
                    {/* Popular badge */}
                    {meta.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-[#FF4444] to-[#FF6666] text-white shadow-lg">
                          {meta.badge}
                        </span>
                      </div>
                    )}

                    {/* Background gradient */}
                    <div className={cn('absolute inset-0 rounded-3xl bg-gradient-to-br opacity-60 pointer-events-none', meta.color)} />

                    <div className="relative">
                      {/* Icon + name */}
                      <div className="flex items-center gap-3 mb-5">
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center',
                          plan.code === 'QUARTERLY' ? 'bg-[#FF4444]/15 text-[#FF4444]' : 'bg-[#00D9FF]/15 text-[#00D9FF]'
                        )}>
                          {meta.icon}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-foreground text-base">
                            {plan.code === 'TRIAL' ? 'Gói dùng thử' : plan.code === 'MONTHLY' ? 'Gói tháng' : 'Gói quý'}
                          </p>
                          <p className="text-xs text-slate-400">{plan.durationDays} ngày</p>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="mb-6">
                        <div className="flex items-end gap-2">
                          <span className="font-display font-extrabold text-4xl text-slate-900 dark:text-foreground">
                            {fmtPrice(plan.price)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">≈ {perDay(plan.price, plan.durationDays)}</p>
                      </div>

                      {/* Features */}
                      <ul className="space-y-2.5 mb-7 flex-1">
                        {meta.features.map(f => (
                          <li key={f} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-[#A8A29E]">
                            <Check className={cn('w-4 h-4 mt-0.5 flex-shrink-0',
                              plan.code === 'QUARTERLY' ? 'text-[#FF4444]' : 'text-[#00D9FF]'
                            )} />
                            {f}
                          </li>
                        ))}
                      </ul>

                      {/* CTA */}
                      {isLoggedIn ? (
                        <button
                          disabled={isButtonDisabled(plan.code)}
                          className={cn(
                            'w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2',
                            subscription?.isActive && subscription.planCode === plan.code
                              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 cursor-default'
                              : !canUpgrade(plan.code) && subscription?.isActive
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                              : plan.code === 'QUARTERLY'
                              ? 'bg-gradient-to-r from-[#FF4444] to-[#FF6666] text-white hover:shadow-lg hover:shadow-[#FF4444]/25 disabled:opacity-50'
                              : 'bg-gradient-to-r from-[#00D9FF] to-[#00E8FF] text-slate-900 hover:shadow-lg hover:shadow-[#00D9FF]/25 disabled:opacity-50'
                          )}
                          onClick={e => { e.stopPropagation(); if (!isButtonDisabled(plan.code)) handleSubscribe(plan.code); }}
                        >
                          {paying === plan.code ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                          {getButtonLabel(plan.code)}
                        </button>
                      ) : (
                        <button
                          onClick={e => { e.stopPropagation(); navigate('/login'); }}
                          className={cn(
                            'w-full py-3 rounded-xl font-bold text-sm text-center transition-all duration-200',
                            plan.code === 'QUARTERLY'
                              ? 'bg-gradient-to-r from-[#FF4444] to-[#FF6666] text-white hover:shadow-lg hover:shadow-[#FF4444]/25'
                              : 'bg-gradient-to-r from-[#00D9FF] to-[#00E8FF] text-slate-900 hover:shadow-lg hover:shadow-[#00D9FF]/25'
                          )}
                        >
                          Đăng nhập để đăng ký
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Top-up credits section */}
          {isLoggedIn && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="mb-8">
              <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#00D9FF]" />Nạp thêm credit
              </h2>
              <p className="text-sm text-slate-500 dark:text-[#A8A29E] mb-5">
                Hết credit? Nạp thêm bất cứ lúc nào. Giá lẻ cao hơn gói — mua gói sẽ tiết kiệm hơn.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  {
                    code: 'TOPUP_AI_VIDEO',
                    icon: <Video className="w-5 h-5" />,
                    label: 'AI Video Analysis',
                    amount: '5 lượt',
                    price: 50000,
                    perUnit: '10.000đ/lượt',
                    compare: 'Gói tháng: 6.600đ/lượt',
                    color: 'text-[#00D9FF]',
                    bg: 'bg-[#00D9FF]/10',
                    border: 'border-[#00D9FF]/20',
                  },
                  {
                    code: 'TOPUP_FORUM_POST',
                    icon: <FileText className="w-5 h-5" />,
                    label: 'Bài đăng diễn đàn',
                    amount: '10 bài',
                    price: 50000,
                    perUnit: '5.000đ/bài',
                    compare: 'Gói tháng: 6.600đ/bài',
                    color: 'text-[#FF4444]',
                    bg: 'bg-[#FF4444]/10',
                    border: 'border-[#FF4444]/20',
                  },
                  {
                    code: 'TOPUP_AI_ARTICLE',
                    icon: <BarChart2 className="w-5 h-5" />,
                    label: 'AI Phân tích bài viết (Extension)',
                    amount: '10 lượt',
                    price: 50000,
                    perUnit: '5.000đ/lượt',
                    compare: 'Gói tháng: 3.300đ/lượt',
                    color: 'text-[#00D9FF]',
                    bg: 'bg-[#00D9FF]/10',
                    border: 'border-[#00D9FF]/20',
                  },
                ].map(item => (
                  <div key={item.code} className={`glass-card rounded-2xl p-5 border ${item.border} flex items-center justify-between gap-4`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${item.bg} ${item.color} flex items-center justify-center flex-shrink-0`}>
                        {item.icon}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{item.label}</p>
                        <p className="text-xs text-slate-500">{item.amount} · {item.perUnit}</p>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">⚡ {item.compare}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-slate-900 dark:text-white">{item.price.toLocaleString('vi-VN')}đ</p>
                      <button
                        disabled={!!paying}
                        onClick={() => handleSubscribe(item.code)}
                        className={`mt-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${item.color} ${item.bg} border ${item.border} hover:opacity-80 disabled:opacity-50`}
                      >
                        {paying === item.code ? <Loader2 className="w-3 h-3 animate-spin inline" /> : 'Mua ngay'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Extension promo */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="rounded-2xl overflow-hidden border border-[#00D9FF]/20 bg-gradient-to-r from-[#00D9FF]/5 to-transparent p-6">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-[#00D9FF]/10 border border-[#00D9FF]/20 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🧩</span>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <p className="font-bold text-foreground mb-1">Kèm theo Browser Extension miễn phí</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Mọi gói Premium đều bao gồm quyền dùng extension để phân tích bài viết bóng đá ngay trên trình duyệt.
                </p>
              </div>
              <div className="flex-shrink-0 flex flex-col sm:flex-row gap-2 items-center">
                <a href="https://chromewebstore.google.com/detail/VN%20Football/ggdbpkdphapeckchnakjifbinabfeloa" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-[#00D9FF] to-[#0099bb] text-white hover:opacity-90 transition-opacity whitespace-nowrap">
                  🌐 Cài trên Chrome
                </a>
                {/* <a href="https://microsoftedge.microsoft.com/addons" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-[#0078d4] to-[#005a9e] text-white hover:opacity-90 transition-opacity whitespace-nowrap">
                  🌐 Cài trên Edge
                </a> */}
              </div>
            </div>
          </motion.div>

          {/* FAQ / Trust */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="glass-card rounded-2xl p-6 text-center">
            <p className="text-sm text-slate-500 dark:text-[#A8A29E]">
              Thanh toán an toàn · Hủy bất cứ lúc nào · Hỗ trợ 24/7
            </p>
          </motion.div>

        </div>
      </div>
    </MainLayout>
  );
}
