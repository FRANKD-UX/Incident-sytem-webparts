import { AuthenticatedUserContext, AuthTokenProvider } from './authTypes';

export const createAnonymousTokenProvider = (): AuthTokenProvider => ({
  async getAccessToken(): Promise<string> {
    return '';
  }
});

export const createUserContext = (displayName: string, email: string): AuthenticatedUserContext => ({
  userId: email,
  displayName,
  email,
  roles: []
});
