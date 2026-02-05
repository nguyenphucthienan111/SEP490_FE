import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Settings,
  Shield,
  Database,
  Bell,
  Palette,
  Globe,
  Key,
  Save,
  ArrowLeft,
  Trophy,
  Users,
  Calendar,
  FileText,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminSettingsPage() {
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "VN Football Analytics",
    siteDescription: "Nền tảng phân tích và đánh giá cầu thủ bóng đá Việt Nam",
    maintenanceMode: false,
    language: "vi",
    timezone: "Asia/Ho_Chi_Minh",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    newUserAlert: true,
    matchUpdateAlert: true,
    systemErrorAlert: true,
    weeklyReport: true,
  });

  const [ratingSettings, setRatingSettings] = useState({
    autoCalculate: true,
    defaultBaseScore: "6.0",
    minRating: "1.0",
    maxRating: "10.0",
    decimalPlaces: "1",
  });

  const handleSaveGeneral = () => {
    // Save general settings
    console.log("Saving general settings:", generalSettings);
  };

  const handleSaveNotifications = () => {
    // Save notification settings
    console.log("Saving notification settings:", notificationSettings);
  };

  const handleSaveRatings = () => {
    // Save rating settings
    console.log("Saving rating settings:", ratingSettings);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-[280px] bg-muted border-r border-slate-200 dark:border-white/[0.08] p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF4444] to-[#FF6666] flex items-center justify-center">
            <span className="font-display font-extrabold text-foreground text-lg">VN</span>
          </div>
          <div>
            <p className="font-display font-bold text-foreground">Admin Panel</p>
            <p className="text-slate-600 dark:text-[#A8A29E] text-xs">Quản trị hệ thống</p>
          </div>
        </div>

        <nav className="space-y-1">
          <Link
            to="/admin"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-[#A8A29E] hover:bg-accent transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Dashboard
          </Link>
          <Link
            to="/admin/leagues"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-[#A8A29E] hover:bg-accent transition-colors"
          >
            <Trophy className="w-5 h-5" />
            Giải đấu
          </Link>
          <Link
            to="/admin/players"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-[#A8A29E] hover:bg-accent transition-colors"
          >
            <Users className="w-5 h-5" />
            Cầu thủ
          </Link>
          <Link
            to="/admin/matches"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-[#A8A29E] hover:bg-accent transition-colors"
          >
            <Calendar className="w-5 h-5" />
            Trận đấu
          </Link>
          <Link
            to="/admin/content"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-[#A8A29E] hover:bg-accent transition-colors"
          >
            <FileText className="w-5 h-5" />
            Nội dung
          </Link>
          <Link
            to="/admin/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-100 dark:bg-[#00D9FF]/10 text-[#00D9FF]"
          >
            <Settings className="w-5 h-5" />
            Cài đặt
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-[280px] p-8">
        <div className="max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display font-extrabold text-3xl text-foreground mb-2">
              Cài đặt hệ thống
            </h1>
            <p className="text-slate-600 dark:text-[#A8A29E]">Quản lý cấu hình và thiết lập hệ thống</p>
          </div>

          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="bg-card border border-slate-200 dark:border-white/[0.08] p-1 rounded-xl">
              <TabsTrigger
                value="general"
                className="data-[state=active]:bg-blue-100 dark:bg-[#00D9FF]/10 data-[state=active]:text-[#00D9FF] rounded-lg px-6"
              >
                <Globe className="w-4 h-4 mr-2" />
                Chung
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="data-[state=active]:bg-blue-100 dark:bg-[#00D9FF]/10 data-[state=active]:text-[#00D9FF] rounded-lg px-6"
              >
                <Bell className="w-4 h-4 mr-2" />
                Thông báo
              </TabsTrigger>
              <TabsTrigger
                value="ratings"
                className="data-[state=active]:bg-blue-100 dark:bg-[#00D9FF]/10 data-[state=active]:text-[#00D9FF] rounded-lg px-6"
              >
                <Palette className="w-4 h-4 mr-2" />
                Rating Engine
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="data-[state=active]:bg-blue-100 dark:bg-[#00D9FF]/10 data-[state=active]:text-[#00D9FF] rounded-lg px-6"
              >
                <Shield className="w-4 h-4 mr-2" />
                Bảo mật
              </TabsTrigger>
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general">
              <div className="bg-card border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6">
                <h3 className="font-display font-bold text-xl text-foreground mb-6">
                  Cài đặt chung
                </h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-slate-600 dark:text-[#A8A29E]">Tên trang web</Label>
                      <Input
                        value={generalSettings.siteName}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                        className="bg-card border-slate-200 dark:border-white/[0.08] text-foreground h-12 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-600 dark:text-[#A8A29E]">Ngôn ngữ</Label>
                      <Select
                        value={generalSettings.language}
                        onValueChange={(value) => setGeneralSettings({ ...generalSettings, language: value })}
                      >
                        <SelectTrigger className="bg-card border-slate-200 dark:border-white/[0.08] text-foreground h-12 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-slate-200 dark:border-white/[0.08]">
                          <SelectItem value="vi">Tiếng Việt</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-600 dark:text-[#A8A29E]">Mô tả trang web</Label>
                    <Input
                      value={generalSettings.siteDescription}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, siteDescription: e.target.value })}
                      className="bg-card border-slate-200 dark:border-white/[0.08] text-foreground h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-600 dark:text-[#A8A29E]">Múi giờ</Label>
                    <Select
                      value={generalSettings.timezone}
                      onValueChange={(value) => setGeneralSettings({ ...generalSettings, timezone: value })}
                    >
                        <SelectTrigger className="bg-card border-slate-200 dark:border-white/[0.08] text-foreground h-12 rounded-xl w-full md:w-1/2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-slate-200 dark:border-white/[0.08]">
                        <SelectItem value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (GMT+7)</SelectItem>
                        <SelectItem value="Asia/Bangkok">Asia/Bangkok (GMT+7)</SelectItem>
                        <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
                    <div>
                      <p className="text-foreground font-medium">Chế độ bảo trì</p>
                      <p className="text-slate-600 dark:text-[#A8A29E] text-sm">Khi bật, chỉ admin có thể truy cập trang</p>
                    </div>
                    <Switch
                      checked={generalSettings.maintenanceMode}
                      onCheckedChange={(checked) => setGeneralSettings({ ...generalSettings, maintenanceMode: checked })}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSaveGeneral}
                      className="bg-gradient-to-r from-[#FF4444] to-[#FF6666] text-slate-900 dark:text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Lưu thay đổi
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Notification Settings */}
            <TabsContent value="notifications">
              <div className="bg-card border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6">
                <h3 className="font-display font-bold text-xl text-foreground mb-6">
                  Cài đặt thông báo
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted border border-slate-200 dark:border-white/[0.05]">
                    <div>
                      <p className="text-foreground font-medium">Thông báo qua Email</p>
                      <p className="text-slate-600 dark:text-[#A8A29E] text-sm">Nhận thông báo qua email</p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, emailNotifications: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted border border-slate-200 dark:border-white/[0.05]">
                    <div>
                      <p className="text-foreground font-medium">Người dùng mới</p>
                      <p className="text-slate-600 dark:text-[#A8A29E] text-sm">Thông báo khi có người dùng đăng ký</p>
                    </div>
                    <Switch
                      checked={notificationSettings.newUserAlert}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, newUserAlert: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted border border-slate-200 dark:border-white/[0.05]">
                    <div>
                      <p className="text-foreground font-medium">Cập nhật trận đấu</p>
                      <p className="text-slate-600 dark:text-[#A8A29E] text-sm">Thông báo khi có trận đấu mới hoặc kết quả</p>
                    </div>
                    <Switch
                      checked={notificationSettings.matchUpdateAlert}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, matchUpdateAlert: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted border border-slate-200 dark:border-white/[0.05]">
                    <div>
                      <p className="text-foreground font-medium">Lỗi hệ thống</p>
                      <p className="text-slate-600 dark:text-[#A8A29E] text-sm">Thông báo khi có lỗi hệ thống nghiêm trọng</p>
                    </div>
                    <Switch
                      checked={notificationSettings.systemErrorAlert}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, systemErrorAlert: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted border border-slate-200 dark:border-white/[0.05]">
                    <div>
                      <p className="text-foreground font-medium">Báo cáo hàng tuần</p>
                      <p className="text-slate-600 dark:text-[#A8A29E] text-sm">Nhận email tổng hợp mỗi tuần</p>
                    </div>
                    <Switch
                      checked={notificationSettings.weeklyReport}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, weeklyReport: checked })}
                    />
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={handleSaveNotifications}
                      className="bg-gradient-to-r from-[#FF4444] to-[#FF6666] text-slate-900 dark:text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Lưu thay đổi
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Rating Engine Settings */}
            <TabsContent value="ratings">
              <div className="bg-card border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6">
                <h3 className="font-display font-bold text-xl text-foreground mb-6">
                  Cấu hình Rating Engine
                </h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted border border-slate-200 dark:border-white/[0.05]">
                    <div>
                      <p className="text-foreground font-medium">Tự động tính điểm</p>
                      <p className="text-slate-600 dark:text-[#A8A29E] text-sm">Tự động tính rating sau khi nhập thống kê trận đấu</p>
                    </div>
                    <Switch
                      checked={ratingSettings.autoCalculate}
                      onCheckedChange={(checked) => setRatingSettings({ ...ratingSettings, autoCalculate: checked })}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-slate-600 dark:text-[#A8A29E]">Điểm cơ bản</Label>
                      <Input
                        value={ratingSettings.defaultBaseScore}
                        onChange={(e) => setRatingSettings({ ...ratingSettings, defaultBaseScore: e.target.value })}
                        className="bg-card border-slate-200 dark:border-white/[0.08] text-foreground h-12 rounded-xl"
                      />
                      <p className="text-slate-600 dark:text-[#A8A29E] text-xs">Điểm khởi đầu cho mỗi cầu thủ trong trận</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-600 dark:text-[#A8A29E]">Số chữ số thập phân</Label>
                      <Select
                        value={ratingSettings.decimalPlaces}
                        onValueChange={(value) => setRatingSettings({ ...ratingSettings, decimalPlaces: value })}
                      >
                        <SelectTrigger className="bg-card border-slate-200 dark:border-white/[0.08] text-foreground h-12 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-slate-200 dark:border-white/[0.08]">
                          <SelectItem value="0">0 (6, 7, 8)</SelectItem>
                          <SelectItem value="1">1 (6.5, 7.2)</SelectItem>
                          <SelectItem value="2">2 (6.54, 7.21)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-600 dark:text-[#A8A29E]">Điểm tối thiểu</Label>
                      <Input
                        value={ratingSettings.minRating}
                        onChange={(e) => setRatingSettings({ ...ratingSettings, minRating: e.target.value })}
                        className="bg-card border-slate-200 dark:border-white/[0.08] text-foreground h-12 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-600 dark:text-[#A8A29E]">Điểm tối đa</Label>
                      <Input
                        value={ratingSettings.maxRating}
                        onChange={(e) => setRatingSettings({ ...ratingSettings, maxRating: e.target.value })}
                        className="bg-card border-slate-200 dark:border-white/[0.08] text-foreground h-12 rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/[0.05]">
                    <Button
                      variant="outline"
                      className="border-slate-300 dark:border-white/20 text-foreground hover:bg-slate-200 dark:bg-white/10"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Tính lại tất cả rating
                    </Button>
                    <Button
                      onClick={handleSaveRatings}
                      className="bg-gradient-to-r from-[#FF4444] to-[#FF6666] text-slate-900 dark:text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Lưu thay đổi
                    </Button>
                  </div>
                </div>
              </div>

              {/* Position Weights */}
              <div className="bg-card border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6 mt-6">
                <h3 className="font-display font-bold text-xl text-foreground mb-2">
                  Trọng số theo vị trí
                </h3>
                <p className="text-slate-600 dark:text-[#A8A29E] mb-6">
                  Điều chỉnh trọng số của các chỉ số theo vị trí cầu thủ
                </p>
                <Link
                  to="/admin/ratings"
                  className="inline-flex items-center gap-2 text-[#00D9FF] hover:underline"
                >
                  Quản lý trọng số rating →
                </Link>
              </div>
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value="security">
              <div className="bg-card border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6">
                <h3 className="font-display font-bold text-xl text-foreground mb-6">
                  Cài đặt bảo mật
                </h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-slate-600 dark:text-[#A8A29E]">Thay đổi mật khẩu Admin</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        type="password"
                        placeholder="Mật khẩu hiện tại"
                        className="bg-card border-slate-200 dark:border-white/[0.08] text-foreground h-12 rounded-xl"
                      />
                      <Input
                        type="password"
                        placeholder="Mật khẩu mới"
                        className="bg-card border-slate-200 dark:border-white/[0.08] text-foreground h-12 rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Label className="text-slate-600 dark:text-[#A8A29E]">API Keys</Label>
                    <div className="p-4 rounded-xl bg-muted border border-slate-200 dark:border-white/[0.05]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Key className="w-5 h-5 text-slate-600 dark:text-[#A8A29E]" />
                          <div>
                            <p className="text-foreground font-medium">Production API Key</p>
                            <p className="text-slate-600 dark:text-[#A8A29E] text-sm font-mono">vn_live_••••••••••••</p>
                          </div>
                        </div>
                          <Button variant="outline" className="border-slate-300 dark:border-white/20 text-foreground hover:bg-slate-200 dark:bg-white/10">
                          Tạo lại
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Label className="text-slate-600 dark:text-[#A8A29E]">Dữ liệu & Backup</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-muted border border-slate-200 dark:border-white/[0.05]">
                        <div className="flex items-center gap-3 mb-3">
                          <Database className="w-5 h-5 text-[#00D9FF]" />
                          <p className="text-foreground font-medium">Export dữ liệu</p>
                        </div>
                        <Button variant="outline" className="w-full border-slate-300 dark:border-white/20 text-foreground hover:bg-slate-200 dark:bg-white/10">
                          Tải xuống backup
                        </Button>
                      </div>
                      <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                        <div className="flex items-center gap-3 mb-3">
                          <AlertTriangle className="w-5 h-5 text-red-400" />
                          <p className="text-foreground font-medium">Xóa dữ liệu</p>
                        </div>
                        <Button variant="outline" className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10">
                          Xóa tất cả dữ liệu
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
