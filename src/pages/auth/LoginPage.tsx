import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login - replace with actual auth logic
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to home or dashboard
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0A1628] flex relative">
      {/* Back to Home Button */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-[#A8A29E] hover:text-white transition-colors group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-body">Trang chủ</span>
      </Link>

      {/* Left Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A1628] via-[#1A0F2E] to-[#0A1628]" />
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
          <p className="text-[#A8A29E] text-lg max-w-md font-body">
            Nền tảng phân tích và đánh giá cầu thủ bóng đá Việt Nam với hệ thống 
            chấm điểm minh bạch, theo vị trí.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-8">
            <div className="text-center">
              <p className="font-mono text-4xl font-bold text-[#00D9FF]">500+</p>
              <p className="text-[#A8A29E] text-sm mt-1">Cầu thủ</p>
            </div>
            <div className="text-center">
              <p className="font-mono text-4xl font-bold text-[#FF4444]">100+</p>
              <p className="text-[#A8A29E] text-sm mt-1">Trận đấu</p>
            </div>
            <div className="text-center">
              <p className="font-mono text-4xl font-bold text-white">3</p>
              <p className="text-[#A8A29E] text-sm mt-1">Giải đấu</p>
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
              <span className="font-display font-extrabold text-white text-2xl">VN</span>
            </div>
            <h1 className="font-display font-extrabold text-2xl text-white">VN Football Analytics</h1>
          </div>

          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-xl">
            <div className="text-center mb-8">
              <h2 className="font-display font-extrabold text-3xl text-white mb-2">Đăng Nhập</h2>
              <p className="text-[#A8A29E] font-body">Chào mừng bạn quay trở lại!</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#E8E6E1] font-body">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A8A29E]" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-white/[0.03] border-white/[0.08] text-white placeholder:text-[#A8A29E]/50 h-12 rounded-xl focus:border-[#00D9FF] focus:ring-[#00D9FF]/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#E8E6E1] font-body">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A8A29E]" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-white/[0.03] border-white/[0.08] text-white placeholder:text-[#A8A29E]/50 h-12 rounded-xl focus:border-[#00D9FF] focus:ring-[#00D9FF]/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8A29E] hover:text-white transition-colors"
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
                    className="border-white/20 data-[state=checked]:bg-[#00D9FF] data-[state=checked]:border-[#00D9FF]"
                  />
                  <Label htmlFor="remember" className="text-[#A8A29E] text-sm font-body cursor-pointer">
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
                className="w-full h-12 bg-gradient-to-r from-[#FF4444] to-[#FF6666] hover:from-[#FF5555] hover:to-[#FF7777] text-white font-semibold rounded-xl shadow-lg shadow-[#FF4444]/30 transition-all duration-200"
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
              <p className="text-[#A8A29E] font-body">
                Chưa có tài khoản?{" "}
                <Link to="/register" className="text-[#00D9FF] hover:underline font-semibold">
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-[#A8A29E]/50 text-sm mt-6 font-body">
            Bằng việc đăng nhập, bạn đồng ý với{" "}
            <Link to="/terms" className="text-[#A8A29E] hover:underline">Điều khoản sử dụng</Link>
            {" "}và{" "}
            <Link to="/privacy" className="text-[#A8A29E] hover:underline">Chính sách bảo mật</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
