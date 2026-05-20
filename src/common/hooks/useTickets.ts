import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { TicketListResult, TicketQuery } from '../../models/Ticket';
import { getTickets } from '../../services/api/ticketApi';
import { useApiRuntime } from './useApiContext';

export const useTickets = (query: TicketQuery): UseQueryResult<TicketListResult> => {
  const { client, config } = useApiRuntime();
  return useQuery({
    queryKey: ['tickets', query],
    queryFn: () => getTickets(client, config.useMockData, query)
  });
};
