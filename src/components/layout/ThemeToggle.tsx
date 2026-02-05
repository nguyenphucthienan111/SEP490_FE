import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Lightbulb } from 'lucide-react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const stored = localStorage.getItem('theme');
      if (stored === 'light' || stored === 'dark') return stored;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
    } catch (e) {
      /* ignore */
    }
    return 'dark';
  });

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {}
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-pressed={theme === 'light'}
      aria-label={theme === 'dark' ? 'Bật chế độ sáng' : 'Bật chế độ tối'}
      title={theme === 'dark' ? 'Bật chế độ sáng' : 'Bật chế độ tối'}
      className={theme === 'light' ? "bg-yellow-500/10 text-yellow-300 hover:bg-yellow-500/20" : "text-[#A8A29E] hover:text-foreground hover:bg-white/5"}
    >
      <Lightbulb className={"w-5 h-5 " + (theme === 'light' ? 'text-yellow-300' : '')} />
    </Button>
  );
}
