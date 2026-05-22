import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClientService } from "../core/services/http-client.service";
import {
  AdminDashboardStats,
  DashboardSummary,
} from "../shared/models/dashboard.model";

@Injectable({ providedIn: "root" })
export class DashboardApiService {
  private readonly http = inject(HttpClientService);

  getDashboardSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>("/dashboard/summary");
  }

  getAdminStats(): Observable<AdminDashboardStats> {
    return this.http.get<AdminDashboardStats>("/dashboard/admin-stats");
  }
}
