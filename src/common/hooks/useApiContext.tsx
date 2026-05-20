import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as React from 'react';
import { PlatformConfig } from '../types/PlatformConfig';
import { ApiClient, createApiClient } from '../../services/api/httpClient';

export interface ApiRuntime {
  client: ApiClient;
  config: PlatformConfig;
}

const ApiRuntimeContext = React.createContext<ApiRuntime | undefined>(undefined);

export interface ApiProviderProps {
  config: PlatformConfig;
  children: React.ReactNode;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

export const ApiProvider: React.FC<ApiProviderProps> = ({ config, children }) => {
  const runtime = React.useMemo<ApiRuntime>(() => ({ client: createApiClient(config), config }), [config]);

  return (
    <ApiRuntimeContext.Provider value={runtime}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ApiRuntimeContext.Provider>
  );
};

export const useApiRuntime = (): ApiRuntime => {
  const runtime = React.useContext(ApiRuntimeContext);
  if (!runtime) {
    throw new Error('useApiRuntime must be used inside ApiProvider.');
  }

  return runtime;
};
