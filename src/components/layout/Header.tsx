import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Leagues', path: '/leagues' },
  { label: 'Players', path: '/players' },
  { label: 'Matches', path: '/matches' },
  { label: 'Analytics', path: '/analytics' },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/5">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF4444] to-[#FF6666] flex items-center justify-center">
              <span className="font-display font-extrabold text-white text-lg">VN</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-display font-bold text-lg text-white leading-tight">
                Player Rating
              </h1>
              <p className="text-xs text-[#A8A29E] font-label uppercase tracking-wider">
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
                    ? "bg-white/10 text-white"
                    : "text-[#A8A29E] hover:text-white hover:bg-white/5"
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
              className="text-[#A8A29E] hover:text-white hover:bg-white/5"
            >
              <Search className="w-5 h-5" />
            </Button>
            
            <Link to="/admin">
              <Button 
                className="hidden sm:flex bg-[#FF4444] hover:bg-[#FF5555] text-white font-label font-semibold text-sm px-5 h-10 rounded-xl glow-red transition-all duration-200 hover:scale-[0.98]"
              >
                Admin Portal
              </Button>
            </Link>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-[#A8A29E] hover:text-white hover:bg-white/5"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden glass-card border-t border-white/5 animate-fade-in">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "px-4 py-3 rounded-lg font-body text-sm font-medium transition-all duration-200",
                  location.pathname === item.path
                    ? "bg-white/10 text-white"
                    : "text-[#A8A29E] hover:text-white hover:bg-white/5"
                )}
              >
                {item.label}
              </Link>
            ))}
            <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
              <Button 
                className="w-full mt-2 bg-[#FF4444] hover:bg-[#FF5555] text-white font-label font-semibold text-sm h-10 rounded-xl"
              >
                Admin Portal
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
