import { TicketPriority, TicketStatus } from './Ticket';

export interface FilterState {
  id: string;
  name: string;
  owner: string;
  search?: string;
  statuses: TicketStatus[];
  priorities: TicketPriority[];
  departments: string[];
  isShared: boolean;
}
