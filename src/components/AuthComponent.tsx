import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const FloatingDecorations = () => (
  <div className="pointer-events-none select-none" aria-hidden="true">
    <span className="fixed top-[8%] left-[6%] text-5xl opacity-20 animate-float text-rose-300 dark:text-rose-400" style={{ animationDuration: '5s' }}>♥</span>
    <span className="fixed top-[14%] right-[10%] text-2xl opacity-15 animate-float delay-300 text-rose-700 dark:text-rose-500" style={{ animationDuration: '6s' }}>♥</span>
    <span className="fixed top-[5%] left-[50%] text-xl opacity-20 animate-sparkle text-amber-400 dark:text-amber-300">✦</span>
    <span className="fixed bottom-[12%] right-[8%] text-4xl opacity-15 animate-float delay-200 text-rose-400 dark:text-rose-300" style={{ animationDuration: '7s' }}>♥</span>
    <span className="fixed bottom-[20%] left-[12%] text-lg opacity-20 animate-sparkle delay-400 text-amber-400 dark:text-amber-300">✦</span>
    <span className="fixed top-[45%] left-[3%] text-xl opacity-10 animate-float delay-500 text-rose-600 dark:text-rose-400" style={{ animationDuration: '8s' }}>♥</span>
    <span className="fixed top-[55%] right-[4%] text-base opacity-15 animate-sparkle delay-100 text-amber-400 dark:text-amber-300">✦</span>
  </div>
);

/**
 * AuthComponent — Romantic login & register screen
 * Requirements: 1.1, 1.2, 1.3, 10.1–10.4
 */
