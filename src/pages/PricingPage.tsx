import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Crown, Loader2, Star } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { apiClient } from '@/services/api';
import { subscriptionService, SubscriptionStatus } from '@/services/subscriptionService';
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
      '10 lượt AI Chat/ngày',
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
      '25 lượt AI Chat/ngày',
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
      '50 lượt AI Chat/ngày',
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
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('accessToken');

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
    }
  }, []);

  const handleSubscribe = async (planCode: string) => {
    if (!isLoggedIn) { navigate('/login'); return; }
    setPaying(planCode);
    try {
      const payment = await subscriptionService.createPayment(planCode);
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

          {/* Plans */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 text-[#00D9FF] animate-spin" />
            </div>
          ) : (
            <div className="grid sm:grid-cols-3 gap-6 mb-12">
              {plans.map((plan, i) => {
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
                            {plan.code === 'TRIAL' ? 'Dùng thử' : plan.code === 'MONTHLY' ? 'Hàng tháng' : 'Hàng quý'}
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
                          disabled={!!paying || subscription?.isActive}
                          className={cn(
                            'w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2',
                            subscription?.isActive && subscription.planCode === plan.code
                              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 cursor-default'
                              : plan.code === 'QUARTERLY'
                              ? 'bg-gradient-to-r from-[#FF4444] to-[#FF6666] text-white hover:shadow-lg hover:shadow-[#FF4444]/25 disabled:opacity-50'
                              : 'bg-gradient-to-r from-[#00D9FF] to-[#00E8FF] text-slate-900 hover:shadow-lg hover:shadow-[#00D9FF]/25 disabled:opacity-50'
                          )}
                          onClick={e => { e.stopPropagation(); if (!subscription?.isActive) handleSubscribe(plan.code); }}
                        >
                          {paying === plan.code ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                          {subscription?.isActive && subscription.planCode === plan.code
                            ? '✓ Đang sử dụng'
                            : subscription?.isActive
                            ? 'Đã có gói khác'
                            : 'Đăng ký ngay'}
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

          {/* FAQ / Trust */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
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
