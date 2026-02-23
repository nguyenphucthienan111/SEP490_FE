import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { authService } from "@/services/authService";
import { emailVerificationService } from "@/services/emailVerificationService";
import { userService } from "@/services/userService";
import { toast } from "sonner";
import { TermsModal } from "@/components/TermsModal";
import { PrivacyModal } from "@/components/PrivacyModal";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showResendButton, setShowResendButton] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setShowResendButton(false);

    try {
      const loginResponse = await authService.login({
        email,
        password,
        rememberMe,
      });
      
      console.log('Login response:', loginResponse);
      console.log('Access token:', localStorage.getItem('accessToken'));
      console.log('Refresh token:', localStorage.getItem('refreshToken'));

      // Fetch user info after successful login
      try {
        const userData = await userService.getMe();
        console.log('User data from /me:', userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } catch (err) {
        console.error('Failed to fetch user info:', err);
        // If API /me fails, try to use user from login response
        if (loginResponse.user) {
          console.log('Using user from login response:', loginResponse.user);
          localStorage.setItem('user', JSON.stringify(loginResponse.user));
        }
      }

      toast.success("Đăng nhập thành công!");
      
      // Reload page to update header
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Đăng nhập thất bại. Vui lòng thử lại.";
      setError(errorMessage);
      
      // Show resend button if error is about email verification
      if (errorMessage.toLowerCase().includes("email") && 
          (errorMessage.toLowerCase().includes("xác thực") || 
           errorMessage.toLowerCase().includes("verified"))) {
        setShowResendButton(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError("Vui lòng nhập email của bạn.");
      return;
    }

    setIsResending(true);
    try {
      await emailVerificationService.resendVerification({ email });
      toast.success("Email xác thực đã được gửi! Vui lòng kiểm tra hộp thư.");
      setShowResendButton(false);
    } catch (error: any) {
      setError(error.message || "Gửi lại email thất bại. Vui lòng thử lại.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex relative">
      {/* Back to Home Button */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white hover:text-slate-200 transition-colors group font-body font-semibold"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span>Trang chủ</span>
      </Link>

      {/* Left Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 dark:from-midnight-navy via-dark-purple to-slate-300 dark:to-midnight-navy" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FF4444] rounded-full blur-[128px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00D9FF] rounded-full blur-[128px]" />
        </div>
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FF4444] to-[#FF6666] flex items-center justify-center mb-8 shadow-lg shadow-[#FF4444]/30">
            <span className="font-display font-extrabold text-white text-3xl">VN</span>
          </div>
          <h1 className="font-display font-extrabold text-5xl text-white mb-4">
            VN Football Analytics
          </h1>
          <p className="text-white/90 text-lg max-w-md font-body">
            Nền tảng phân tích và đánh giá cầu thủ bóng đá Việt Nam với hệ thống 
            chấm điểm minh bạch, theo vị trí.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-8">
            <div className="text-center">
              <p className="font-mono text-4xl font-bold text-[#00D9FF]">500+</p>
              <p className="text-white dark:text-[#A8A29E] text-sm mt-1 font-semibold">Cầu thủ</p>
            </div>
            <div className="text-center">
              <p className="font-mono text-4xl font-bold text-[#FF4444]">100+</p>
              <p className="text-white dark:text-[#A8A29E] text-sm mt-1 font-semibold">Trận đấu</p>
            </div>
            <div className="text-center">
              <p className="font-mono text-4xl font-bold text-white dark:text-foreground">3</p>
              <p className="text-white dark:text-[#A8A29E] text-sm mt-1 font-semibold">Giải đấu</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#FF4444] to-[#FF6666] flex items-center justify-center mb-4">
              <span className="font-display font-extrabold text-slate-900 dark:text-white text-2xl">VN</span>
            </div>
            <h1 className="font-display font-extrabold text-2xl text-foreground">VN Football Analytics</h1>
          </div>

          <div className="bg-card border border-slate-200 dark:border-white/[0.08] rounded-2xl p-8 backdrop-blur-xl">
            <div className="text-center mb-8">
              <h2 className="font-serif text-3xl font-bold text-slate-900 dark:text-foreground mb-2">Đăng Nhập</h2>
              <p className="text-slate-700 dark:text-[#A8A29E] font-body">Chào mừng bạn quay trở lại!</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {showResendButton && (
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <p className="text-sm text-blue-400 mb-3">
                    Email của bạn chưa được xác thực. Vui lòng kiểm tra hộp thư hoặc gửi lại email xác thực.
                  </p>
                  <Button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={isResending}
                    className="w-full h-10 bg-gradient-to-r from-[#00D9FF] to-[#00B8D4] hover:from-[#00E8FF] hover:to-[#00C8E4] text-white font-semibold rounded-xl shadow-lg shadow-[#00D9FF]/30 transition-all duration-200 disabled:opacity-50"
                  >
                    {isResending ? "Đang gửi..." : "Gửi lại email xác thực"}
                  </Button>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 dark:text-[#E8E6E1] font-body font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 dark:text-[#A8A29E]" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-white dark:bg-card border-slate-300 dark:border-white/[0.08] text-slate-900 dark:text-foreground placeholder:text-slate-400 dark:placeholder:text-[#A8A29E]/50 h-12 rounded-xl focus:border-[#00D9FF] focus:ring-[#00D9FF]/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 dark:text-[#E8E6E1] font-body font-medium">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 dark:text-[#A8A29E]" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-white dark:bg-card border-slate-300 dark:border-white/[0.08] text-slate-900 dark:text-foreground placeholder:text-slate-400 dark:placeholder:text-[#A8A29E]/50 h-12 rounded-xl focus:border-[#00D9FF] focus:ring-[#00D9FF]/20"
                    required
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-[#A8A29E] hover:text-slate-900 dark:hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    className="border-slate-400 dark:border-white/20 data-[state=checked]:bg-[#00D9FF] data-[state=checked]:border-[#00D9FF]"
                  />
                  <Label htmlFor="remember" className="text-slate-700 dark:text-[#A8A29E] text-sm font-body cursor-pointer">
                    Ghi nhớ đăng nhập
                  </Label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-[#00D9FF] text-sm hover:underline font-body"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-[#FF4444] to-[#FF6666] hover:from-[#FF5555] hover:to-[#FF7777] text-slate-900 dark:text-white font-semibold rounded-xl shadow-lg shadow-[#FF4444]/30 transition-all duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang đăng nhập...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Đăng nhập
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-700 dark:text-[#A8A29E] font-body">
                Chưa có tài khoản?{" "}
                <Link to="/register" className="text-[#00D9FF] hover:underline font-semibold">
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-slate-600 dark:text-[#A8A29E]/50 text-sm mt-6 font-body">
            Bằng việc đăng nhập, bạn đồng ý với{" "}
            <button
              type="button"
              onClick={() => setShowTerms(true)}
              className="text-slate-700 dark:text-[#A8A29E] hover:underline"
            >
              Điều khoản sử dụng
            </button>
            {" "}và{" "}
            <button
              type="button"
              onClick={() => setShowPrivacy(true)}
              className="text-slate-700 dark:text-[#A8A29E] hover:underline"
            >
              Chính sách bảo mật
            </button>
          </p>

          {/* Modals */}
          <TermsModal open={showTerms} onOpenChange={setShowTerms} />
          <PrivacyModal open={showPrivacy} onOpenChange={setShowPrivacy} />
        </div>
      </div>
    </div>
  );
}
