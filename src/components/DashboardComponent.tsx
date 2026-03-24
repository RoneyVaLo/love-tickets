import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTickets } from '../hooks/useTickets';
import TicketListComponent from './TicketListComponent';
import CreateTicketComponent from './CreateTicketComponent';
import { ThemeSwitcher } from './ThemeSwitcher';
import type { TicketAction } from '../types';
import type { NotificationType } from '../hooks/useNotifications';

interface DashboardComponentProps {
  addNotification?: (message: string, type?: NotificationType) => void;
}

const DashboardComponent: React.FC<DashboardComponentProps> = ({ addNotification }) => {
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();
  const {
    tickets, loading, error,
    weeklyLimitReached, weeklyRedeemCount,
    redeemTicket, completeTicket, confirmTicket, rejectCompletion,
    proposeTicket, approveProposal, rejectProposal,
  } = useTickets(userRole, addNotification);

  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleSignOut = async () => {
    try { await signOut(); navigate('/login'); }
    catch (err: any) { setActionError(err.message || 'Error al cerrar sesión'); }
  };

  const handleTicketAction = async (ticketId: string, action: TicketAction) => {
    try {
      setActionError(null);
      switch (action) {
        case 'redeem':         await redeemTicket(ticketId); break;
        case 'complete':       await completeTicket(ticketId); break;
        case 'confirm':        await confirmTicket(ticketId); break;
        case 'reject':         await rejectCompletion(ticketId); break;
        case 'approve':        await approveProposal(ticketId); break;
        case 'rejectProposal': await rejectProposal(ticketId, 'Rechazado por el Usuario Principal'); break;
        default: throw new Error(`Acción desconocida: ${action}`);
      }
    } catch (err: any) {
      setActionError(err.message || 'Error al realizar la acción');
    }
  };

  const handleProposeTicket = async (description: string) => {
    await proposeTicket(description);
    setShowCreateTicket(false);
  };

  const BG = 'grain min-h-screen bg-rose-50 dark:bg-stone-900';
  const isNovia = userRole === 'novia';
  const isUsuarioPrincipal = userRole === 'usuario_principal';

  if (loading) {
    return (
      <div className={BG + ' flex items-center justify-center'}>
        <div className="text-center animate-fade-in">
          <div className="w-12 h-12 rounded-full border-4 border-rose-200 dark:border-rose-700 border-t-rose-600 dark:border-t-rose-300 animate-spin-slow mx-auto mb-4" />
          <p className="font-serif italic text-lg text-stone-400 dark:text-rose-300">Cargando tus tickets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={BG + ' flex items-center justify-center p-4'}>
        <div className="rounded-2xl p-8 max-w-md text-center bg-white/80 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/60 shadow-xl">
          <span className="text-4xl mb-3 block">💔</span>
          <h3 className="font-display text-xl font-semibold mb-2 text-rose-900 dark:text-rose-100">Algo salió mal</h3>
          <p className="font-serif italic text-sm text-stone-400 dark:text-rose-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={BG}>

      <header className="sticky top-0 z-50 bg-rose-50/95 dark:bg-stone-900/95 border-b border-rose-200/60 dark:border-rose-900/60 backdrop-blur-md shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-2xl animate-pulse-soft flex-shrink-0 text-rose-600 dark:text-rose-300">♥</span>
              <div className="min-w-0">
                <h1 className="font-display text-xl font-semibold leading-tight truncate text-rose-900 dark:text-rose-100">
                  Tickets Canjeables
                </h1>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="font-sans text-xs truncate text-stone-400 dark:text-rose-300">
                    {user?.displayName || user?.email}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-sans text-xs font-bold uppercase tracking-wider bg-rose-100 dark:bg-rose-900/60 border border-rose-200 dark:border-rose-700 text-rose-700 dark:text-rose-200">
                    {isNovia ? '💕 Novia' : '🎩 Principal'}
                  </span>
                  {isNovia && (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-sans text-xs font-bold uppercase tracking-wider border ${
                      weeklyLimitReached
                        ? 'bg-red-100 dark:bg-red-900/60 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300'
                        : 'bg-amber-50 dark:bg-amber-900/40 border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300'
                    }`}>
                      🎟 {weeklyRedeemCount}/3
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <ThemeSwitcher />
              <Link to="/history"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-sans text-sm font-semibold bg-white/70 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-700 text-rose-700 dark:text-rose-200 hover:bg-white dark:hover:bg-rose-900/50 hover:border-rose-400 dark:hover:border-rose-500 transition-all duration-200">
                <span>📜</span><span>Histórico</span>
              </Link>
              <Link to="/history" aria-label="Histórico"
                className="sm:hidden inline-flex items-center px-2.5 py-2 rounded-xl font-sans text-sm bg-white/70 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-700 text-rose-700 dark:text-rose-200 hover:bg-white dark:hover:bg-rose-900/50 transition-all duration-200">
                <span>📜</span>
              </Link>
              <button onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-sans text-sm text-stone-400 dark:text-rose-300 hover:bg-rose-100/60 dark:hover:bg-rose-900/40 hover:text-rose-700 dark:hover:text-rose-100 transition-all duration-200">
                <span>↩</span>
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {actionError && (
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm mb-6 animate-slide-down bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300" role="alert">
            <span className="flex-shrink-0 text-base">⚠</span>
            <p className="flex-1 font-sans">{actionError}</p>
            <button onClick={() => setActionError(null)} className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity">✕</button>
          </div>
        )}

        {isNovia && (
          <div className="space-y-10">
            <section className="animate-fade-up">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">💌</span>
                  <h2 className="font-display text-2xl font-semibold text-rose-900 dark:text-rose-100">Proponer Ticket</h2>
                </div>
                {!showCreateTicket && (
                  <button onClick={() => setShowCreateTicket(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-sans font-bold text-sm tracking-wide bg-rose-600 dark:bg-rose-500 text-white shadow-md hover:bg-rose-700 dark:hover:bg-rose-400 hover:-translate-y-0.5 transition-all duration-200">
                    <span>+</span> Nuevo
                  </button>
                )}
              </div>
              {showCreateTicket && (
                <div className="animate-slide-down">
                  <CreateTicketComponent onSubmit={handleProposeTicket} />
                  <button onClick={() => setShowCreateTicket(false)}
                    className="mt-3 font-sans text-sm text-stone-400 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-200 transition-colors">
                    ✕ Cancelar
                  </button>
                </div>
              )}
            </section>

            <div className="flex items-center gap-3 text-amber-500 dark:text-amber-400">
              <div className="flex-1 h-px bg-amber-200/60 dark:bg-amber-500/40" />
              <span className="text-base">✦</span>
              <div className="flex-1 h-px bg-amber-200/60 dark:bg-amber-500/40" />
            </div>

            <section className="animate-fade-up delay-100">
              <TicketListComponent tickets={tickets} userRole={userRole} onTicketAction={handleTicketAction} listType="available" weeklyLimitReached={weeklyLimitReached} />
            </section>

            <div className="flex items-center gap-3 text-amber-500 dark:text-amber-400">
              <div className="flex-1 h-px bg-amber-200/60 dark:bg-amber-500/40" />
              <span className="text-base">✦</span>
              <div className="flex-1 h-px bg-amber-200/60 dark:bg-amber-500/40" />
            </div>

            <section className="animate-fade-up delay-200">
              <TicketListComponent tickets={tickets} userRole={userRole} onTicketAction={handleTicketAction} listType="completed" />
            </section>
          </div>
        )}

        {isUsuarioPrincipal && (
          <div className="space-y-10">
            <section className="animate-fade-up">
              <TicketListComponent tickets={tickets} userRole={userRole} onTicketAction={handleTicketAction} listType="proposed" />
            </section>

            <div className="flex items-center gap-3 text-amber-500 dark:text-amber-400">
              <div className="flex-1 h-px bg-amber-200/60 dark:bg-amber-500/40" />
              <span className="text-base">✦</span>
              <div className="flex-1 h-px bg-amber-200/60 dark:bg-amber-500/40" />
            </div>

            <section className="animate-fade-up delay-100">
              <TicketListComponent tickets={tickets} userRole={userRole} onTicketAction={handleTicketAction} listType="redeemed" />
            </section>
          </div>
        )}

        {!isNovia && !isUsuarioPrincipal && (
          <div className="flex flex-col items-center justify-center py-12 px-8 text-center rounded-2xl border-2 border-dashed border-rose-200 dark:border-rose-900 bg-white/50 dark:bg-rose-950/20">
            <span className="text-4xl mb-3">🤔</span>
            <p className="font-serif italic text-stone-400 dark:text-rose-300">Rol de usuario no reconocido</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardComponent;
