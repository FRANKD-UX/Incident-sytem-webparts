export interface AuthenticatedUserContext {
  userId: string;
  displayName: string;
  email: string;
  roles: string[];
}

export interface AuthTokenProvider {
  getAccessToken(): Promise<string>;
}
