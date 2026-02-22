import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Calendar,
  Shield,
  Bell,
  Star,
  Clock,
  ChevronRight,
  Edit2,
  Camera,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { userService, UserResponse } from "@/services/userService";
import { authService } from "@/services/authService";
import { toast } from "sonner";

// Mock user data
const mockUser = {
  id: "1",
  name: "Nguyễn Văn A",
  email: "nguyenvana@email.com",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80",
  role: "Viewer",
  joinDate: "2025-01-15",
  favoriteTeam: "Hà Nội FC",
  favoritePlayers: [
    { id: "1", name: "Nguyễn Quang Hải", team: "Công an Hà Nội", position: "Midfielder" },
    { id: "2", name: "Nguyễn Tiến Linh", team: "Bình Dương", position: "Forward" },
    { id: "3", name: "Đỗ Hùng Dũng", team: "Hà Nội FC", position: "Midfielder" },
  ],
  recentViews: [
    { type: "player", id: "1", name: "Nguyễn Quang Hải", date: "2025-01-20" },
    { type: "match", id: "1", name: "Hà Nội FC vs HAGL", date: "2025-01-19" },
    { type: "player", id: "2", name: "Nguyễn Tiến Linh", date: "2025-01-18" },
  ],
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    fullName: "",
  });
  const [notifications, setNotifications] = useState({
    matchResults: true,
    playerUpdates: true,
    newsletter: false,
    pushNotifications: true,
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await userService.getMe();
        setUser(userData);
        setFormData({
          username: userData.username,
          email: userData.email,
          fullName: userData.fullName,
        });
      } catch (error) {
        console.error('Failed to fetch user:', error);
        toast.error('Không thể tải thông tin người dùng');
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    if (authService.isAuthenticated()) {
      fetchUser();
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleSave = () => {
    // TODO: Call API to update user profile
    toast.success('Cập nhật thông tin thành công!');
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      const refreshToken = authService.getRefreshToken();
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
      toast.success('Đăng xuất thành công!');
      navigate('/');
    } catch (error) {
      toast.error('Đăng xuất thất bại');
    }
  };

  const handleEditClick = () => {
    if (!isEditing) {
      setActiveTab("profile");
    }
    setIsEditing(!isEditing);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-white/[0.08] bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="flex items-center gap-2 text-slate-600 dark:text-[#A8A29E] hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-body">Về trang chủ</span>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="text-slate-600 dark:text-[#A8A29E] hover:text-foreground hover:bg-slate-100 dark:bg-white/5"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Profile Header */}
          <div className="bg-card/5 border border-slate-200 dark:border-white/[0.08] rounded-2xl p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-[#00D9FF]/30 bg-gradient-to-br from-[#00D9FF]/20 to-[#00D9FF]/5 flex items-center justify-center">
                <User className="w-16 h-16 text-[#00D9FF]" />
              </div>
              <button className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                <Camera className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="font-display font-extrabold text-3xl text-foreground mb-2">
                {user.fullName}
              </h1>
              <p className="text-slate-600 dark:text-[#A8A29E] font-body mb-4">@{user.username}</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-[#00D9FF]/10 text-[#00D9FF]">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm font-body">{user.email}</span>
                </div>
                {user.isEmailVerified && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm font-body">Đã xác thực</span>
                  </div>
                )}
              </div>
            </div>

            {/* Edit Button */}
            <Button
              onClick={handleEditClick}
              className="bg-card border border-slate-200 dark:border-white/[0.08] text-foreground hover:bg-white/[0.08]"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              {isEditing ? "Hủy" : "Chỉnh sửa"}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-card border border-slate-200 dark:border-white/[0.08] p-1 rounded-xl">
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-blue-100 dark:bg-[#00D9FF]/10 data-[state=active]:text-[#00D9FF] rounded-lg px-6"
            >
              <User className="w-4 h-4 mr-2" />
              Thông tin
            </TabsTrigger>
            <TabsTrigger
              value="favorites"
              className="data-[state=active]:bg-blue-100 dark:bg-[#00D9FF]/10 data-[state=active]:text-[#00D9FF] rounded-lg px-6"
            >
              <Star className="w-4 h-4 mr-2" />
              Yêu thích
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="data-[state=active]:bg-blue-100 dark:bg-[#00D9FF]/10 data-[state=active]:text-[#00D9FF] rounded-lg px-6"
            >
              <Clock className="w-4 h-4 mr-2" />
              Hoạt động
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-blue-100 dark:bg-[#00D9FF]/10 data-[state=active]:text-[#00D9FF] rounded-lg px-6"
            >
              <Bell className="w-4 h-4 mr-2" />
              Cài đặt
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="bg-card border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6">
              <h3 className="font-display font-bold text-xl text-foreground mb-6">
                Thông tin cá nhân
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-600 dark:text-[#A8A29E]">Tên đăng nhập</Label>
                  <p className="text-foreground font-body h-12 flex items-center px-4 bg-muted rounded-xl">
                    {user.username}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-600 dark:text-[#A8A29E]">Email</Label>
                  {isEditing ? (
                    <Input
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-card/5 border-slate-200 dark:border-white/[0.08] text-foreground h-12 rounded-xl"
                    />
                  ) : (
                    <p className="text-foreground font-body h-12 flex items-center px-4 bg-muted rounded-xl">
                      {formData.email}
                    </p>
                  )}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-slate-600 dark:text-[#A8A29E]">Họ và tên</Label>
                  {isEditing ? (
                    <Input
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="bg-card/5 border-slate-200 dark:border-white/[0.08] text-foreground h-12 rounded-xl"
                    />
                  ) : (
                    <p className="text-foreground font-body h-12 flex items-center px-4 bg-muted rounded-xl">
                      {formData.fullName}
                    </p>
                  )}
                </div>
              </div>
              {isEditing && (
                <div className="mt-6 flex justify-end gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => setIsEditing(false)}
                    className="text-slate-600 dark:text-[#A8A29E] hover:text-foreground"
                  >
                    Hủy
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="bg-gradient-to-r from-[#FF4444] to-[#FF6666] text-slate-900 dark:text-white"
                  >
                    Lưu thay đổi
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="space-y-6">
            <div className="bg-card border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6">
              <h3 className="font-display font-bold text-xl text-foreground mb-6">
                Cầu thủ yêu thích
              </h3>
              <div className="space-y-3">
                {mockUser.favoritePlayers.map((player) => (
                  <Link
                    key={player.id}
                    to={`/players/${player.id}`}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted hover:bg-accent border border-slate-200 dark:border-white/[0.05] transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00D9FF]/20 to-[#00D9FF]/5 flex items-center justify-center">
                        <User className="w-6 h-6 text-[#00D9FF]" />
                      </div>
                      <div>
                        <p className="text-foreground font-semibold">{player.name}</p>
                        <p className="text-slate-600 dark:text-[#A8A29E] text-sm">{player.team} • {player.position}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-600 dark:text-[#A8A29E] group-hover:text-[#00D9FF] transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <div className="bg-card border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6">
              <h3 className="font-display font-bold text-xl text-foreground mb-6">
                Hoạt động gần đây
              </h3>
              <div className="space-y-3">
                {mockUser.recentViews.map((view, index) => (
                  <Link
                    key={index}
                    to={view.type === "player" ? `/players/${view.id}` : `/matches/${view.id}`}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted hover:bg-accent border border-slate-200 dark:border-white/[0.05] transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        view.type === "player" ? "bg-blue-100 dark:bg-[#00D9FF]/10" : "bg-red-100 dark:bg-[#FF4444]/10"
                      }`}>
                        {view.type === "player" ? (
                          <User className="w-5 h-5 text-[#00D9FF]" />
                        ) : (
                          <Calendar className="w-5 h-5 text-[#FF4444]" />
                        )}
                      </div>
                      <div>
                        <p className="text-foreground font-medium">{view.name}</p>
                        <p className="text-slate-600 dark:text-[#A8A29E] text-sm">
                          {view.type === "player" ? "Cầu thủ" : "Trận đấu"} • {view.date}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-600 dark:text-[#A8A29E] group-hover:text-foreground transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="bg-card border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6">
              <h3 className="font-display font-bold text-xl text-foreground mb-6">
                Cài đặt thông báo
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted border border-slate-200 dark:border-white/[0.05]">
                  <div>
                    <p className="text-foreground font-medium">Kết quả trận đấu</p>
                    <p className="text-slate-600 dark:text-[#A8A29E] text-sm">Nhận thông báo khi trận đấu kết thúc</p>
                  </div>
                  <Switch
                    checked={notifications.matchResults}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, matchResults: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted border border-slate-200 dark:border-white/[0.05]">
                  <div>
                    <p className="text-foreground font-medium">Cập nhật cầu thủ</p>
                    <p className="text-slate-600 dark:text-[#A8A29E] text-sm">Thông báo về cầu thủ yêu thích</p>
                  </div>
                  <Switch
                    checked={notifications.playerUpdates}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, playerUpdates: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted border border-slate-200 dark:border-white/[0.05]">
                  <div>
                    <p className="text-foreground font-medium">Bản tin hàng tuần</p>
                    <p className="text-slate-600 dark:text-[#A8A29E] text-sm">Nhận email tổng hợp mỗi tuần</p>
                  </div>
                  <Switch
                    checked={notifications.newsletter}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, newsletter: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted border border-slate-200 dark:border-white/[0.05]">
                  <div>
                    <p className="text-foreground font-medium">Push Notifications</p>
                    <p className="text-slate-600 dark:text-[#A8A29E] text-sm">Thông báo đẩy trên trình duyệt</p>
                  </div>
                  <Switch
                    checked={notifications.pushNotifications}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, pushNotifications: checked })}
                  />
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
              <h3 className="font-display font-bold text-xl text-red-400 mb-4">
                Bảo mật
              </h3>
              <p className="text-slate-600 dark:text-[#A8A29E] text-sm mb-4">
                Các hành động dưới đây không thể hoàn tác. Hãy cẩn thận.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  Đổi mật khẩu
                </Button>
                <Button
                  variant="outline"
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  Xóa tài khoản
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
