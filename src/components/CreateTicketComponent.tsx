import React, { useState } from 'react';
import type { FormEvent } from 'react';

interface CreateTicketComponentProps {
  onSubmit: (description: string) => Promise<void>;
}

const MIN_LENGTH = 5;
const MAX_LENGTH = 200;

/**
 * CreateTicketComponent — Romantic ticket proposal form
 * Requirements: 6.1, 6.2, 11.1, 11.2, 10.1–10.4
 */
const CreateTicketComponent: React.FC<CreateTicketComponentProps> = ({ onSubmit }) => {
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = (desc: string) => {
    if (!desc.trim()) return 'La descripción es requerida';
    if (desc.length < MIN_LENGTH) return `Mínimo ${MIN_LENGTH} caracteres`;
    if (desc.length > MAX_LENGTH) return `Máximo ${MAX_LENGTH} caracteres`;
    return null;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const validationError = validate(description);
    if (validationError) { setError(validationError); return; }
    setLoading(true);
    try {
      await onSubmit(description);
      setDescription('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3500);
    } catch (err: any) {
      setError(err.message || 'Error al crear el ticket. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const charCount = description.length;
  const charStatus = charCount === 0 ? 'empty'
    : charCount < MIN_LENGTH ? 'short'
    : charCount > MAX_LENGTH ? 'over'
    : 'valid';

  const charHintClass = charStatus === 'short' ? 'text-amber-600 dark:text-amber-300'
    : charStatus === 'over'  ? 'text-red-600 dark:text-red-300'
    : charStatus === 'valid' ? 'text-emerald-600 dark:text-emerald-300'
    : 'text-stone-400 dark:text-rose-400';

  return (
    <div className="rounded-2xl p-6 animate-fade-up bg-white/80 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-800 shadow-md shadow-rose-900/8 dark:shadow-rose-900/30 backdrop-blur-sm">

      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">💌</span>
          <h3 className="font-display text-xl font-semibold text-rose-900 dark:text-rose-100">
            Proponer Nuevo Ticket
          </h3>
        </div>
        <p className="font-serif italic text-sm text-stone-400 dark:text-rose-300">
          Describe la actividad que te gustaría proponer
        </p>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-5 text-amber-500 dark:text-amber-400">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-200/60 dark:via-amber-500/40 to-transparent" />
        <span className="text-[0.6rem]">✦</span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-200/60 dark:via-amber-500/40 to-transparent" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="description" className="block font-sans text-xs font-bold uppercase tracking-widest mb-1.5 text-rose-700 dark:text-rose-300">
            Descripción
          </label>
          <textarea
            id="description" name="description" rows={4}
            value={description}
            onChange={e => { setDescription(e.target.value); if (error) setError(null); }}
            disabled={loading}
            placeholder="Ej: Cena romántica en casa con velas y música..."
            className="w-full px-4 py-3 rounded-xl text-sm font-sans resize-none bg-white/70 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-700 text-stone-800 dark:text-rose-100 placeholder:text-stone-400 dark:placeholder:text-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-400/40 dark:focus:ring-rose-400/30 focus:border-rose-400 dark:focus:border-rose-500 focus:bg-white dark:focus:bg-rose-950/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          />
          {charCount > 0 && (
            <div className={`flex justify-between items-center mt-1.5 text-xs font-sans ${charHintClass}`}>
              <span>
                {charStatus === 'short' && `Mínimo ${MIN_LENGTH} caracteres`}
                {charStatus === 'valid' && '✓ Longitud válida'}
                {charStatus === 'over'  && `Máximo ${MAX_LENGTH} caracteres`}
              </span>
              <span className="font-bold">{charCount}/{MAX_LENGTH}</span>
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm animate-slide-down bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300" role="alert">
            <span className="flex-shrink-0">⚠</span>
            <p className="font-sans">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm animate-slide-down bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300" role="status">
            <span className="flex-shrink-0">💚</span>
            <p className="font-sans">¡Ticket propuesto exitosamente!</p>
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button type="submit" disabled={loading || !description.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-sans font-bold text-sm tracking-wide bg-gradient-to-r from-rose-700 to-rose-500 dark:from-rose-600 dark:to-rose-400 text-white shadow-md shadow-rose-700/25 hover:shadow-rose-700/40 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0">
            {loading ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin-slow" />
                Enviando...
              </>
            ) : (
              <><span>💌</span> Proponer Ticket</>
            )}
          </button>

          {description.trim() && !loading && (
            <button type="button" onClick={() => { setDescription(''); setError(null); }}
              className="px-4 py-2.5 rounded-xl font-sans font-semibold text-sm bg-white/70 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-700 text-rose-700 dark:text-rose-200 hover:bg-white dark:hover:bg-rose-900/50 hover:border-rose-400 dark:hover:border-rose-500 transition-all duration-200">
              Limpiar
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateTicketComponent;
