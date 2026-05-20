import { BoardColumn } from '../../models/BoardColumn';
import { ApiClient } from './httpClient';
import { mockBoardColumns } from './mockData';

export const getBoard = async (client: ApiClient, useMockData: boolean): Promise<BoardColumn[]> => {
  if (useMockData) {
    return mockBoardColumns;
  }

  return client.get<BoardColumn[]>('/board/my-work');
};
