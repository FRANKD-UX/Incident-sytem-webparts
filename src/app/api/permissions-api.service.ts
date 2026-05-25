import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { UserPermissions } from "../shared/models/user.model";
import { AuthService } from "../core/auth/auth.service";

@Injectable({ providedIn: "root" })
export class PermissionsApiService {
  constructor(private readonly auth: AuthService) {}

  getUserPermissions(): Observable<UserPermissions> {
    return of(this.auth.getPermissions());
  }
}
