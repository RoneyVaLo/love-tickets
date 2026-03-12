import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { useHistory } from './useHistory';
import { firestoreTicketService } from '../services/tickets';
import type { Ticket } from '../types';
import { Timestamp } from 'firebase/firestore';

// Mock del servicio de tickets
vi.mock('../services/tickets', () => ({
  firestoreTicketService: {
    subscribeToTickets: vi.fn(),
  },
}));

describe('useHistory Hook', () => {
  let mockUnsubscribe: ReturnType<typeof vi.fn>;
  let mockTickets: Ticket[];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUnsubscribe = vi.fn();

    // Mock tickets de prueba con diferentes estados y timestamps
    const now = Date.now();
    mockTickets = [
      {
        id: 'ticket-1',
        description: 'Cena romántica',
        status: 'pendiente',
        createdBy: 'usuario_principal',
        timestamps: {
          createdAt: Timestamp.fromMillis(now - 10000),
        },
      },
      {
        id: 'ticket-2',
        description: 'Masaje relajante',
        status: 'canjeado',
        createdBy: 'usuario_principal',
        redeemedBy: 'novia',
        timestamps: {
          createdAt: Timestamp.fromMillis(now - 9000),
          redeemedAt: Timestamp.fromMillis(now - 5000),
        },
      },
      {
        id: 'ticket-3',
        description: 'Película favorita',
        status: 'completado',
        createdBy: 'usuario_principal',
        redeemedBy: 'novia',
        completedBy: 'usuario_principal',
        timestamps: {
          createdAt: Timestamp.fromMillis(now - 8000),
          redeemedAt: Timestamp.fromMillis(now - 3000),
          completedAt: Timestamp.fromMillis(now - 2000),
        },
      },
      {
        id: 'ticket-4',
        description: 'Desayuno en cama',
        status: 'confirmado',
        createdBy: 'usuario_principal',
        redeemedBy: 'novia',
        completedBy: 'usuario_principal',
        confirmedBy: 'novia',
        timestamps: {
          createdAt: Timestamp.fromMillis(now - 7000),
          redeemedAt: Timestamp.fromMillis(now - 1000),
          completedAt: Timestamp.fromMillis(now - 500),
          confirmedAt: Timestamp.fromMillis(now - 100),
        },
      },
      {
        id: 'ticket-5',
        description: 'Paseo por el parque',
        status: 'propuesto',
        createdBy: 'novia',
        timestamps: {
          createdAt: Timestamp.fromMillis(now - 6000),
          proposedAt: Timestamp.fromMillis(now - 6000),
        },
      },
      {
        id: 'ticket-6',
        description: 'Cocinar juntos',
        status: 'canjeado',
        createdBy: 'usuario_principal',
        redeemedBy: 'novia',
        timestamps: {
          createdAt: Timestamp.fromMillis(now - 5000),
          redeemedAt: Timestamp.fromMillis(now - 4000),
        },
      },
    ];

    // Mock por defecto de subscribeToTickets
    vi.mocked(firestoreTicketService.subscribeToTickets).mockImplementation(
      (_status, callback) => {
        callback(mockTickets);
        return mockUnsubscribe as () => void;
      }
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    test('should initialize with loading true', () => {
      vi.mocked(firestoreTicketService.subscribeToTickets).mockImplementation(
        () => mockUnsubscribe as () => void
      );

      const { result } = renderHook(() => useHistory());

      expect(result.current.loading).toBe(true);
      expect(result.current.history).toEqual([]);
      expect(result.current.error).toBe(null);
      expect(result.current.currentFilter).toBe('all');
    });

    test('should subscribe to all tickets on mount', async () => {
      renderHook(() => useHistory());

      await waitFor(() => {
        expect(firestoreTicketService.subscribeToTickets).toHaveBeenCalledWith(
          'all',
          expect.any(Function)
        );
      });
    });

    test('should unsubscribe on unmount', () => {
      const { unmount } = renderHook(() => useHistory());

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });

  describe('Historical Tickets Filtering (Requirement 8.2)', () => {
    test('should only include tickets with historical states (canjeado, completado, confirmado)', async () => {
      const { result } = renderHook(() => useHistory());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Debe incluir solo tickets con estados: canjeado, completado, confirmado
      expect(result.current.history).toHaveLength(4);
      
      const statuses = result.current.history.map(t => t.status);
      expect(statuses).toContain('canjeado');
      expect(statuses).toContain('completado');
      expect(statuses).toContain('confirmado');
      
      // No debe incluir pendiente ni propuesto
      expect(statuses).not.toContain('pendiente');
      expect(statuses).not.toContain('propuesto');
    });

    test('should exclude pending tickets from history', async () => {
      const { result } = renderHook(() => useHistory());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const pendingTicket = result.current.history.find(t => t.id === 'ticket-1');
      expect(pendingTicket).toBeUndefined();
    });

    test('should exclude proposed tickets from history', async () => {
      const { result } = renderHook(() => useHistory());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const proposedTicket = result.current.history.find(t => t.id === 'ticket-5');
      expect(proposedTicket).toBeUndefined();
    });
  });

  describe('Ordering by redeemedAt (Requirement 8.4)', () => {
    test('should order tickets by redeemedAt descending (most recent first)', async () => {
      const { result } = renderHook(() => useHistory());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Verificar que están ordenados por redeemedAt descendente
      const history = result.current.history;
      expect(history).toHaveLength(4);
      
      // El orden esperado basado en los timestamps:
      // ticket-4: now - 1000 (más reciente)
      // ticket-3: now - 3000
      // ticket-6: now - 4000
      // ticket-2: now - 5000 (más antiguo)
      expect(history[0].id).toBe('ticket-4');
      expect(history[1].id).toBe('ticket-3');
      expect(history[2].id).toBe('ticket-6');
      expect(history[3].id).toBe('ticket-2');
    });

    test('should maintain descending order when new tickets are added', async () => {
      let subscriptionCallback: ((tickets: Ticket[]) => void) | null = null;

      vi.mocked(firestoreTicketService.subscribeToTickets).mockImplementation(
        (_status, callback) => {
          subscriptionCallback = callback;
          callback(mockTickets);
          return mockUnsubscribe as () => void;
        }
      );

      const { result } = renderHook(() => useHistory());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Agregar un nuevo ticket con timestamp más reciente
      const now = Date.now();
      const newTicket: Ticket = {
        id: 'ticket-7',
        description: 'Nuevo ticket',
        status: 'canjeado',
        createdBy: 'usuario_principal',
        redeemedBy: 'novia',
        timestamps: {
          createdAt: Timestamp.fromMillis(now - 1000),
          redeemedAt: Timestamp.fromMillis(now), // Más reciente
        },
      };

      act(() => {
        if (subscriptionCallback) {
          subscriptionCallback([...mockTickets, newTicket]);
        }
      });

      await waitFor(() => {
        expect(result.current.history[0].id).toBe('ticket-7');
      });
    });
  });

  describe('filterByStatus (Requirement 8.5)', () => {
    test('should show all historical tickets when filter is "all"', async () => {
      const { result } = renderHook(() => useHistory());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.currentFilter).toBe('all');
      expect(result.current.history).toHaveLength(4);
    });

    test('should filter by "canjeado" status', async () => {
      const { result } = renderHook(() => useHistory());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.filterByStatus('canjeado');
      });

      await waitFor(() => {
        expect(result.current.currentFilter).toBe('canjeado');
        expect(result.current.history).toHaveLength(2);
        expect(result.current.history.every(t => t.status === 'canjeado')).toBe(true);
      });
    });

    test('should filter by "completado" status', async () => {
      const { result } = renderHook(() => useHistory());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.filterByStatus('completado');
      });

      await waitFor(() => {
        expect(result.current.currentFilter).toBe('completado');
        expect(result.current.history).toHaveLength(1);
        expect(result.current.history[0].status).toBe('completado');
        expect(result.current.history[0].id).toBe('ticket-3');
      });
    });

    test('should filter by "confirmado" status', async () => {
      const { result } = renderHook(() => useHistory());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.filterByStatus('confirmado');
      });

      await waitFor(() => {
        expect(result.current.currentFilter).toBe('confirmado');
        expect(result.current.history).toHaveLength(1);
        expect(result.current.history[0].status).toBe('confirmado');
        expect(result.current.history[0].id).toBe('ticket-4');
      });
    });

    test('should return to all tickets when filter is set back to "all"', async () => {
      const { result } = renderHook(() => useHistory());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Filtrar por canjeado
      act(() => {
        result.current.filterByStatus('canjeado');
      });

      await waitFor(() => {
        expect(result.current.history).toHaveLength(2);
      });

      // Volver a mostrar todos
      act(() => {
        result.current.filterByStatus('all');
      });

      await waitFor(() => {
        expect(result.current.currentFilter).toBe('all');
        expect(result.current.history).toHaveLength(4);
      });
    });

    test('should maintain order when filtering', async () => {
      const { result } = renderHook(() => useHistory());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.filterByStatus('canjeado');
      });

      await waitFor(() => {
        const history = result.current.history;
        expect(history).toHaveLength(2);
        
        // Verificar que mantiene el orden descendente por redeemedAt
        // ticket-6: now - 4000
        // ticket-2: now - 5000
        expect(history[0].id).toBe('ticket-6');
        expect(history[1].id).toBe('ticket-2');
      });
    });

    test('should return empty array when filtering by status with no matches', async () => {
      // Crear tickets sin ninguno en estado completado
      const ticketsWithoutCompleted = mockTickets.filter(t => t.status !== 'completado');
      
      vi.mocked(firestoreTicketService.subscribeToTickets).mockImplementation(
        (_status, callback) => {
          callback(ticketsWithoutCompleted);
          return mockUnsubscribe as () => void;
        }
      );

      const { result } = renderHook(() => useHistory());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.filterByStatus('completado');
      });

      await waitFor(() => {
        expect(result.current.history).toHaveLength(0);
      });
    });
  });

  describe('Real-time updates', () => {
    test('should update history when Firestore data changes', async () => {
      let subscriptionCallback: ((tickets: Ticket[]) => void) | null = null;

      vi.mocked(firestoreTicketService.subscribeToTickets).mockImplementation(
        (_status, callback) => {
          subscriptionCallback = callback;
          callback(mockTickets);
          return mockUnsubscribe as () => void;
        }
      );

      const { result } = renderHook(() => useHistory());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const initialLength = result.current.history.length;

      // Simular que un ticket pendiente se canjea
      const now = Date.now();
      const updatedTickets = mockTickets.map(t => 
        t.id === 'ticket-1' 
          ? {
              ...t,
              status: 'canjeado' as const,
              redeemedBy: 'novia',
              timestamps: {
                ...t.timestamps,
                redeemedAt: Timestamp.fromMillis(now),
              },
            }
          : t
      );

      act(() => {
        if (subscriptionCallback) {
          subscriptionCallback(updatedTickets);
        }
      });

      await waitFor(() => {
        // Ahora debe incluir el ticket que cambió a canjeado
        expect(result.current.history.length).toBe(initialLength + 1);
        expect(result.current.history.some(t => t.id === 'ticket-1')).toBe(true);
      });
    });

    test('should update filtered history when data changes', async () => {
      let subscriptionCallback: ((tickets: Ticket[]) => void) | null = null;

      vi.mocked(firestoreTicketService.subscribeToTickets).mockImplementation(
        (_status, callback) => {
          subscriptionCallback = callback;
          callback(mockTickets);
          return mockUnsubscribe as () => void;
        }
      );

      const { result } = renderHook(() => useHistory());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Filtrar por completado
      act(() => {
        result.current.filterByStatus('completado');
      });

      await waitFor(() => {
        expect(result.current.history).toHaveLength(1);
      });

      // Simular que un ticket canjeado se completa
      const now = Date.now();
      const updatedTickets = mockTickets.map(t => 
        t.id === 'ticket-2' 
          ? {
              ...t,
              status: 'completado' as const,
              completedBy: 'usuario_principal',
              timestamps: {
                ...t.timestamps,
                completedAt: Timestamp.fromMillis(now),
              },
            }
          : t
      );

      act(() => {
        if (subscriptionCallback) {
          subscriptionCallback(updatedTickets);
        }
      });

      await waitFor(() => {
        // Ahora debe mostrar 2 tickets completados
        expect(result.current.history).toHaveLength(2);
        expect(result.current.history.every(t => t.status === 'completado')).toBe(true);
      });
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty ticket list', async () => {
      vi.mocked(firestoreTicketService.subscribeToTickets).mockImplementation(
        (_status, callback) => {
          callback([]);
          return mockUnsubscribe as () => void;
        }
      );

      const { result } = renderHook(() => useHistory());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.history).toEqual([]);
    });

    test('should handle tickets without redeemedAt timestamp', async () => {
      const ticketsWithoutRedeemedAt: Ticket[] = [
        {
          id: 'ticket-1',
          description: 'Ticket sin redeemedAt',
          status: 'canjeado',
          createdBy: 'usuario_principal',
          timestamps: {
            createdAt: Timestamp.now(),
            // redeemedAt faltante
          },
        },
      ];

      vi.mocked(firestoreTicketService.subscribeToTickets).mockImplementation(
        (_status, callback) => {
          callback(ticketsWithoutRedeemedAt);
          return mockUnsubscribe as () => void;
        }
      );

      const { result } = renderHook(() => useHistory());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // No debe fallar, debe manejar el caso con timestamp 0
      expect(result.current.history).toHaveLength(1);
    });
  });
});
