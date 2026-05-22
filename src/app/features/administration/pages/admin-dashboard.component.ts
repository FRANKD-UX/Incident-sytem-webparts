import { CommonModule } from "@angular/common";
import { Component, OnInit, inject, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { DashboardApiService } from "../../../api/dashboard-api.service";
import { AdminDashboardStats } from "../../../shared/models/dashboard.model";
import { HasPermissionDirective } from "../../../shared/directives/has-permission.directive";

interface AdminCard {
  title: string;
  description: string;
  icon: string;
  color: string;
  route: string;
  permission: string;
  count: number;
}

@Component({
  selector: "app-admin-dashboard",
  standalone: true,
  imports: [CommonModule, RouterLink, HasPermissionDirective],
  template: `
    <section class="admin-dashboard">
      <h1>Administration</h1>

      @if (loading()) {
        <p>Loading administration settings...</p>
      } @else {
        <div class="admin-grid">
          @for (card of cards(); track card.title) {
            <a
              *hasPermission="card.permission"
              [routerLink]="card.route"
              class="admin-card"
            >
              <div
                class="admin-card__icon"
                [style.background]="
                  'linear-gradient(135deg,' + card.color + ', ' + card.color + 'cc)'
                "
              >
                <span class="material-icons">{{ card.icon }}</span>
              </div>
              <div class="admin-card__content">
                <h3>{{ card.title }}</h3>
                <p>{{ card.description }}</p>
                <strong>{{ card.count }}</strong>
              </div>
              <span class="material-icons admin-card__chevron">chevron_right</span>
            </a>
          }
        </div>
      }
    </section>
  `,
  styles: [
    `
      .admin-dashboard {
        display: grid;
        gap: 16px;
      }
      .admin-dashboard h1 {
        margin: 0;
      }
      .admin-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 16px;
      }
      .admin-card {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 24px;
        background: var(--bg-primary, #ffffff);
        border: 1px solid var(--border-color, #e5e7eb);
        border-radius: 8px;
        text-decoration: none;
        color: inherit;
        cursor: pointer;
        transition: box-shadow 0.2s ease;
      }
      .admin-card:hover {
        box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
      }
      .admin-card__icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .admin-card__icon .material-icons {
        color: white;
        font-size: 24px;
      }
      .admin-card__content {
        display: grid;
        gap: 4px;
      }
      .admin-card__content h3,
      .admin-card__content p,
      .admin-card__content strong {
        margin: 0;
      }
      .admin-card__content p {
        color: var(--text-secondary, #6b7280);
      }
      .admin-card__chevron {
        margin-left: auto;
        color: var(--text-secondary, #9ca3af);
      }
    `,
  ],
})
export class AdminDashboardComponent implements OnInit {
  private readonly dashboardApi = inject(DashboardApiService);

  readonly loading = signal(true);
  readonly systemStats = signal<AdminDashboardStats>({
    incidentTypes: 0,
    workflows: 0,
    slaRules: 0,
    roles: 0,
  });

  readonly cards = signal<AdminCard[]>([]);

  ngOnInit(): void {
    this.dashboardApi.getAdminStats().subscribe({
      next: (stats) => {
        this.systemStats.set(stats);
        this.cards.set([
          {
            title: "Incident Types",
            description: "Configure available incident categories",
            icon: "category",
            color: "#2563eb",
            route: "/administration/incident-types",
            permission: "READ",
            count: stats.incidentTypes,
          },
          {
            title: "Workflows",
            description: "Manage department chain workflows",
            icon: "account_tree",
            color: "#7c3aed",
            route: "/administration/workflows",
            permission: "MANAGE",
            count: stats.workflows,
          },
          {
            title: "SLA Rules",
            description: "Tune response and resolution SLAs",
            icon: "timer",
            color: "#f59e0b",
            route: "/administration/sla-rules",
            permission: "MANAGE",
            count: stats.slaRules,
          },
          {
            title: "Roles",
            description: "Control role assignments and scopes",
            icon: "badge",
            color: "#10b981",
            route: "/administration/roles",
            permission: "MANAGE",
            count: stats.roles,
          },
          {
            title: "Settings",
            description: "Global administration preferences",
            icon: "settings",
            color: "#6b7280",
            route: "/administration/settings",
            permission: "READ",
            count: 1,
          },
        ]);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
