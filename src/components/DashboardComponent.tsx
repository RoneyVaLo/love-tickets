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

/**
 * DashboardComponent - Main dashboard view organized by user role
 * 
 * Validates Requirements: 2.1, 4.1, 5.1, 6.1, 7.1, 8.1, 10.1, 10.2, 10.3, 10.4
 * 
 * Features:
 * - Organizes components based on user role
 * - For Novia: shows available tickets, completed tickets pending confirmation, button to propose tickets
 * - For Usuario Principal: shows redeemed tickets, proposed tickets pending approval
 * - Includes access to history for both roles
 * - Responsive design with TailwindCSS (mobile min 320px, desktop min 1024px)
 */
const DashboardComponent: React.FC<DashboardComponentProps> = ({ addNotification }) => {
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();
  const {
    tickets,
    loading,
    error,
    redeemTicket,
    completeTicket,
    confirmTicket,
    rejectCompletion,
    proposeTicket,
    approveProposal,
    rejectProposal,
  } = useTickets(userRole, addNotification);

  const [showCreateTicket, setShowCreateTicket] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  /**
   * Handle sign out
   */
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (err: any) {
      setActionError(err.message || 'Error al cerrar sesión');
    }
  };

  /**
   * Handle ticket actions based on action type
   */
  const handleTicketAction = async (ticketId: string, action: TicketAction) => {
    try {
      setActionError(null);

      switch (action) {
        case 'redeem':
          await redeemTicket(ticketId);
          break;
        case 'complete':
          await completeTicket(ticketId);
          break;
        case 'confirm':
          await confirmTicket(ticketId);
          break;
        case 'reject':
          // 'reject' is used for rejecting completion (Novia rejects completed ticket)
          await rejectCompletion(ticketId);
          break;
        case 'approve':
          await approveProposal(ticketId);
          break;
        case 'rejectProposal':
          // 'rejectProposal' is used for rejecting proposals (Usuario Principal rejects proposed ticket)
          await rejectProposal(ticketId, 'Rechazado por el Usuario Principal');
          break;
        default:
          throw new Error(`Acción desconocida: ${action}`);
      }
    } catch (err: any) {
      setActionError(err.message || 'Error al realizar la acción');
    }
  };

  /**
   * Handle ticket proposal submission
   */
  const handleProposeTicket = async (description: string) => {
    await proposeTicket(description);
    setShowCreateTicket(false);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-red-800 font-semibold mb-2">Error</h3>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Dashboard
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1">
                Bienvenido, {user?.displayName || user?.email}
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                  {userRole === 'usuario_principal' ? 'Usuario Principal' : 'Novia'}
                </span>
              </p>
            </div>
            
            {/* Navigation buttons */}
            <div className="flex items-center gap-2">
              <ThemeSwitcher />
              <Link
                to="/history"
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Ver Histórico
              </Link>
              
              <button
                onClick={handleSignOut}
                className="inline-flex items-center justify-center px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-white hover:bg-red-50 transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Action Error Display */}
        {actionError && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4">
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
                <p className="text-sm font-medium text-red-800 dark:text-red-300">{actionError}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setActionError(null)}
                  className="inline-flex text-red-400 hover:text-red-600"
                >
                  <span className="sr-only">Cerrar</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Role-specific content */}
        {userRole === 'novia' ? (
          <div className="space-y-8">
            {/* Propose Ticket Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Proponer Ticket
                </h2>
                {!showCreateTicket && (
                  <button
                    onClick={() => setShowCreateTicket(true)}
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Nuevo Ticket
                  </button>
                )}
              </div>
              
              {showCreateTicket && (
                <div className="mb-6">
                  <CreateTicketComponent onSubmit={handleProposeTicket} />
                  <button
                    onClick={() => setShowCreateTicket(false)}
                    className="mt-4 text-sm text-gray-600 hover:text-gray-800 underline"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </section>

            {/* Available Tickets Section */}
            <section>
              <TicketListComponent
                tickets={tickets}
                userRole={userRole}
                onTicketAction={handleTicketAction}
                listType="available"
              />
            </section>

            {/* Completed Tickets Pending Confirmation Section */}
            <section>
              <TicketListComponent
                tickets={tickets}
                userRole={userRole}
                onTicketAction={handleTicketAction}
                listType="completed"
              />
            </section>
          </div>
        ) : userRole === 'usuario_principal' ? (
          <div className="space-y-8">
            {/* Proposed Tickets Pending Approval Section */}
            <section>
              <TicketListComponent
                tickets={tickets}
                userRole={userRole}
                onTicketAction={handleTicketAction}
                listType="proposed"
              />
            </section>

            {/* Redeemed Tickets Section */}
            <section>
              <TicketListComponent
                tickets={tickets}
                userRole={userRole}
                onTicketAction={handleTicketAction}
                listType="redeemed"
              />
            </section>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Rol de usuario no reconocido</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardComponent;
