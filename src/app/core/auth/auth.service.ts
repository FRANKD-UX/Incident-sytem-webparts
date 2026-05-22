import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class AuthService {
  isAuthenticated(): boolean {
    return true;
  }

  getToken(): string | null {
    return localStorage.getItem("access_token");
  }

  hasPermission(_resource: string): boolean {
    return true;
  }

  logout(): void {
    localStorage.removeItem("access_token");
  }
}
