import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import TicketCardComponent from './TicketCardComponent';
import type { Ticket } from '../types';
import { Timestamp } from 'firebase/firestore';

describe('TicketCardComponent', () => {
  const mockOnAction = vi.fn();

  const createMockTicket = (overrides?: Partial<Ticket>): Ticket => ({
    id: 'test-ticket-1',
    description: 'Test ticket description',
    status: 'pendiente',
    createdBy: 'user1',
    timestamps: {
      createdAt: Timestamp.fromDate(new Date('2024-01-15T10:00:00Z')),
    },
    ...overrides,
  });

  beforeEach(() => {
    mockOnAction.mockClear();
  });

  describe('Display Requirements (2.2, 8.3)', () => {
    test('displays ticket description', () => {
      const ticket = createMockTicket({ description: 'Cena romántica en casa' });
      render(<TicketCardComponent ticket={ticket} userRole="novia" onAction={mockOnAction} />);
      
      expect(screen.getByText('Cena romántica en casa')).toBeInTheDocument();
    });

    test('displays ticket status', () => {
      const ticket = createMockTicket({ status: 'pendiente' });
      render(<TicketCardComponent ticket={ticket} userRole="novia" onAction={mockOnAction} />);
      
      expect(screen.getByText('Pendiente')).toBeInTheDocument();
    });

    test('displays created timestamp', () => {
      const ticket = createMockTicket();
      render(<TicketCardComponent ticket={ticket} userRole="novia" onAction={mockOnAction} />);
      
      expect(screen.getByText(/Creado:/)).toBeInTheDocument();
    });

    test('displays redeemed timestamp when present', () => {
      const ticket = createMockTicket({
        status: 'canjeado',
        timestamps: {
          createdAt: Timestamp.fromDate(new Date('2024-01-15T10:00:00Z')),
          redeemedAt: Timestamp.fromDate(new Date('2024-01-16T14:30:00Z')),
        },
      });
      render(<TicketCardComponent ticket={ticket} userRole="usuario_principal" onAction={mockOnAction} />);
      
      expect(screen.getByText(/Canjeado:/)).toBeInTheDocument();
    });

    test('displays completed timestamp when present', () => {
      const ticket = createMockTicket({
        status: 'completado',
        timestamps: {
          createdAt: Timestamp.fromDate(new Date('2024-01-15T10:00:00Z')),
          redeemedAt: Timestamp.fromDate(new Date('2024-01-16T14:30:00Z')),
          completedAt: Timestamp.fromDate(new Date('2024-01-17T18:00:00Z')),
        },
      });
      render(<TicketCardComponent ticket={ticket} userRole="novia" onAction={mockOnAction} />);
      
      expect(screen.getByText(/Completado:/)).toBeInTheDocument();
    });

    test('displays rejection reason when present', () => {
      const ticket = createMockTicket({
        rejectionReason: 'No cumple con los requisitos',
      });
      render(<TicketCardComponent ticket={ticket} userRole="novia" onAction={mockOnAction} />);
      
      expect(screen.getByText(/Razón de rechazo:/)).toBeInTheDocument();
      expect(screen.getByText(/No cumple con los requisitos/)).toBeInTheDocument();
    });
  });

  describe('Action Buttons Logic', () => {
    test('shows "Canjear" button for Novia with pendiente ticket', () => {
      const ticket = createMockTicket({ status: 'pendiente' });
      render(<TicketCardComponent ticket={ticket} userRole="novia" onAction={mockOnAction} />);
      
      const button = screen.getByRole('button', { name: /Canjear/i });
      expect(button).toBeInTheDocument();
    });

    test('calls onAction with "redeem" when Canjear button is clicked', () => {
      const ticket = createMockTicket({ status: 'pendiente' });
      render(<TicketCardComponent ticket={ticket} userRole="novia" onAction={mockOnAction} />);
      
      const button = screen.getByRole('button', { name: /Canjear/i });
      fireEvent.click(button);
      
      expect(mockOnAction).toHaveBeenCalledWith('redeem');
    });

    test('shows "Completar" button for Usuario Principal with canjeado ticket', () => {
      const ticket = createMockTicket({ status: 'canjeado' });
      render(<TicketCardComponent ticket={ticket} userRole="usuario_principal" onAction={mockOnAction} />);
      
      const button = screen.getByRole('button', { name: /Completar/i });
      expect(button).toBeInTheDocument();
    });

    test('calls onAction with "complete" when Completar button is clicked', () => {
      const ticket = createMockTicket({ status: 'canjeado' });
      render(<TicketCardComponent ticket={ticket} userRole="usuario_principal" onAction={mockOnAction} />);
      
      const button = screen.getByRole('button', { name: /Completar/i });
      fireEvent.click(button);
      
      expect(mockOnAction).toHaveBeenCalledWith('complete');
    });

    test('shows "Confirmar" and "Rechazar" buttons for Novia with completado ticket', () => {
      const ticket = createMockTicket({ status: 'completado' });
      render(<TicketCardComponent ticket={ticket} userRole="novia" onAction={mockOnAction} />);
      
      expect(screen.getByRole('button', { name: /Confirmar/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Rechazar/i })).toBeInTheDocument();
    });

    test('calls onAction with "confirm" when Confirmar button is clicked', () => {
      const ticket = createMockTicket({ status: 'completado' });
      render(<TicketCardComponent ticket={ticket} userRole="novia" onAction={mockOnAction} />);
      
      const button = screen.getByRole('button', { name: /Confirmar/i });
      fireEvent.click(button);
      
      expect(mockOnAction).toHaveBeenCalledWith('confirm');
    });

    test('calls onAction with "reject" when Rechazar button is clicked for completado ticket', () => {
      const ticket = createMockTicket({ status: 'completado' });
      render(<TicketCardComponent ticket={ticket} userRole="novia" onAction={mockOnAction} />);
      
      const button = screen.getByRole('button', { name: /Rechazar/i });
      fireEvent.click(button);
      
      expect(mockOnAction).toHaveBeenCalledWith('reject');
    });

    test('shows "Aprobar" and "Rechazar" buttons for Usuario Principal with propuesto ticket', () => {
      const ticket = createMockTicket({ status: 'propuesto' });
      render(<TicketCardComponent ticket={ticket} userRole="usuario_principal" onAction={mockOnAction} />);
      
      expect(screen.getByRole('button', { name: /Aprobar/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Rechazar/i })).toBeInTheDocument();
    });

    test('calls onAction with "approve" when Aprobar button is clicked', () => {
      const ticket = createMockTicket({ status: 'propuesto' });
      render(<TicketCardComponent ticket={ticket} userRole="usuario_principal" onAction={mockOnAction} />);
      
      const button = screen.getByRole('button', { name: /Aprobar/i });
      fireEvent.click(button);
      
      expect(mockOnAction).toHaveBeenCalledWith('approve');
    });

    test('calls onAction with "rejectProposal" when Rechazar button is clicked for propuesto ticket', () => {
      const ticket = createMockTicket({ status: 'propuesto' });
      render(<TicketCardComponent ticket={ticket} userRole="usuario_principal" onAction={mockOnAction} />);
      
      const button = screen.getByRole('button', { name: /Rechazar/i });
      fireEvent.click(button);
      
      expect(mockOnAction).toHaveBeenCalledWith('rejectProposal');
    });

    test('shows no action buttons for confirmado ticket', () => {
      const ticket = createMockTicket({ status: 'confirmado' });
      render(<TicketCardComponent ticket={ticket} userRole="novia" onAction={mockOnAction} />);
      
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    test('shows no action buttons for wrong role/status combination', () => {
      const ticket = createMockTicket({ status: 'pendiente' });
      render(<TicketCardComponent ticket={ticket} userRole="usuario_principal" onAction={mockOnAction} />);
      
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Responsive Design (10.1, 10.2, 10.3, 10.4)', () => {
    test('applies responsive classes for mobile and desktop', () => {
      const ticket = createMockTicket();
      const { container } = render(
        <TicketCardComponent ticket={ticket} userRole="novia" onAction={mockOnAction} />
      );
      
      // Check for responsive padding classes (p-4 sm:p-6)
      const card = container.querySelector('.p-4.sm\\:p-6');
      expect(card).toBeInTheDocument();
    });

    test('applies responsive text size classes', () => {
      const ticket = createMockTicket();
      const { container } = render(
        <TicketCardComponent ticket={ticket} userRole="novia" onAction={mockOnAction} />
      );
      
      // Check for responsive text classes (text-sm sm:text-base)
      const description = container.querySelector('.text-sm.sm\\:text-base');
      expect(description).toBeInTheDocument();
    });

    test('applies responsive button layout for multiple buttons', () => {
      const ticket = createMockTicket({ status: 'completado' });
      const { container } = render(
        <TicketCardComponent ticket={ticket} userRole="novia" onAction={mockOnAction} />
      );
      
      // Check for responsive flex direction (flex-col sm:flex-row)
      const buttonContainer = container.querySelector('.flex-col.sm\\:flex-row');
      expect(buttonContainer).toBeInTheDocument();
    });
  });

  describe('Status Display', () => {
    test.each([
      ['pendiente', 'Pendiente', 'bg-blue-100'],
      ['canjeado', 'Canjeado', 'bg-yellow-100'],
      ['completado', 'Completado', 'bg-purple-100'],
      ['confirmado', 'Confirmado', 'bg-green-100'],
      ['propuesto', 'Propuesto', 'bg-gray-100'],
    ])('displays correct status badge for %s status', (status, displayText, colorClass) => {
      const ticket = createMockTicket({ status: status as any });
      const { container } = render(
        <TicketCardComponent ticket={ticket} userRole="novia" onAction={mockOnAction} />
      );
      
      expect(screen.getByText(displayText)).toBeInTheDocument();
      const badge = container.querySelector(`.${colorClass}`);
      expect(badge).toBeInTheDocument();
    });
  });
});
