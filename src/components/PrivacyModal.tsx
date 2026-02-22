import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PrivacyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PrivacyModal({ open, onOpenChange }: PrivacyModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] bg-card border-slate-200 dark:border-white/[0.08]">
        <DialogHeader>
          <DialogTitle className="font-display font-bold text-2xl text-foreground">
            Chính sách bảo mật
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-slate-600 dark:text-[#A8A29E]">
            <section>
              <h3 className="font-display font-bold text-lg text-foreground mb-3">
                1. Giới thiệu
              </h3>
              <p className="mb-2">
                VN Football Analytics ("chúng tôi", "của chúng tôi") cam kết bảo vệ quyền riêng tư 
                của bạn. Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng, 
                tiết lộ và bảo vệ thông tin cá nhân của bạn khi bạn sử dụng dịch vụ của chúng tôi.
              </p>
            </section>

            <section>
              <h3 className="font-display font-bold text-lg text-foreground mb-3">
                2. Thông tin chúng tôi thu thập
              </h3>
              <p className="mb-2">Chúng tôi thu thập các loại thông tin sau:</p>
              
              <h4 className="font-semibold text-foreground mt-3 mb-2">2.1. Thông tin bạn cung cấp:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Thông tin tài khoản: tên, email, mật khẩu</li>
                <li>Thông tin hồ sơ: ảnh đại diện, đội bóng yêu thích</li>
                <li>Nội dung do người dùng tạo: bình luận, đánh giá</li>
              </ul>

              <h4 className="font-semibold text-foreground mt-3 mb-2">2.2. Thông tin tự động thu thập:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Dữ liệu sử dụng: trang đã xem, thời gian truy cập</li>
                <li>Thông tin thiết bị: loại thiết bị, hệ điều hành, trình duyệt</li>
                <li>Địa chỉ IP và dữ liệu vị trí</li>
                <li>Cookies và công nghệ theo dõi tương tự</li>
              </ul>
            </section>

            <section>
              <h3 className="font-display font-bold text-lg text-foreground mb-3">
                3. Cách chúng tôi sử dụng thông tin
              </h3>
              <p className="mb-2">Chúng tôi sử dụng thông tin của bạn để:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Cung cấp, vận hành và cải thiện Dịch vụ</li>
                <li>Tạo và quản lý tài khoản của bạn</li>
                <li>Cá nhân hóa trải nghiệm người dùng</li>
                <li>Gửi thông báo về cập nhật, bảo mật và hỗ trợ</li>
                <li>Phân tích xu hướng và hành vi người dùng</li>
                <li>Phát hiện và ngăn chặn gian lận, lạm dụng</li>
                <li>Tuân thủ nghĩa vụ pháp lý</li>
              </ul>
            </section>

            <section>
              <h3 className="font-display font-bold text-lg text-foreground mb-3">
                4. Chia sẻ thông tin
              </h3>
              <p className="mb-2">
                Chúng tôi không bán thông tin cá nhân của bạn. Chúng tôi có thể chia sẻ 
                thông tin của bạn trong các trường hợp sau:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Với nhà cung cấp dịch vụ bên thứ ba hỗ trợ hoạt động của chúng tôi</li>
                <li>Khi có yêu cầu pháp lý hoặc để bảo vệ quyền lợi của chúng tôi</li>
                <li>Trong trường hợp sáp nhập, mua lại hoặc bán tài sản</li>
                <li>Với sự đồng ý của bạn</li>
              </ul>
            </section>

            <section>
              <h3 className="font-display font-bold text-lg text-foreground mb-3">
                5. Bảo mật thông tin
              </h3>
              <p className="mb-2">
                Chúng tôi thực hiện các biện pháp bảo mật kỹ thuật và tổ chức phù hợp để 
                bảo vệ thông tin cá nhân của bạn khỏi truy cập trái phép, mất mát, 
                tiết lộ hoặc thay đổi, bao gồm:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Mã hóa dữ liệu trong quá trình truyền tải (SSL/TLS)</li>
                <li>Mã hóa mật khẩu</li>
                <li>Kiểm soát truy cập nghiêm ngặt</li>
                <li>Giám sát và kiểm tra bảo mật thường xuyên</li>
              </ul>
            </section>

            <section>
              <h3 className="font-display font-bold text-lg text-foreground mb-3">
                6. Cookies và công nghệ theo dõi
              </h3>
              <p className="mb-2">
                Chúng tôi sử dụng cookies và công nghệ tương tự để:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Ghi nhớ tùy chọn và cài đặt của bạn</li>
                <li>Hiểu cách bạn sử dụng Dịch vụ</li>
                <li>Cải thiện hiệu suất và trải nghiệm người dùng</li>
              </ul>
              <p className="mt-2">
                Bạn có thể kiểm soát cookies thông qua cài đặt trình duyệt của mình.
              </p>
            </section>

            <section>
              <h3 className="font-display font-bold text-lg text-foreground mb-3">
                7. Quyền của bạn
              </h3>
              <p className="mb-2">Bạn có các quyền sau đối với thông tin cá nhân của mình:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Truy cập và nhận bản sao dữ liệu của bạn</li>
                <li>Yêu cầu sửa đổi thông tin không chính xác</li>
                <li>Yêu cầu xóa dữ liệu cá nhân</li>
                <li>Phản đối hoặc hạn chế xử lý dữ liệu</li>
                <li>Rút lại sự đồng ý bất cứ lúc nào</li>
                <li>Khiếu nại với cơ quan có thẩm quyền</li>
              </ul>
            </section>

            <section>
              <h3 className="font-display font-bold text-lg text-foreground mb-3">
                8. Lưu trữ dữ liệu
              </h3>
              <p className="mb-2">
                Chúng tôi lưu trữ thông tin cá nhân của bạn chỉ trong thời gian cần thiết 
                để thực hiện các mục đích được nêu trong chính sách này, trừ khi pháp luật 
                yêu cầu hoặc cho phép thời gian lưu trữ lâu hơn.
              </p>
            </section>

            <section>
              <h3 className="font-display font-bold text-lg text-foreground mb-3">
                9. Dịch vụ bên thứ ba
              </h3>
              <p className="mb-2">
                Dịch vụ của chúng tôi có thể chứa liên kết đến các trang web hoặc dịch vụ 
                của bên thứ ba. Chúng tôi không chịu trách nhiệm về các thực tiễn bảo mật 
                của các bên thứ ba này.
              </p>
            </section>

            <section>
              <h3 className="font-display font-bold text-lg text-foreground mb-3">
                10. Trẻ em
              </h3>
              <p className="mb-2">
                Dịch vụ của chúng tôi không dành cho trẻ em dưới 13 tuổi. 
                Chúng tôi không cố ý thu thập thông tin cá nhân từ trẻ em dưới 13 tuổi.
              </p>
            </section>

            <section>
              <h3 className="font-display font-bold text-lg text-foreground mb-3">
                11. Thay đổi chính sách
              </h3>
              <p className="mb-2">
                Chúng tôi có thể cập nhật Chính sách bảo mật này theo thời gian. 
                Chúng tôi sẽ thông báo cho bạn về bất kỳ thay đổi nào bằng cách 
                đăng chính sách mới trên trang này và cập nhật ngày "Cập nhật lần cuối".
              </p>
            </section>

            <section>
              <h3 className="font-display font-bold text-lg text-foreground mb-3">
                12. Liên hệ
              </h3>
              <p className="mb-2">
                Nếu bạn có câu hỏi về Chính sách bảo mật này hoặc muốn thực hiện quyền của mình, 
                vui lòng liên hệ:
              </p>
              <ul className="list-none space-y-1 ml-4">
                <li>Email: privacy@vnfootballanalytics.com</li>
                <li>Địa chỉ: [Địa chỉ công ty]</li>
              </ul>
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
