import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, FileText, Menu, LogOut, ChevronDown, Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { authService } from '@/services/authService';
import { userService } from '@/services/userService';

interface AdminLayoutProps {
  children: ReactNode;
}

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard',          path: '/admin' },
  { icon: Users,           label: 'Quản lý người dùng', path: '/admin/users' },
  { icon: Target,          label: 'Quản lý dự đoán',    path: '/admin/predictions' },
  { icon: FileText,        label: 'Quản lý diễn đàn',   path: '/admin/forum' },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [username, setUsername] = useState('Admin');
  const [email, setEmail] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login', { replace: true });
      return;
    }
    userService.getMe()
      .then(u => {
        const isAdmin = u.roles?.some(r => r.toLowerCase() === 'admin');
        if (!isAdmin) { navigate('/', { replace: true }); return; }
        setUsername(u.username ?? u.fullName ?? 'Admin');
        setEmail(u.email ?? '');
      })
      .catch(() => navigate('/login', { replace: true }));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FF4444] rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00D9FF] rounded-full blur-[128px]" />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card/95 backdrop-blur-xl border-r border-slate-200 dark:border-white/5 transform transition-transform duration-300 lg:transform-none",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-200 dark:border-white/5">
            <Link to="/admin" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF4444] to-[#FF6666] flex items-center justify-center">
                <span className="font-display font-extrabold text-white text-lg">VN</span>
              </div>
              <div>
                <h1 className="font-display font-bold text-foreground text-sm">Admin Portal</h1>
                <p className="text-xs text-slate-500 dark:text-[#A8A29E]">Player Rating System</p>
              </div>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {sidebarItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200",
                    isActive
                      ? "bg-[#FF4444] text-white font-semibold"
                      : "text-slate-600 dark:text-[#A8A29E] hover:bg-slate-100 dark:hover:bg-white/5 hover:text-foreground"
                  )}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-200 dark:border-white/5">
            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-600 dark:text-[#A8A29E] hover:bg-slate-100 dark:hover:bg-white/5 hover:text-foreground transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Về trang chủ
            </Link>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-[#A8A29E]">
              <Menu className="w-5 h-5" />
            </button>
            <div className="ml-auto flex items-center gap-3">
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF4444] to-[#FF6666] flex items-center justify-center">
                    <span className="font-bold text-white text-sm">A</span>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-foreground leading-tight">{username}</p>
                    <p className="text-xs text-slate-500 dark:text-[#A8A29E]">{email}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/')}>Về trang chủ</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-500">Đăng xuất</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
