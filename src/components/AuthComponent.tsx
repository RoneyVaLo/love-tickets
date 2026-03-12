import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * AuthComponent
 * 
 * Componente de autenticación que proporciona formularios de login y registro.
 * 
 * Funcionalidades:
 * - Formulario de login con campos email y password
 * - Formulario de registro con campos email, password, confirmación de password, nombre y rol
 * - Alternar entre modo login y registro
 * - Mostrar errores de autenticación
 * - Mostrar estado de loading durante autenticación
 * - Aplicar estilos con TailwindCSS responsivos
 * 
 * Requirements: 1.1, 1.2, 1.3, 10.1, 10.2, 10.3, 10.4
 */
export function AuthComponent() {
  const [isLoginMode, setIsLoginMode] = useState<boolean>(true);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [role, setRole] = useState<'usuario_principal' | 'novia'>('novia');
  const [error, setError] = useState<string | null>(null);
  const { signIn, signUp, loading } = useAuth();
  const navigate = useNavigate();

  /**
   * Maneja el envío del formulario de login
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Limpiar errores previos
    setError(null);
    
    // Validación básica
    if (!email || !password) {
      setError('Por favor, completa todos los campos');
      return;
    }

    if (!isLoginMode) {
      // Validaciones adicionales para registro
      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden');
        return;
      }
      
      if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        return;
      }
    }

    try {
      if (isLoginMode) {
        await signIn(email, password);
      } else {
        await signUp(email, password, role, displayName || undefined);
      }
      // Redirect to dashboard on success
      navigate('/dashboard');
    } catch (err: any) {
      // Manejo de errores específicos de Firebase
      if (err.code === 'auth/user-not-found') {
        setError('Usuario no encontrado');
      } else if (err.code === 'auth/wrong-password') {
        setError('Contraseña incorrecta');
      } else if (err.code === 'auth/invalid-email') {
        setError('Email inválido');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Error de conexión. Por favor, verifica tu internet.');
      } else {
        setError(err.message || `Error al ${isLoginMode ? 'iniciar sesión' : 'registrarse'}. Intenta nuevamente.`);
      }
    }
  };

  /**
   * Alterna entre modo login y registro
   */
  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError(null);
    setPassword('');
    setConfirmPassword('');
    setDisplayName('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Tickets Canjeables
          </h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            {isLoginMode ? 'Inicia sesión para gestionar tus tickets' : 'Crea tu cuenta para comenzar'}
          </p>
        </div>

        {/* Formulario */}
        <form 
          className="mt-8 space-y-6 bg-white p-6 sm:p-8 rounded-xl shadow-lg"
          onSubmit={handleSubmit}
        >
          <div className="space-y-4">
            {/* Campo Nombre (solo en registro) */}
            {!isLoginMode && (
              <div>
                <label 
                  htmlFor="displayName" 
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nombre (opcional)
                </label>
                <input
                  id="displayName"
                  name="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={loading}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                  placeholder="Tu nombre"
                />
              </div>
            )}

            {/* Campo Email */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                placeholder="tu@email.com"
              />
            </div>

            {/* Campo Password */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isLoginMode ? "current-password" : "new-password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                placeholder="••••••••"
              />
            </div>

            {/* Campo Confirmar Password (solo en registro) */}
            {!isLoginMode && (
              <div>
                <label 
                  htmlFor="confirmPassword" 
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Confirmar Contraseña
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                  placeholder="••••••••"
                />
              </div>
            )}

            {/* Campo Rol (solo en registro) */}
            {!isLoginMode && (
              <div>
                <label 
                  htmlFor="role" 
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Rol
                </label>
                <select
                  id="role"
                  name="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'usuario_principal' | 'novia')}
                  disabled={loading}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                >
                  <option value="novia">Novia</option>
                  <option value="usuario_principal">Usuario Principal</option>
                </select>
              </div>
            )}
          </div>

          {/* Mensaje de Error */}
          {error && (
            <div className="rounded-lg bg-red-50 p-4 border border-red-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg 
                    className="h-5 w-5 text-red-400" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Botón Submit */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg 
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                  >
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    />
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  {isLoginMode ? 'Iniciando sesión...' : 'Registrando...'}
                </span>
              ) : (
                isLoginMode ? 'Iniciar Sesión' : 'Registrarse'
              )}
            </button>
          </div>

          {/* Toggle entre Login y Registro */}
          <div className="text-center">
            <button
              type="button"
              onClick={toggleMode}
              disabled={loading}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {isLoginMode 
                ? '¿No tienes cuenta? Regístrate aquí' 
                : '¿Ya tienes cuenta? Inicia sesión aquí'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
