import { Ticket, TicketStatus } from './Ticket';

export interface BoardColumn {
  id: TicketStatus;
  title: string;
  tickets: Ticket[];
}
