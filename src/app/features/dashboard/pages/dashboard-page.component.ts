// src/app/features/dashboard/pages/dashboard-page.component.ts

import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DashboardApiService } from "../../../api/dashboard-api.service";
import { DashboardSummary } from "../../../shared/models/dashboard.model";
import { StatCardComponent } from "../../../shared/components/stat-card/stat-card.component";
import { LoadingStateComponent } from "../../../shared/components/loading-state/loading-state.component";
import { ErrorStateComponent } from "../../../shared/components/error-state/error-state.component";

@Component({
  selector: "app-dashboard-page",
  standalone: true,
  imports: [
    CommonModule,
    StatCardComponent,
    LoadingStateComponent,
    ErrorStateComponent,
  ],
  template: `
    <div class="dashboard-page">
      <div class="page-header">
        <div>
          <h1>Dashboard</h1>
          <p class="subtitle">Operations Overview</p>
        </div>
        <div class="page-actions">
          <span class="last-updated">Last updated: {{ lastUpdated }}</span>
          <button class="btn btn-secondary" (click)="refresh()">
            <span class="material-icons">refresh</span>
            Refresh
          </button>
        </div>
      </div>

      @if (loading) {
        <app-loading-state message="Loading dashboard data..." />
      } @else if (error) {
        <app-error-state [error]="error" (retry)="loadDashboard()" />
      } @else {
        <!-- KPI Cards -->
        <div class="kpi-grid">
          @for (kpi of dashboardData?.kpis; track kpi.id) {
            <app-stat-card [kpi]="kpi" />
          }
        </div>

        <!-- Workload & Trends -->
        <div class="dashboard-grid">
          <div class="card">
            <div class="card__header">
              <h3>Department Workload</h3>
            </div>
            <div class="card__body">
              <table class="table">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Open</th>
                    <th>In Progress</th>
                    <th>Escalated</th>
                    <th>SLA Compliance</th>
                  </tr>
                </thead>
                <tbody>
                  @for (
                    dept of dashboardData?.workloadByDepartment;
                    track dept.department.id
                  ) {
                    <tr>
                      <td>{{ dept.department.name }}</td>
                      <td>{{ dept.openIncidents }}</td>
                      <td>{{ dept.inProgress }}</td>
                      <td>{{ dept.escalated }}</td>
                      <td>
                        <div class="compliance-bar">
                          <div
                            class="compliance-bar__fill"
                            [style.width]="dept.slaCompliance + '%'"
                            [class.warning]="dept.slaCompliance < 80"
                            [class.critical]="dept.slaCompliance < 60"
                          ></div>
                          <span>{{ dept.slaCompliance }}%</span>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <div class="card">
            <div class="card__header">
              <h3>Recent Incidents</h3>
            </div>
            <div class="card__body">
              @for (
                incident of dashboardData?.recentIncidents;
                track incident.id
              ) {
                <div class="incident-item">
                  <div class="incident-item__header">
                    <span class="incident-ref">{{
                      incident.referenceNumber
                    }}</span>
                    <span
                      class="status-badge"
                      [class]="'status-' + incident.status.toLowerCase()"
                    >
                      {{ incident.status }}
                    </span>
                  </div>
                  <h4>{{ incident.title }}</h4>
                  <div class="incident-item__meta">
                    <span>{{ incident.currentDepartment.name }}</span>
                    <span>{{ incident.priority }}</span>
                    <span>{{ incident.updatedAt | date: "short" }}</span>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styleUrls: ["./dashboard-page.component.scss"],
})
export class DashboardPageComponent implements OnInit {
  private readonly dashboardApi = inject(DashboardApiService);

  dashboardData: DashboardSummary | null = null;
  loading = false;
  error: string | null = null;
  lastUpdated = "";

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = null;

    this.dashboardApi.getDashboardSummary().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.lastUpdated = new Date().toLocaleString();
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      },
    });
  }

  refresh(): void {
    this.loadDashboard();
  }
}
