import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  FileText,
  Eye,
  Calendar,
  User,
  Tag,
  MoreVertical,
  ArrowLeft,
  Trophy,
  Users,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

// Mock articles data
const mockArticles = [
  {
    id: "1",
    title: "Phân tích phong độ Nguyễn Quang Hải mùa giải 2024",
    excerpt: "Đánh giá chi tiết màn trình diễn của Quang Hải qua các trận đấu gần đây...",
    author: "Admin",
    status: "published",
    views: 1234,
    publishedAt: "2024-01-20",
    category: "player-analysis",
    linkedPlayers: ["Nguyễn Quang Hải"],
    linkedMatches: [],
  },
  {
    id: "2",
    title: "Top 10 cầu thủ xuất sắc nhất V.League 2024",
    excerpt: "Danh sách những cầu thủ có điểm số cao nhất sau nửa mùa giải...",
    author: "Admin",
    status: "published",
    views: 2567,
    publishedAt: "2024-01-18",
    category: "rankings",
    linkedPlayers: [],
    linkedMatches: [],
  },
  {
    id: "3",
    title: "Hà Nội FC vs HAGL: Phân tích chiến thuật",
    excerpt: "Chi tiết về lối chơi và hiệu suất của từng cầu thủ trong trận đấu...",
    author: "Admin",
    status: "draft",
    views: 0,
    publishedAt: null,
    category: "match-analysis",
    linkedPlayers: [],
    linkedMatches: ["Hà Nội FC vs HAGL"],
  },
];

const categories = [
  { value: "player-analysis", label: "Phân tích cầu thủ" },
  { value: "match-analysis", label: "Phân tích trận đấu" },
  { value: "rankings", label: "Xếp hạng" },
  { value: "news", label: "Tin tức" },
  { value: "insights", label: "Insights" },
];

