export interface PlatformConfig {
  apiBaseUrl: string;
  useMockData: boolean;
}

declare global {
  interface Window {
    __INCIDENT_PLATFORM_CONFIG__?: Partial<PlatformConfig>;
  }
}
