import { Timestamp } from 'firebase/firestore';

export type TicketStatus = 'pendiente' | 'canjeado' | 'completado' | 'confirmado' | 'propuesto';

export type UserRole = 'usuario_principal' | 'novia';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  displayName?: string;
}

export interface TicketTimestamps {
  createdAt: Timestamp;
  redeemedAt?: Timestamp;
  completedAt?: Timestamp;
  confirmedAt?: Timestamp;
  proposedAt?: Timestamp;
  approvedAt?: Timestamp;
}

export interface Ticket {
  id: string;
  description: string;
  status: TicketStatus;
  createdBy: string;
  redeemedBy?: string;
  completedBy?: string;
  confirmedBy?: string;
  timestamps: TicketTimestamps;
  rejectionReason?: string;
}

export type TicketAction = 'redeem' | 'complete' | 'confirm' | 'reject' | 'approve' | 'rejectProposal';

// Validation Result
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// UseAuth Return Type
export interface UseAuthReturn {
  user: User | null;
  userRole: 'usuario_principal' | 'novia' | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// UseTickets Return Type
export interface UseTicketsReturn {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
  redeemTicket: (ticketId: string) => Promise<void>;
  completeTicket: (ticketId: string) => Promise<void>;
  confirmTicket: (ticketId: string) => Promise<void>;
  rejectCompletion: (ticketId: string) => Promise<void>;
  proposeTicket: (description: string) => Promise<void>;
  approveProposal: (ticketId: string) => Promise<void>;
  rejectProposal: (ticketId: string, reason: string) => Promise<void>;
}

// UseHistory Return Type
export interface UseHistoryReturn {
  history: Ticket[];
  loading: boolean;
  error: string | null;
  filterByStatus: (status: TicketStatus | 'all') => void;
  currentFilter: TicketStatus | 'all';
}
