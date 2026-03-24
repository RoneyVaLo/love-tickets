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

const LIST_CONFIG: Record<ListType, {
  title: string; icon: string; statusFilter: string; emptyMessage: string; emptyIcon: string;
}> = {
  available: { title: 'Tickets Disponibles', icon: '🎀', statusFilter: 'pendiente',  emptyMessage: 'No hay tickets disponibles por ahora',                    emptyIcon: '🎀' },
  redeemed:  { title: 'Tickets Canjeados',   icon: '🌹', statusFilter: 'canjeado',   emptyMessage: 'No hay tickets canjeados pendientes',                      emptyIcon: '🌹' },
  completed: { title: 'Tickets Completados', icon: '✨', statusFilter: 'completado', emptyMessage: 'No hay tickets completados pendientes de confirmación',     emptyIcon: '✨' },
  proposed:  { title: 'Tickets Propuestos',  icon: '💌', statusFilter: 'propuesto',  emptyMessage: 'No hay propuestas pendientes de aprobación',               emptyIcon: '💌' },
};

/**
 * TicketListComponent — Romantic filtered ticket list
 * Requirements: 2.1, 4.1, 5.1, 7.1, 10.1–10.4
 */
const TicketListComponent: React.FC<TicketListComponentProps> = ({
  tickets, userRole, onTicketAction, listType,
}) => {
  const config = LIST_CONFIG[listType];
  const filtered = tickets.filter(t => t.status === config.statusFilter);

  return (
    <div className="w-full animate-fade-up">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-5">
        <span className="text-2xl">{config.icon}</span>
        <div>
          <h2 className="font-display text-2xl font-semibold text-rose-900 dark:text-rose-100">{config.title}</h2>
          <p className="font-sans text-xs mt-0.5 tracking-wider text-stone-400 dark:text-rose-300">
            {filtered.length} {filtered.length === 1 ? 'ticket' : 'tickets'}
          </p>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-8 text-center rounded-2xl border-2 border-dashed border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20">
          <span className="text-5xl mb-3 animate-pulse-soft">{config.emptyIcon}</span>
          <p className="font-serif italic text-base text-stone-400 dark:text-rose-300">
            {config.emptyMessage}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((ticket, i) => (
            <div key={ticket.id} className="animate-fade-up" style={{ animationDelay: `${i * 0.07}s` }}>
              <TicketCardComponent
                ticket={ticket}
                userRole={userRole}
                onAction={action => onTicketAction(ticket.id, action)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketListComponent;
