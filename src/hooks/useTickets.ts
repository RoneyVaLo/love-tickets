import { useState, useEffect, useCallback } from 'react';
import { firestoreTicketService } from '../services/tickets';
import type { Ticket, UseTicketsReturn, UserRole } from '../types';

/**
 * useTickets Hook
 * 
 * Custom hook para gestionar tickets con sincronización en tiempo real desde Firestore.
 * Proporciona funciones para todas las operaciones de tickets con validación de roles.
 * 
 * @param userRole - Rol del usuario actual ('usuario_principal' | 'novia')
 * @returns UseTicketsReturn con estado de tickets y funciones de operación
 * 
 * Requirements: 2.3, 3.1, 3.2, 4.2, 4.3, 5.2, 5.3, 5.5, 6.1, 6.2, 6.3, 7.2, 7.3, 9.3, 11.3, 11.4, 11.5
 */
export function useTickets(userRole: UserRole | null): UseTicketsReturn {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Suscribirse a cambios en tiempo real de todos los tickets
  useEffect(() => {
    if (!userRole) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Suscribirse a todos los tickets
    const unsubscribe = firestoreTicketService.subscribeToTickets(
      'all',
      (updatedTickets) => {
        setTickets(updatedTickets);
        setLoading(false);
      }
    );

    // Cleanup: cancelar suscripción al desmontar
    return () => {
      unsubscribe();
    };
  }, [userRole]);

  /**
   * Canjear un ticket pendiente (solo Novia)
   * Requirements: 3.1, 3.2, 11.4
   */
  const redeemTicket = useCallback(
    async (ticketId: string): Promise<void> => {
      try {
        setError(null);

        // Validar rol
        if (userRole !== 'novia') {
          throw new Error('Solo la Novia puede canjear tickets');
        }

        // Validar que el ticket existe y está en estado pendiente
        const ticket = tickets.find((t) => t.id === ticketId);
        if (!ticket) {
          throw new Error('Ticket no encontrado');
        }

        if (ticket.status !== 'pendiente') {
          throw new Error('Solo se pueden canjear tickets pendientes');
        }

        // Actualizar estado a canjeado
        await firestoreTicketService.updateTicketStatus(
          ticketId,
          'canjeado',
          { redeemedBy: userRole }
        );
      } catch (err: any) {
        const errorMessage = err.message || 'Error al canjear ticket';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [userRole, tickets]
  );

  /**
   * Marcar un ticket canjeado como completado (solo Usuario Principal)
   * Requirements: 4.2, 4.3, 11.5
   */
  const completeTicket = useCallback(
    async (ticketId: string): Promise<void> => {
      try {
        setError(null);

        // Validar rol
        if (userRole !== 'usuario_principal') {
          throw new Error('Solo el Usuario Principal puede marcar tickets como completados');
        }

        // Validar que el ticket existe y está en estado canjeado
        const ticket = tickets.find((t) => t.id === ticketId);
        if (!ticket) {
          throw new Error('Ticket no encontrado');
        }

        if (ticket.status !== 'canjeado') {
          throw new Error('Solo se pueden completar tickets canjeados');
        }

        // Actualizar estado a completado
        await firestoreTicketService.updateTicketStatus(
          ticketId,
          'completado',
          { completedBy: userRole }
        );
      } catch (err: any) {
        const errorMessage = err.message || 'Error al completar ticket';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [userRole, tickets]
  );

  /**
   * Confirmar que un ticket completado fue realizado satisfactoriamente (solo Novia)
   * Requirements: 5.2, 5.3, 11.4
   */
  const confirmTicket = useCallback(
    async (ticketId: string): Promise<void> => {
      try {
        setError(null);

        // Validar rol
        if (userRole !== 'novia') {
          throw new Error('Solo la Novia puede confirmar tickets');
        }

        // Validar que el ticket existe y está en estado completado
        const ticket = tickets.find((t) => t.id === ticketId);
        if (!ticket) {
          throw new Error('Ticket no encontrado');
        }

        if (ticket.status !== 'completado') {
          throw new Error('Solo se pueden confirmar tickets completados');
        }

        // Actualizar estado a confirmado
        await firestoreTicketService.updateTicketStatus(
          ticketId,
          'confirmado',
          { confirmedBy: userRole }
        );
      } catch (err: any) {
        const errorMessage = err.message || 'Error al confirmar ticket';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [userRole, tickets]
  );

  /**
   * Rechazar la completitud de un ticket, revirtiéndolo a estado canjeado (solo Novia)
   * Requirements: 5.5, 11.4
   */
  const rejectCompletion = useCallback(
    async (ticketId: string): Promise<void> => {
      try {
        setError(null);

        // Validar rol
        if (userRole !== 'novia') {
          throw new Error('Solo la Novia puede rechazar la completitud de tickets');
        }

        // Validar que el ticket existe y está en estado completado
        const ticket = tickets.find((t) => t.id === ticketId);
        if (!ticket) {
          throw new Error('Ticket no encontrado');
        }

        if (ticket.status !== 'completado') {
          throw new Error('Solo se puede rechazar la completitud de tickets completados');
        }

        // Revertir estado a canjeado
        await firestoreTicketService.updateTicketStatus(ticketId, 'canjeado');
      } catch (err: any) {
        const errorMessage = err.message || 'Error al rechazar completitud';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [userRole, tickets]
  );

  /**
   * Proponer un nuevo ticket (solo Novia)
   * Requirements: 6.1, 6.2, 6.3, 11.4
   */
  const proposeTicket = useCallback(
    async (description: string): Promise<void> => {
      try {
        setError(null);

        // Validar rol
        if (userRole !== 'novia') {
          throw new Error('Solo la Novia puede proponer tickets');
        }

        // La validación de descripción se hace en el servicio
        // Crear ticket con estado propuesto
        await firestoreTicketService.createTicket({
          description,
          status: 'propuesto',
          createdBy: userRole,
        });
      } catch (err: any) {
        const errorMessage = err.message || 'Error al proponer ticket';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [userRole]
  );

  /**
   * Aprobar un ticket propuesto, cambiándolo a estado pendiente (solo Usuario Principal)
   * Requirements: 7.2, 11.5
   */
  const approveProposal = useCallback(
    async (ticketId: string): Promise<void> => {
      try {
        setError(null);

        // Validar rol
        if (userRole !== 'usuario_principal') {
          throw new Error('Solo el Usuario Principal puede aprobar propuestas');
        }

        // Validar que el ticket existe y está en estado propuesto
        const ticket = tickets.find((t) => t.id === ticketId);
        if (!ticket) {
          throw new Error('Ticket no encontrado');
        }

        if (ticket.status !== 'propuesto') {
          throw new Error('Solo se pueden aprobar tickets propuestos');
        }

        // Actualizar estado a pendiente
        await firestoreTicketService.updateTicketStatus(ticketId, 'pendiente');
      } catch (err: any) {
        const errorMessage = err.message || 'Error al aprobar propuesta';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [userRole, tickets]
  );

  /**
   * Rechazar un ticket propuesto, eliminándolo del sistema (solo Usuario Principal)
   * Requirements: 7.3, 11.5
   */
  const rejectProposal = useCallback(
    async (ticketId: string, _reason: string): Promise<void> => {
      try {
        setError(null);

        // Validar rol
        if (userRole !== 'usuario_principal') {
          throw new Error('Solo el Usuario Principal puede rechazar propuestas');
        }

        // Validar que el ticket existe y está en estado propuesto
        const ticket = tickets.find((t) => t.id === ticketId);
        if (!ticket) {
          throw new Error('Ticket no encontrado');
        }

        if (ticket.status !== 'propuesto') {
          throw new Error('Solo se pueden rechazar tickets propuestos');
        }

        // Eliminar ticket del sistema
        await firestoreTicketService.deleteTicket(ticketId);
      } catch (err: any) {
        const errorMessage = err.message || 'Error al rechazar propuesta';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [userRole, tickets]
  );

  return {
    tickets,
    loading,
    error,
    redeemTicket,
    completeTicket,
    confirmTicket,
    rejectCompletion,
    proposeTicket,
    approveProposal,
    rejectProposal,
  };
}
