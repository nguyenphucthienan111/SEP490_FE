import { useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { Search, UserPlus, MoreVertical, Shield, Ban, CheckCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const users = [
    { id: 1, username: 'nguyenvana', email: 'nguyenvana@email.com', fullName: 'Nguyễn Văn A', role: 'User', status: 'Active', verified: true, joinDate: '2024-01-15' },
    { id: 2, username: 'tranthib', email: 'tranthib@email.com', fullName: 'Trần Thị B', role: 'User', status: 'Active', verified: true, joinDate: '2024-02-20' },
    { id: 3, username: 'levanc', email: 'levanc@email.com', fullName: 'Lê Văn C', role: 'Moderator', status: 'Active', verified: true, joinDate: '2024-01-10' },
    { id: 4, username: 'phamthid', email: 'phamthid@email.com', fullName: 'Phạm Thị D', role: 'User', status: 'Suspended', verified: false, joinDate: '2024-03-05' },
    { id: 5, username: 'admin', email: 'admin@vleague.vn', fullName: 'Admin User', role: 'Admin', status: 'Active', verified: true, joinDate: '2023-12-01' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Quản Lý Người Dùng</h1>
            <p className="text-slate-600 dark:text-[#A8A29E] mt-1">Quản lý tài khoản và phân quyền người dùng</p>
          </div>
          <Button className="bg-gradient-to-r from-[#FF4444] to-[#FF6666] text-white">
            <UserPlus className="w-4 h-4 mr-2" />
            Thêm Người Dùng
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card border border-slate-200 dark:border-white/5 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-[#A8A29E]">Tổng Người Dùng</p>
                <p className="text-2xl font-bold text-foreground mt-1">1,234</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-slate-200 dark:border-white/5 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-[#A8A29E]">Đang Hoạt Động</p>
                <p className="text-2xl font-bold text-foreground mt-1">1,180</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-slate-200 dark:border-white/5 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-[#A8A29E]">Bị Khóa</p>
                <p className="text-2xl font-bold text-foreground mt-1">54</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                <Ban className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-slate-200 dark:border-white/5 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-[#A8A29E]">Chưa Xác Thực</p>
                <p className="text-2xl font-bold text-foreground mt-1">89</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <Mail className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-card border border-slate-200 dark:border-white/5 rounded-xl p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Tìm kiếm theo tên, email, username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select className="px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-background text-foreground">
              <option>Tất cả vai trò</option>
              <option>Admin</option>
              <option>Moderator</option>
              <option>User</option>
            </select>
            <select className="px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-background text-foreground">
              <option>Tất cả trạng thái</option>
              <option>Active</option>
              <option>Suspended</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-card border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/5">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600 dark:text-[#A8A29E]">Người Dùng</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600 dark:text-[#A8A29E]">Email</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600 dark:text-[#A8A29E]">Vai Trò</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600 dark:text-[#A8A29E]">Trạng Thái</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600 dark:text-[#A8A29E]">Ngày Tham Gia</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600 dark:text-[#A8A29E]">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF4444] to-[#FF6666] flex items-center justify-center">
                          <span className="font-bold text-white text-sm">{user.fullName.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{user.fullName}</p>
                          <p className="text-sm text-slate-600 dark:text-[#A8A29E]">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600 dark:text-[#A8A29E]">{user.email}</span>
                        {user.verified && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === 'Admin' ? 'bg-purple-500/10 text-purple-500' :
                        user.role === 'Moderator' ? 'bg-blue-500/10 text-blue-500' :
                        'bg-slate-500/10 text-slate-600 dark:text-slate-400'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        user.status === 'Active' ? 'bg-green-500/10 text-green-500' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-[#A8A29E]">
                      {new Date(user.joinDate).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {user.status === 'Active' ? (
                            <DropdownMenuItem className="text-red-600">
                              <Ban className="w-4 h-4 mr-2" />
                              Khóa tài khoản
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem className="text-green-600">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Mở khóa tài khoản
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
