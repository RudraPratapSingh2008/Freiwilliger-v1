import { Moon, Sun } from 'lucide-react';
import { useDarkMode } from '../../hooks/useDarkMode';
import { Switch } from '@/components/ui/switch';

export default function ThemeToggle() {
  const { isDark, toggle } = useDarkMode();

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3">
        {isDark ? <Moon className="h-5 w-5 text-violet-400" /> : <Sun className="h-5 w-5 text-amber-500" />}
        <div>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Dark Mode</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Switch between light and dark themes</p>
        </div>
      </div>
      <Switch checked={isDark} onCheckedChange={toggle} />
    </div>
  );
}
