import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { authService } from "@/services/authService";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordRequirements = [
    { label: "Ít nhất 8 ký tự", met: formData.password.length >= 8 },
    { label: "Chứa chữ hoa", met: /[A-Z]/.test(formData.password) },
    { label: "Chứa chữ thường", met: /[a-z]/.test(formData.password) },
    { label: "Chứa số", met: /[0-9]/.test(formData.password) },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu không khớp");
      return;
    }
    setIsLoading(true);
    setError("");

    try {
      await authService.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        fullName: formData.fullName,
      });

      // Navigate to login or home after successful registration
      navigate("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 dark:from-midnight-navy via-dark-purple to-slate-300 dark:to-midnight-navy" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00D9FF] rounded-full blur-[128px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FF4444] rounded-full blur-[128px]" />
        </div>
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FF4444] to-[#FF6666] flex items-center justify-center mb-8 shadow-lg shadow-[#FF4444]/30">
            <span className="font-display font-extrabold text-white text-3xl">VN</span>
          </div>
          <h1 className="font-display font-extrabold text-5xl text-white mb-4">
            Tham gia cùng chúng tôi
          </h1>
          <p className="text-white/90 text-lg max-w-md font-body">
            Tạo tài khoản để khám phá thống kê, so sánh cầu thủ và theo dõi 
            phong độ của các ngôi sao bóng đá Việt Nam.
          </p>
          <div className="mt-12 space-y-4 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-[#00D9FF]/10 flex items-center justify-center">
                <Check className="w-5 h-5 text-[#00D9FF]" />
              </div>
              <p className="text-white font-body font-medium">Xem thống kê chi tiết của cầu thủ</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-[#00D9FF]/10 flex items-center justify-center">
                <Check className="w-5 h-5 text-[#00D9FF]" />
              </div>
              <p className="text-white font-body font-medium">So sánh cầu thủ cùng vị trí</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-[#00D9FF]/10 flex items-center justify-center">
                <Check className="w-5 h-5 text-[#00D9FF]" />
              </div>
              <p className="text-white font-body font-medium">Theo dõi xu hướng phong độ theo thời gian</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-[#00D9FF]/10 flex items-center justify-center">
                <Check className="w-5 h-5 text-[#00D9FF]" />
              </div>
              <p className="text-white font-body font-medium">Lưu danh sách cầu thủ yêu thích</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#FF4444] to-[#FF6666] flex items-center justify-center mb-4">
              <span className="font-display font-extrabold text-foreground text-2xl">VN</span>
            </div>
            <h1 className="font-display font-extrabold text-2xl text-foreground">VN Football Analytics</h1>
          </div>

          <div className="bg-card border border-slate-200 dark:border-white/[0.08] rounded-2xl p-8 backdrop-blur-xl">
            <div className="text-center mb-8">
              <h2 className="font-display font-extrabold text-3xl text-slate-900 dark:text-foreground mb-2">Đăng Ký</h2>
              <p className="text-slate-700 dark:text-[#A8A29E] font-body">Tạo tài khoản mới</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="username" className="text-[#E8E6E1] font-body">Tên đăng nhập</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 dark:text-[#A8A29E]" />
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="pl-10 bg-card border-slate-200 dark:border-white/[0.08] text-foreground placeholder:text-slate-600 dark:text-[#A8A29E]/50 h-12 rounded-xl focus:border-[#00D9FF] focus:ring-[#00D9FF]/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-slate-700 dark:text-[#E8E6E1] font-body font-medium">Họ và tên</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 dark:text-[#A8A29E]" />
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="pl-10 bg-white dark:bg-card border-slate-300 dark:border-white/[0.08] text-slate-900 dark:text-foreground placeholder:text-slate-400 dark:placeholder:text-[#A8A29E]/50 h-12 rounded-xl focus:border-[#00D9FF] focus:ring-[#00D9FF]/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 dark:text-[#E8E6E1] font-body font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 dark:text-[#A8A29E]" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
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
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
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
                {formData.password && (
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
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
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
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-red-600 dark:text-red-400 text-xs mt-1">Mật khẩu không khớp</p>
                )}
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={agreeTerms}
                  onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                  className="border-slate-400 dark:border-white/20 data-[state=checked]:bg-[#00D9FF] data-[state=checked]:border-[#00D9FF] mt-0.5"
                />
                <Label htmlFor="terms" className="text-slate-700 dark:text-[#A8A29E] text-sm font-body cursor-pointer leading-relaxed">
                  Tôi đồng ý với{" "}
                  <Link to="/terms" className="text-[#00D9FF] hover:underline">Điều khoản sử dụng</Link>
                  {" "}và{" "}
                  <Link to="/privacy" className="text-[#00D9FF] hover:underline">Chính sách bảo mật</Link>
                </Label>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !agreeTerms || formData.password !== formData.confirmPassword}
                className="w-full h-12 bg-gradient-to-r from-[#FF4444] to-[#FF6666] hover:from-[#FF5555] hover:to-[#FF7777] text-slate-900 dark:text-white font-semibold rounded-xl shadow-lg shadow-[#FF4444]/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang đăng ký...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Đăng ký
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-700 dark:text-[#A8A29E] font-body">
                Đã có tài khoản?{" "}
                <Link to="/login" className="text-[#00D9FF] hover:underline font-semibold">
                  Đăng nhập
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
