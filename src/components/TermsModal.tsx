import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TermsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TermsModal({ open, onOpenChange }: TermsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] bg-card border-slate-200 dark:border-white/[0.08]">
        <DialogHeader>
          <DialogTitle className="font-display font-bold text-2xl text-foreground">
            Điều khoản sử dụng
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-slate-600 dark:text-[#A8A29E]">
            <section>
              <h3 className="font-display font-bold text-lg text-foreground mb-3">
                1. Chấp nhận điều khoản
              </h3>
              <p className="mb-2">
                Bằng việc truy cập và sử dụng nền tảng VN Football Analytics ("Dịch vụ"), 
                bạn đồng ý tuân thủ và bị ràng buộc bởi các điều khoản và điều kiện sau đây. 
                Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, 
                vui lòng không sử dụng Dịch vụ của chúng tôi.
              </p>
            </section>

            <section>
              <h3 className="font-display font-bold text-lg text-foreground mb-3">
                2. Mô tả dịch vụ
              </h3>
              <p className="mb-2">
                VN Football Analytics cung cấp nền tảng phân tích và đánh giá cầu thủ bóng đá Việt Nam 
                với hệ thống chấm điểm minh bạch, theo vị trí. Dịch vụ bao gồm:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Thống kê chi tiết về hiệu suất cầu thủ</li>
                <li>Hệ thống đánh giá và xếp hạng</li>
                <li>So sánh cầu thủ cùng vị trí</li>
                <li>Phân tích xu hướng và dự đoán</li>
                <li>Nội dung phân tích chuyên sâu</li>
              </ul>
            </section>

            <section>
              <h3 className="font-display font-bold text-lg text-foreground mb-3">
                3. Tài khoản người dùng
              </h3>
              <p className="mb-2">
                Để sử dụng một số tính năng của Dịch vụ, bạn cần tạo tài khoản. Bạn cam kết:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Cung cấp thông tin chính xác, đầy đủ và cập nhật</li>
                <li>Bảo mật thông tin đăng nhập của bạn</li>
                <li>Chịu trách nhiệm về mọi hoạt động diễn ra dưới tài khoản của bạn</li>
                <li>Thông báo ngay cho chúng tôi về bất kỳ vi phạm bảo mật nào</li>
              </ul>
            </section>

            <section>
              <h3 className="font-display font-bold text-lg text-foreground mb-3">
                4. Quyền sở hữu trí tuệ
              </h3>
              <p className="mb-2">
                Tất cả nội dung, tính năng và chức năng của Dịch vụ (bao gồm nhưng không giới hạn 
                ở văn bản, đồ họa, logo, biểu tượng, hình ảnh, video, dữ liệu và phần mềm) 
                là tài sản của VN Football Analytics và được bảo vệ bởi luật bản quyền quốc tế.
              </p>
            </section>

            <section>
              <h3 className="font-display font-bold text-lg text-foreground mb-3">
                5. Hành vi bị cấm
              </h3>
              <p className="mb-2">Khi sử dụng Dịch vụ, bạn không được:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Vi phạm bất kỳ luật hoặc quy định hiện hành nào</li>
                <li>Xâm phạm quyền của người khác</li>
                <li>Tải lên hoặc truyền tải virus, mã độc hại</li>
                <li>Thu thập thông tin người dùng khác mà không có sự cho phép</li>
                <li>Sử dụng Dịch vụ cho mục đích thương mại mà không được phép</li>
                <li>Can thiệp hoặc làm gián đoạn hoạt động của Dịch vụ</li>
              </ul>
            </section>

            <section>
              <h3 className="font-display font-bold text-lg text-foreground mb-3">
                6. Độ chính xác của dữ liệu
              </h3>
              <p className="mb-2">
                Chúng tôi nỗ lực cung cấp thông tin chính xác và cập nhật. Tuy nhiên, 
                chúng tôi không đảm bảo tính chính xác, đầy đủ hoặc kịp thời của dữ liệu. 
                Dữ liệu được cung cấp chỉ mang tính chất tham khảo.
              </p>
            </section>

            <section>
              <h3 className="font-display font-bold text-lg text-foreground mb-3">
                7. Giới hạn trách nhiệm
              </h3>
              <p className="mb-2">
                VN Football Analytics không chịu trách nhiệm về bất kỳ thiệt hại trực tiếp, 
                gián tiếp, ngẫu nhiên, đặc biệt hoặc hậu quả nào phát sinh từ việc sử dụng 
                hoặc không thể sử dụng Dịch vụ.
              </p>
            </section>

            <section>
              <h3 className="font-display font-bold text-lg text-foreground mb-3">
                8. Thay đổi điều khoản
              </h3>
              <p className="mb-2">
                Chúng tôi có quyền sửa đổi các điều khoản này bất cứ lúc nào. 
                Việc tiếp tục sử dụng Dịch vụ sau khi có thay đổi đồng nghĩa với việc 
                bạn chấp nhận các điều khoản mới.
              </p>
            </section>

            <section>
              <h3 className="font-display font-bold text-lg text-foreground mb-3">
                9. Chấm dứt
              </h3>
              <p className="mb-2">
                Chúng tôi có quyền chấm dứt hoặc tạm ngừng quyền truy cập của bạn vào Dịch vụ 
                ngay lập tức, không cần thông báo trước, nếu bạn vi phạm các điều khoản này.
              </p>
            </section>

            <section>
              <h3 className="font-display font-bold text-lg text-foreground mb-3">
                10. Liên hệ
              </h3>
              <p className="mb-2">
                Nếu bạn có bất kỳ câu hỏi nào về Điều khoản sử dụng này, 
                vui lòng liên hệ với chúng tôi qua email: support@vnfootballanalytics.com
              </p>
            </section>

            <p className="text-sm italic mt-6">
              Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
            </p>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
