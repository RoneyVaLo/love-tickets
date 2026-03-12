import React from 'react';
import { useHistory } from '../hooks/useHistory';
import { useAuth } from '../hooks/useAuth';
import TicketCardComponent from './TicketCardComponent';
import type { TicketStatus } from '../types';

/**
 * HistoryComponent - Displays historical tickets with filtering
 * 
 * Validates Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 10.1, 10.2, 10.3, 10.4
 * 
 * Features:
 * - Shows list of historical tickets (canjeado, completado, confirmado)
 * - Implements filters by ticket status
 * - Displays tickets ordered by redeemedAt descending (most recent first)
 * - Responsive design with TailwindCSS (mobile min 320px, desktop min 1024px)
 */
const HistoryComponent: React.FC = () => {
  const { history, loading, error, filterByStatus, currentFilter } = useHistory();
  const { userRole } = useAuth();

  // Handle filter change
  const handleFilterChange = (status: TicketStatus | 'all') => {
    filterByStatus(status);
  };

  // Filter button component for reusability
  const FilterButton: React.FC<{
    label: string;
    value: TicketStatus | 'all';
    count?: number;
  }> = ({ label, value, count }) => {
    const isActive = currentFilter === value;
    return (
      <button
        onClick={() => handleFilterChange(value)}
        className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium text-sm transition-colors ${
          isActive
            ? 'bg-blue-600 text-white shadow-md'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        {label}
        {count !== undefined && (
          <span className="ml-1 text-xs opacity-80">({count})</span>
        )}
      </button>
    );
  };

  // Calculate counts for each filter
  const getCounts = () => {
    return {
      all: history.length,
      canjeado: history.filter((t) => t.status === 'canjeado').length,
      completado: history.filter((t) => t.status === 'completado').length,
      confirmado: history.filter((t) => t.status === 'confirmado').length,
    };
  };

  const counts = getCounts();

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando histórico...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-red-800 font-semibold mb-2">Error</h3>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Histórico de Tickets
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Revisa todos los tickets canjeados, completados y confirmados
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Filtrar por estado
          </h2>
          <div className="flex flex-wrap gap-2">
            <FilterButton label="Todos" value="all" count={counts.all} />
            <FilterButton label="Canjeados" value="canjeado" count={counts.canjeado} />
            <FilterButton label="Completados" value="completado" count={counts.completado} />
            <FilterButton label="Confirmados" value="confirmado" count={counts.confirmado} />
          </div>
        </div>

        {/* Tickets list */}
        {history.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No hay tickets en el histórico
            </h3>
            <p className="text-sm text-gray-500">
              {currentFilter === 'all'
                ? 'Los tickets canjeados aparecerán aquí'
                : `No hay tickets con estado "${currentFilter}"`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {history.map((ticket) => (
              <TicketCardComponent
                key={ticket.id}
                ticket={ticket}
                userRole={userRole || 'novia'}
                onAction={() => {
                  // Historical tickets don't have actions in this view
                  // Actions are handled in other components (TicketListComponent)
                }}
              />
            ))}
          </div>
        )}

        {/* Results count */}
        {history.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-600">
            Mostrando {history.length} ticket{history.length !== 1 ? 's' : ''}
            {currentFilter !== 'all' && ` con estado "${currentFilter}"`}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryComponent;
