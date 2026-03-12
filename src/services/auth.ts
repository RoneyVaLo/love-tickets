import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  type User as FirebaseUser,
  type UserCredential,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import type { UserRole } from '../types';

/**
 * FirebaseAuthService
 * 
 * Abstracción de Firebase Authentication que proporciona métodos para:
 * - Iniciar sesión (signIn)
 * - Cerrar sesión (signOut)
 * - Obtener usuario actual (getCurrentUser)
 * - Suscribirse a cambios de autenticación (onAuthStateChanged)
 * - Obtener rol de usuario (getUserRole)
 * 
 * Maneja errores específicos de Firebase con mensajes descriptivos.
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 */
export class FirebaseAuthService {
  /**
   * Inicia sesión con email y contraseña
   * @param email - Email del usuario
   * @param password - Contraseña del usuario
   * @returns Promise con UserCredential de Firebase
   * @throws Error con mensaje descriptivo según el código de error de Firebase
   */
  async signIn(email: string, password: string): Promise<UserCredential> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (error: any) {
      // Manejar errores específicos de Firebase Authentication
      switch (error.code) {
        case 'auth/user-not-found':
          throw new Error('Usuario no encontrado');
        case 'auth/wrong-password':
          throw new Error('Contraseña incorrecta');
        case 'auth/invalid-email':
          throw new Error('Email inválido');
        case 'auth/user-disabled':
          throw new Error('Usuario deshabilitado');
        case 'auth/too-many-requests':
          throw new Error('Demasiados intentos fallidos. Intenta más tarde.');
        case 'auth/network-request-failed':
          throw new Error('Error de conexión. Por favor, verifica tu internet.');
        case 'auth/invalid-credential':
          throw new Error('Credenciales inválidas');
        default:
          throw new Error('Error al iniciar sesión. Intenta nuevamente.');
      }
    }
  }

  /**
   * Cierra la sesión del usuario actual
   * @returns Promise que se resuelve cuando se cierra la sesión
   * @throws Error si hay un problema al cerrar sesión
   */
  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (error: any) {
      throw new Error('Error al cerrar sesión. Intenta nuevamente.');
    }
  }

  /**
   * Obtiene el usuario actualmente autenticado
   * @returns Usuario de Firebase o null si no hay sesión activa
   */
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  /**
   * Suscribe un callback a cambios en el estado de autenticación
   * @param callback - Función que se ejecuta cuando cambia el estado de autenticación
   * @returns Función para cancelar la suscripción
   */
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void): () => void {
    return firebaseOnAuthStateChanged(auth, callback);
  }

  /**
   * Obtiene el rol del usuario desde Firestore
   * @param userId - ID del usuario
   * @returns Promise con el rol del usuario ('usuario_principal' o 'novia')
   * @throws Error si el usuario no existe o no tiene rol asignado
   */
  async getUserRole(userId: string): Promise<UserRole> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        throw new Error('Usuario no encontrado en la base de datos');
      }

      const userData = userDoc.data();
      const role = userData?.role as UserRole;

      if (!role || (role !== 'usuario_principal' && role !== 'novia')) {
        throw new Error('Rol de usuario inválido o no asignado');
      }

      return role;
    } catch (error: any) {
      if (error.message.includes('Usuario no encontrado') || error.message.includes('Rol de usuario')) {
        throw error;
      }
      throw new Error('Error al obtener rol de usuario. Intenta nuevamente.');
    }
  }
}

// Exportar instancia singleton del servicio
export const firebaseAuthService = new FirebaseAuthService();
