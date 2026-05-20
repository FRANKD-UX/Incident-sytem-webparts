import { TicketListResult, TicketQuery } from '../../models/Ticket';
import { ApiClient } from './httpClient';
import { mockTickets } from './mockData';

export const getTickets = async (client: ApiClient, useMockData: boolean, query: TicketQuery): Promise<TicketListResult> => {
  if (useMockData) {
    const search = query.search?.toLowerCase();
    const filtered = mockTickets.filter((ticket) => {
      const matchesSearch = !search || `${ticket.ticketNumber} ${ticket.subject} ${ticket.department}`.toLowerCase().indexOf(search) >= 0;
      const matchesStatus = !query.status || ticket.status === query.status;
      const matchesPriority = !query.priority || ticket.priority === query.priority;
      return matchesSearch && matchesStatus && matchesPriority;
    });
    const start = query.pageIndex * query.pageSize;
    return { items: filtered.slice(start, start + query.pageSize), total: filtered.length };
  }

  return client.get<TicketListResult>('/tickets', { params: query });
};
