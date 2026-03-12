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
