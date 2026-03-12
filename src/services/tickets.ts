import {
  collection,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  Timestamp,
  type Unsubscribe,
  type QueryConstraint,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import type { Ticket, TicketStatus } from '../types';

/**
 * FirestoreTicketService
 * 
 * Abstracción de operaciones CRUD de tickets en Firestore que proporciona:
 * - Suscripción a tickets en tiempo real (subscribeToTickets)
 * - Creación de tickets (createTicket)
 * - Actualización de estado de tickets (updateTicketStatus)
 * - Eliminación de tickets (deleteTicket)
 * - Obtención de ticket por ID (getTicketById)
 * 
 * Incluye validación de transiciones de estado y retry logic con exponential backoff.
 * Requirements: 9.1, 9.2, 9.3
 */
export class FirestoreTicketService {
  private readonly ticketsCollection = 'tickets';
  private readonly maxRetries = 3;
  private readonly baseDelayMs = 1000;

  /**
   * Valida si una transición de estado es válida según la máquina de estados
   * @param currentStatus - Estado actual del ticket
   * @param newStatus - Nuevo estado propuesto
   * @returns true si la transición es válida, false en caso contrario
   */
  private validateStateTransition(
    currentStatus: TicketStatus,
    newStatus: TicketStatus
  ): boolean {
    const validTransitions: Record<TicketStatus, TicketStatus[]> = {
      propuesto: ['pendiente'],
      pendiente: ['canjeado'],
      canjeado: ['completado'],
      completado: ['confirmado', 'canjeado'],
      confirmado: [],
    };

    return validTransitions[currentStatus]?.includes(newStatus) ?? false;
  }

  /**
   * Implementa delay para exponential backoff
   * @param attempt - Número de intento actual (0-indexed)
   */
  private async delay(attempt: number): Promise<void> {
    const delayMs = this.baseDelayMs * Math.pow(2, attempt);
    return new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  /**
   * Ejecuta una operación con retry logic y exponential backoff
   * @param operation - Función asíncrona a ejecutar
   * @param operationName - Nombre de la operación para mensajes de error
   * @returns Promise con el resultado de la operación
   * @throws Error si la operación falla después de todos los reintentos
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;

        // No reintentar en caso de errores de permisos
        if (error.code === 'permission-denied') {
          throw new Error('No tienes permiso para realizar esta acción');
        }

        // No reintentar en caso de documento no encontrado
        if (error.code === 'not-found') {
          throw new Error('Ticket no encontrado');
        }

        // Reintentar solo en caso de errores de red o disponibilidad
        if (
          (error.code === 'unavailable' || error.code === 'deadline-exceeded') &&
          attempt < this.maxRetries - 1
        ) {
          await this.delay(attempt);
          continue;
        }

        // Si no es un error recuperable o ya agotamos los reintentos, lanzar error
        if (attempt === this.maxRetries - 1) {
          break;
        }
      }
    }

    throw new Error(
      `${operationName} falló después de ${this.maxRetries} intentos: ${lastError?.message}`
    );
  }

  /**
   * Suscribe un callback a cambios en tiempo real de tickets
   * @param status - Estado de tickets a filtrar ('all' para todos)
   * @param callback - Función que recibe la lista actualizada de tickets
   * @returns Función para cancelar la suscripción
   */
  subscribeToTickets(
    status: TicketStatus | 'all',
    callback: (tickets: Ticket[]) => void
  ): Unsubscribe {
    const ticketsRef = collection(db, this.ticketsCollection);
    
    // Construir query con filtro de estado si no es 'all'
    const constraints: QueryConstraint[] = [];
    if (status !== 'all') {
      constraints.push(where('status', '==', status));
    }
    
    const q = query(ticketsRef, ...constraints);

    // Suscribirse a cambios en tiempo real
    return onSnapshot(
      q,
      (snapshot) => {
        const tickets: Ticket[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Ticket));
        callback(tickets);
      },
      (error) => {
        console.error('Error en suscripción a tickets:', error);
        // Llamar callback con array vacío en caso de error
        callback([]);
      }
    );
  }

  /**
   * Crea un nuevo ticket en Firestore
   * @param ticket - Datos del ticket (sin id ni timestamps)
   * @returns Promise con el ID del ticket creado
   * @throws Error si la creación falla
   */
  async createTicket(
    ticket: Omit<Ticket, 'id' | 'timestamps'>
  ): Promise<string> {
    return this.executeWithRetry(async () => {
      // Validar descripción
      if (!ticket.description || ticket.description.trim().length === 0) {
        throw new Error('La descripción es requerida');
      }

      if (ticket.description.length < 5) {
        throw new Error('La descripción debe tener al menos 5 caracteres');
      }

      if (ticket.description.length > 200) {
        throw new Error('La descripción no puede exceder 200 caracteres');
      }

      const ticketsRef = collection(db, this.ticketsCollection);
      
      // Preparar datos del ticket con timestamps
      const ticketData = {
        ...ticket,
        timestamps: {
          createdAt: Timestamp.now(),
          ...(ticket.status === 'propuesto' && { proposedAt: Timestamp.now() }),
        },
      };

      const docRef = await addDoc(ticketsRef, ticketData);
      return docRef.id;
    }, 'Crear ticket');
  }

  /**
   * Actualiza el estado de un ticket con validación de transiciones
   * @param ticketId - ID del ticket a actualizar
   * @param newStatus - Nuevo estado del ticket
   * @param metadata - Metadatos adicionales (ej: userId, rejectionReason)
   * @returns Promise que se resuelve cuando se actualiza el ticket
   * @throws Error si la transición es inválida o la actualización falla
   */
  async updateTicketStatus(
    ticketId: string,
    newStatus: TicketStatus,
    metadata?: Record<string, any>
  ): Promise<void> {
    return this.executeWithRetry(async () => {
      // Obtener ticket actual para validar transición
      const ticket = await this.getTicketById(ticketId);
      
      if (!ticket) {
        throw new Error('Ticket no encontrado');
      }

      // Validar transición de estado
      if (!this.validateStateTransition(ticket.status, newStatus)) {
        throw new Error(
          `Transición de estado inválida: ${ticket.status} -> ${newStatus}`
        );
      }

      const ticketRef = doc(db, this.ticketsCollection, ticketId);
      
      // Preparar actualización con timestamps correspondientes
      const updates: any = {
        status: newStatus,
        ...metadata,
      };

      // Agregar timestamp según el nuevo estado
      switch (newStatus) {
        case 'pendiente':
          updates['timestamps.approvedAt'] = Timestamp.now();
          break;
        case 'canjeado':
          updates['timestamps.redeemedAt'] = Timestamp.now();
          break;
        case 'completado':
          updates['timestamps.completedAt'] = Timestamp.now();
          break;
        case 'confirmado':
          updates['timestamps.confirmedAt'] = Timestamp.now();
          break;
      }

      await updateDoc(ticketRef, updates);
    }, 'Actualizar estado de ticket');
  }

  /**
   * Elimina un ticket de Firestore
   * @param ticketId - ID del ticket a eliminar
   * @returns Promise que se resuelve cuando se elimina el ticket
   * @throws Error si la eliminación falla
   */
  async deleteTicket(ticketId: string): Promise<void> {
    return this.executeWithRetry(async () => {
      const ticketRef = doc(db, this.ticketsCollection, ticketId);
      await deleteDoc(ticketRef);
    }, 'Eliminar ticket');
  }

  /**
   * Obtiene un ticket por su ID
   * @param ticketId - ID del ticket
   * @returns Promise con el ticket o null si no existe
   * @throws Error si la consulta falla
   */
  async getTicketById(ticketId: string): Promise<Ticket | null> {
    return this.executeWithRetry(async () => {
      const ticketRef = doc(db, this.ticketsCollection, ticketId);
      const ticketDoc = await getDoc(ticketRef);

      if (!ticketDoc.exists()) {
        return null;
      }

      return {
        id: ticketDoc.id,
        ...ticketDoc.data(),
      } as Ticket;
    }, 'Obtener ticket');
  }
}

// Exportar instancia singleton del servicio
export const firestoreTicketService = new FirestoreTicketService();
