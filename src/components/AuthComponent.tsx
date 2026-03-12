import { useState, FormEvent } from 'react';
import type { User } from '../types';

interface AuthComponentProps {
  onAuthSuccess: (user: User) => void;
}

/**
 * AuthComponent
 * 
 * Componente de autenticación que proporciona un formulario de login.
 * 
 * Funcionalidades:
 * - Formulario de login con campos email y password
 * - Mostrar errores de autenticación
 * - Mostrar estado de loading durante autenticación
 * - Aplicar estilos con TailwindCSS responsivos
 * 
 * Requirements: 1.1, 1.2, 1.3, 10.1, 10.2, 10.3, 10.4
 */
export function AuthComponent({ onAuthSuccess }: AuthComponentProps) {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

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

    setLoading(true);

    try {
      // Aquí se integraría con useAuth hook
      // Por ahora, simulamos la autenticación
      // En la integración real, esto se manejará desde el componente padre
      
      // Placeholder para demostrar la estructura
      // El componente padre pasará la lógica de autenticación
      
      setError('Integración pendiente con useAuth hook');
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
        setError(err.message || 'Error al iniciar sesión. Intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
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
            Inicia sesión para gestionar tus tickets
          </p>
        </div>

        {/* Formulario */}
        <form 
          className="mt-8 space-y-6 bg-white p-6 sm:p-8 rounded-xl shadow-lg"
          onSubmit={handleSubmit}
        >
          <div className="space-y-4">
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
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                placeholder="••••••••"
              />
            </div>
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
                  Iniciando sesión...
                </span>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
