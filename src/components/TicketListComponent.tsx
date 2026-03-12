import React from 'react';
import TicketCardComponent from './TicketCardComponent';
import type { Ticket, TicketAction, UserRole } from '../types';

export type ListType = 'available' | 'redeemed' | 'completed' | 'proposed';

interface TicketListComponentProps {
  tickets: Ticket[];
  userRole: UserRole;
  onTicketAction: (ticketId: string, action: TicketAction) => void;
  listType: ListType;
}

/**
 * TicketListComponent - Renders a filtered list of ticket cards
 * 
 * Validates Requirements: 2.1, 4.1, 5.1, 7.1, 10.1, 10.2, 10.3, 10.4
 * 
 * Features:
 * - Filters tickets based on listType and userRole
 * - Renders TicketCardComponent for each ticket
 * - Handles ticket actions and passes them to parent
 * - Responsive design with TailwindCSS (mobile min 320px, desktop min 1024px)
 * 
 * Filtering Logic:
 * - available: Shows pendiente tickets (for Novia to redeem)
 * - redeemed: Shows canjeado tickets (for Usuario Principal to complete)
 * - completed: Shows completado tickets (for Novia to confirm/reject)
 * - proposed: Shows propuesto tickets (for Usuario Principal to approve/reject)
 */
const TicketListComponent: React.FC<TicketListComponentProps> = ({
  tickets,
  userRole,
  onTicketAction,
  listType,
}) => {
  // Filter tickets based on listType
  const filterTickets = (): Ticket[] => {
    switch (listType) {
      case 'available':
        // Show pendiente tickets (Novia can redeem these)
        return tickets.filter(ticket => ticket.status === 'pendiente');
      
      case 'redeemed':
        // Show canjeado tickets (Usuario Principal can complete these)
        return tickets.filter(ticket => ticket.status === 'canjeado');
      
      case 'completed':
        // Show completado tickets (Novia can confirm/reject these)
        return tickets.filter(ticket => ticket.status === 'completado');
      
      case 'proposed':
        // Show propuesto tickets (Usuario Principal can approve/reject these)
        return tickets.filter(ticket => ticket.status === 'propuesto');
      
      default:
        return tickets;
    }
  };

  const filteredTickets = filterTickets();

  // Get list title based on listType and userRole
  const getListTitle = (): string => {
    switch (listType) {
      case 'available':
        return 'Tickets Disponibles';
      case 'redeemed':
        return 'Tickets Canjeados';
      case 'completed':
        return 'Tickets Completados';
      case 'proposed':
        return 'Tickets Propuestos';
      default:
        return 'Tickets';
    }
  };

  // Get empty state message
  const getEmptyMessage = (): string => {
    switch (listType) {
      case 'available':
        return 'No hay tickets disponibles para canjear';
      case 'redeemed':
        return 'No hay tickets canjeados pendientes';
      case 'completed':
        return 'No hay tickets completados pendientes de confirmación';
      case 'proposed':
        return 'No hay tickets propuestos pendientes de aprobación';
      default:
        return 'No hay tickets';
    }
  };

  return (
    <div className="w-full">
      {/* List header */}
      <div className="mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
          {getListTitle()}
        </h2>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          {filteredTickets.length} {filteredTickets.length === 1 ? 'ticket' : 'tickets'}
        </p>
      </div>

      {/* Tickets list or empty state */}
      {filteredTickets.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 sm:p-12 text-center border border-gray-200">
          <svg
            className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-gray-600 text-sm sm:text-base">
            {getEmptyMessage()}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {filteredTickets.map((ticket) => (
            <TicketCardComponent
              key={ticket.id}
              ticket={ticket}
              userRole={userRole}
              onAction={(action) => onTicketAction(ticket.id, action)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketListComponent;
