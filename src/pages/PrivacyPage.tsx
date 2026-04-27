import { MainLayout } from '@/components/layout/MainLayout';

export default function PrivacyPage() {
  const lastUpdated = '28/04/2026';

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold text-foreground mb-2">Chính sách Bảo mật</h1>
        <p className="text-sm text-muted-foreground mb-8">Cập nhật lần cuối: {lastUpdated}</p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-sm leading-relaxed text-foreground/80">

          <section>
            <h2 className="text-lg font-bold text-foreground mb-2">1. Giới thiệu</h2>
            <p>
              VN Football Analytics ("chúng tôi") cam kết bảo vệ quyền riêng tư của người dùng.
              Chính sách này mô tả cách chúng tôi thu thập, sử dụng và bảo vệ thông tin của bạn
              khi sử dụng website <strong>vnfootballanalytics.vercel.app</strong> và Chrome Extension <strong>VN Football Analytics</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-2">2. Thông tin chúng tôi thu thập</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Thông tin tài khoản:</strong> Email, tên người dùng khi đăng ký.</li>
              <li><strong>Dữ liệu sử dụng:</strong> Lịch sử phân tích AI, lịch sử chat, dự đoán kết quả.</li>
              <li><strong>Thông tin thanh toán:</strong> Mã giao dịch, trạng thái thanh toán (không lưu thông tin thẻ).</li>
              <li><strong>Extension:</strong> JWT token đăng nhập được lưu cục bộ trong trình duyệt để xác thực API. Nội dung bài viết bạn chọn phân tích được gửi lên server để xử lý AI.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-2">3. Cách chúng tôi sử dụng thông tin</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Cung cấp và cải thiện dịch vụ phân tích bóng đá.</li>
              <li>Xác thực người dùng và quản lý gói đăng ký.</li>
              <li>Xử lý yêu cầu phân tích AI từ extension.</li>
              <li>Gửi thông báo liên quan đến tài khoản (không spam).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-2">4. Chia sẻ thông tin</h2>
            <p>
              Chúng tôi <strong>không bán</strong> thông tin cá nhân của bạn cho bên thứ ba.
              Dữ liệu chỉ được chia sẻ với:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Google Gemini AI:</strong> Nội dung bài viết được gửi để phân tích (không kèm thông tin định danh).</li>
              <li><strong>Azure / Vercel:</strong> Nhà cung cấp hạ tầng hosting.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-2">5. Bảo mật dữ liệu</h2>
            <p>
              Mật khẩu được mã hóa bằng bcrypt. Giao tiếp giữa extension và server sử dụng HTTPS.
              JWT token được lưu trong <code>chrome.storage.local</code> — chỉ extension của chúng tôi mới có thể truy cập.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-2">6. Quyền của người dùng</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Yêu cầu xóa tài khoản và toàn bộ dữ liệu.</li>
              <li>Xuất lịch sử phân tích của bạn.</li>
              <li>Gỡ cài đặt extension bất cứ lúc nào — token sẽ bị xóa khỏi trình duyệt.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-2">7. Cookie</h2>
            <p>
              Website sử dụng localStorage để lưu token đăng nhập. Không sử dụng cookie theo dõi quảng cáo.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-2">8. Liên hệ</h2>
            <p>
              Nếu có câu hỏi về chính sách bảo mật, vui lòng liên hệ qua tính năng{' '}
              <a href="/forum" className="text-[#00D9FF] hover:underline">Hỗ trợ</a> trên website
              hoặc email: <strong>nguyenphucthienan111@gmail.com</strong>
            </p>
          </section>

        </div>
      </div>
    </MainLayout>
  );
}
