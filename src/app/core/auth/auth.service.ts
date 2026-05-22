import { Injectable, inject } from "@angular/core";
import { Observable, BehaviorSubject, from, throwError, of, forkJoin } from "rxjs";
import { catchError, map, switchMap, tap } from "rxjs/operators";
import { HttpClientService } from "../services/http-client.service";
import { User, UserPermissions } from "../../shared/models/user.model";

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  permissions: UserPermissions | null;
}

interface MsalLoginResponse {
  accessToken: string;
  idToken: string;
  account: {
    homeAccountId: string;
    username: string;
    name: string;
  };
}

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly http = inject(HttpClientService);

  private readonly authState = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    permissions: null,
  });

  readonly authState$ = this.authState.asObservable();

  constructor() {
    this.checkExistingAuth();
  }

  loginWithMicrosoft(): Observable<void> {
    return from(this.msalLogin()).pipe(
      switchMap((response) => this.processAuthResponse(response.accessToken)),
    );
  }

  validateToken(token: string): Observable<boolean> {
    return this.http.post<{ valid: boolean }>("/auth/validate", { token }).pipe(
      map((result) => result.valid),
      catchError(() => of(false)),
    );
  }

  isAuthenticated(): boolean {
    return this.authState.value.isAuthenticated;
  }

  getToken(): string | null {
    return this.authState.value.token;
  }

  getUser(): User | null {
    return this.authState.value.user;
  }

  getPermissions(): UserPermissions | null {
    return this.authState.value.permissions;
  }

  hasPermission(resource: string): boolean {
    const permissions = this.authState.value.permissions;
    if (!permissions) {
      return false;
    }

    return (
      permissions.allowedActions.includes(resource) ||
      permissions.permissions.some((permission) => permission.resource === resource)
    );
  }

  logout(): void {
    localStorage.removeItem("access_token");
    localStorage.removeItem("redirectUrl");
    this.authState.next({
      isAuthenticated: false,
      user: null,
      token: null,
      permissions: null,
    });
  }

  refreshToken(): Observable<string> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error("No token available to refresh."));
    }

    return this.http.post<{ token: string }>("/auth/refresh", { token }).pipe(
      map((response) => response.token),
      tap((newToken) => {
        localStorage.setItem("access_token", newToken);
        this.authState.next({ ...this.authState.value, token: newToken });
      }),
    );
  }

  private checkExistingAuth(): void {
    const token = localStorage.getItem("access_token");
    if (!token) {
      return;
    }

    this.validateToken(token)
      .pipe(
        switchMap((valid) => {
          if (!valid) {
            this.logout();
            return of(undefined);
          }
          return this.processAuthResponse(token);
        }),
      )
      .subscribe({
        error: () => this.logout(),
      });
  }

  private async msalLogin(): Promise<MsalLoginResponse> {
    return {
      accessToken: `mock-access-token-${Date.now()}`,
      idToken: `mock-id-token-${Date.now()}`,
      account: {
        homeAccountId: "mock-home-account",
        username: "jane.smith@contoso.com",
        name: "Jane Smith",
      },
    };
  }

  private processAuthResponse(token: string): Observable<void> {
    localStorage.setItem("access_token", token);

    return forkJoin({
      user: this.loadUserInfo(),
      permissions: this.loadUserPermissions(),
    }).pipe(
      tap(({ user, permissions }) => {
        this.authState.next({
          isAuthenticated: true,
          user,
          token,
          permissions,
        });
      }),
      map(() => void 0),
    );
  }

  private loadUserInfo(): Observable<User> {
    return this.http.get<User>("/me");
  }

  private loadUserPermissions(): Observable<UserPermissions> {
    return this.http.get<UserPermissions>("/me/permissions");
  }
}
