import React from 'react';
import { Link } from 'react-router-dom';
import { useHistory } from '../hooks/useHistory';
import { useAuth } from '../hooks/useAuth';
import TicketCardComponent from './TicketCardComponent';
import type { TicketStatus } from '../types';

/**
 * HistoryComponent — Romantic ticket history with filters
 * Requirements: 8.1–8.5, 10.1–10.4
 */
const HistoryComponent: React.FC = () => {
  const { history, loading, error, filterByStatus, currentFilter } = useHistory();
  const { userRole } = useAuth();

  const counts = {
    all:        history.length,
    canjeado:   history.filter(t => t.status === 'canjeado').length,
    completado: history.filter(t => t.status === 'completado').length,
    confirmado: history.filter(t => t.status === 'confirmado').length,
  };

  const filters: { label: string; value: TicketStatus | 'all'; icon: string; count: number }[] = [
    { label: 'Todos',       value: 'all',        icon: '✦', count: counts.all },
    { label: 'Canjeados',   value: 'canjeado',   icon: '🌹', count: counts.canjeado },
    { label: 'Completados', value: 'completado', icon: '✨', count: counts.completado },
    { label: 'Confirmados', value: 'confirmado', icon: '💚', count: counts.confirmado },
  ];

  if (loading) {
    return (
      <div className="grain min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-amber-50/30 to-rose-100 dark:from-stone-950 dark:via-rose-950/50 dark:to-stone-900">
        <div className="text-center animate-fade-in">
          <div className="w-12 h-12 rounded-full border-4 border-rose-200 dark:border-rose-700 border-t-rose-600 dark:border-t-rose-300 animate-spin-slow mx-auto mb-4" />
          <p className="font-serif italic text-lg text-stone-400 dark:text-rose-300">Cargando histórico...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grain min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-rose-50 via-amber-50/30 to-rose-100 dark:from-stone-950 dark:via-rose-950/50 dark:to-stone-900">
        <div className="rounded-2xl p-8 max-w-md text-center bg-white/80 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/60 shadow-xl">
          <span className="text-4xl mb-3 block">💔</span>
          <h3 className="font-display text-xl font-semibold mb-2 text-rose-900 dark:text-rose-100">Error al cargar</h3>
          <p className="font-serif italic text-sm text-stone-400 dark:text-rose-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grain min-h-screen bg-gradient-to-br from-rose-50 via-amber-50/30 to-rose-100 dark:from-stone-950 dark:via-rose-950/50 dark:to-stone-900">

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-rose-50/95 dark:bg-stone-950/95 border-b border-rose-200/60 dark:border-rose-900/60 backdrop-blur-md shadow-sm shadow-rose-900/8 dark:shadow-rose-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <Link to="/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-sans text-sm bg-transparent border border-transparent text-stone-400 dark:text-rose-300 hover:bg-rose-100/60 dark:hover:bg-rose-900/40 hover:text-rose-700 dark:hover:text-rose-100 transition-all duration-200">
              ← <span className="hidden sm:inline">Volver</span>
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-xl">📜</span>
              <h1 className="font-display text-xl font-semibold text-rose-900 dark:text-rose-100">
                Histórico de Tickets
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Subtitle */}
        <p className="font-serif italic text-base mb-6 animate-fade-up text-stone-400 dark:text-rose-300">
          Todos los momentos que han compartido juntos
        </p>

        {/* Filter tabs */}
        <div className="rounded-2xl p-4 mb-8 animate-fade-up delay-100 bg-white/80 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-800 shadow-md shadow-rose-900/8 dark:shadow-rose-900/30 backdrop-blur-sm">
          <p className="font-sans text-xs font-bold uppercase tracking-widest mb-3 text-rose-700 dark:text-rose-300">
            Filtrar por estado
          </p>
          <div className="flex flex-wrap gap-2">
            {filters.map(f => (
              <button key={f.value} onClick={() => filterByStatus(f.value)}
                className={`px-3 py-1.5 rounded-full font-sans text-xs font-bold uppercase tracking-wider border transition-all duration-200 ${
                  currentFilter === f.value
                    ? 'bg-gradient-to-r from-rose-700 to-rose-500 dark:from-rose-600 dark:to-rose-400 text-white border-transparent shadow-md shadow-rose-700/25'
                    : 'bg-white/60 dark:bg-rose-950/50 text-rose-700 dark:text-rose-200 border-rose-200 dark:border-rose-700 hover:bg-white dark:hover:bg-rose-900/50 hover:border-rose-400 dark:hover:border-rose-500'
                }`}>
                <span className="mr-1">{f.icon}</span>
                {f.label}
                <span className="ml-1.5 opacity-70">({f.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tickets */}
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-8 text-center rounded-2xl border-2 border-dashed border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20 animate-fade-up delay-200">
            <span className="text-5xl mb-3 animate-pulse-soft">📜</span>
            <h3 className="font-display text-lg font-semibold mb-1 text-rose-900 dark:text-rose-100">
              Sin tickets en el histórico
            </h3>
            <p className="font-serif italic text-sm text-stone-400 dark:text-rose-300">
              {currentFilter === 'all'
                ? 'Los tickets canjeados aparecerán aquí'
                : `No hay tickets con estado "${currentFilter}"`}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {history.map((ticket, i) => (
                <div key={ticket.id} className="animate-fade-up" style={{ animationDelay: `${i * 0.06}s` }}>
                  <TicketCardComponent ticket={ticket} userRole={userRole || 'novia'} onAction={() => {}} />
                </div>
              ))}
            </div>
            <p className="text-center mt-8 font-serif italic text-sm animate-fade-up text-stone-400 dark:text-rose-300">
              {history.length} {history.length === 1 ? 'ticket' : 'tickets'}
              {currentFilter !== 'all' && ` con estado "${currentFilter}"`}
            </p>
          </>
        )}
      </main>
    </div>
  );
};

export default HistoryComponent;
