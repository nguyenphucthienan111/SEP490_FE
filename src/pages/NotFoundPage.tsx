import { Link } from "react-router-dom";
import { Home, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FF4444] rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00D9FF] rounded-full blur-[128px]" />
      </div>

      <div className="relative z-10 text-center">
        {/* 404 Text */}
        <div className="mb-8">
          <h1 className="font-display font-extrabold text-[180px] leading-none text-transparent bg-clip-text bg-gradient-to-r from-[#FF4444] to-[#FF6666] mb-0">
            404
          </h1>
          <p className="font-display font-bold text-2xl text-foreground -mt-6">
            Không tìm thấy trang
          </p>
        </div>

        {/* Description */}
        <p className="text-[#A8A29E] text-lg max-w-md mx-auto mb-8 font-body">
          Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc không tồn tại.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            asChild
            className="bg-gradient-to-r from-[#FF4444] to-[#FF6666] hover:from-[#FF5555] hover:to-[#FF7777] text-white font-semibold px-6 h-12 rounded-xl shadow-lg shadow-[#FF4444]/30"
          >
            <Link to="/">
              <Home className="w-5 h-5 mr-2" />
              Về trang chủ
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-white/20 text-foreground hover:bg-white/10 px-6 h-12 rounded-xl"
          >
            <Link to="/players">
              <Search className="w-5 h-5 mr-2" />
              Tìm cầu thủ
            </Link>
          </Button>
        </div>

        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t border-white/[0.08]">
          <p className="text-[#A8A29E] text-sm mb-4">Hoặc thử các liên kết phổ biến:</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/leagues"
              className="text-[#00D9FF] hover:underline text-sm"
            >
              Giải đấu
            </Link>
            <span className="text-foreground/20">•</span>
            <Link
              to="/matches"
              className="text-[#00D9FF] hover:underline text-sm"
            >
              Trận đấu
            </Link>
            <span className="text-foreground/20">•</span>
            <Link
              to="/analytics"
              className="text-[#00D9FF] hover:underline text-sm"
            >
              Phân tích
            </Link>
            <span className="text-foreground/20">•</span>
            <Link
              to="/compare"
              className="text-[#00D9FF] hover:underline text-sm"
            >
              So sánh cầu thủ
            </Link>
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 mt-8 text-[#A8A29E] hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại trang trước
        </button>
      </div>
    </div>
  );
}
