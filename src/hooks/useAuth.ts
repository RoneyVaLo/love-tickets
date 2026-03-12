import { useState, useEffect } from 'react';
import { firebaseAuthService } from '../services/auth';
import type { User, UseAuthReturn, UserRole } from '../types';
import type { User as FirebaseUser } from 'firebase/auth';

/**
 * useAuth Hook
 * 
 * Custom hook para gestionar el estado de autenticación de la aplicación.
 * 
 * Funcionalidades:
 * - Gestiona estado de autenticación: user, userRole, loading, error
 * - Implementa funciones: signIn, signOut
 * - Se suscribe a cambios de estado de autenticación con onAuthStateChanged
 * 
 * Requirements: 1.2, 1.4, 1.5
 * 
 * @returns {UseAuthReturn} Objeto con estado y funciones de autenticación
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'usuario_principal' | 'novia' | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Función para iniciar sesión
   * @param email - Email del usuario
   * @param password - Contraseña del usuario
   */
  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const userCredential = await firebaseAuthService.signIn(email, password);
      const firebaseUser = userCredential.user;
      
      // Obtener rol del usuario desde Firestore
      const role = await firebaseAuthService.getUserRole(firebaseUser.uid);
      
      // Actualizar estado con usuario y rol
      setUser({
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        role,
        displayName: firebaseUser.displayName || undefined,
      });
      setUserRole(role);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Función para cerrar sesión
   */
  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      await firebaseAuthService.signOut();
      
      // Limpiar estado
      setUser(null);
      setUserRole(null);
    } catch (err: any) {
      setError(err.message || 'Error al cerrar sesión');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Función para registrar un nuevo usuario
   * @param email - Email del usuario
   * @param password - Contraseña del usuario
   * @param role - Rol del usuario ('usuario_principal' o 'novia')
   * @param displayName - Nombre opcional del usuario
   */
  const signUp = async (
    email: string,
    password: string,
    role: UserRole,
    displayName?: string
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const userCredential = await firebaseAuthService.signUp(email, password, role, displayName);
      const firebaseUser = userCredential.user;
      
      // Actualizar estado con usuario y rol
      setUser({
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        role,
        displayName: firebaseUser.displayName || undefined,
      });
      setUserRole(role);
    } catch (err: any) {
      setError(err.message || 'Error al registrar usuario');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Effect para suscribirse a cambios de estado de autenticación
   * Se ejecuta al montar el componente y se limpia al desmontar
   */
  useEffect(() => {
    const unsubscribe = firebaseAuthService.onAuthStateChanged(
      async (firebaseUser: FirebaseUser | null) => {
        try {
          if (firebaseUser) {
            // Usuario autenticado - obtener rol
            const role = await firebaseAuthService.getUserRole(firebaseUser.uid);
            
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              role,
              displayName: firebaseUser.displayName || undefined,
            });
            setUserRole(role);
          } else {
            // No hay usuario autenticado
            setUser(null);
            setUserRole(null);
          }
        } catch (err: any) {
          setError(err.message || 'Error al obtener información del usuario');
          setUser(null);
          setUserRole(null);
        } finally {
          setLoading(false);
        }
      }
    );

    // Cleanup: cancelar suscripción al desmontar
    return () => unsubscribe();
  }, []);

  return {
    user,
    userRole,
    loading,
    error,
    signIn,
    signOut,
    signUp,
  };
}
