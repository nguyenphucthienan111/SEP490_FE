import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Trophy,
  Calendar,
  Users,
  ChevronRight,
  MoreVertical,
  RefreshCw,
} from "lucide-react";
import { AdminLayout } from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { leagueService, League } from "@/services/leagueService";
import { toast } from "sonner";

export default function AdminLeaguesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [seasonFilter, setSeasonFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLeague, setEditingLeague] = useState<League | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    season: "",
    country: "Vietnam",
    startDate: "",
    endDate: "",
  });
  const [leagues, setLeagues] = useState<League[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Load leagues from localStorage on mount
    loadLeaguesFromCache();
  }, []);

  const loadLeaguesFromCache = () => {
    const cached = localStorage.getItem('leagues');
    if (cached) {
      try {
        const data = JSON.parse(cached);
        setLeagues(data);
        console.log('Loaded leagues from localStorage:', data);
      } catch (e) {
        console.error('Failed to parse cached leagues:', e);
      }
    }
  };

  const handleSyncLeagues = async () => {
    setIsSyncing(true);
    try {
      const syncedLeagues = await leagueService.syncLeagues();
      console.log('Synced leagues:', syncedLeagues);
      
      // Save to localStorage
      localStorage.setItem('leagues', JSON.stringify(syncedLeagues));
      setLeagues(syncedLeagues);
      
      toast.success(`Đồng bộ thành công ${syncedLeagues.length} giải đấu!`);
    } catch (error) {
      console.error('Failed to sync leagues:', error);
      toast.error('Đồng bộ giải đấu thất bại');
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredLeagues = leagues.filter((league) => {
    const matchesSearch = league.leagueName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleEdit = (league: League) => {
    setEditingLeague(league);
    setFormData({
      name: league.leagueName,
      season: "",
      country: league.country || "Vietnam",
      startDate: "",
      endDate: "",
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    // Save league logic
    setIsDialogOpen(false);
    setEditingLeague(null);
    setFormData({ name: "", season: "", country: "Vietnam", startDate: "", endDate: "" });
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-extrabold text-3xl text-foreground mb-2">
              Quản lý Giải đấu
            </h1>
            <p className="text-slate-600 dark:text-[#A8A29E]">Tạo và quản lý các giải đấu bóng đá</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleSyncLeagues}
              disabled={isSyncing}
              variant="outline"
              className="border-slate-300 dark:border-white/20 text-slate-900 dark:text-foreground hover:bg-slate-100 dark:hover:bg-white/10"
            >
              <RefreshCw className={`w-5 h-5 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ giải đấu'}
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-[#FF4444] to-[#FF6666] text-white shadow-lg hover:shadow-xl transition-all duration-200">
                  <Plus className="w-5 h-5 mr-2" />
                  Thêm giải đấu
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white/95 dark:bg-card/95 backdrop-blur-xl border-slate-200 dark:border-white/10 text-slate-800 dark:text-foreground max-w-md shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="font-display font-bold text-xl text-slate-800">
                    {editingLeague ? "Chỉnh sửa giải đấu" : "Thêm giải đấu mới"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label className="text-slate-600 font-medium">Tên giải đấu</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="V.League 1"
                      className="bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-400 focus:ring-blue-400/20"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-600 font-medium">Mùa giải</Label>
                      <Input
                        value={formData.season}
                        onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                        placeholder="2025"
                        className="bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-400 focus:ring-blue-400/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-600 font-medium">Quốc gia</Label>
                      <Input
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-400 focus:ring-blue-400/20"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-600 font-medium">Ngày bắt đầu</Label>
                      <Input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-400 focus:ring-blue-400/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-600 font-medium">Ngày kết thúc</Label>
                      <Input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-400 focus:ring-blue-400/20"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      variant="ghost"
                      onClick={() => setIsDialogOpen(false)}
                      className="text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                    >
                      Hủy
                    </Button>
                    <Button
                      onClick={handleSave}
                      className="bg-gradient-to-r from-[#FF4444] to-[#FF6666] text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      {editingLeague ? "Lưu thay đổi" : "Tạo giải đấu"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Tìm kiếm giải đấu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/80 dark:bg-card/80 backdrop-blur-xl border-slate-200 dark:border-white/10 text-slate-800 dark:text-foreground shadow-sm focus:border-blue-400 focus:ring-blue-400/20"
              />
            </div>
            <Select value={seasonFilter} onValueChange={setSeasonFilter}>
              <SelectTrigger className="w-[140px] bg-white/80 dark:bg-card/80 backdrop-blur-xl border-slate-200 dark:border-white/10 text-slate-800 dark:text-foreground shadow-sm focus:border-blue-400 focus:ring-blue-400/20">
                <SelectValue placeholder="Mùa giải" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 dark:bg-card/95 backdrop-blur-xl border-slate-200 dark:border-white/10 shadow-xl">
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Leagues Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-slate-400 dark:text-slate-500" />
            </div>
          ) : filteredLeagues.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredLeagues.map((league) => (
                <div
                  key={league.leagueId}
                  className="bg-white/80 dark:bg-card/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-6 hover:shadow-xl hover:shadow-[#FF4444]/10 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center border border-blue-200/50 overflow-hidden">
                        {league.logoUrl ? (
                          <img src={league.logoUrl} alt={league.leagueName} className="w-10 h-10 object-contain" />
                        ) : (
                          <span className="text-3xl">🏆</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-xl text-slate-800 dark:text-foreground">{league.leagueName}</h3>
                        <p className="text-slate-600 dark:text-[#A8A29E]">{league.leagueType}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-700 hover:bg-slate-100">
                          <MoreVertical className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-white dark:bg-card backdrop-blur-xl border-slate-200 dark:border-white/10 shadow-xl">
                        <DropdownMenuItem onClick={() => handleEdit(league)} className="text-slate-700 dark:text-foreground hover:bg-slate-50 dark:hover:bg-white/10 focus:bg-slate-50 dark:focus:bg-white/10">
                          <Edit className="w-4 h-4 mr-2" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 focus:bg-red-50 dark:focus:bg-red-500/10">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                      <p className="font-mono text-2xl font-bold text-slate-800 dark:text-foreground">{league.teams?.length || 0}</p>
                      <p className="text-slate-500 dark:text-[#A8A29E] text-xs">Đội</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                      <p className="font-mono text-2xl font-bold text-slate-800 dark:text-foreground">{league.seasons?.length || 0}</p>
                      <p className="text-slate-500 dark:text-[#A8A29E] text-xs">Mùa</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                      <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-[#A8A29E] border border-slate-200 dark:border-white/10">
                        {league.country || "Vietnam"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-slate-500 dark:text-[#A8A29E] pt-4 border-t border-slate-100 dark:border-white/10">
                    <span>API ID: {league.apiLeagueId}</span>
                    <Link
                      to={`/admin/leagues/${league.leagueId}`}
                      className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline font-medium"
                    >
                      Chi tiết
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-[#A8A29E]">Chưa có giải đấu nào. Nhấn "Đồng bộ giải đấu" để tải dữ liệu.</p>
            </div>
          )}
        </div>
      </AdminLayout>
  );
}
