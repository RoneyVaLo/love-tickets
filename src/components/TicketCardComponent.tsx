import React from 'react';
import type { Ticket, TicketAction, UserRole } from '../types';

interface TicketCardComponentProps {
  ticket: Ticket;
  userRole: UserRole;
  onAction: (action: TicketAction) => void;
}

const STATUS_CONFIG: Record<string, { label: string; icon: string; classes: string }> = {
  pendiente:  { label: 'Pendiente',  icon: '🎀', classes: 'bg-sky-50 dark:bg-sky-900/40 text-sky-700 dark:text-sky-200 border border-sky-200 dark:border-sky-700' },
  canjeado:   { label: 'Canjeado',   icon: '🌹', classes: 'bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-200 border border-amber-200 dark:border-amber-700' },
  completado: { label: 'Completado', icon: '✨', classes: 'bg-violet-50 dark:bg-violet-900/40 text-violet-700 dark:text-violet-200 border border-violet-200 dark:border-violet-700' },
  confirmado: { label: 'Confirmado', icon: '💚', classes: 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-700' },
  propuesto:  { label: 'Propuesto',  icon: '💌', classes: 'bg-rose-50 dark:bg-rose-900/40 text-rose-700 dark:text-rose-200 border border-rose-200 dark:border-rose-700' },
};

/**
 * TicketCardComponent — Romantic ticket card
 * Requirements: 2.2, 8.3, 10.1–10.4
 */
const TicketCardComponent: React.FC<TicketCardComponentProps> = ({ ticket, userRole, onAction }) => {
  const formatDate = (timestamp: any): string => {
    if (!timestamp) return '—';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return '—'; }
  };

  const status = STATUS_CONFIG[ticket.status] ?? { label: ticket.status, icon: '•', classes: 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700' };

  const timestamps: { label: string; value: any }[] = [
    { label: 'Creado',     value: ticket.timestamps.createdAt },
    { label: 'Canjeado',   value: ticket.timestamps.redeemedAt },
    { label: 'Completado', value: ticket.timestamps.completedAt },
    { label: 'Confirmado', value: ticket.timestamps.confirmedAt },
    { label: 'Propuesto',  value: ticket.timestamps.proposedAt },
    { label: 'Aprobado',   value: ticket.timestamps.approvedAt },
  ].filter(t => t.value);

  const renderActions = () => {
    if (userRole === 'novia' && ticket.status === 'pendiente') {
      return (
        <button onClick={() => onAction('redeem')}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-sans font-bold text-sm tracking-wide bg-gradient-to-r from-rose-700 to-rose-500 dark:from-rose-600 dark:to-rose-400 text-white shadow-md shadow-rose-700/25 hover:shadow-rose-700/40 hover:-translate-y-0.5 transition-all duration-200">
          <span>🎀</span> Canjear Ticket
        </button>
      );
    }
    if (userRole === 'usuario_principal' && ticket.status === 'canjeado') {
      return (
        <button onClick={() => onAction('complete')}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-sans font-bold text-sm tracking-wide bg-gradient-to-r from-emerald-600 to-emerald-500 dark:from-emerald-500 dark:to-emerald-400 text-white shadow-md shadow-emerald-600/25 hover:shadow-emerald-600/40 hover:-translate-y-0.5 transition-all duration-200">
          <span>✨</span> Marcar Completado
        </button>
      );
    }
    if (userRole === 'novia' && ticket.status === 'completado') {
      return (
        <div className="flex gap-2">
          <button onClick={() => onAction('confirm')}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl font-sans font-bold text-sm bg-gradient-to-r from-emerald-600 to-emerald-500 dark:from-emerald-500 dark:to-emerald-400 text-white shadow-md shadow-emerald-600/25 hover:-translate-y-0.5 transition-all duration-200">
            <span>💚</span> Confirmar
          </button>
          <button onClick={() => onAction('reject')}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl font-sans font-bold text-sm bg-gradient-to-r from-red-600 to-red-500 dark:from-red-500 dark:to-red-400 text-white shadow-md shadow-red-600/25 hover:-translate-y-0.5 transition-all duration-200">
            <span>✕</span> Rechazar
          </button>
        </div>
      );
    }
    if (userRole === 'usuario_principal' && ticket.status === 'propuesto') {
      return (
        <div className="flex gap-2">
          <button onClick={() => onAction('approve')}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl font-sans font-bold text-sm bg-gradient-to-r from-emerald-600 to-emerald-500 dark:from-emerald-500 dark:to-emerald-400 text-white shadow-md shadow-emerald-600/25 hover:-translate-y-0.5 transition-all duration-200">
            <span>💚</span> Aprobar
          </button>
          <button onClick={() => onAction('rejectProposal')}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl font-sans font-bold text-sm bg-gradient-to-r from-red-600 to-red-500 dark:from-red-500 dark:to-red-400 text-white shadow-md shadow-red-600/25 hover:-translate-y-0.5 transition-all duration-200">
            <span>✕</span> Rechazar
          </button>
        </div>
      );
    }
    return null;
  };

  const actions = renderActions();

  return (
    <div className="rounded-2xl p-5 animate-fade-up bg-white/80 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-800 shadow-md shadow-rose-900/8 dark:shadow-rose-900/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-rose-900/12 dark:hover:shadow-rose-900/40 transition-all duration-300 backdrop-blur-sm">

      {/* Status badge */}
      <div className="mb-3">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-sans text-xs font-bold uppercase tracking-wider ${status.classes}`}>
          <span>{status.icon}</span>
          {status.label}
        </span>
      </div>

      {/* Description */}
      <p className="font-serif text-[1.0625rem] leading-relaxed mb-4 text-stone-800 dark:text-rose-50">
        {ticket.description}
      </p>

      {/* Timestamps */}
      {timestamps.length > 0 && (
        <div className="mb-4 space-y-1">
          {timestamps.map(({ label, value }) => (
            <div key={label} className="flex items-center gap-2 text-xs">
              <span className="text-amber-400 dark:text-amber-400 text-[0.6rem]">✦</span>
              <span className="font-sans font-bold uppercase tracking-wider text-[0.7rem] text-stone-500 dark:text-rose-300">{label}:</span>
              <span className="font-serif italic text-stone-500 dark:text-rose-200">{formatDate(value)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Rejection reason */}
      {ticket.rejectionReason && (
        <div className="mb-4 px-3 py-2 rounded-xl text-sm bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200">
          <span className="font-sans font-bold text-xs uppercase tracking-wider">Motivo de rechazo: </span>
          <span className="font-serif italic">{ticket.rejectionReason}</span>
        </div>
      )}

      {/* Actions */}
      {actions && (
        <>
          <div className="flex items-center gap-3 my-4 text-amber-500 dark:text-amber-400">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-200/60 dark:via-amber-500/40 to-transparent" />
            <span className="text-[0.6rem]">✦</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-200/60 dark:via-amber-500/40 to-transparent" />
          </div>
          {actions}
        </>
      )}
    </div>
  );
};

export default TicketCardComponent;
