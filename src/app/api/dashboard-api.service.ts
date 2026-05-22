import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DashboardSummary, AdminDashboardStats } from '../shared/models/dashboard.model';
import { MockBackendService } from './mock-backend.service';

@Injectable({ providedIn: 'root' })
export class DashboardApiService {
  constructor(private mock: MockBackendService) {}
  getDashboardSummary(): Observable<DashboardSummary> { return this.mock.getMockDashboardSummary(); }
  getAdminStats(): Observable<AdminDashboardStats> { return this.mock.getMockDashboardSummary() as any; }
}
