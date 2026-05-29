import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ApiResponse } from "../shared/models/common.model";
import {
  DashboardSummary,
  AdminDashboardStats,
} from "../shared/models/dashboard.model";
import { HttpClientService } from "../core/services/http-client.service";

@Injectable({ providedIn: 'root' })
export class DashboardApiService {
  constructor(private readonly http: HttpClientService) {}

  getDashboardSummary(): Observable<DashboardSummary> {
    return this.http
      .get<DashboardSummary>("/dashboard/summary")
      .pipe(map((response) => this.mapDashboardSummary(response)));
  }

  getAdminStats(): Observable<AdminDashboardStats> {
    return this.http
      .get<AdminDashboardStats>("/dashboard/admin-stats")
      .pipe(map((response) => this.mapAdminStats(response)));
  }

  private mapDashboardSummary(
    response: ApiResponse<DashboardSummary>,
  ): DashboardSummary {
    const summary = response.data;
    return {
      kpis: summary?.kpis ?? [],
      workloadByDepartment: summary?.workloadByDepartment ?? [],
      trends: summary?.trends ?? { daily: [], weekly: [], monthly: [] },
      recentIncidents: summary?.recentIncidents ?? [],
      slaCompliance: summary?.slaCompliance ?? {
        overall: 0,
        byDepartment: [],
        byPriority: [],
      },
    };
  }

  private mapAdminStats(
    response: ApiResponse<AdminDashboardStats>,
  ): AdminDashboardStats {
    const stats = response.data;
    return {
      incidentTypes: stats?.incidentTypes ?? 0,
      workflows: stats?.workflows ?? 0,
      slaRules: stats?.slaRules ?? 0,
      roles: stats?.roles ?? 0,
    };
  }
}
