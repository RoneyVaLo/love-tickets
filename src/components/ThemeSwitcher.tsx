import { useTheme } from '../hooks/useTheme';

export function ThemeSwitcher(): JSX.Element {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      className="inline-flex items-center justify-center w-9 h-9 rounded-xl font-sans text-base bg-white/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-white dark:hover:bg-rose-900/40 hover:border-rose-400 dark:hover:border-rose-600 transition-all duration-200"
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}
