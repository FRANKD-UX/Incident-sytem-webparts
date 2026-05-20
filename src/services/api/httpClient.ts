import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { PlatformConfig } from '../../common/types/PlatformConfig';

const defaultConfig: PlatformConfig = {
  apiBaseUrl: '',
  useMockData: true
};

export const resolvePlatformConfig = (apiBaseUrl?: string): PlatformConfig => ({
  ...defaultConfig,
  ...window.__INCIDENT_PLATFORM_CONFIG__,
  apiBaseUrl: apiBaseUrl ?? window.__INCIDENT_PLATFORM_CONFIG__?.apiBaseUrl ?? defaultConfig.apiBaseUrl
});

export interface ApiClient {
  get<TResponse>(url: string, config?: AxiosRequestConfig): Promise<TResponse>;
  post<TRequest, TResponse>(url: string, data: TRequest, config?: AxiosRequestConfig): Promise<TResponse>;
}

export const createApiClient = (platformConfig: PlatformConfig): ApiClient => {
  const instance: AxiosInstance = axios.create({
    baseURL: platformConfig.apiBaseUrl,
    headers: { Accept: 'application/json' }
  });

  return {
    async get<TResponse>(url: string, config?: AxiosRequestConfig): Promise<TResponse> {
      const response = await instance.get<TResponse>(url, config);
      return response.data;
    },
    async post<TRequest, TResponse>(url: string, data: TRequest, config?: AxiosRequestConfig): Promise<TResponse> {
      const response = await instance.post<TResponse>(url, data, config);
      return response.data;
    }
  };
};
