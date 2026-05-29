// src/app/features/administration/pages/admin-dashboard.component.ts

import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { DashboardApiService } from "../../../api/dashboard-api.service";
import { LoadingStateComponent } from "../../../shared/components/loading-state/loading-state.component";
import { HasRoleDirective } from "../../../shared/directives/has-permission.directive";

@Component({
  selector: "app-admin-dashboard",
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingStateComponent, HasRoleDirective],
  template: `
    <div class="admin-dashboard">
      <div class="page-header">
        <div>
          <h1>Administration</h1>
          <p class="subtitle">System configuration and management</p>
        </div>
      </div>

      @if (loading()) {
        <app-loading-state message="Loading configuration..." />
      } @else {
        <div class="admin-grid">
          <!-- Incident Types Card -->
          <a
            routerLink="incident-types"
            class="admin-card"
            *hasRole="['ADMIN', 'SYSTEM_ADMIN']"
          >
            <div
              class="admin-card__icon"
              style="background: linear-gradient(135deg, #3b82f6, #2563eb)"
            >
              <span class="material-icons">category</span>
            </div>
            <div class="admin-card__content">
              <h3>Incident Types</h3>
              <p>Configure incident types, categories, and default settings</p>
              <span class="admin-card__count"
                >{{ systemStats().incidentTypes }} configured</span
              >
            </div>
            <span class="material-icons chevron">chevron_right</span>
          </a>

          <!-- Workflows Card -->
          <a
            routerLink="workflows"
            class="admin-card"
            *hasRole="['ADMIN', 'SYSTEM_ADMIN']"
          >
            <div
              class="admin-card__icon"
              style="background: linear-gradient(135deg, #8b5cf6, #7c3aed)"
            >
              <span class="material-icons">account_tree</span>
            </div>
            <div class="admin-card__content">
              <h3>Workflows</h3>
              <p>Manage department chains, checklists, and transition rules</p>
              <span class="admin-card__count"
                >{{ systemStats().workflows }} active</span
              >
            </div>
            <span class="material-icons chevron">chevron_right</span>
          </a>

          <!-- Agent Performance Card -->
          <a
            routerLink="agent-performance"
            class="admin-card"
            *hasRole="['ADMIN', 'SYSTEM_ADMIN']"
          >
            <div
              class="admin-card__icon"
              style="background: linear-gradient(135deg, #0ea5e9, #0369a1)"
            >
              <span class="material-icons">insights</span>
            </div>
            <div class="admin-card__content">
              <h3>Agent Performance</h3>
              <p>
                Review ticket closures, close times, SLA compliance, and breach
                rates by agent.
              </p>
              <span class="admin-card__count">Management view</span>
            </div>
            <span class="material-icons chevron">chevron_right</span>
          </a>

          <!-- SLA Rules Card -->
          <a
            routerLink="sla"
            class="admin-card"
            *hasRole="['ADMIN', 'SYSTEM_ADMIN']"
          >
            <div
              class="admin-card__icon"
              style="background: linear-gradient(135deg, #f59e0b, #d97706)"
            >
              <span class="material-icons">timer</span>
            </div>
            <div class="admin-card__content">
              <h3>SLA Configuration</h3>
              <p>Define response and resolution time targets</p>
              <span class="admin-card__count"
                >{{ systemStats().slaRules }} rules</span
              >
            </div>
            <span class="material-icons chevron">chevron_right</span>
          </a>

          <!-- User Roles Card -->
          <a
            routerLink="roles"
            class="admin-card"
            *hasRole="['ADMIN', 'SYSTEM_ADMIN']"
          >
            <div
              class="admin-card__icon"
              style="background: linear-gradient(135deg, #10b981, #059669)"
            >
              <span class="material-icons">shield</span>
            </div>
            <div class="admin-card__content">
              <h3>Roles & Permissions</h3>
              <p>Manage user roles, department access, and permissions</p>
              <span class="admin-card__count"
                >{{ systemStats().roles }} roles</span
              >
            </div>
            <span class="material-icons chevron">chevron_right</span>
          </a>

          <!-- System Settings Card -->
          <a
            routerLink="settings"
            class="admin-card"
            *hasRole="['ADMIN', 'SYSTEM_ADMIN']"
          >
            <div
              class="admin-card__icon"
              style="background: linear-gradient(135deg, #6b7280, #4b5563)"
            >
              <span class="material-icons">settings</span>
            </div>
            <div class="admin-card__content">
              <h3>System Settings</h3>
              <p>Global configuration, integrations, and maintenance</p>
              <span class="admin-card__count">View settings</span>
            </div>
            <span class="material-icons chevron">chevron_right</span>
          </a>
        </div>
      }
    </div>
  `,
  styleUrls: ["./admin-dashboard.component.scss"],
})
export class AdminDashboardComponent implements OnInit {
  private readonly dashboardApi = inject(DashboardApiService);

  loading = signal(false);
  systemStats = signal({
    incidentTypes: 0,
    workflows: 0,
    slaRules: 0,
    roles: 0,
  });

  ngOnInit(): void {
    this.loadSystemStats();
  }

  private loadSystemStats(): void {
    this.loading.set(true);

    // Load admin dashboard stats
    this.dashboardApi.getAdminStats().subscribe({
      next: (stats) => {
        this.systemStats.set(stats);
        this.loading.set(false);
      },
      error: (err) => {
        console.error("Failed to load admin stats:", err);
        this.loading.set(false);
      },
    });
  }
}
