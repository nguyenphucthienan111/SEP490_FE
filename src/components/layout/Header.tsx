import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Menu, X, User, LogIn, LogOut, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './ThemeToggle';
import { authService } from '@/services/authService';
import { userService, UserResponse } from '@/services/userService';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Leagues', path: '/leagues' },
  { label: 'Players', path: '/players' },
  { label: 'Matches', path: '/matches' },
  { label: 'Predictions', path: '/predictions' },
  { label: 'Analytics', path: '/analytics' },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      if (authService.isAuthenticated()) {
        try {
          // Try to get user from API first
          const userData = await userService.getMe();
          setUser(userData);
        } catch (error) {
          console.error('Failed to fetch user from API:', error);
          // Fallback to localStorage
          const localUser = authService.getCurrentUser();
          if (localUser) {
            setUser(localUser as UserResponse);
          } else {
            // If token is invalid, clear it
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
          }
        }
      }
      setIsLoadingUser(false);
    };

    fetchUser();
  }, [location.pathname]); // Re-fetch when route changes

  const handleLogout = async () => {
    try {
      const refreshToken = authService.getRefreshToken();
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
      setUser(null);
      toast.success('Đăng xuất thành công!');
      navigate('/');
    } catch (error) {
      toast.error('Đăng xuất thất bại');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 dark:bg-background/95 backdrop-blur-sm border-b border-slate-700/50 dark:border-white/5">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF4444] to-[#FF6666] flex items-center justify-center shadow-md">
              <span className="font-display font-extrabold text-white text-lg">VN</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-display font-bold text-lg text-white leading-tight">
                Player Rating
              </h1>
              <p className="text-xs text-slate-400 font-label uppercase tracking-wider">
                Vietnamese Football
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "px-4 py-2 rounded-lg font-body text-sm font-medium transition-all duration-200",
                  location.pathname === item.path
                    ? "bg-slate-700/50 text-white"
                    : "text-slate-300 hover:text-white hover:bg-slate-700/30"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-300 hover:text-white hover:bg-white/5"
            >
              <Search className="w-5 h-5" />
            </Button>

            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* User Menu or Login/Register */}
            {!isLoadingUser && (
              <>
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost"
                        className="text-slate-300 hover:text-white hover:bg-slate-700/40 font-body text-sm gap-2 hidden sm:flex"
                      >
                        <UserCircle className="w-5 h-5" />
                        {user.username}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col">
                          <span className="font-semibold">{user.username}</span>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/profile" className="cursor-pointer">
                          <UserCircle className="w-4 h-4 mr-2" />
                          Hồ sơ
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                        <LogOut className="w-4 h-4 mr-2" />
                        Đăng xuất
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <>
                    {/* Login Button */}
                    <Link to="/login" className="hidden sm:block">
                      <Button 
                        variant="ghost"
                        className="text-slate-300 hover:text-white hover:bg-slate-700/40 active:bg-slate-700/60 font-body text-sm gap-2"
                      >
                        <LogIn className="w-4 h-4" />
                        Đăng nhập
                      </Button>
                    </Link>

                    {/* Register/Sign Up Button */}
                    <Link to="/register" className="hidden sm:block">
                      <Button 
                        className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 active:from-primary/80 active:to-primary/70 text-primary-foreground font-semibold text-sm px-4 h-10 rounded-xl transition-all duration-200 hover:scale-[0.98] shadow-lg"
                      >
                        Đăng ký
                      </Button>
                    </Link>
                  </>
                )}
              </>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-slate-300 hover:text-white hover:bg-white/5"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden bg-slate-900/95 dark:bg-background/95 backdrop-blur-sm border-t border-slate-700/50 dark:border-white/5 animate-fade-in shadow-lg">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "px-4 py-3 rounded-lg font-body text-sm font-medium transition-all duration-200",
                  location.pathname === item.path
                    ? "bg-slate-700/50 text-white"
                    : "text-slate-300 hover:text-white hover:bg-slate-700/30"
                )}
              >
                {item.label}
              </Link>
            ))}
            
            {user ? (
              <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-slate-700/50">
                <div className="px-4 py-2">
                  <p className="text-white font-semibold">{user.username}</p>
                </div>
                <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                  <Button 
                    variant="ghost"
                    className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700/40 font-body text-sm"
                  >
                    <UserCircle className="w-4 h-4 mr-2" />
                    Hồ sơ
                  </Button>
                </Link>
                <Button 
                  variant="ghost"
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 font-body text-sm"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Đăng xuất
                </Button>
              </div>
            ) : (
              <div className="flex gap-2 mt-2">
                <Link to="/login" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                  <Button 
                    variant="outline"
                    className="w-full border-slate-600 text-white hover:bg-white/10 font-semibold text-sm h-10 rounded-xl"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Đăng nhập
                  </Button>
                </Link>
                <Link to="/register" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                  <Button 
                    className="w-full bg-gradient-to-r from-primary to-primary/90 text-primary-foreground font-semibold text-sm h-10 rounded-xl shadow-lg"
                  >
                    Đăng ký
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
