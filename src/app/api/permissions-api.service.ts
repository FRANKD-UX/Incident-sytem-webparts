import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClientService } from "../core/services/http-client.service";
import { UserPermissions } from "../shared/models/user.model";

@Injectable({ providedIn: "root" })
export class PermissionsApiService {
  private readonly http = inject(HttpClientService);

  getUserPermissions(): Observable<UserPermissions> {
    return this.http.get<UserPermissions>("/me/permissions");
  }
}
