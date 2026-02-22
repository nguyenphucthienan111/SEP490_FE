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

// Mock leagues data
const mockLeagues = [
  {
    id: "1",
    name: "V.League 1",
    season: "2025",
    country: "Vietnam",
    teams: 14,
    matches: 182,
    status: "active",
    startDate: "2025-02-15",
    endDate: "2025-10-30",
    logo: "🏆",
  },
  {
    id: "2",
    name: "V.League 2",
    season: "2025",
    country: "Vietnam",
    teams: 12,
    matches: 132,
    status: "active",
    startDate: "2025-03-01",
    endDate: "2025-10-15",
    logo: "🥈",
  },
  {
    id: "3",
    name: "Cúp Quốc gia",
    season: "2025",
    country: "Vietnam",
    teams: 24,
    matches: 47,
    status: "active",
    startDate: "2025-04-10",
    endDate: "2025-09-20",
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
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-[#FF4444] to-[#FF6666] text-white shadow-lg hover:shadow-xl transition-all duration-200">
                  <Plus className="w-5 h-5 mr-2" />
                  Thêm giải đấu
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white border-slate-200 text-slate-800 max-w-md shadow-2xl">
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

          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Tìm kiếm giải đấu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-slate-200 text-slate-800 shadow-sm focus:border-blue-400 focus:ring-blue-400/20"
              />
            </div>
            <Select value={seasonFilter} onValueChange={setSeasonFilter}>
              <SelectTrigger className="w-[140px] bg-white border-slate-200 text-slate-800 shadow-sm focus:border-blue-400 focus:ring-blue-400/20">
                <SelectValue placeholder="Mùa giải" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200 shadow-xl">
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Leagues Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredLeagues.map((league) => (
              <div
                key={league.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg hover:border-slate-300 transition-all duration-200 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-3xl border border-blue-200/50">
                      {league.logo}
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-xl text-slate-800">{league.name}</h3>
                      <p className="text-slate-600">Mùa giải {league.season}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-700 hover:bg-slate-100">
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-white border-slate-200 shadow-xl">
                      <DropdownMenuItem onClick={() => handleEdit(league)} className="text-slate-700 hover:bg-slate-50 focus:bg-slate-50">
                        <Edit className="w-4 h-4 mr-2" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600 hover:bg-red-50 focus:bg-red-50">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="font-mono text-2xl font-bold text-slate-800">{league.teams}</p>
                    <p className="text-slate-500 text-xs">Đội</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="font-mono text-2xl font-bold text-slate-800">{league.matches}</p>
                    <p className="text-slate-500 text-xs">Trận</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      league.status === "active"
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}>
                      {league.status === "active" ? "Đang diễn ra" : "Hoàn thành"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-slate-500 pt-4 border-t border-slate-100">
                  <span>{league.startDate} - {league.endDate}</span>
                  <Link
                    to={`/admin/leagues/${league.id}`}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline font-medium"
                  >
                    Chi tiết
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AdminLayout>
  );
}