export default function AdminContentPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "",
  });

  const filteredArticles = mockArticles.filter((article) => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || article.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSave = () => {
    // Save article logic
    setIsDialogOpen(false);
    setFormData({ title: "", excerpt: "", content: "", category: "" });
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
            to="/admin/content"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-100 dark:bg-[#00D9FF]/10 text-[#00D9FF]"
          >
            <FileText className="w-5 h-5" />
            Nội dung
          </Link>
          <Link
            to="/admin/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-[#A8A29E] hover:bg-accent transition-colors"
          >
            <Settings className="w-5 h-5" />
            Cài đặt
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-[280px] p-8">
        <div className="max-w-6xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display font-extrabold text-3xl text-foreground mb-2">
                Quản lý Nội dung
              </h1>
              <p className="text-slate-600 dark:text-[#A8A29E]">Tạo và quản lý bài viết phân tích</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-[#FF4444] to-[#FF6666] text-slate-900 dark:text-white">
                  <Plus className="w-5 h-5 mr-2" />
                  Tạo bài viết
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-background border-slate-200 dark:border-white/[0.08] text-foreground max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="font-display font-bold text-xl text-foreground">
                    Tạo bài viết mới
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label className="text-slate-600 dark:text-[#A8A29E]">Tiêu đề</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Nhập tiêu đề bài viết..."
                      className="bg-card border-slate-200 dark:border-white/[0.08] text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-600 dark:text-[#A8A29E]">Danh mục</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger className="bg-card border-slate-200 dark:border-white/[0.08] text-foreground">
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-slate-200 dark:border-white/[0.08]">
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-600 dark:text-[#A8A29E]">Mô tả ngắn</Label>
                    <Textarea
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      placeholder="Tóm tắt nội dung bài viết..."
                      className="bg-card border-slate-200 dark:border-white/[0.08] text-foreground resize-none"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-600 dark:text-[#A8A29E]">Nội dung</Label>
                    <Textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Viết nội dung bài viết..."
                      className="bg-card border-slate-200 dark:border-white/[0.08] text-foreground resize-none"
                      rows={8}
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      variant="ghost"
                      onClick={() => setIsDialogOpen(false)}
                      className="text-slate-600 dark:text-[#A8A29E] hover:text-foreground"
                    >
                      Hủy
                    </Button>
                    <Button
                      variant="outline"
                      className="border-slate-300 dark:border-white/20 text-foreground hover:bg-slate-200 dark:bg-white/10"
                    >
                      Lưu nháp
                    </Button>
                    <Button
                      onClick={handleSave}
                      className="bg-gradient-to-r from-[#FF4444] to-[#FF6666] text-slate-900 dark:text-white"
                    >
                      Đăng bài
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card border border-slate-200 dark:border-white/[0.08] rounded-2xl p-5">
              <p className="text-slate-600 dark:text-[#A8A29E] text-sm mb-1">Tổng bài viết</p>
              <p className="font-mono text-3xl font-bold text-foreground">{mockArticles.length}</p>
            </div>
            <div className="bg-card border border-slate-200 dark:border-white/[0.08] rounded-2xl p-5">
              <p className="text-slate-600 dark:text-[#A8A29E] text-sm mb-1">Đã xuất bản</p>
              <p className="font-mono text-3xl font-bold text-green-400">
                {mockArticles.filter((a) => a.status === "published").length}
              </p>
            </div>
            <div className="bg-card border border-slate-200 dark:border-white/[0.08] rounded-2xl p-5">
              <p className="text-slate-600 dark:text-[#A8A29E] text-sm mb-1">Bản nháp</p>
              <p className="font-mono text-3xl font-bold text-yellow-400">
                {mockArticles.filter((a) => a.status === "draft").length}
              </p>
            </div>
            <div className="bg-card border border-slate-200 dark:border-white/[0.08] rounded-2xl p-5">
              <p className="text-slate-600 dark:text-[#A8A29E] text-sm mb-1">Tổng lượt xem</p>
              <p className="font-mono text-3xl font-bold text-[#00D9FF]">
                {mockArticles.reduce((sum, a) => sum + a.views, 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 dark:text-[#A8A29E]" />
              <Input
                placeholder="Tìm kiếm bài viết..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-slate-200 dark:border-white/[0.08] text-foreground"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px] bg-card border-slate-200 dark:border-white/[0.08] text-foreground">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent className="bg-background border-slate-200 dark:border-white/[0.08]">
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="published">Đã xuất bản</SelectItem>
                <SelectItem value="draft">Bản nháp</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Articles List */}
          <div className="space-y-4">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                className="bg-card border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6 hover:bg-accent transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        article.status === "published"
                          ? "bg-green-500/10 text-green-400"
                          : "bg-yellow-500/10 text-yellow-400"
                      }`}>
                        {article.status === "published" ? "Đã xuất bản" : "Bản nháp"}
                      </span>
                      <span className="text-slate-600 dark:text-[#A8A29E] text-sm">
                        {categories.find((c) => c.value === article.category)?.label}
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-xl text-foreground mb-2">
                      {article.title}
                    </h3>
                    <p className="text-slate-600 dark:text-[#A8A29E] line-clamp-2">{article.excerpt}</p>

                    <div className="flex items-center gap-6 mt-4">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-[#A8A29E] text-sm">
                        <User className="w-4 h-4" />
                        {article.author}
                      </div>
                      {article.publishedAt && (
                        <div className="flex items-center gap-2 text-slate-600 dark:text-[#A8A29E] text-sm">
                          <Calendar className="w-4 h-4" />
                          {article.publishedAt}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-slate-600 dark:text-[#A8A29E] text-sm">
                        <Eye className="w-4 h-4" />
                        {article.views.toLocaleString()} lượt xem
                      </div>
                    </div>

                    {(article.linkedPlayers.length > 0 || article.linkedMatches.length > 0) && (
                      <div className="flex items-center gap-2 mt-3">
                        <Tag className="w-4 h-4 text-slate-600 dark:text-[#A8A29E]" />
                        <div className="flex flex-wrap gap-2">
                          {article.linkedPlayers.map((player, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-full text-xs bg-blue-100 dark:bg-[#00D9FF]/10 text-[#00D9FF]">
                              {player}
                            </span>
                          ))}
                          {article.linkedMatches.map((match, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-full text-xs bg-red-100 dark:bg-[#FF4444]/10 text-[#FF4444]">
                              {match}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-slate-600 dark:text-[#A8A29E] hover:text-foreground">
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-background border-slate-200 dark:border-white/[0.08]">
                      <DropdownMenuItem className="text-foreground hover:bg-accent">
                        <Edit className="w-4 h-4 mr-2" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-foreground hover:bg-accent">
                        <Eye className="w-4 h-4 mr-2" />
                        Xem trước
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-400 hover:bg-red-500/10">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
