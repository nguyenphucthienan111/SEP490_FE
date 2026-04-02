import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';
import { Loader2, CheckCircle2, XCircle, Copy, Clock, ArrowLeft, RefreshCw } from 'lucide-react';
import { subscriptionService, PaymentInfo } from '@/services/subscriptionService';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function PaymentPage() {
  const { paymentCode } = useParams<{ paymentCode: string }>();
  const navigate = useNavigate();
  const [payment, setPayment] = useState<PaymentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchPayment = async () => {
    if (!paymentCode) return;
    try {
      const data = await subscriptionService.getPayment(paymentCode);
      setPayment(data);
      return data;
    } catch {
      toast.error('Không thể tải thông tin thanh toán');
    }
  };

  useEffect(() => {
    if (!paymentCode) return;
    const token = localStorage.getItem('accessToken');

    fetchPayment().then(data => {
      setLoading(false);
      if (!data || data.status !== 'Pending') return;

      // Countdown timer
      const expires = new Date(data.expiresAt).getTime();
      const updateTimer = () => setTimeLeft(Math.max(0, Math.floor((expires - Date.now()) / 1000)));
      updateTimer();
      timerRef.current = setInterval(updateTimer, 1000);

      // SSE for realtime payment status
      const apiBase = import.meta.env.VITE_API_BASE_URL || '';
      const sseUrl = `${apiBase}/api/subscriptions/payments/${paymentCode}/events`;
      const es = new EventSource(
        token ? `${sseUrl}?access_token=${encodeURIComponent(token)}` : sseUrl
      );

      es.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data);
          const status = event?.status ?? event?.Status;
          if (status) {
            setPayment(prev => prev ? { ...prev, status, paidAt: event?.paidAt ?? prev.paidAt } : prev);
            if (status === 'Paid') {
              clearInterval(timerRef.current!);
              es.close();
              toast.success('Thanh toán thành công! Gói Premium đã được kích hoạt.');
            }
            if (status === 'Expired' || status === 'Cancelled') {
              clearInterval(timerRef.current!);
              es.close();
            }
          }
        } catch { /* ignore parse errors */ }
      };

      es.onerror = () => {
        // SSE failed — fallback to polling
        es.close();
        if (!pollRef.current) {
          pollRef.current = setInterval(async () => {
            const updated = await fetchPayment();
            if (updated && (updated.status === 'Paid' || updated.status === 'Expired' || updated.status === 'Cancelled')) {
              clearInterval(pollRef.current!);
              clearInterval(timerRef.current!);
              if (updated.status === 'Paid') toast.success('Thanh toán thành công! Gói Premium đã được kích hoạt.');
            }
          }, 3000);
        }
      };

      pollRef.current = null; // SSE active, no polling needed
      return () => { es.close(); };
    });

    return () => {
      clearInterval(pollRef.current!);
      clearInterval(timerRef.current!);
    };
  }, [paymentCode]);

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép ${label}`);
  };

  const fmtTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const fmtPrice = (n: number) => n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

  if (loading) return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#00D9FF] animate-spin" />
      </div>
    </MainLayout>
  );

  if (!payment) return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <p className="text-slate-500 mb-4">Không tìm thấy thông tin thanh toán</p>
          <Link to="/pricing" className="text-[#00D9FF] hover:underline text-sm">← Quay lại</Link>
        </div>
      </div>
    </MainLayout>
  );

  const isPaid = payment.status === 'Paid';
  const isExpired = payment.status === 'Expired' || payment.status === 'Cancelled';
  const isPending = payment.status === 'Pending';

  return (
    <MainLayout>
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4 max-w-lg">
          <Link to="/pricing" className="inline-flex items-center gap-2 text-slate-500 dark:text-[#A8A29E] hover:text-[#FF4444] transition-colors mb-8 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />Quay lại
          </Link>

          {/* Paid state */}
          {isPaid && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-3xl p-10 text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <h2 className="font-display font-extrabold text-2xl text-slate-900 dark:text-foreground mb-2">Thanh toán thành công!</h2>
              <p className="text-slate-500 dark:text-[#A8A29E] mb-2">Gói <span className="font-semibold text-slate-900 dark:text-foreground">{payment.planName}</span> đã được kích hoạt.</p>
              {payment.paidAt && (
                <p className="text-xs text-slate-400 mb-6">
                  {new Date(payment.paidAt).toLocaleString('vi-VN')}
                </p>
              )}
              <button onClick={() => navigate('/')}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-sm hover:shadow-lg transition-all">
                Về trang chủ
              </button>
            </motion.div>
          )}

          {/* Expired state */}
          {isExpired && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-3xl p-10 text-center">
              <div className="w-20 h-20 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-5">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="font-display font-extrabold text-2xl text-slate-900 dark:text-foreground mb-2">
                {payment.status === 'Expired' ? 'Đã hết hạn' : 'Đã huỷ'}
              </h2>
              <p className="text-slate-500 dark:text-[#A8A29E] mb-6">Vui lòng tạo lại đơn thanh toán mới.</p>
              <Link to="/pricing"
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#FF4444] to-[#FF6666] text-white font-bold text-sm hover:shadow-lg transition-all inline-block">
                Chọn gói lại
              </Link>
            </motion.div>
          )}

          {/* Pending state */}
          {isPending && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="space-y-4">
              {/* Header */}
              <div className="glass-card rounded-3xl p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-sm font-semibold text-amber-500">Chờ thanh toán</span>
                </div>
                <h2 className="font-display font-extrabold text-xl text-slate-900 dark:text-foreground">
                  {payment.planName}
                </h2>
                <p className="font-mono-data text-3xl font-black text-[#00D9FF] mt-1">{fmtPrice(payment.amount)}</p>

                {/* Countdown */}
                {timeLeft > 0 && (
                  <div className="flex items-center justify-center gap-2 mt-3 text-slate-500 dark:text-[#A8A29E]">
                    <Clock className="w-4 h-4" />
                    <span className="font-mono-data text-sm">Hết hạn sau <span className={cn('font-bold', timeLeft < 120 ? 'text-red-500' : 'text-slate-700 dark:text-slate-300')}>{fmtTime(timeLeft)}</span></span>
                  </div>
                )}
              </div>

              {/* QR Code */}
              <div className="glass-card rounded-3xl p-6 flex flex-col items-center">
                <p className="text-xs font-semibold text-slate-500 dark:text-[#A8A29E] uppercase tracking-wider mb-4">Quét mã QR để thanh toán</p>
                <div className="p-3 bg-white rounded-2xl shadow-md">
                  <img src={payment.qrUrl} alt="QR Code" className="w-52 h-52 object-contain" />
                </div>
                <p className="text-xs text-slate-400 mt-3 text-center">Hỗ trợ tất cả ứng dụng ngân hàng</p>
              </div>

              {/* Bank info */}
              <div className="glass-card rounded-3xl p-6 space-y-3">
                <p className="text-xs font-semibold text-slate-500 dark:text-[#A8A29E] uppercase tracking-wider mb-4">Thông tin chuyển khoản</p>
                {[
                  { label: 'Ngân hàng', value: payment.bankCode, copy: false },
                  { label: 'Số tài khoản', value: payment.accountNumber, copy: true },
                  { label: 'Chủ tài khoản', value: payment.accountName, copy: false },
                  { label: 'Số tiền', value: fmtPrice(payment.amount), copy: false },
                  { label: 'Nội dung CK', value: payment.transferContent, copy: true, highlight: true },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between gap-3">
                    <span className="text-xs text-slate-400 flex-shrink-0 w-28">{item.label}</span>
                    <span className={cn('text-sm font-semibold flex-1 text-right',
                      item.highlight ? 'text-[#FF4444] font-mono-data' : 'text-slate-900 dark:text-foreground'
                    )}>{item.value}</span>
                    {item.copy && (
                      <button onClick={() => copy(item.value, item.label)}
                        className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 transition-colors flex-shrink-0">
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Note */}
              <div className="rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-4">
                <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                  ⚠️ Nhập đúng nội dung chuyển khoản <span className="font-mono font-bold">{payment.transferContent}</span> để hệ thống tự động xác nhận.
                </p>
              </div>

              {/* Polling indicator */}
              <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Đang tự động kiểm tra thanh toán...
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
