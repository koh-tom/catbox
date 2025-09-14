import { MdDarkMode, MdLightMode, MdSettingsBrightness } from 'react-icons/md';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      aria-label={`現在のテーマ: ${theme}`}
      className="h-9 w-9"
    >
      {theme === 'light' && <MdLightMode className="h-5 w-5" />}
      {theme === 'dark' && <MdDarkMode className="h-5 w-5" />}
      {theme === 'system' && <MdSettingsBrightness className="h-5 w-5" />}
    </Button>
  );
}
