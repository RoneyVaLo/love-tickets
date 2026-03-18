import { useTheme } from '../hooks/useTheme';

export function ThemeSwitcher(): JSX.Element {
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === 'dark';
  const icon = isDark ? '☀️' : '🌙';
  const ariaLabel = isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={ariaLabel}
      className="rounded-full p-2 text-xl leading-none
        bg-gray-200 text-gray-800 hover:bg-gray-300
        dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400
        transition-colors duration-200"
    >
      {icon}
    </button>
  );
}
