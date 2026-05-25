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
        <div class="kpi-grid">
          @for (kpi of dashboardData?.kpis; track kpi.id) {
            <app-stat-card [kpi]="kpi" />
          }
        </div>

        <section class="operations-strip" aria-label="Operational summary">
          <div class="ops-metric">
            <span>Open queues</span>
            <strong>{{ activeDepartmentCount() }}</strong>
          </div>
          <div class="ops-metric">
            <span>Overall SLA</span>
            <strong>{{ dashboardData?.slaCompliance?.overall ?? 0 }}%</strong>
          </div>
          <div class="ops-metric">
            <span>Escalations</span>
            <strong>{{ totalEscalated() }}</strong>
          </div>
          <div class="ops-metric">
            <span>Latest update</span>
            <strong>{{ lastUpdated }}</strong>
          </div>
        </section>

        <div class="dashboard-grid">
          <section class="panel panel--wide">
            <div class="panel__header">
              <div>
                <h2>Department Workload</h2>
                <p>Live queue ownership by department</p>
              </div>
            </div>

            <div class="department-list">
              @for (dept of dashboardData?.workloadByDepartment; track dept.department.id) {
                <article class="department-row">
                  <div class="department-row__name">
                    <span class="department-dot"></span>
                    <div>
                      <strong>{{ dept.department.name }}</strong>
                      <span>{{ dept.department.code }} queue</span>
                    </div>
                  </div>

                  <div class="department-row__stats">
                    <span><strong>{{ dept.openIncidents }}</strong> Open</span>
                    <span><strong>{{ dept.inProgress }}</strong> Active</span>
                    <span><strong>{{ dept.escalated }}</strong> Escalated</span>
                  </div>

                  <div class="sla-cell">
                    <div class="compliance-bar">
                      <div
                        class="compliance-bar__fill"
                        [style.width]="dept.slaCompliance + '%'"
                        [class.warning]="dept.slaCompliance < 80"
                        [class.critical]="dept.slaCompliance < 60"
                      ></div>
                    </div>
                    <span>{{ dept.slaCompliance }}% SLA</span>
                  </div>
                </article>
              }
            </div>
          </section>

          <section class="panel">
            <div class="panel__header">
              <div>
                <h2>Recent Incidents</h2>
                <p>Newest operational activity</p>
              </div>
            </div>

            <div class="incident-list">
              @for (incident of dashboardData?.recentIncidents; track incident.id) {
                <article class="incident-item">
                  <div class="incident-item__header">
                    <span class="incident-ref">{{ incidentRef(incident) }}</span>
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
                </article>
              }
            </div>
          </section>
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

  activeDepartmentCount(): number {
    return this.dashboardData?.workloadByDepartment.filter(
      (dept) => dept.openIncidents + dept.inProgress + dept.escalated > 0,
    ).length ?? 0;
  }

  totalEscalated(): number {
    return this.dashboardData?.workloadByDepartment.reduce(
      (total, dept) => total + dept.escalated,
      0,
    ) ?? 0;
  }

  incidentRef(incident: DashboardSummary["recentIncidents"][number]): string {
    return incident.referenceNumber || incident.id;
  }
}
