import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle, XCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { passwordService } from "@/services/passwordService";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Token không hợp lệ hoặc đã hết hạn.');
    }
  }, [token]);

  const passwordRequirements = [
    { label: "Ít nhất 8 ký tự", met: password.length >= 8 },
    { label: "Chứa chữ hoa", met: /[A-Z]/.test(password) },
    { label: "Chứa chữ thường", met: /[a-z]/.test(password) },
    { label: "Chứa số", met: /[0-9]/.test(password) },
    { label: "Chứa ký tự đặc biệt", met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast.error("Token không hợp lệ");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu không khớp");
      toast.error("Mật khẩu không khớp");
      return;
    }

    const allRequirementsMet = passwordRequirements.every(req => req.met);
    if (!allRequirementsMet) {
      setError("Mật khẩu không đáp ứng yêu cầu");
      toast.error("Mật khẩu không đáp ứng yêu cầu");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Decode token from URL before sending to API
      const decodedToken = decodeURIComponent(token);
      console.log('Original token from URL:', token);
      console.log('Decoded token:', decodedToken);
      
      await passwordService.resetPassword({
        token: decodedToken,
        newPassword: password,
        confirmNewPassword: confirmPassword,
      });

      console.log('Password reset successful');
      setIsSuccess(true);
      toast.success("Đặt lại mật khẩu thành công!");
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('Password reset failed:', err);
      const errorMessage = err instanceof Error ? err.message : "Đặt lại mật khẩu thất bại. Vui lòng thử lại.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
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
          {!isSuccess ? (
            <>
              <div className="text-center mb-8">
                <h2 className="font-serif text-3xl font-bold text-slate-900 dark:text-foreground mb-2">Đặt Lại Mật Khẩu</h2>
                <p className="text-slate-700 dark:text-[#A8A29E] font-body">
                  Nhập mật khẩu mới của bạn
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700 dark:text-[#E8E6E1] font-body font-medium">Mật khẩu mới</Label>
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
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-[#A8A29E] hover:text-slate-900 dark:hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {password && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {passwordRequirements.map((req, index) => (
                        <div key={index} className="flex items-center gap-1.5">
                          <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${req.met ? 'bg-green-500' : 'bg-slate-300 dark:bg-white/10'}`}>
                            {req.met && <Check className="w-2.5 h-2.5 text-white" />}
                          </div>
                          <span className={`text-xs ${req.met ? 'text-green-600 dark:text-green-400' : 'text-slate-600 dark:text-[#A8A29E]'}`}>{req.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-slate-700 dark:text-[#E8E6E1] font-body font-medium">Xác nhận mật khẩu</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 dark:text-[#A8A29E]" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10 bg-white dark:bg-card border-slate-300 dark:border-white/[0.08] text-slate-900 dark:text-foreground placeholder:text-slate-400 dark:placeholder:text-[#A8A29E]/50 h-12 rounded-xl focus:border-[#00D9FF] focus:ring-[#00D9FF]/20"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-[#A8A29E] hover:text-slate-900 dark:hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-red-600 dark:text-red-400 text-xs mt-1">Mật khẩu không khớp</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !token || password !== confirmPassword}
                  className="w-full h-12 bg-gradient-to-r from-[#FF4444] to-[#FF6666] hover:from-[#FF5555] hover:to-[#FF7777] text-slate-900 dark:text-white font-semibold rounded-xl shadow-lg shadow-[#FF4444]/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang xử lý...
                    </div>
                  ) : (
                    "Đặt lại mật khẩu"
                  )}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="font-serif text-3xl font-bold text-slate-900 dark:text-foreground mb-2">
                Thành Công!
              </h2>
              <p className="text-slate-700 dark:text-[#A8A29E] font-body font-medium mb-6">
                Mật khẩu của bạn đã được đặt lại thành công.
              </p>
              <p className="text-sm text-slate-600 dark:text-[#A8A29E]">
                Đang chuyển hướng đến trang đăng nhập...
              </p>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-slate-700 dark:text-[#A8A29E] hover:text-slate-900 dark:hover:text-foreground transition-colors font-body"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
