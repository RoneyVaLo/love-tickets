import React from 'react';
import type { Ticket, TicketAction, UserRole } from '../types';

interface TicketCardComponentProps {
  ticket: Ticket;
  userRole: UserRole;
  onAction: (action: TicketAction) => void;
  weeklyLimitReached?: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; accent: string; border: string; bg: string; darkBg: string; darkBorder: string; darkText: string; text: string }> = {
  pendiente:  { label: 'Pendiente',  accent: 'text-sky-600 dark:text-sky-300',    border: 'border-sky-300 dark:border-sky-600',       bg: 'bg-sky-50',     darkBg: 'dark:bg-sky-950/60',    text: 'text-sky-700',    darkText: 'dark:text-sky-100',    darkBorder: '' },
  canjeado:   { label: 'Canjeado',   accent: 'text-amber-600 dark:text-amber-300', border: 'border-amber-300 dark:border-amber-600',   bg: 'bg-amber-50',   darkBg: 'dark:bg-amber-950/60',  text: 'text-amber-700',  darkText: 'dark:text-amber-100',  darkBorder: '' },
  completado: { label: 'Completado', accent: 'text-violet-600 dark:text-violet-300',border: 'border-violet-300 dark:border-violet-600', bg: 'bg-violet-50',  darkBg: 'dark:bg-violet-950/60', text: 'text-violet-700', darkText: 'dark:text-violet-100', darkBorder: '' },
  confirmado: { label: 'Confirmado', accent: 'text-emerald-600 dark:text-emerald-300',border:'border-emerald-300 dark:border-emerald-600',bg:'bg-emerald-50', darkBg:'dark:bg-emerald-950/60', text:'text-emerald-700', darkText:'dark:text-emerald-100', darkBorder:'' },
  propuesto:  { label: 'Propuesto',  accent: 'text-rose-600 dark:text-rose-300',   border: 'border-rose-300 dark:border-rose-600',     bg: 'bg-rose-50',    darkBg: 'dark:bg-rose-950/60',   text: 'text-rose-700',   darkText: 'dark:text-rose-100',   darkBorder: '' },
};

