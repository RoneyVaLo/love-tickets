import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAuth } from './useAuth';
import { firebaseAuthService } from '../services/auth';
import type { UserCredential } from 'firebase/auth';

// Mock del servicio de autenticación
vi.mock('../services/auth', () => ({
  firebaseAuthService: {
    signIn: vi.fn(),
    signOut: vi.fn(),
    getCurrentUser: vi.fn(),
    onAuthStateChanged: vi.fn(),
    getUserRole: vi.fn(),
  },
}));

describe('useAuth Hook', () => {
  let mockUnsubscribe: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUnsubscribe = vi.fn();
    
    // Mock por defecto de onAuthStateChanged
    vi.mocked(firebaseAuthService.onAuthStateChanged).mockImplementation((callback) => {
      // Simular que no hay usuario autenticado inicialmente
      callback(null);
      return mockUnsubscribe as () => void;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('should initialize with loading true and no user', async () => {
    // Mock onAuthStateChanged to not call callback immediately
    vi.mocked(firebaseAuthService.onAuthStateChanged).mockImplementation(() => {
      return mockUnsubscribe as () => void;
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBe(null);
    expect(result.current.userRole).toBe(null);
    expect(result.current.error).toBe(null);
  });

  test('should set loading to false after auth state check', async () => {
    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  test('should sign in successfully with valid credentials', async () => {
    const mockUserCredential: Partial<UserCredential> = {
      user: {
        uid: 'test-user-id',
        email: 'test@example.com',
        displayName: 'Test User',
      } as any,
    };

    vi.mocked(firebaseAuthService.signIn).mockResolvedValue(mockUserCredential as UserCredential);
    vi.mocked(firebaseAuthService.getUserRole).mockResolvedValue('novia');

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn('test@example.com', 'password123');
    });

    expect(result.current.user).toEqual({
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'novia',
      displayName: 'Test User',
    });
    expect(result.current.userRole).toBe('novia');
    expect(result.current.error).toBe(null);
  });

  test('should handle sign in error', async () => {
    const errorMessage = 'Credenciales inválidas';
    vi.mocked(firebaseAuthService.signIn).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      try {
        await result.current.signIn('test@example.com', 'wrongpassword');
      } catch (error) {
        // Expected error
      }
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.user).toBe(null);
  });

  test('should sign out successfully', async () => {
    // Primero iniciar sesión
    const mockUserCredential: Partial<UserCredential> = {
      user: {
        uid: 'test-user-id',
        email: 'test@example.com',
      } as any,
    };

    vi.mocked(firebaseAuthService.signIn).mockResolvedValue(mockUserCredential as UserCredential);
    vi.mocked(firebaseAuthService.getUserRole).mockResolvedValue('usuario_principal');
    vi.mocked(firebaseAuthService.signOut).mockResolvedValue();

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn('test@example.com', 'password123');
    });

    expect(result.current.user).not.toBe(null);

    // Ahora cerrar sesión
    await act(async () => {
      await result.current.signOut();
    });

    expect(result.current.user).toBe(null);
    expect(result.current.userRole).toBe(null);
    expect(firebaseAuthService.signOut).toHaveBeenCalled();
  });

  test('should handle sign out error', async () => {
    const errorMessage = 'Error al cerrar sesión';
    vi.mocked(firebaseAuthService.signOut).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      try {
        await result.current.signOut();
      } catch (error) {
        // Expected error
      }
    });

    expect(result.current.error).toBe(errorMessage);
  });

  test('should subscribe to auth state changes on mount', () => {
    renderHook(() => useAuth());

    expect(firebaseAuthService.onAuthStateChanged).toHaveBeenCalled();
  });

  test('should unsubscribe from auth state changes on unmount', () => {
    const { unmount } = renderHook(() => useAuth());

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  test('should update user state when auth state changes', async () => {
    let authCallback: ((user: any) => void) | null = null;

    vi.mocked(firebaseAuthService.onAuthStateChanged).mockImplementation((callback) => {
      authCallback = callback;
      callback(null); // Inicialmente sin usuario
      return mockUnsubscribe as () => void;
    });

    vi.mocked(firebaseAuthService.getUserRole).mockResolvedValue('novia');

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Simular cambio de estado de autenticación
    const mockFirebaseUser = {
      uid: 'new-user-id',
      email: 'newuser@example.com',
      displayName: 'New User',
    };

    await act(async () => {
      if (authCallback) {
        authCallback(mockFirebaseUser);
      }
      // Esperar a que se resuelva getUserRole
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await waitFor(() => {
      expect(result.current.user).toEqual({
        id: 'new-user-id',
        email: 'newuser@example.com',
        role: 'novia',
        displayName: 'New User',
      });
      expect(result.current.userRole).toBe('novia');
    });
  });

  test('should handle error when getting user role fails', async () => {
    const errorMessage = 'Error al obtener rol de usuario';
    
    vi.mocked(firebaseAuthService.onAuthStateChanged).mockImplementation((callback) => {
      const mockFirebaseUser = {
        uid: 'test-user-id',
        email: 'test@example.com',
      };
      callback(mockFirebaseUser as any);
      return mockUnsubscribe as () => void;
    });

    vi.mocked(firebaseAuthService.getUserRole).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.user).toBe(null);
      expect(result.current.userRole).toBe(null);
    });
  });
});
