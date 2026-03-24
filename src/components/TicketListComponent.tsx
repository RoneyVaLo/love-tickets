import React, { useRef, useState, useCallback, useEffect } from 'react';
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
  available: { title: 'Tickets Disponibles', icon: '🎀', statusFilter: 'pendiente',  emptyMessage: 'No hay tickets disponibles por ahora',                emptyIcon: '🎀' },
  redeemed:  { title: 'Tickets Canjeados',   icon: '🌹', statusFilter: 'canjeado',   emptyMessage: 'No hay tickets canjeados pendientes',                  emptyIcon: '🌹' },
  completed: { title: 'Tickets Completados', icon: '✨', statusFilter: 'completado', emptyMessage: 'No hay tickets completados pendientes de confirmación', emptyIcon: '✨' },
  proposed:  { title: 'Tickets Propuestos',  icon: '💌', statusFilter: 'propuesto',  emptyMessage: 'No hay propuestas pendientes de aprobación',           emptyIcon: '💌' },
};

/**
 * TicketListComponent — Romantic ticket carousel
 * Requirements: 2.1, 4.1, 5.1, 7.1, 10.1–10.4
 */
const TicketListComponent: React.FC<TicketListComponentProps> = ({
  tickets, userRole, onTicketAction, listType,
}) => {
  const config = LIST_CONFIG[listType];
  const filtered = tickets.filter(t => t.status === config.statusFilter);

  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Sync dot indicator with scroll position
  const onScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track || filtered.length === 0) return;
    const slideWidth = track.scrollWidth / filtered.length;
    const idx = Math.round(track.scrollLeft / slideWidth);
    setActiveIndex(Math.min(idx, filtered.length - 1));
  }, [filtered.length]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => track.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  // Reset to first slide when ticket list changes
  useEffect(() => {
    setActiveIndex(0);
    if (trackRef.current) trackRef.current.scrollLeft = 0;
  }, [filtered.length]);

  const scrollTo = (idx: number) => {
    const track = trackRef.current;
    if (!track) return;
    const slide = track.children[idx] as HTMLElement | undefined;
    if (slide) {
      track.scrollTo({ left: slide.offsetLeft, behavior: 'smooth' });
    }
    setActiveIndex(idx);
  };

  const prev = () => scrollTo(Math.max(0, activeIndex - 1));
  const next = () => scrollTo(Math.min(filtered.length - 1, activeIndex + 1));

  const hasPrev = activeIndex > 0;
  const hasNext = activeIndex < filtered.length - 1;

  return (
    <div className="w-full animate-fade-up">

      {/* ── Section header ── */}
      <div className="flex items-center justify-between mb-5 px-1">
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden="true">{config.icon}</span>
          <div>
            <h2 className="font-display text-2xl font-semibold text-rose-900 dark:text-rose-100">
              {config.title}
            </h2>
            <p className="font-sans text-xs mt-0.5 tracking-wider text-stone-400 dark:text-rose-300">
              {filtered.length} {filtered.length === 1 ? 'ticket' : 'tickets'}
            </p>
          </div>
        </div>

        {/* Arrow controls — visible on md+ */}
        {filtered.length > 1 && (
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={prev}
              disabled={!hasPrev}
              aria-label="Ticket anterior"
              className="w-9 h-9 flex items-center justify-center rounded-full border transition-all duration-200
                border-rose-200 dark:border-rose-700 bg-white/70 dark:bg-rose-950/50
                text-rose-600 dark:text-rose-300
                hover:bg-rose-100 dark:hover:bg-rose-900/60 hover:border-rose-400 dark:hover:border-rose-500
                disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/70 dark:disabled:hover:bg-rose-950/50"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              onClick={next}
              disabled={!hasNext}
              aria-label="Ticket siguiente"
              className="w-9 h-9 flex items-center justify-center rounded-full border transition-all duration-200
                border-rose-200 dark:border-rose-700 bg-white/70 dark:bg-rose-950/50
                text-rose-600 dark:text-rose-300
                hover:bg-rose-100 dark:hover:bg-rose-900/60 hover:border-rose-400 dark:hover:border-rose-500
                disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/70 dark:disabled:hover:bg-rose-950/50"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* ── Empty state ── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-8 text-center rounded-2xl border-2 border-dashed border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20">
          <span className="text-5xl mb-3 animate-pulse-soft" aria-hidden="true">{config.emptyIcon}</span>
          <p className="font-serif italic text-base text-stone-400 dark:text-rose-300">
            {config.emptyMessage}
          </p>
        </div>
      ) : (
        <>
          {/* ── Carousel track ── */}
          <div
            ref={trackRef}
            className="carousel-track"
            role="region"
            aria-label={config.title}
            aria-roledescription="carrusel"
          >
            {filtered.map((ticket, i) => (
              <div
                key={ticket.id}
                className="carousel-slide animate-carousel-in"
                style={{ animationDelay: `${i * 0.06}s` }}
                role="group"
                aria-roledescription="diapositiva"
                aria-label={`Ticket ${i + 1} de ${filtered.length}`}
              >
                <TicketCardComponent
                  ticket={ticket}
                  userRole={userRole}
                  onAction={action => onTicketAction(ticket.id, action)}
                />
              </div>
            ))}

            {/* Trailing spacer so last card doesn't hug the edge */}
            <div className="flex-shrink-0 w-4" aria-hidden="true" />
          </div>

          {/* ── Dot indicators + mobile arrows ── */}
          {filtered.length > 1 && (
            <div className="flex items-center justify-center gap-3 mt-4">

              {/* Mobile prev arrow */}
              <button
                onClick={prev}
                disabled={!hasPrev}
                aria-label="Ticket anterior"
                className="sm:hidden w-8 h-8 flex items-center justify-center rounded-full border transition-all duration-200
                  border-rose-200 dark:border-rose-700 bg-white/70 dark:bg-rose-950/50
                  text-rose-600 dark:text-rose-300
                  disabled:opacity-25 disabled:cursor-not-allowed"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {/* Dots */}
              <div className="flex items-center gap-1.5" role="tablist" aria-label="Navegación de tickets">
                {filtered.map((_, i) => (
                  <button
                    key={i}
                    role="tab"
                    aria-selected={i === activeIndex}
                    aria-label={`Ir al ticket ${i + 1}`}
                    onClick={() => scrollTo(i)}
                    className={`rounded-full transition-all duration-300 focus-visible:outline-2 focus-visible:outline-rose-500 ${
                      i === activeIndex
                        ? 'w-5 h-2 bg-rose-500 dark:bg-rose-400'
                        : 'w-2 h-2 bg-rose-200 dark:bg-rose-700 hover:bg-rose-300 dark:hover:bg-rose-600'
                    }`}
                  />
                ))}
              </div>

              {/* Mobile next arrow */}
              <button
                onClick={next}
                disabled={!hasNext}
                aria-label="Ticket siguiente"
                className="sm:hidden w-8 h-8 flex items-center justify-center rounded-full border transition-all duration-200
                  border-rose-200 dark:border-rose-700 bg-white/70 dark:bg-rose-950/50
                  text-rose-600 dark:text-rose-300
                  disabled:opacity-25 disabled:cursor-not-allowed"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TicketListComponent;
