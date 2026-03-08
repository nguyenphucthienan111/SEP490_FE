import { useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { TrendingUp, Users, Target, Award, Plus, Calendar, Trophy, Star, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function AdminPredictionsPage() {
  const [activeTab, setActiveTab] = useState('active');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    type: '',
  });

  const activeCampaigns = [
    { 
      id: 1, 
      type: 'Match Result', 
      title: 'Hà Nội FC vs Hoàng Anh Gia Lai', 
      startDate: '2024-03-15',
      endDate: '2024-03-15 19:00',
      participants: 1234,
      status: 'Active'
    },
    { 
      id: 2, 
      type: 'Top 6', 
      title: 'Dự đoán Top 6 Vòng 2', 
      startDate: '2024-03-10',
      endDate: '2024-03-14 18:30',
      participants: 2156,
      status: 'Active'
    },
    { 
      id: 3, 
      type: 'POTM', 
      title: 'Cầu thủ xuất sắc nhất tháng 3', 
      startDate: '2024-03-01',
      endDate: '2024-03-31 23:59',
      participants: 3421,
      status: 'Active'
    },
  ];

  const completedCampaigns = [
    { 
      id: 4, 
      type: 'Match Result', 
      title: 'Viettel FC vs Hải Phòng FC', 
      date: '2024-03-14',
      participants: 987,
      correctPredictions: 654,
      accuracy: 66.3,
      status: 'Completed'
    },
    { 
      id: 5, 
      type: 'Top Scorer', 
      title: 'Vua phá lưới lượt đi', 
      date: '2024-02-28',
      participants: 1876,
      correctPredictions: 423,
      accuracy: 22.5,
      status: 'Completed'
    },
  ];

  const campaignTypes = [
    { icon: Calendar, label: 'Kết quả trận đấu', color: 'blue', description: 'Dự đoán đội thắng/hòa/thua', value: 'match' },
    { icon: Trophy, label: 'Top 6 vòng đấu', color: 'purple', description: 'Dự đoán 6 đội dẫn đầu', value: 'top6' },
    { icon: Star, label: 'POTM', color: 'yellow', description: 'Cầu thủ xuất sắc nhất tháng', value: 'potm' },
    { icon: Target, label: 'Top Scorer', color: 'red', description: 'Vua phá lưới lượt đi/về', value: 'topscorer' },
    { icon: Award, label: 'POTS', color: 'green', description: 'Cầu thủ xuất sắc nhất giải', value: 'pots' },
    { icon: Crown, label: 'Vô địch', color: 'orange', description: 'Đội vô địch giải đấu', value: 'champion' },
  ];

  const handleCreatePrediction = () => {
    setIsCreateModalOpen(true);
  };

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    const typeData = campaignTypes.find(t => t.value === type);
    setFormData({
      ...formData,
      type: type,
      title: typeData?.label || '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating prediction:', formData);
    // Here you would call API to create prediction
    setIsCreateModalOpen(false);
    setSelectedType('');
    setFormData({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      type: '',
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Quản Lý Dự Đoán</h1>
            <p className="text-slate-600 dark:text-[#A8A29E] mt-1">Tạo và quản lý các chiến dịch dự đoán</p>
          </div>
          <Button className="bg-gradient-to-r from-[#FF4444] to-[#FF6666] text-white" onClick={handleCreatePrediction}>
            <Plus className="w-4 h-4 mr-2" />
            Tạo Dự Đoán Mới
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card border border-slate-200 dark:border-white/5 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-[#A8A29E]">Tổng Dự Đoán</p>
                <p className="text-2xl font-bold text-foreground mt-1">45,678</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-slate-200 dark:border-white/5 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-[#A8A29E]">Người Tham Gia</p>
                <p className="text-2xl font-bold text-foreground mt-1">8,234</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-slate-200 dark:border-white/5 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-[#A8A29E]">Độ Chính Xác TB</p>
                <p className="text-2xl font-bold text-foreground mt-1">68.3%</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-slate-200 dark:border-white/5 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-[#A8A29E]">Đang Hoạt Động</p>
                <p className="text-2xl font-bold text-foreground mt-1">12</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <Award className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Campaign Types */}
        <div className="bg-card border border-slate-200 dark:border-white/5 rounded-xl p-6">
          <h2 className="font-display text-xl font-bold text-foreground mb-4">Loại Dự Đoán</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaignTypes.map((type, index) => (
              <div 
                key={index}
                className="p-4 rounded-xl border border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-${type.color}-500/10 flex items-center justify-center flex-shrink-0`}>
                    <type.icon className={`w-5 h-5 text-${type.color}-500`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{type.label}</h3>
                    <p className="text-sm text-slate-600 dark:text-[#A8A29E] mt-1">{type.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create Prediction Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display">Tạo Dự Đoán Mới</DialogTitle>
              <DialogDescription>
                Chọn loại dự đoán và điền thông tin chi tiết
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              {/* Step 1: Select Type */}
              {!selectedType && (
                <div>
                  <Label className="text-base font-semibold mb-3 block">Chọn Loại Dự Đoán</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {campaignTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => handleTypeSelect(type.value)}
                        className="p-4 rounded-xl border-2 border-slate-200 dark:border-white/10 hover:border-[#FF4444] hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-left"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-${type.color}-500/10 flex items-center justify-center flex-shrink-0`}>
                            <type.icon className={`w-5 h-5 text-${type.color}-500`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{type.label}</h3>
                            <p className="text-sm text-slate-600 dark:text-[#A8A29E] mt-1">{type.description}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Fill Details */}
              {selectedType && (
                <>
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      {(() => {
                        const type = campaignTypes.find(t => t.value === selectedType);
                        return type ? (
                          <>
                            <div className={`w-10 h-10 rounded-lg bg-${type.color}-500/10 flex items-center justify-center`}>
                              <type.icon className={`w-5 h-5 text-${type.color}-500`} />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{type.label}</p>
                              <p className="text-sm text-slate-600 dark:text-[#A8A29E]">{type.description}</p>
                            </div>
                          </>
                        ) : null;
                      })()}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedType('')}
                    >
                      Đổi loại
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Tiêu Đề</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="VD: Hà Nội FC vs Hoàng Anh Gia Lai"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Mô Tả</Label>
                      <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Mô tả chi tiết về dự đoán này..."
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-background text-foreground min-h-[100px]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startDate">Ngày Bắt Đầu</Label>
                        <Input
                          id="startDate"
                          type="datetime-local"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="endDate">Ngày Kết Thúc</Label>
                        <Input
                          id="endDate"
                          type="datetime-local"
                          value={formData.endDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    {/* Match-specific fields */}
                    {selectedType === 'match' && (
                      <div className="space-y-4 p-4 bg-blue-500/5 rounded-xl border border-blue-500/20">
                        <h3 className="font-semibold text-foreground">Thông Tin Trận Đấu</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Đội Nhà</Label>
                            <Input placeholder="Chọn đội nhà" />
                          </div>
                          <div>
                            <Label>Đội Khách</Label>
                            <Input placeholder="Chọn đội khách" />
                          </div>
                        </div>
                        <div>
                          <Label>Tích hợp AI dự đoán tỷ lệ</Label>
                          <div className="flex items-center gap-2 mt-2">
                            <input type="checkbox" id="aiPrediction" className="w-4 h-4" />
                            <label htmlFor="aiPrediction" className="text-sm text-slate-600 dark:text-[#A8A29E]">
                              Sử dụng AI để tính toán tỷ lệ thắng/hòa/thua
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Top 6 specific fields */}
                    {selectedType === 'top6' && (
                      <div className="space-y-4 p-4 bg-purple-500/5 rounded-xl border border-purple-500/20">
                        <h3 className="font-semibold text-foreground">Thông Tin Vòng Đấu</h3>
                        <div>
                          <Label>Vòng Đấu</Label>
                          <Input type="number" placeholder="VD: 30" />
                        </div>
                        <div>
                          <Label>Giải Đấu</Label>
                          <select className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-background text-foreground">
                            <option>V.League 1</option>
                            <option>V.League 2</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setIsCreateModalOpen(false)}
                    >
                      Hủy
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-[#FF4444] to-[#FF6666] text-white"
                    >
                      Tạo Dự Đoán
                    </Button>
                  </div>
                </>
              )}
            </form>
          </DialogContent>
        </Dialog>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-white/5">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'active'
                ? 'text-[#FF4444] border-b-2 border-[#FF4444]'
                : 'text-slate-600 dark:text-[#A8A29E] hover:text-foreground'
            }`}
          >
            Đang Hoạt Động ({activeCampaigns.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'completed'
                ? 'text-[#FF4444] border-b-2 border-[#FF4444]'
                : 'text-slate-600 dark:text-[#A8A29E] hover:text-foreground'
            }`}
          >
            Đã Kết Thúc ({completedCampaigns.length})
          </button>
        </div>

        {/* Active Campaigns */}
        {activeTab === 'active' && (
          <div className="bg-card border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/5">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600 dark:text-[#A8A29E]">Loại</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600 dark:text-[#A8A29E]">Tiêu Đề</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600 dark:text-[#A8A29E]">Thời Gian</th>
                    <th className="text-center px-6 py-4 text-sm font-semibold text-slate-600 dark:text-[#A8A29E]">Người Tham Gia</th>
                    <th className="text-center px-6 py-4 text-sm font-semibold text-slate-600 dark:text-[#A8A29E]">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                  {activeCampaigns.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500">
                          {campaign.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-foreground">{campaign.title}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-[#A8A29E]">
                        <div>
                          <p>Bắt đầu: {new Date(campaign.startDate).toLocaleDateString('vi-VN')}</p>
                          <p>Kết thúc: {campaign.endDate}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-mono text-foreground">{campaign.participants.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                          {campaign.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Completed Campaigns */}
        {activeTab === 'completed' && (
          <div className="bg-card border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/5">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600 dark:text-[#A8A29E]">Loại</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600 dark:text-[#A8A29E]">Tiêu Đề</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600 dark:text-[#A8A29E]">Ngày</th>
                    <th className="text-center px-6 py-4 text-sm font-semibold text-slate-600 dark:text-[#A8A29E]">Tổng Dự Đoán</th>
                    <th className="text-center px-6 py-4 text-sm font-semibold text-slate-600 dark:text-[#A8A29E]">Đúng</th>
                    <th className="text-center px-6 py-4 text-sm font-semibold text-slate-600 dark:text-[#A8A29E]">Độ Chính Xác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                  {completedCampaigns.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-600 dark:text-slate-400">
                          {campaign.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-foreground">{campaign.title}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-[#A8A29E]">
                        {new Date(campaign.date).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-mono text-foreground">{campaign.participants.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-mono text-green-500">{campaign.correctPredictions.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          campaign.accuracy >= 70 ? 'bg-green-500/10 text-green-500' :
                          campaign.accuracy >= 60 ? 'bg-yellow-500/10 text-yellow-500' :
                          'bg-red-500/10 text-red-500'
                        }`}>
                          {campaign.accuracy}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
