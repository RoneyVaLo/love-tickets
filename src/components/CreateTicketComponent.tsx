import React, { useState } from 'react';
import type { FormEvent } from 'react';

interface CreateTicketComponentProps {
  onSubmit: (description: string) => Promise<void>;
}

/**
 * CreateTicketComponent - Form for proposing new tickets
 * 
 * Validates Requirements: 6.1, 6.2, 11.1, 11.2, 10.1, 10.2, 10.3, 10.4
 * 
 * Features:
 * - Form for creating proposed tickets
 * - Description validation (5-200 characters)
 * - Display validation errors
 * - Responsive design with TailwindCSS (mobile min 320px, desktop min 1024px)
 */
const CreateTicketComponent: React.FC<CreateTicketComponentProps> = ({ onSubmit }) => {
  const [description, setDescription] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  // Validation constants
  const MIN_LENGTH = 5;
  const MAX_LENGTH = 200;

  /**
   * Validates ticket description
   * Requirements: 11.1, 11.2
   */
  const validateDescription = (desc: string): { valid: boolean; error?: string } => {
    // Check if empty or only whitespace
    if (!desc || desc.trim().length === 0) {
      return { valid: false, error: 'La descripción es requerida' };
    }

    // Check minimum length
    if (desc.length < MIN_LENGTH) {
      return { valid: false, error: `La descripción debe tener al menos ${MIN_LENGTH} caracteres` };
    }

    // Check maximum length
    if (desc.length > MAX_LENGTH) {
      return { valid: false, error: `La descripción no puede exceder ${MAX_LENGTH} caracteres` };
    }

    return { valid: true };
  };

  /**
   * Handles form submission
   * Requirements: 6.1, 6.2
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Clear previous messages
    setError(null);
    setSuccess(false);

    // Validate description
    const validation = validateDescription(description);
    if (!validation.valid) {
      setError(validation.error || 'Error de validación');
      return;
    }

    setLoading(true);

    try {
      await onSubmit(description);
      
      // Success - clear form and show success message
      setDescription('');
      setSuccess(true);
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al crear el ticket. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles description input change with real-time validation feedback
   */
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setDescription(value);
    
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  // Calculate character count and validation status
  const charCount = description.length;
  const isValid = charCount >= MIN_LENGTH && charCount <= MAX_LENGTH;
  const showCharCount = charCount > 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
          Proponer Nuevo Ticket
        </h3>
        <p className="mt-1 text-xs sm:text-sm text-gray-600">
          Describe la actividad que te gustaría proponer
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Description textarea */}
        <div>
          <label 
            htmlFor="description" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Descripción
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={description}
            onChange={handleDescriptionChange}
            disabled={loading}
            placeholder="Ej: Cena romántica en casa con velas y música..."
            className={`
              w-full px-3 py-2 border rounded-lg 
              placeholder-gray-400 text-gray-900 text-sm sm:text-base
              focus:outline-none focus:ring-2 focus:border-transparent
              disabled:bg-gray-100 disabled:cursor-not-allowed
              transition-colors resize-none
              ${error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'}
            `}
          />
          
          {/* Character count */}
          {showCharCount && (
            <div className="mt-1 flex justify-between items-center text-xs">
              <span className={`
                ${charCount < MIN_LENGTH ? 'text-orange-600' : ''}
                ${isValid ? 'text-green-600' : ''}
                ${charCount > MAX_LENGTH ? 'text-red-600' : ''}
              `}>
                {charCount < MIN_LENGTH && `Mínimo ${MIN_LENGTH} caracteres`}
                {isValid && 'Longitud válida'}
                {charCount > MAX_LENGTH && `Máximo ${MAX_LENGTH} caracteres`}
              </span>
              <span className={`
                ${charCount > MAX_LENGTH ? 'text-red-600 font-semibold' : 'text-gray-500'}
              `}>
                {charCount}/{MAX_LENGTH}
              </span>
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="rounded-lg bg-red-50 p-3 border border-red-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg 
                  className="h-5 w-5 text-red-400" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-xs sm:text-sm font-medium text-red-800">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success message */}
        {success && (
          <div className="rounded-lg bg-green-50 p-3 border border-green-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg 
                  className="h-5 w-5 text-green-400" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-xs sm:text-sm font-medium text-green-800">
                  ¡Ticket propuesto exitosamente!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Submit button */}
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="submit"
            disabled={loading || !description.trim()}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-sm sm:text-base"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg 
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24"
                >
                  <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                  />
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Creando...
              </span>
            ) : (
              'Proponer Ticket'
            )}
          </button>
          
          {description.trim() && !loading && (
            <button
              type="button"
              onClick={() => {
                setDescription('');
                setError(null);
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm sm:text-base"
            >
              Limpiar
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateTicketComponent;
