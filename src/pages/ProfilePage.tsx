import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  User, Mail, Calendar, Shield, Bell, Star, Clock, ChevronRight,
  Edit2, Camera, LogOut, ArrowLeft, Flame, Package, Check,
  CreditCard, CheckCircle2, XCircle, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/services/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { userService, UserResponse } from "@/services/userService";
import { authService } from "@/services/authService";
import { cosmeticService, CosmeticItemDto, LoadoutDto } from "@/services/cosmeticService";
import { CosmeticPreview } from "@/components/cosmetics/CosmeticPreview";
import { UserAvatar, UserDisplayName } from "@/components/cosmetics/UserAvatar";
import { invalidateLoadoutCache } from "@/hooks/useMyLoadout";
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
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    fullName: "",
  });
  const [inventory, setInventory] = useState<CosmeticItemDto[]>([]);
  const [loadout, setLoadout] = useState<LoadoutDto>({});
  const [fullLoadout, setFullLoadout] = useState<any>(null);
  const [equipping, setEquipping] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'payments' && payments.length === 0 && !paymentsLoading) {
      setPaymentsLoading(true);
      apiClient.get<any>('/api/subscriptions/my-payments')
        .then(res => setPayments(res?.data ?? res ?? []))
        .catch(() => {})
        .finally(() => setPaymentsLoading(false));
    }
  }, [activeTab]);
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
        // Load loadout
        cosmeticService.getLoadout(userData.userId).then(setLoadout).catch(() => {});
        cosmeticService.getFullLoadout(userData.userId).then(setFullLoadout).catch(() => {});
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
      cosmeticService.getInventory().then(setInventory).catch(() => {});
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleSave = async () => {
    if (!formData.fullName.trim()) { toast.error('Họ tên không được để trống'); return; }
    setIsSaving(true);
    try {
      const updated = await userService.updateProfile({ fullName: formData.fullName });
      setUser(prev => prev ? { ...prev, fullName: updated.fullName } : prev);
      toast.success('Cập nhật thông tin thành công!');
      setIsEditing(false);
    } catch (e: any) {
      toast.error(e.message || 'Cập nhật thất bại');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEquip = async (slot: keyof LoadoutDto, itemId: number | null) => {
    const newLoadout = { ...loadout, [slot]: itemId };
    setLoadout(newLoadout);
    setEquipping(true);
    try {
      await cosmeticService.equip(newLoadout);
      invalidateLoadoutCache();
      if (user) {
        const fl = await cosmeticService.getFullLoadout(user.userId);
        setFullLoadout(fl);
      }
      toast.success("Đã cập nhật trang phục!");
    } catch (e: any) { toast.error(e.message || "Lỗi"); }
    finally { setEquipping(false); }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    try {
      const result = await userService.uploadAvatar(file);
      setUser(prev => prev ? { ...prev, avatarUrl: result.avatarUrl } : prev);
      toast.success('Cập nhật ảnh đại diện thành công!');
    } catch (err: any) {
      toast.error(err.message || 'Upload thất bại');
    } finally {
      setIsUploadingAvatar(false);
    }
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
              <UserAvatar avatarUrl={user.avatarUrl} username={user.username} size={128} loadout={fullLoadout} className="rounded-2xl" />
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl cursor-pointer">
                {isUploadingAvatar
                  ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <Camera className="w-6 h-6 text-white" />
                }
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={isUploadingAvatar} />
              </label>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="font-display font-extrabold text-3xl text-foreground mb-2">
                <UserDisplayName username={user.fullName} loadout={fullLoadout} />
              </h1>
              <p className="text-slate-600 dark:text-[#A8A29E] font-body mb-4">@<UserDisplayName username={user.username} loadout={fullLoadout} /></p>
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
            <TabsTrigger value="profile" className="data-[state=active]:bg-blue-100 dark:bg-[#00D9FF]/10 data-[state=active]:text-[#00D9FF] rounded-lg px-6">
              <User className="w-4 h-4 mr-2" />Thông tin
            </TabsTrigger>
            <TabsTrigger value="favorites" className="data-[state=active]:bg-blue-100 dark:bg-[#00D9FF]/10 data-[state=active]:text-[#00D9FF] rounded-lg px-6">
              <Star className="w-4 h-4 mr-2" />Yêu thích
            </TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-blue-100 dark:bg-[#00D9FF]/10 data-[state=active]:text-[#00D9FF] rounded-lg px-6"
              onClick={() => {
                if (payments.length === 0 && !paymentsLoading) {
                  setPaymentsLoading(true);
                  apiClient.get<any>('/api/subscriptions/my-payments')
                    .then(res => setPayments(res?.data ?? []))
                    .catch(() => {})
                    .finally(() => setPaymentsLoading(false));
                }
              }}>
              <CreditCard className="w-4 h-4 mr-2" />Thanh toán
            </TabsTrigger>
            <TabsTrigger value="wardrobe" className="data-[state=active]:bg-blue-100 dark:bg-[#00D9FF]/10 data-[state=active]:text-[#00D9FF] rounded-lg px-6">
              <Package className="w-4 h-4 mr-2" />Tủ đồ
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="bg-card border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6">
              <h3 className="font-display font-bold text-xl text-foreground mb-6">Thông tin cá nhân</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-600 dark:text-[#A8A29E]">Username</Label>
                  <p className="text-foreground font-body h-12 flex items-center px-4 bg-muted rounded-xl">{user.username}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-600 dark:text-[#A8A29E]">Email</Label>
                  {isEditing ? (
                    <Input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-card/5 border-slate-200 dark:border-white/[0.08] text-foreground h-12 rounded-xl" />
                  ) : (
                    <p className="text-foreground font-body h-12 flex items-center px-4 bg-muted rounded-xl">{formData.email}</p>
                  )}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-slate-600 dark:text-[#A8A29E]">Họ và tên</Label>
                  {isEditing ? (
                    <Input value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="bg-card/5 border-slate-200 dark:border-white/[0.08] text-foreground h-12 rounded-xl" />
                  ) : (
                    <p className="text-foreground font-body h-12 flex items-center px-4 bg-muted rounded-xl">{formData.fullName}</p>
                  )}
                </div>
              </div>
              {isEditing && (
                <div className="mt-6 flex justify-end gap-3">
                  <Button variant="ghost" onClick={() => setIsEditing(false)} className="text-slate-600 dark:text-[#A8A29E] hover:text-foreground">Hủy</Button>
                  <Button onClick={handleSave} disabled={isSaving} className="bg-gradient-to-r from-[#FF4444] to-[#FF6666] text-slate-900 dark:text-white">
                    {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </Button>
                </div>
              )}
            </div>

            {/* Bảo mật */}
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-5 h-5 text-red-400" />
                <h3 className="font-display font-bold text-lg text-red-400">Bảo mật</h3>
              </div>
              <p className="text-slate-500 dark:text-[#A8A29E] text-sm mb-5">Quản lý mật khẩu và bảo mật tài khoản.</p>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                  Đổi mật khẩu
                </Button>
                <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                  Xóa tài khoản
                </Button>
              </div>
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

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-4">
            <div className="bg-card border border-slate-200 dark:border-white/[0.08] rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-white/[0.08] flex items-center justify-between">
                <h3 className="font-display font-bold text-lg text-foreground">Lịch sử thanh toán</h3>
                <Link to="/pricing" className="text-xs text-[#00D9FF] hover:underline font-medium">Nâng cấp gói →</Link>
              </div>
              {paymentsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-2 border-[#00D9FF] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : payments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <CreditCard className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-sm">Chưa có giao dịch nào</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-white/[0.05]">
                  {payments.map((p: any) => {
                    const statusMap: Record<string, { label: string; icon: any; cls: string }> = {
                      Paid:      { label: 'Thành công', icon: CheckCircle2, cls: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' },
                      Pending:   { label: 'Chờ thanh toán', icon: AlertTriangle, cls: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10' },
                      Cancelled: { label: 'Đã huỷ', icon: XCircle, cls: 'text-slate-400 bg-slate-100 dark:bg-white/5' },
                      Expired:   { label: 'Hết hạn', icon: XCircle, cls: 'text-red-400 bg-red-50 dark:bg-red-500/10' },
                    };
                    const s = statusMap[p.status] ?? statusMap.Cancelled;
                    const Icon = s.icon;
                    const fmtPrice = (n: number) => n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
                    const fmtDate = (d: string) => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                    return (
                      <div key={p.paymentId} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                        {/* Icon trạng thái */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.cls}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-foreground">{p.planName}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${s.cls}`}>{s.label}</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 font-mono-data">{p.paymentCode}</p>
                          <p className="text-xs text-slate-400">{fmtDate(p.createdAt)}</p>
                        </div>
                        {/* Số tiền */}
                        <div className="text-right flex-shrink-0">
                          <p className="font-mono-data font-bold text-sm text-foreground">{fmtPrice(p.amount)}</p>
                          <p className="text-[10px] text-slate-400">{p.provider}</p>
                        </div>
                        {/* Link xem nếu Pending */}
                        {p.status === 'Pending' && (
                          <Link to={`/payment/${p.paymentCode}`}
                            className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold hover:bg-amber-100 transition-colors">
                            Thanh toán
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Wardrobe Tab */}
          <TabsContent value="wardrobe" className="space-y-6">
            {inventory.length === 0
              ? <div className="text-center py-16 text-slate-500">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Tủ đồ trống. <a href="/shop" className="text-[#00D9FF] hover:underline">Ghé shop</a> để đổi vật phẩm trang trí!</p>
                </div>
              : Object.entries({
                  frameItemId: { label: "Khung avatar", cat: "frame" },
                  nameColorItemId: { label: "Màu tên", cat: "nameColor" },
                  bannerItemId: { label: "Banner hồ sơ", cat: "banner" },
                  badgeItemId: { label: "Huy hiệu", cat: "badge" },
                  effectItemId: { label: "Hiệu ứng", cat: "effect" },
                  cardItemId: { label: "Card hồ sơ", cat: "card" },
                } as Record<keyof LoadoutDto, { label: string; cat: string }>).map(([slot, { label, cat }]) => {
                  const slotItems = inventory.filter(i => i.category === cat);
                  if (slotItems.length === 0) return null;
                  const equipped = loadout[slot as keyof LoadoutDto];
                  return (
                    <div key={slot} className="bg-card border border-slate-200 dark:border-white/[0.08] rounded-2xl p-5">
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-3">{label}</h3>
                      <div className="flex gap-3 flex-wrap">
                        {/* None option */}
                        <button onClick={() => handleEquip(slot as keyof LoadoutDto, null)}
                          className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center text-xs text-slate-400 transition-all ${!equipped ? "border-[#FF4444] bg-red-50 dark:bg-red-500/10" : "border-slate-200 dark:border-slate-700 hover:border-slate-400"}`}>
                          Bỏ
                        </button>
                        {slotItems.map(item => (
                          <button key={item.itemId} onClick={() => handleEquip(slot as keyof LoadoutDto, item.itemId)}
                            className={`relative w-16 h-16 rounded-xl border-2 flex items-center justify-center transition-all ${equipped === item.itemId ? "border-[#FF4444] bg-red-50 dark:bg-red-500/10" : "border-slate-200 dark:border-slate-700 hover:border-slate-400"}`}
                            title={item.name}>
                            <CosmeticPreview item={item} size="sm" />
                            {equipped === item.itemId && (
                              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#FF4444] flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })
            }
            {equipping && <p className="text-xs text-center text-slate-400">Đang lưu...</p>}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
