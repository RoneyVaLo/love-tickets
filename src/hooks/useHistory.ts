import { useState, useEffect, useCallback } from 'react';
import { firestoreTicketService } from '../services/tickets';
import type { Ticket, UseHistoryReturn, TicketStatus } from '../types';

/**
 * useHistory Hook
 * 
 * Custom hook para gestionar el histórico de tickets con filtros.
 * Suscribe a tickets con estados históricos (canjeado, completado, confirmado)
 * y los ordena por fecha de canje descendente.
 * 
 * @returns UseHistoryReturn con histórico de tickets y funciones de filtrado
 * 
 * Requirements: 8.1, 8.2, 8.4, 8.5
 */
export function useHistory(): UseHistoryReturn {
  const [allHistory, setAllHistory] = useState<Ticket[]>([]);
  const [history, setHistory] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFilter, setCurrentFilter] = useState<TicketStatus | 'all'>('all');

  // Suscribirse a cambios en tiempo real de todos los tickets
  useEffect(() => {
    setLoading(true);
    setError(null);

    // Suscribirse a todos los tickets
    const unsubscribe = firestoreTicketService.subscribeToTickets(
      'all',
      (updatedTickets) => {
        // Filtrar solo tickets con estados históricos (canjeado, completado, confirmado)
        // Requirement 8.2
        const historicalTickets = updatedTickets.filter(
          (ticket) =>
            ticket.status === 'canjeado' ||
            ticket.status === 'completado' ||
            ticket.status === 'confirmado'
        );

        // Ordenar por redeemedAt descendente (más reciente primero)
        // Requirement 8.4
        const sortedTickets = historicalTickets.sort((a, b) => {
          const aTime = a.timestamps.redeemedAt?.toMillis() ?? 0;
          const bTime = b.timestamps.redeemedAt?.toMillis() ?? 0;
          return bTime - aTime;
        });

        setAllHistory(sortedTickets);
        setLoading(false);
      }
    );

    // Cleanup: cancelar suscripción al desmontar
    return () => {
      unsubscribe();
    };
  }, []);

  // Aplicar filtro cuando cambia allHistory o currentFilter
  useEffect(() => {
    if (currentFilter === 'all') {
      setHistory(allHistory);
    } else {
      // Filtrar por estado específico
      // Requirement 8.5
      const filtered = allHistory.filter(
        (ticket) => ticket.status === currentFilter
      );
      setHistory(filtered);
    }
  }, [allHistory, currentFilter]);

  /**
   * Filtrar histórico por estado de ticket
   * Requirement 8.5
   * 
   * @param status - Estado por el cual filtrar ('all' para mostrar todos)
   */
  const filterByStatus = useCallback((status: TicketStatus | 'all'): void => {
    setCurrentFilter(status);
  }, []);

  return {
    history,
    loading,
    error,
    filterByStatus,
    currentFilter,
  };
}
