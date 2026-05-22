import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { UserPermissions } from "../shared/models/user.model";

@Injectable({ providedIn: "root" })
export class PermissionsApiService {
  getUserPermissions(): Observable<UserPermissions> {
    return of({
      userId: "1",
      departmentId: "1",
      departmentName: "Support",
      role: "ADMIN",
      permissions: [],
      allowedIncidentTypes: [],
      allowedActions: ["CREATE", "READ", "UPDATE", "DELETE"],
    });
  }
}
