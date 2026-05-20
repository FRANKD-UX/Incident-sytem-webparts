import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { BoardColumn } from '../../models/BoardColumn';
import { getBoard } from '../../services/api/boardApi';
import { useApiRuntime } from './useApiContext';

export const useBoard = (): UseQueryResult<BoardColumn[]> => {
  const { client, config } = useApiRuntime();
  return useQuery({
    queryKey: ['board'],
    queryFn: () => getBoard(client, config.useMockData)
  });
};