export function AuthComponent() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<'usuario_principal' | 'novia'>('novia');
  const [error, setError] = useState<string | null>(null);
  const { signIn, signUp, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) { setError('Por favor, completa todos los campos'); return; }
    if (!isLoginMode) {
      if (password !== confirmPassword) { setError('Las contraseñas no coinciden'); return; }
      if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }
    }
    try {
      if (isLoginMode) { await signIn(email, password); }
      else { await signUp(email, password, role, displayName || undefined); }
      navigate('/dashboard');
    } catch (err: any) {
      const map: Record<string, string> = {
        'auth/user-not-found': 'Usuario no encontrado',
        'auth/wrong-password': 'Contraseña incorrecta',
        'auth/invalid-email': 'Email inválido',
        'auth/network-request-failed': 'Error de conexión. Verifica tu internet.',
      };
      setError(map[err.code] ?? err.message ?? `Error al ${isLoginMode ? 'iniciar sesión' : 'registrarse'}.`);
    }
  };

  const toggleMode = () => {
    setIsLoginMode(v => !v);
    setError(null);
    setPassword('');
    setConfirmPassword('');
    setDisplayName('');
  };

  const inputClass = `
    w-full px-4 py-3 rounded-xl text-sm font-sans
    bg-white/70 dark:bg-rose-950/50
    border border-rose-200 dark:border-rose-700
    text-stone-800 dark:text-rose-100
    placeholder:text-stone-400 dark:placeholder:text-rose-500
    focus:outline-none focus:ring-2 focus:ring-rose-400/40 dark:focus:ring-rose-400/30
    focus:border-rose-400 dark:focus:border-rose-500
    focus:bg-white dark:focus:bg-rose-950/70
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-all duration-200
  `;

  const labelClass = `
    block font-sans text-xs font-bold uppercase tracking-widest mb-1.5
    text-rose-700 dark:text-rose-300
  `;

  return (
    <div className="grain min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-rose-50 via-amber-50/30 to-rose-100 dark:from-stone-950 dark:via-rose-950/50 dark:to-stone-900">
      <FloatingDecorations />

      <div className="w-full max-w-md relative z-10">

        {/* Brand header */}
        <div className="text-center mb-8 animate-fade-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 bg-gradient-to-br from-rose-100 to-amber-100 dark:from-rose-900/60 dark:to-rose-800/40 border border-rose-200 dark:border-rose-700">
            <span className="text-3xl animate-pulse-soft text-rose-700 dark:text-rose-300">♥</span>
          </div>
          <h1 className="font-display text-4xl font-semibold mb-1 text-rose-900 dark:text-rose-100">
            Tickets Canjeables
          </h1>
          <p className="font-serif text-lg italic text-stone-500 dark:text-rose-300">
            {isLoginMode ? 'Bienvenido de vuelta, amor' : 'Comienza tu historia'}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8 animate-fade-up delay-100 bg-white/80 dark:bg-rose-950/60 border border-rose-200/60 dark:border-rose-700/60 shadow-xl shadow-rose-900/10 dark:shadow-rose-900/40 backdrop-blur-sm">

          {/* Ornamental divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-300/60 dark:via-amber-500/50 to-transparent" />
            <span className="font-serif text-sm italic text-amber-600 dark:text-amber-300">
              ✦ {isLoginMode ? 'Iniciar Sesión' : 'Crear Cuenta'} ✦
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-300/60 dark:via-amber-500/50 to-transparent" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {!isLoginMode && (
              <div className="animate-slide-down">
                <label htmlFor="displayName" className={labelClass}>Nombre (opcional)</label>
                <input id="displayName" name="displayName" type="text"
                  value={displayName} onChange={e => setDisplayName(e.target.value)}
                  disabled={loading} placeholder="Tu nombre" className={inputClass} />
              </div>
            )}

            <div>
              <label htmlFor="email" className={labelClass}>Correo electrónico</label>
              <input id="email" name="email" type="email" autoComplete="email" required
                value={email} onChange={e => setEmail(e.target.value)}
                disabled={loading} placeholder="tu@correo.com" className={inputClass} />
            </div>

            <div>
              <label htmlFor="password" className={labelClass}>Contraseña</label>
              <input id="password" name="password" type="password"
                autoComplete={isLoginMode ? 'current-password' : 'new-password'} required
                value={password} onChange={e => setPassword(e.target.value)}
                disabled={loading} placeholder="••••••••" className={inputClass} />
            </div>

            {!isLoginMode && (
              <div className="animate-slide-down">
                <label htmlFor="confirmPassword" className={labelClass}>Confirmar contraseña</label>
                <input id="confirmPassword" name="confirmPassword" type="password"
                  autoComplete="new-password" required
                  value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  disabled={loading} placeholder="••••••••" className={inputClass} />
              </div>
            )}

            {!isLoginMode && (
              <div className="animate-slide-down delay-100">
                <label htmlFor="role" className={labelClass}>Rol</label>
                <select id="role" name="role"
                  value={role} onChange={e => setRole(e.target.value as 'usuario_principal' | 'novia')}
                  disabled={loading}
                  className={`${inputClass} select-romantic`}>
                  <option value="novia">💕 Novia</option>
                  <option value="usuario_principal">🎩 Usuario Principal</option>
                </select>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm animate-slide-down bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300" role="alert">
                <span className="text-base flex-shrink-0">⚠</span>
                <p className="font-sans">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-sans font-bold text-sm tracking-wider uppercase transition-all duration-200 bg-gradient-to-r from-rose-700 to-rose-500 dark:from-rose-600 dark:to-rose-400 text-white shadow-lg shadow-rose-700/30 dark:shadow-rose-500/20 hover:shadow-rose-700/50 hover:-translate-y-0.5 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:scale-100">
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin-slow" />
                  {isLoginMode ? 'Entrando...' : 'Creando cuenta...'}
                </>
              ) : (
                <><span>{isLoginMode ? '♥' : '✦'}</span>{isLoginMode ? 'Iniciar Sesión' : 'Registrarse'}</>
              )}
            </button>
          </form>

          {/* Toggle mode */}
          <div className="mt-6 text-center">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-200/60 dark:via-amber-600/40 to-transparent" />
              <span className="text-xs text-amber-400 dark:text-amber-500">·</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-200/60 dark:via-amber-600/40 to-transparent" />
            </div>
            <button type="button" onClick={toggleMode} disabled={loading}
              className="font-sans text-sm text-rose-600 dark:text-rose-300 hover:text-rose-800 dark:hover:text-rose-100 disabled:opacity-40 transition-colors">
              {isLoginMode ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión aquí'}
            </button>
          </div>
        </div>

        <p className="text-center mt-6 font-serif text-sm italic animate-fade-up delay-300 text-stone-400 dark:text-rose-400">
          Hecho con ♥ para momentos especiales
        </p>
      </div>
    </div>
  );
}
