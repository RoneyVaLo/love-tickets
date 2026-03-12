import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { useTickets } from './useTickets';
import { firestoreTicketService } from '../services/tickets';
import type { Ticket } from '../types';
import { Timestamp } from 'firebase/firestore';

// Mock del servicio de tickets
vi.mock('../services/tickets', () => ({
  firestoreTicketService: {
    subscribeToTickets: vi.fn(),
    createTicket: vi.fn(),
    updateTicketStatus: vi.fn(),
    deleteTicket: vi.fn(),
    getTicketById: vi.fn(),
  },
}));

describe('useTickets Hook', () => {
  let mockUnsubscribe: ReturnType<typeof vi.fn>;
  let mockTickets: Ticket[];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUnsubscribe = vi.fn();

    // Mock tickets de prueba
    mockTickets = [
      {
        id: 'ticket-1',
        description: 'Cena romántica',
        status: 'pendiente',
        createdBy: 'usuario_principal',
        timestamps: {
          createdAt: Timestamp.now(),
        },
      },
      {
        id: 'ticket-2',
        description: 'Masaje relajante',
        status: 'canjeado',
        createdBy: 'usuario_principal',
        redeemedBy: 'novia',
        timestamps: {
          createdAt: Timestamp.now(),
          redeemedAt: Timestamp.now(),
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
          createdAt: Timestamp.now(),
          redeemedAt: Timestamp.now(),
          completedAt: Timestamp.now(),
        },
      },
      {
        id: 'ticket-4',
        description: 'Desayuno en cama',
        status: 'propuesto',
        createdBy: 'novia',
        timestamps: {
          createdAt: Timestamp.now(),
          proposedAt: Timestamp.now(),
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

      const { result } = renderHook(() => useTickets('novia'));

      expect(result.current.loading).toBe(true);
      expect(result.current.tickets).toEqual([]);
      expect(result.current.error).toBe(null);
    });

    test('should not subscribe if userRole is null', () => {
      const { result } = renderHook(() => useTickets(null));

      expect(result.current.loading).toBe(false);
      expect(firestoreTicketService.subscribeToTickets).not.toHaveBeenCalled();
    });

    test('should load tickets on mount', async () => {
      const { result } = renderHook(() => useTickets('novia'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.tickets).toEqual(mockTickets);
      expect(firestoreTicketService.subscribeToTickets).toHaveBeenCalledWith(
        'all',
        expect.any(Function)
      );
    });

    test('should unsubscribe on unmount', () => {
      const { unmount } = renderHook(() => useTickets('novia'));

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });

  describe('redeemTicket', () => {
    test('should allow Novia to redeem pending ticket', async () => {
      vi.mocked(firestoreTicketService.updateTicketStatus).mockResolvedValue();

      const { result } = renderHook(() => useTickets('novia'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.redeemTicket('ticket-1');
      });

      expect(firestoreTicketService.updateTicketStatus).toHaveBeenCalledWith(
        'ticket-1',
        'canjeado',
        { redeemedBy: 'novia' }
      );
      expect(result.current.error).toBe(null);
    });

    test('should reject redeem if user is not Novia', async () => {
      const { result } = renderHook(() => useTickets('usuario_principal'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.redeemTicket('ticket-1');
        } catch (error: any) {
          expect(error.message).toBe('Solo la Novia puede canjear tickets');
        }
      });

      expect(firestoreTicketService.updateTicketStatus).not.toHaveBeenCalled();
      expect(result.current.error).toBe('Solo la Novia puede canjear tickets');
    });

    test('should reject redeem if ticket is not pending', async () => {
      const { result } = renderHook(() => useTickets('novia'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.redeemTicket('ticket-2'); // canjeado
        } catch (error: any) {
          expect(error.message).toBe('Solo se pueden canjear tickets pendientes');
        }
      });

      expect(firestoreTicketService.updateTicketStatus).not.toHaveBeenCalled();
      expect(result.current.error).toBe('Solo se pueden canjear tickets pendientes');
    });

    test('should reject redeem if ticket not found', async () => {
      const { result } = renderHook(() => useTickets('novia'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.redeemTicket('non-existent');
        } catch (error: any) {
          expect(error.message).toBe('Ticket no encontrado');
        }
      });

      expect(firestoreTicketService.updateTicketStatus).not.toHaveBeenCalled();
    });
  });

  describe('completeTicket', () => {
    test('should allow Usuario Principal to complete redeemed ticket', async () => {
      vi.mocked(firestoreTicketService.updateTicketStatus).mockResolvedValue();

      const { result } = renderHook(() => useTickets('usuario_principal'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.completeTicket('ticket-2');
      });

      expect(firestoreTicketService.updateTicketStatus).toHaveBeenCalledWith(
        'ticket-2',
        'completado',
        { completedBy: 'usuario_principal' }
      );
      expect(result.current.error).toBe(null);
    });

    test('should reject complete if user is not Usuario Principal', async () => {
      const { result } = renderHook(() => useTickets('novia'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.completeTicket('ticket-2');
        } catch (error: any) {
          expect(error.message).toBe('Solo el Usuario Principal puede marcar tickets como completados');
        }
      });

      expect(firestoreTicketService.updateTicketStatus).not.toHaveBeenCalled();
    });

    test('should reject complete if ticket is not redeemed', async () => {
      const { result } = renderHook(() => useTickets('usuario_principal'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.completeTicket('ticket-1'); // pendiente
        } catch (error: any) {
          expect(error.message).toBe('Solo se pueden completar tickets canjeados');
        }
      });

      expect(firestoreTicketService.updateTicketStatus).not.toHaveBeenCalled();
    });
  });

  describe('confirmTicket', () => {
    test('should allow Novia to confirm completed ticket', async () => {
      vi.mocked(firestoreTicketService.updateTicketStatus).mockResolvedValue();

      const { result } = renderHook(() => useTickets('novia'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.confirmTicket('ticket-3');
      });

      expect(firestoreTicketService.updateTicketStatus).toHaveBeenCalledWith(
        'ticket-3',
        'confirmado',
        { confirmedBy: 'novia' }
      );
      expect(result.current.error).toBe(null);
    });

    test('should reject confirm if user is not Novia', async () => {
      const { result } = renderHook(() => useTickets('usuario_principal'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.confirmTicket('ticket-3');
        } catch (error: any) {
          expect(error.message).toBe('Solo la Novia puede confirmar tickets');
        }
      });

      expect(firestoreTicketService.updateTicketStatus).not.toHaveBeenCalled();
    });

    test('should reject confirm if ticket is not completed', async () => {
      const { result } = renderHook(() => useTickets('novia'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.confirmTicket('ticket-2'); // canjeado
        } catch (error: any) {
          expect(error.message).toBe('Solo se pueden confirmar tickets completados');
        }
      });

      expect(firestoreTicketService.updateTicketStatus).not.toHaveBeenCalled();
    });
  });

  describe('rejectCompletion', () => {
    test('should allow Novia to reject completion and revert to redeemed', async () => {
      vi.mocked(firestoreTicketService.updateTicketStatus).mockResolvedValue();

      const { result } = renderHook(() => useTickets('novia'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.rejectCompletion('ticket-3');
      });

      expect(firestoreTicketService.updateTicketStatus).toHaveBeenCalledWith(
        'ticket-3',
        'canjeado'
      );
      expect(result.current.error).toBe(null);
    });

    test('should reject rejectCompletion if user is not Novia', async () => {
      const { result } = renderHook(() => useTickets('usuario_principal'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.rejectCompletion('ticket-3');
        } catch (error: any) {
          expect(error.message).toBe('Solo la Novia puede rechazar la completitud de tickets');
        }
      });

      expect(firestoreTicketService.updateTicketStatus).not.toHaveBeenCalled();
    });

    test('should reject rejectCompletion if ticket is not completed', async () => {
      const { result } = renderHook(() => useTickets('novia'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.rejectCompletion('ticket-2'); // canjeado
        } catch (error: any) {
          expect(error.message).toBe('Solo se puede rechazar la completitud de tickets completados');
        }
      });

      expect(firestoreTicketService.updateTicketStatus).not.toHaveBeenCalled();
    });
  });

  describe('proposeTicket', () => {
    test('should allow Novia to propose new ticket', async () => {
      vi.mocked(firestoreTicketService.createTicket).mockResolvedValue('new-ticket-id');

      const { result } = renderHook(() => useTickets('novia'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.proposeTicket('Nueva actividad propuesta');
      });

      expect(firestoreTicketService.createTicket).toHaveBeenCalledWith({
        description: 'Nueva actividad propuesta',
        status: 'propuesto',
        createdBy: 'novia',
      });
      expect(result.current.error).toBe(null);
    });

    test('should reject propose if user is not Novia', async () => {
      const { result } = renderHook(() => useTickets('usuario_principal'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.proposeTicket('Nueva actividad');
        } catch (error: any) {
          expect(error.message).toBe('Solo la Novia puede proponer tickets');
        }
      });

      expect(firestoreTicketService.createTicket).not.toHaveBeenCalled();
    });

    test('should handle validation errors from service', async () => {
      vi.mocked(firestoreTicketService.createTicket).mockRejectedValue(
        new Error('La descripción debe tener al menos 5 caracteres')
      );

      const { result } = renderHook(() => useTickets('novia'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.proposeTicket('abc');
        } catch (error: any) {
          expect(error.message).toBe('La descripción debe tener al menos 5 caracteres');
        }
      });

      expect(result.current.error).toBe('La descripción debe tener al menos 5 caracteres');
    });
  });

  describe('approveProposal', () => {
    test('should allow Usuario Principal to approve proposal', async () => {
      vi.mocked(firestoreTicketService.updateTicketStatus).mockResolvedValue();

      const { result } = renderHook(() => useTickets('usuario_principal'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.approveProposal('ticket-4');
      });

      expect(firestoreTicketService.updateTicketStatus).toHaveBeenCalledWith(
        'ticket-4',
        'pendiente'
      );
      expect(result.current.error).toBe(null);
    });

    test('should reject approve if user is not Usuario Principal', async () => {
      const { result } = renderHook(() => useTickets('novia'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.approveProposal('ticket-4');
        } catch (error: any) {
          expect(error.message).toBe('Solo el Usuario Principal puede aprobar propuestas');
        }
      });

      expect(firestoreTicketService.updateTicketStatus).not.toHaveBeenCalled();
    });

    test('should reject approve if ticket is not proposed', async () => {
      const { result } = renderHook(() => useTickets('usuario_principal'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.approveProposal('ticket-1'); // pendiente
        } catch (error: any) {
          expect(error.message).toBe('Solo se pueden aprobar tickets propuestos');
        }
      });

      expect(firestoreTicketService.updateTicketStatus).not.toHaveBeenCalled();
    });
  });

  describe('rejectProposal', () => {
    test('should allow Usuario Principal to reject proposal', async () => {
      vi.mocked(firestoreTicketService.deleteTicket).mockResolvedValue();

      const { result } = renderHook(() => useTickets('usuario_principal'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.rejectProposal('ticket-4', 'No es apropiado');
      });

      expect(firestoreTicketService.deleteTicket).toHaveBeenCalledWith('ticket-4');
      expect(result.current.error).toBe(null);
    });

    test('should reject rejectProposal if user is not Usuario Principal', async () => {
      const { result } = renderHook(() => useTickets('novia'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.rejectProposal('ticket-4', 'Razón');
        } catch (error: any) {
          expect(error.message).toBe('Solo el Usuario Principal puede rechazar propuestas');
        }
      });

      expect(firestoreTicketService.deleteTicket).not.toHaveBeenCalled();
    });

    test('should reject rejectProposal if ticket is not proposed', async () => {
      const { result } = renderHook(() => useTickets('usuario_principal'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.rejectProposal('ticket-1', 'Razón'); // pendiente
        } catch (error: any) {
          expect(error.message).toBe('Solo se pueden rechazar tickets propuestos');
        }
      });

      expect(firestoreTicketService.deleteTicket).not.toHaveBeenCalled();
    });
  });

  describe('Real-time updates', () => {
    test('should update tickets when Firestore data changes', async () => {
      let subscriptionCallback: ((tickets: Ticket[]) => void) | null = null;

      vi.mocked(firestoreTicketService.subscribeToTickets).mockImplementation(
        (_status, callback) => {
          subscriptionCallback = callback;
          callback(mockTickets);
          return mockUnsubscribe as () => void;
        }
      );

      const { result } = renderHook(() => useTickets('novia'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.tickets).toEqual(mockTickets);

      // Simular actualización de datos
      const updatedTickets = [
        ...mockTickets,
        {
          id: 'ticket-5',
          description: 'Nuevo ticket',
          status: 'pendiente' as const,
          createdBy: 'usuario_principal',
          timestamps: {
            createdAt: Timestamp.now(),
          },
        },
      ];

      act(() => {
        if (subscriptionCallback) {
          subscriptionCallback(updatedTickets);
        }
      });

      await waitFor(() => {
        expect(result.current.tickets).toEqual(updatedTickets);
      });
    });
  });
});
