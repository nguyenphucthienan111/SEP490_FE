import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { emailVerificationService } from "@/services/emailVerificationService";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Token xác thực không hợp lệ.');
        return;
      }

      console.log('Starting email verification with token:', token);
      
      try {
        await emailVerificationService.verifyEmail(token);
        console.log('Email verification successful');
        setStatus('success');
        setMessage('Email của bạn đã được xác thực thành công!');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error: any) {
        console.error('Email verification failed:', error);
        setStatus('error');
        setMessage(error.message || 'Xác thực email thất bại. Token có thể đã hết hạn.');
      }
    };

    verifyEmail();
  }, [token, navigate]);

  const handleResendVerification = async () => {
    if (!email) {
      setMessage('Vui lòng nhập email của bạn.');
      return;
    }

    setIsResending(true);
    try {
      await emailVerificationService.resendVerification({ email });
      setMessage('Email xác thực mới đã được gửi. Vui lòng kiểm tra hộp thư.');
    } catch (error: any) {
      setMessage(error.message || 'Gửi lại email thất bại. Vui lòng thử lại.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8 relative">
      {/* Back to Home Button */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white hover:text-slate-200 transition-colors group font-body font-semibold"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span>Trang chủ</span>
      </Link>

      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FF4444] rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00D9FF] rounded-full blur-[128px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#FF4444] to-[#FF6666] flex items-center justify-center mb-4 shadow-lg shadow-[#FF4444]/30 hover:scale-105 transition-transform">
            <span className="font-display font-extrabold text-white text-2xl">VN</span>
          </Link>
          <h1 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white">VN Football Analytics</h1>
        </div>

        <div className="bg-card border border-slate-200 dark:border-white/[0.08] rounded-2xl p-8 backdrop-blur-xl">
          <div className="text-center">
            {status === 'loading' && (
              <>
                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center mx-auto mb-6">
                  <Loader2 className="w-8 h-8 text-[#00D9FF] animate-spin" />
                </div>
                <h2 className="font-serif text-3xl font-bold text-slate-900 dark:text-foreground mb-2">
                  Đang Xác Thực...
                </h2>
                <p className="text-slate-700 dark:text-[#A8A29E] font-body font-medium">
                  Vui lòng đợi trong giây lát.
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="font-serif text-3xl font-bold text-slate-900 dark:text-foreground mb-2">
                  Xác Thực Thành Công!
                </h2>
                <p className="text-slate-700 dark:text-[#A8A29E] font-body font-medium mb-6">
                  {message}
                </p>
                <p className="text-sm text-slate-600 dark:text-[#A8A29E]">
                  Đang chuyển hướng đến trang đăng nhập...
                </p>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                  <XCircle className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="font-serif text-3xl font-bold text-slate-900 dark:text-foreground mb-2">
                  Xác Thực Thất Bại
                </h2>
                <p className="text-slate-700 dark:text-[#A8A29E] font-body font-medium mb-6">
                  {message}
                </p>

                {/* Resend Verification Form */}
                <div className="mt-8 p-6 bg-slate-50 dark:bg-white/5 rounded-xl">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Mail className="w-5 h-5 text-[#00D9FF]" />
                    <h3 className="font-body font-semibold text-slate-900 dark:text-foreground">
                      Gửi Lại Email Xác Thực
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-card border border-slate-300 dark:border-white/[0.08] rounded-xl text-slate-900 dark:text-foreground placeholder:text-slate-400 dark:placeholder:text-[#A8A29E]/50 focus:border-[#00D9FF] focus:ring-2 focus:ring-[#00D9FF]/20 outline-none transition-all"
                    />
                    <Button
                      onClick={handleResendVerification}
                      disabled={isResending || !email}
                      className="w-full h-12 bg-gradient-to-r from-[#00D9FF] to-[#00B8D4] hover:from-[#00E8FF] hover:to-[#00C8E4] text-white font-semibold rounded-xl shadow-lg shadow-[#00D9FF]/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isResending ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Đang gửi...
                        </div>
                      ) : (
                        'Gửi Lại Email'
                      )}
                    </Button>
                  </div>
                </div>

                <div className="mt-6">
                  <Link to="/login">
                    <Button
                      variant="outline"
                      className="border-slate-300 dark:border-white/20 text-slate-900 dark:text-foreground hover:bg-slate-100 dark:hover:bg-white/10"
                    >
                      Quay lại đăng nhập
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
