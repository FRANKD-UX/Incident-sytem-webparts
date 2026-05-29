import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, delay, of } from "rxjs";
import {
  Department,
  User,
  UserPermissions,
} from "../../shared/models/user.model";

type MockRole = "AGENT" | "ADMIN" | "SYSTEM_ADMIN";

const MOCK_DEPARTMENTS: Record<"SUP" | "OPS", Department> = {
  SUP: { id: "1", name: "Support", code: "SUP", isActive: true },
  OPS: { id: "2", name: "Operations", code: "OPS", isActive: true },
};

const MOCK_USERS: Record<MockRole, User> = {
  AGENT: {
    id: "1",
    displayName: "Test Agent",
    email: "agent@test.com",
    department: MOCK_DEPARTMENTS.SUP,
    role: {
      id: "role-agent",
      name: "AGENT",
      departmentId: "1",
      permissions: [],
    },
    permissions: [],
  },
  ADMIN: {
    id: "2",
    displayName: "Test Admin",
    email: "admin@test.com",
    department: MOCK_DEPARTMENTS.SUP,
    role: {
      id: "role-admin",
      name: "ADMIN",
      departmentId: "1",
      permissions: [],
    },
    permissions: [],
  },
  SYSTEM_ADMIN: {
    id: "3",
    displayName: "System Admin",
    email: "sysadmin@test.com",
    department: MOCK_DEPARTMENTS.OPS,
    role: {
      id: "role-system-admin",
      name: "SYSTEM_ADMIN",
      departmentId: "2",
      permissions: [],
    },
    permissions: [],
  },
};

const ROLE_ALLOWED_ACTIONS: Record<MockRole, string[]> = {
  AGENT: [
    "VIEW_INCIDENTS",
    "CREATE_INCIDENT",
    "VIEW_INCIDENT_DETAILS",
    "VIEW_BOARD",
  ],
  ADMIN: [
    "VIEW_INCIDENTS",
    "CREATE_INCIDENT",
    "VIEW_INCIDENT_DETAILS",
    "VIEW_BOARD",
  ],
  SYSTEM_ADMIN: [
    "VIEW_INCIDENTS",
    "CREATE_INCIDENT",
    "VIEW_INCIDENT_DETAILS",
    "VIEW_BOARD",
  ],
};

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly user$ = new BehaviorSubject<User | null>(this.restoreUser());
  private readonly token$ = new BehaviorSubject<string | null>(
    localStorage.getItem("access_token"),
  );

  isAuthenticated(): boolean {
    return !!this.user$.value;
  }

  getToken(): string | null {
    return this.token$.value;
  }

  getCurrentUser(): User | null {
    return this.user$.value;
  }

  getUser(): User {
    return this.user$.value ?? MOCK_USERS.ADMIN;
  }

  hasAnyRole(requiredRoles: string[]): boolean {
    if (!requiredRoles.length) {
      return true;
    }

    const currentRole = this.user$.value?.role.name;
    return !!currentRole && requiredRoles.includes(currentRole);
  }

  hasAnyPermission(requiredPermissions: string[]): boolean {
    if (!requiredPermissions.length) {
      return true;
    }

    const permissions = this.getPermissions();
    return requiredPermissions.some((permission) =>
      permissions.allowedActions.includes(permission),
    );
  }

  getPermissions(): UserPermissions {
    const user = this.user$.value;
    const role = (user?.role.name as MockRole | undefined) ?? "AGENT";

    return {
      userId: user?.id ?? "",
      departmentId: user?.department.id ?? "",
      departmentName: user?.department.name ?? "",
      role: user?.role.name ?? "ANONYMOUS",
      permissions: user?.permissions ?? [],
      allowedIncidentTypes: ["1"],
      allowedActions: user ? ROLE_ALLOWED_ACTIONS[role] : [],
    };
  }

  loginWithMicrosoft(role: MockRole = "ADMIN"): Observable<User> {
    const user = MOCK_USERS[role];
    const token = `mock-token-${role.toLowerCase()}`;
    this.setSession(user, token);
    return of(user).pipe(delay(120));
  }

  setMockUser(role: MockRole | null): void {
    if (!role) {
      this.logout();
      return;
    }

    const user = MOCK_USERS[role];
    this.setSession(user, `mock-token-${role.toLowerCase()}`);
  }

  refreshToken(): Promise<string | null> {
    return Promise.resolve(this.token$.value);
  }

  logout(): void {
    this.user$.next(null);
    this.token$.next(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("mock_auth_user");
  }

  private setSession(user: User, token: string): void {
    this.user$.next(user);
    this.token$.next(token);
    localStorage.setItem("access_token", token);
    localStorage.setItem("mock_auth_user", JSON.stringify(user));
  }

  private restoreUser(): User | null {
    const rawUser = localStorage.getItem("mock_auth_user");
    if (!rawUser) {
      return null;
    }

    try {
      return JSON.parse(rawUser) as User;
    } catch {
      return null;
    }
  }
}