const TicketCardComponent: React.FC<TicketCardComponentProps> = ({ ticket, userRole, onAction, weeklyLimitReached = false }) => {
  const formatDate = (timestamp: any): string => {
    if (!timestamp) return '—';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return '—'; }
  };

  const cfg = STATUS_CONFIG[ticket.status] ?? {
    label: ticket.status, accent: 'text-stone-500', border: 'border-stone-300 dark:border-stone-600',
    bg: 'bg-stone-50', darkBg: 'dark:bg-stone-900/60', text: 'text-stone-600', darkText: 'dark:text-stone-200', darkBorder: '',
  };

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
        <div className="flex flex-col gap-1">
          <button
            onClick={() => !weeklyLimitReached && onAction('redeem')}
            disabled={weeklyLimitReached}
            title={weeklyLimitReached ? 'Límite semanal alcanzado (3/3)' : undefined}
            className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-sans font-bold text-xs tracking-wide transition-all duration-200
              ${weeklyLimitReached
                ? 'bg-stone-300 dark:bg-stone-700 text-stone-500 dark:text-stone-400 cursor-not-allowed opacity-60'
                : 'bg-gradient-to-r from-rose-700 to-rose-500 dark:from-rose-600 dark:to-rose-400 text-white shadow-sm hover:shadow-rose-700/40 hover:-translate-y-0.5 cursor-pointer'
              }`}>
            Canjear
          </button>
          {weeklyLimitReached && (
            <p className="text-[0.55rem] text-center font-sans text-stone-500 dark:text-stone-400 leading-tight">
              Límite semanal (3/3)
            </p>
          )}
        </div>
      );
    }
    if (userRole === 'usuario_principal' && ticket.status === 'canjeado') {
      return (
        <button onClick={() => onAction('complete')}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-sans font-bold text-xs tracking-wide bg-gradient-to-r from-emerald-600 to-emerald-500 dark:from-emerald-500 dark:to-emerald-400 text-white shadow-sm hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
          Completar
        </button>
      );
    }
    if (userRole === 'novia' && ticket.status === 'completado') {
      return (
        <div className="flex gap-1.5 flex-col">
          <button onClick={() => onAction('confirm')}
            className="flex-1 flex items-center justify-center px-2 py-2 rounded-lg font-sans font-bold text-xs bg-gradient-to-r from-emerald-600 to-emerald-500 dark:from-emerald-500 dark:to-emerald-400 text-white shadow-sm hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
            Confirmar
          </button>
          <button onClick={() => onAction('reject')}
            className="flex-1 flex items-center justify-center px-2 py-2 rounded-lg font-sans font-bold text-xs bg-gradient-to-r from-red-600 to-red-500 dark:from-red-500 dark:to-red-400 text-white shadow-sm hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
            Rechazar
          </button>
        </div>
      );
    }
    if (userRole === 'usuario_principal' && ticket.status === 'propuesto') {
      return (
        <div className="flex flex-col gap-1.5">
          <button onClick={() => onAction('approve')}
            className="flex-1 flex items-center justify-center px-2 py-2 rounded-lg font-sans font-bold text-xs bg-gradient-to-r from-emerald-600 to-emerald-500 dark:from-emerald-500 dark:to-emerald-400 text-white shadow-sm hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
            Aprobar
          </button>
          <button onClick={() => onAction('rejectProposal')}
            className="flex-1 flex items-center justify-center px-2 py-2 rounded-lg font-sans font-bold text-xs bg-gradient-to-r from-red-600 to-red-500 dark:from-red-500 dark:to-red-400 text-white shadow-sm hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
            Rechazar
          </button>
        </div>
      );
    }
    return null;
  };

  const actions = renderActions();

  return (
    <div
      className={`ticket-shape ${cfg.accent} ${cfg.bg} ${cfg.darkBg} ${cfg.border} animate-fade-up
        relative flex w-full rounded-xl border-2
        shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300`}
    >
      {/* ── Left: main body ── */}
      <div className="flex-1 flex flex-col justify-center px-6 py-5 min-w-0">
        {/* "Vale Por" label */}
        <p className="font-sans text-[0.65rem] font-bold uppercase tracking-[0.18em] opacity-50 mb-1 select-none">
          Vale Por
        </p>

        {/* Description — the big title */}
        <h3 className={`font-display font-bold leading-tight ${cfg.text} ${cfg.darkText} text-lg sm:text-xl break-words`}>
          {ticket.description}
        </h3>

        {/* Decorative lines (from original design) */}
        <div className="mt-3 space-y-1.5">
          <div className="h-[3px] w-28 rounded-full opacity-20 bg-current" />
          <div className="h-[3px] w-16 rounded-full opacity-20 bg-current" />
        </div>
      </div>

      {/* ── Dashed divider ── */}
      <div className="self-stretch w-px border-r-2 border-dashed border-current opacity-30 my-3" />

      {/* ── Right: stub ── */}
      <div className="w-28 flex-shrink-0 flex flex-col justify-between px-3 py-4 gap-2">
        {/* Status badge */}
        <div className="text-center">
          <span className={`inline-block font-sans text-[0.6rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${cfg.border} ${cfg.text} ${cfg.darkText} opacity-90`}>
            {cfg.label}
          </span>
        </div>

        {/* Timestamps */}
        {timestamps.length > 0 && (
          <div className="space-y-0.5">
            {timestamps.slice(0, 2).map(({ label, value }) => (
              <div key={label} className="text-center">
                <span className="block font-sans font-bold uppercase tracking-wider text-[0.55rem] opacity-40">
                  {label}
                </span>
                <span className="block font-serif italic text-[0.6rem] opacity-60">
                  {formatDate(value)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Rejection reason (compact) */}
        {ticket.rejectionReason && (
          <p className="font-serif italic text-[0.6rem] text-red-600 dark:text-red-400 text-center leading-tight opacity-80">
            {ticket.rejectionReason}
          </p>
        )}

        {/* Actions */}
        {actions && <div className="mt-auto">{actions}</div>}
      </div>
    </div>
  );
};

export default TicketCardComponent;
