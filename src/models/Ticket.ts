import { User } from './User';

export type TicketStatus = 'Open' | 'Pending' | 'Escalated' | 'Closed';
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  department: string;
  assignedTo: User;
  status: TicketStatus;
  priority: TicketPriority;
  category: string;
  createdAt: string;
  updatedAt: string;
  timeSpent: number;
}

export interface TicketQuery {
  search?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  pageIndex: number;
  pageSize: number;
}

export interface TicketListResult {
  items: Ticket[];
  total: number;
}
