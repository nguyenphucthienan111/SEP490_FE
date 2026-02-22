import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { passwordService } from "@/services/passwordService";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await passwordService.forgotPassword({ email });
      setIsSubmitted(true);
      toast.success("Email đặt lại mật khẩu đã được gửi!");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Gửi email thất bại. Vui lòng thử lại.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsSubmitted(false);
    setEmail("");
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
            <span className="font-display font-extrabold text-foreground text-2xl">VN</span>
          </Link>
          <h1 className="font-display font-extrabold text-2xl text-foreground">VN Football Analytics</h1>
        </div>

        <div className="bg-card border border-slate-200 dark:border-white/[0.08] rounded-2xl p-8 backdrop-blur-xl">
          {!isSubmitted ? (
            <>
              <div className="text-center mb-8">
                <h2 className="font-serif text-3xl font-bold text-foreground mb-2">Quên Mật Khẩu?</h2>
                <p className="text-slate-600 dark:text-[#A8A29E] font-body">
                  Nhập email của bạn và chúng tôi sẽ gửi link đặt lại mật khẩu.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 dark:text-[#E8E6E1] font-body">Email</Label>
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

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-[#FF4444] to-[#FF6666] hover:from-[#FF5555] hover:to-[#FF7777] text-slate-900 dark:text-white font-semibold rounded-xl shadow-lg shadow-[#FF4444]/30 transition-all duration-200"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang gửi...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Gửi link đặt lại
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  )}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="font-display font-extrabold text-2xl text-foreground mb-2">Email Đã Gửi!</h2>
              <p className="text-slate-600 dark:text-[#A8A29E] font-body mb-6">
                Chúng tôi đã gửi link đặt lại mật khẩu đến <span className="text-[#00D9FF]">{email}</span>. 
                Vui lòng kiểm tra hộp thư (bao gồm thư mục spam).
              </p>
              <Button
                onClick={handleResend}
                variant="outline"
                className="border-slate-300 dark:border-white/20 text-foreground hover:bg-slate-200 dark:bg-white/10"
              >
                Gửi lại email
              </Button>
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
