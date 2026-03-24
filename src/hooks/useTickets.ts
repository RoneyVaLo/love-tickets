import { useState, useEffect, useCallback, useRef } from 'react';
import { firestoreTicketService } from '../services/tickets';
import type { Ticket, UseTicketsReturn, UserRole } from '../types';
import type { NotificationType } from './useNotifications';

type AddNotificationFn = (message: string, type?: NotificationType) => void;

/**
 * Detecta cambios entre el snapshot anterior y el nuevo y dispara notificaciones
 * para el usuario actual basándose en qué cambió el otro usuario.
 *
 * La notificación le llega al usuario que RECIBE el efecto de la acción,
 * no al que la ejecutó.
 *
 * Requirements: 3.3, 4.4, 6.4, 7.4, 7.5
 */
function detectAndNotify(
  prev: Ticket[],
  next: Ticket[],
  userRole: UserRole,
  addNotification: AddNotificationFn,
  isFirstLoad: boolean
) {
  if (isFirstLoad) return;

  const prevMap = new Map(prev.map((t) => [t.id, t]));

  for (const ticket of next) {
    const old = prevMap.get(ticket.id);

    if (!old) {
      // Ticket nuevo: solo le interesa al usuario_principal (req 6.4)
      if (userRole === 'usuario_principal' && ticket.status === 'propuesto') {
        addNotification(`Nueva propuesta: "${ticket.description}"`, 'info');
      }
      continue;
    }

    if (old.status === ticket.status) continue;

    const { status, description } = ticket;

    if (userRole === 'usuario_principal') {
      // Req 3.3: Novia canjeó un ticket → notificar al Usuario Principal
      if (old.status === 'pendiente' && status === 'canjeado') {
        addNotification(`Ticket canjeado: "${description}"`, 'info');
      }
    }

    if (userRole === 'novia') {
      // Req 4.4: Usuario Principal completó un ticket → notificar a la Novia
      if (old.status === 'canjeado' && status === 'completado') {
        addNotification(`Ticket completado: "${description}"`, 'success');
      }
      // Req 7.4: Usuario Principal aprobó una propuesta → notificar a la Novia
      if (old.status === 'propuesto' && status === 'pendiente') {
        addNotification(`Propuesta aprobada: "${description}"`, 'success');
      }
    }
  }

  // Req 7.5: ticket propuesto desapareció → fue rechazado → notificar a la Novia
  if (userRole === 'novia') {
    const nextIds = new Set(next.map((t) => t.id));
    for (const old of prev) {
      if (old.status === 'propuesto' && !nextIds.has(old.id)) {
        addNotification(`Propuesta rechazada: "${old.description}"`, 'warning');
      }
    }
  }
}

/**
 * useTickets Hook
 *
 * Custom hook para gestionar tickets con sincronización en tiempo real desde Firestore.
 * Las notificaciones se disparan reactivamente desde el listener cuando el otro usuario
 * realiza una acción, no desde las funciones de acción del usuario actual.
 *
 * Requirements: 2.3, 3.1, 3.2, 3.3, 4.2, 4.3, 4.4, 5.2, 5.3, 5.5, 6.1, 6.2, 6.3,
 *               6.4, 7.2, 7.3, 7.4, 7.5, 9.3, 11.3, 11.4, 11.5
 */
export function useTickets(
  userRole: UserRole | null,
  addNotification?: AddNotificationFn
): UseTicketsReturn {
  const WEEKLY_REDEEM_LIMIT = 3;

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Cuenta cuántos tickets fueron canjeados en los últimos 7 días
   */
  const weeklyRedeemCount = tickets.filter((t) => {
    if (!t.timestamps.redeemedAt) return false;
    const redeemedAt = t.timestamps.redeemedAt.toDate
      ? t.timestamps.redeemedAt.toDate()
      : new Date(t.timestamps.redeemedAt as any);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return redeemedAt >= sevenDaysAgo;
  }).length;

  const weeklyLimitReached = weeklyRedeemCount >= WEEKLY_REDEEM_LIMIT;

  // Ref para comparar snapshots sin re-crear el listener
  const prevTicketsRef = useRef<Ticket[]>([]);
  const isFirstLoadRef = useRef(true);

  // Suscribirse a cambios en tiempo real de todos los tickets
  useEffect(() => {
    if (!userRole) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    isFirstLoadRef.current = true;

    const unsubscribe = firestoreTicketService.subscribeToTickets(
      'all',
      (updatedTickets) => {
        if (addNotification) {
          detectAndNotify(
            prevTicketsRef.current,
            updatedTickets,
            userRole,
            addNotification,
            isFirstLoadRef.current
          );
        }

        prevTicketsRef.current = updatedTickets;
        isFirstLoadRef.current = false;
        setTickets(updatedTickets);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [userRole, addNotification]);

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

        // Validar límite semanal de canjes
        if (weeklyLimitReached) {
          throw new Error(`Has alcanzado el límite de ${WEEKLY_REDEEM_LIMIT} canjes por semana`);
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
    [userRole, tickets, addNotification]
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
    [userRole, tickets, addNotification]
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
    [userRole, addNotification]
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
    [userRole, tickets, addNotification]
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
    [userRole, tickets, addNotification]
  );

  return {
    tickets,
    loading,
    error,
    weeklyRedeemCount,
    weeklyLimitReached,
    redeemTicket,
    completeTicket,
    confirmTicket,
    rejectCompletion,
    proposeTicket,
    approveProposal,
    rejectProposal,
  };
}
