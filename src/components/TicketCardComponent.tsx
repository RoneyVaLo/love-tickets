import React from 'react';
import type { Ticket, TicketAction, UserRole } from '../types';

interface TicketCardComponentProps {
  ticket: Ticket;
  userRole: UserRole;
  onAction: (action: TicketAction) => void;
}

/**
 * TicketCardComponent - Displays individual ticket cards with action buttons
 * 
 * Validates Requirements: 2.2, 8.3, 10.1, 10.2, 10.3, 10.4
 * 
 * Features:
 * - Shows ticket description and details (status, timestamps)
 * - Displays action buttons based on user role and ticket status
 * - Responsive design with TailwindCSS (mobile min 320px, desktop min 1024px)
 */
const TicketCardComponent: React.FC<TicketCardComponentProps> = ({
  ticket,
  userRole,
  onAction,
}) => {
  // Format timestamp for display
  const formatDate = (timestamp: any): string => {
    if (!timestamp) return 'N/A';
    
    try {
      // Handle Firestore Timestamp
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'N/A';
    }
  };

  // Get status display text and color
  const getStatusDisplay = (status: string): { text: string; colorClass: string } => {
    const statusMap: Record<string, { text: string; colorClass: string }> = {
      pendiente: { text: 'Pendiente', colorClass: 'bg-blue-100 text-blue-800' },
      canjeado: { text: 'Canjeado', colorClass: 'bg-yellow-100 text-yellow-800' },
      completado: { text: 'Completado', colorClass: 'bg-purple-100 text-purple-800' },
      confirmado: { text: 'Confirmado', colorClass: 'bg-green-100 text-green-800' },
      propuesto: { text: 'Propuesto', colorClass: 'bg-gray-100 text-gray-800' },
    };
    return statusMap[status] || { text: status, colorClass: 'bg-gray-100 text-gray-800' };
  };

  // Determine which action buttons to show based on role and status
  const getActionButtons = (): React.ReactElement | null => {
    // Novia + pendiente ticket → "Canjear" button
    if (userRole === 'novia' && ticket.status === 'pendiente') {
      return (
        <button
          onClick={() => onAction('redeem')}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Canjear
        </button>
      );
    }

    // Usuario Principal + canjeado ticket → "Completar" button
    if (userRole === 'usuario_principal' && ticket.status === 'canjeado') {
      return (
        <button
          onClick={() => onAction('complete')}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          Completar
        </button>
      );
    }

    // Novia + completado ticket → "Confirmar" and "Rechazar" buttons
    if (userRole === 'novia' && ticket.status === 'completado') {
      return (
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => onAction('confirm')}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Confirmar
          </button>
          <button
            onClick={() => onAction('reject')}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Rechazar
          </button>
        </div>
      );
    }

    // Usuario Principal + propuesto ticket → "Aprobar" and "Rechazar" buttons
    if (userRole === 'usuario_principal' && ticket.status === 'propuesto') {
      return (
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => onAction('approve')}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Aprobar
          </button>
          <button
            onClick={() => onAction('rejectProposal')}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Rechazar
          </button>
        </div>
      );
    }

    return null;
  };

  const statusDisplay = getStatusDisplay(ticket.status);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
      {/* Header with status badge */}
      <div className="flex justify-between items-start mb-3">
        <span
          className={`px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${statusDisplay.colorClass}`}
        >
          {statusDisplay.text}
        </span>
      </div>

      {/* Description */}
      <div className="mb-4">
        <p className="text-gray-800 dark:text-gray-200 text-sm sm:text-base leading-relaxed">
          {ticket.description}
        </p>
      </div>

      {/* Timestamps details */}
      <div className="mb-4 space-y-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <span>
            <span className="font-medium">Creado:</span> {formatDate(ticket.timestamps.createdAt)}
          </span>
        </div>
        
        {ticket.timestamps.redeemedAt && (
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span>
              <span className="font-medium">Canjeado:</span> {formatDate(ticket.timestamps.redeemedAt)}
            </span>
          </div>
        )}
        
        {ticket.timestamps.completedAt && (
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span>
              <span className="font-medium">Completado:</span> {formatDate(ticket.timestamps.completedAt)}
            </span>
          </div>
        )}
        
        {ticket.timestamps.confirmedAt && (
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span>
              <span className="font-medium">Confirmado:</span> {formatDate(ticket.timestamps.confirmedAt)}
            </span>
          </div>
        )}
        
        {ticket.timestamps.proposedAt && (
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span>
              <span className="font-medium">Propuesto:</span> {formatDate(ticket.timestamps.proposedAt)}
            </span>
          </div>
        )}
        
        {ticket.timestamps.approvedAt && (
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span>
              <span className="font-medium">Aprobado:</span> {formatDate(ticket.timestamps.approvedAt)}
            </span>
          </div>
        )}
      </div>

      {/* Rejection reason if present */}
      {ticket.rejectionReason && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
          <p className="text-xs sm:text-sm text-red-800 dark:text-red-300">
            <span className="font-medium">Razón de rechazo:</span> {ticket.rejectionReason}
          </p>
        </div>
      )}

      {/* Action buttons */}
      {getActionButtons()}
    </div>
  );
};

export default TicketCardComponent;
