import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { DashboardSummary } from "../shared/models/dashboard.model";
import { MockBackendService } from "./mock-backend.service";

@Injectable({ providedIn: "root" })
export class DashboardApiService {
  private readonly mock = inject(MockBackendService);

  getDashboardSummary(): Observable<DashboardSummary> {
    return this.mock.getDashboardSummary();
  }

  getAdminStats(): Observable<{
    incidentTypes: number;
    workflows: number;
    slaRules: number;
    roles: number;
  }> {
    return new Observable((observer) => {
      observer.next({ incidentTypes: 8, workflows: 5, slaRules: 12, roles: 6 });
      observer.complete();
    });
  }
}
