import { useState } from "react";
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
  ArrowLeft,
} from "lucide-react";
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

// Mock leagues data
const mockLeagues = [
  {
    id: "1",
    name: "V.League 1",
    season: "2024",
    country: "Vietnam",
    teams: 14,
    matches: 182,
    status: "active",
    startDate: "2024-02-15",
    endDate: "2024-10-30",
    logo: "🏆",
  },
  {
    id: "2",
    name: "V.League 2",
    season: "2024",
    country: "Vietnam",
    teams: 12,
    matches: 132,
    status: "active",
    startDate: "2024-03-01",
    endDate: "2024-10-15",
    logo: "🥈",
  },
  {
    id: "3",
    name: "Cúp Quốc gia",
    season: "2024",
    country: "Vietnam",
    teams: 24,
    matches: 47,
    status: "active",
    startDate: "2024-04-10",
    endDate: "2024-09-20",
    logo: "🏅",
  },
  {
    id: "4",
    name: "V.League 1",
    season: "2023",
    country: "Vietnam",
    teams: 14,
    matches: 182,
    status: "completed",
    startDate: "2023-02-15",
    endDate: "2023-10-30",
    logo: "🏆",
  },
];

export default function AdminLeaguesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [seasonFilter, setSeasonFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLeague, setEditingLeague] = useState<typeof mockLeagues[0] | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    season: "",
    country: "Vietnam",
    startDate: "",
    endDate: "",
  });

  const filteredLeagues = mockLeagues.filter((league) => {
    const matchesSearch = league.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeason = seasonFilter === "all" || league.season === seasonFilter;
    return matchesSearch && matchesSeason;
  });

  const handleEdit = (league: typeof mockLeagues[0]) => {
    setEditingLeague(league);
    setFormData({
      name: league.name,
      season: league.season,
      country: league.country,
      startDate: league.startDate,
      endDate: league.endDate,
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
    <div className="min-h-screen bg-[#0A1628]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-[280px] bg-white/[0.02] border-r border-white/[0.08] p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF4444] to-[#FF6666] flex items-center justify-center">
            <span className="font-display font-extrabold text-white text-lg">VN</span>
          </div>
          <div>
            <p className="font-display font-bold text-white">Admin Panel</p>
            <p className="text-[#A8A29E] text-xs">Quản trị hệ thống</p>
          </div>
        </div>

        <nav className="space-y-1">
          <Link
            to="/admin"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#A8A29E] hover:bg-white/[0.05] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Dashboard
          </Link>
          <Link
            to="/admin/leagues"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#00D9FF]/10 text-[#00D9FF]"
          >
            <Trophy className="w-5 h-5" />
            Giải đấu
          </Link>
          <Link
            to="/admin/players"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#A8A29E] hover:bg-white/[0.05] transition-colors"
          >
            <Users className="w-5 h-5" />
            Cầu thủ
          </Link>
          <Link
            to="/admin/matches"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#A8A29E] hover:bg-white/[0.05] transition-colors"
          >
            <Calendar className="w-5 h-5" />
            Trận đấu
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-[280px] p-8">
        <div className="max-w-6xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display font-extrabold text-3xl text-white mb-2">
                Quản lý Giải đấu
              </h1>
              <p className="text-[#A8A29E]">Tạo và quản lý các giải đấu bóng đá</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-[#FF4444] to-[#FF6666] text-white">
                  <Plus className="w-5 h-5 mr-2" />
                  Thêm giải đấu
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#0A1628] border-white/[0.08] text-white max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-display font-bold text-xl">
                    {editingLeague ? "Chỉnh sửa giải đấu" : "Thêm giải đấu mới"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label className="text-[#A8A29E]">Tên giải đấu</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="V.League 1"
                      className="bg-white/[0.03] border-white/[0.08] text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[#A8A29E]">Mùa giải</Label>
                      <Input
                        value={formData.season}
                        onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                        placeholder="2024"
                        className="bg-white/[0.03] border-white/[0.08] text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#A8A29E]">Quốc gia</Label>
                      <Input
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="bg-white/[0.03] border-white/[0.08] text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[#A8A29E]">Ngày bắt đầu</Label>
                      <Input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="bg-white/[0.03] border-white/[0.08] text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#A8A29E]">Ngày kết thúc</Label>
                      <Input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="bg-white/[0.03] border-white/[0.08] text-white"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      variant="ghost"
                      onClick={() => setIsDialogOpen(false)}
                      className="text-[#A8A29E] hover:text-white"
                    >
                      Hủy
                    </Button>
                    <Button
                      onClick={handleSave}
                      className="bg-gradient-to-r from-[#FF4444] to-[#FF6666] text-white"
                    >
                      {editingLeague ? "Lưu thay đổi" : "Tạo giải đấu"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A8A29E]" />
              <Input
                placeholder="Tìm kiếm giải đấu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/[0.03] border-white/[0.08] text-white"
              />
            </div>
            <Select value={seasonFilter} onValueChange={setSeasonFilter}>
              <SelectTrigger className="w-[140px] bg-white/[0.03] border-white/[0.08] text-white">
                <SelectValue placeholder="Mùa giải" />
              </SelectTrigger>
              <SelectContent className="bg-[#0A1628] border-white/[0.08]">
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Leagues Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredLeagues.map((league) => (
              <div
                key={league.id}
                className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.05] transition-colors group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#00D9FF]/20 to-[#00D9FF]/5 flex items-center justify-center text-3xl">
                      {league.logo}
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-xl text-white">{league.name}</h3>
                      <p className="text-[#A8A29E]">Mùa giải {league.season}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-[#A8A29E] hover:text-white">
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-[#0A1628] border-white/[0.08]">
                      <DropdownMenuItem onClick={() => handleEdit(league)} className="text-white hover:bg-white/[0.05]">
                        <Edit className="w-4 h-4 mr-2" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-400 hover:bg-red-500/10">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 rounded-xl bg-white/[0.02]">
                    <p className="font-mono text-2xl font-bold text-white">{league.teams}</p>
                    <p className="text-[#A8A29E] text-xs">Đội</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-white/[0.02]">
                    <p className="font-mono text-2xl font-bold text-white">{league.matches}</p>
                    <p className="text-[#A8A29E] text-xs">Trận</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-white/[0.02]">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                      league.status === "active"
                        ? "bg-green-500/10 text-green-400"
                        : "bg-[#A8A29E]/10 text-[#A8A29E]"
                    }`}>
                      {league.status === "active" ? "Đang diễn ra" : "Hoàn thành"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-[#A8A29E] pt-4 border-t border-white/[0.05]">
                  <span>{league.startDate} - {league.endDate}</span>
                  <Link
                    to={`/admin/leagues/${league.id}`}
                    className="flex items-center gap-1 text-[#00D9FF] hover:underline"
                  >
                    Chi tiết
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
