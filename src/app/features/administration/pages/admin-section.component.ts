import { CommonModule } from "@angular/common";
import { Component, OnInit, inject, signal } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { forkJoin, of } from "rxjs";
import { catchError } from "rxjs/operators";
import { IncidentApiService } from "../../../api/incident-api.service";
import { PermissionsApiService } from "../../../api/permissions-api.service";
import { WorkflowConfigurationService } from "../../../api/workflow-configuration.service";
import { NotificationService } from "../../../core/services/notification.service";
import { EmptyStateComponent } from "../../../shared/components/empty-state/empty-state.component";
import { ErrorStateComponent } from "../../../shared/components/error-state/error-state.component";
import { LoadingStateComponent } from "../../../shared/components/loading-state/loading-state.component";

type AdminSectionData = {
  title: string;
  subtitle: string;
  icon: string;
};

type AdminMetric = {
  label: string;
  value: string;
};

@Component({
  selector: "app-admin-section",
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LoadingStateComponent,
    ErrorStateComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="admin-section">
      <a class="admin-section__back" routerLink="/administration">
        <span class="material-icons">arrow_back</span>
        Back to administration
      </a>

      <div class="admin-section__hero">
        <div class="admin-section__icon">
          <span class="material-icons">{{ data.icon }}</span>
        </div>
        <div>
          <h1>{{ data.title }}</h1>
          <p>{{ data.subtitle }}</p>
        </div>
      </div>

      @if (loading()) {
        <app-loading-state message="Loading section data..." />
      } @else if (error()) {
        <app-error-state [error]="error()!" (retry)="loadSection()" />
      } @else if (metrics().length === 0) {
        <app-empty-state
          icon="settings_suggest"
          title="No section data available"
          description="Try refreshing after workflow and incident data is loaded."
          actionLabel="Refresh"
          (action)="loadSection()"
        />
      } @else {
        <div class="metrics-grid">
          @for (metric of metrics(); track metric.label) {
            <article>
              <span>{{ metric.label }}</span>
              <strong>{{ metric.value }}</strong>
            </article>
          }
        </div>
      }

      <div class="admin-section__panel admin-section__panel--highlight">
        <h2>Suggested next step</h2>
        <p>
          Use workflow configuration to keep handoff flow, board routing, and
          incident operations aligned.
        </p>
        <a class="admin-section__cta" routerLink="/administration/workflows">
          <span class="material-icons">account_tree</span>
          Open workflows
        </a>
      </div>
    </div>
  `,
  styles: [
    `
      .admin-section {
        display: grid;
        gap: 18px;
      }

      .admin-section__back {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: #245bd1;
        font-weight: 700;
        text-decoration: none;
      }

      .admin-section__hero {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 18px 20px;
        border: 1px solid #dbe3ef;
        border-radius: 18px;
        background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      }

      .admin-section__icon {
        width: 52px;
        height: 52px;
        border-radius: 16px;
        display: grid;
        place-items: center;
        background: linear-gradient(135deg, #2f6fed, #245bd1);
        color: white;
      }

      .admin-section__hero h1 {
        margin: 0;
        font-size: 28px;
      }

      .admin-section__hero p {
        margin: 6px 0 0;
        color: #475569;
      }

      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 12px;
      }

      article {
        border: 1px solid #dbe3ef;
        border-radius: 14px;
        padding: 12px;
        background: white;
      }

      article span {
        display: block;
        color: #64748b;
        font-size: 12px;
      }

      article strong {
        margin-top: 6px;
        display: block;
        font-size: 24px;
        color: #0f172a;
      }

      .admin-section__panel {
        padding: 18px 20px;
        border: 1px solid #dbe3ef;
        border-radius: 18px;
        background: white;
      }

      .admin-section__panel h2 {
        margin: 0 0 12px;
        font-size: 18px;
      }

      .admin-section__panel--highlight {
        background: linear-gradient(180deg, #eff6ff 0%, #ffffff 100%);
      }

      .admin-section__cta {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin-top: 8px;
        padding: 10px 14px;
        border-radius: 999px;
        background: #2f6fed;
        color: white;
        font-weight: 700;
        text-decoration: none;
      }
    `,
  ],
})
export class AdminSectionComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly incidentApi = inject(IncidentApiService);
  private readonly workflowConfiguration = inject(WorkflowConfigurationService);
  private readonly permissionsApi = inject(PermissionsApiService);
  private readonly notification = inject(NotificationService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly metrics = signal<AdminMetric[]>([]);
  readonly data = this.route.snapshot.data as AdminSectionData;

  ngOnInit(): void {
    this.loadSection();
  }

  loadSection(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      incidents: this.incidentApi.getIncidents().pipe(catchError(() => of(null))),
      chains: this.workflowConfiguration.getChains().pipe(catchError(() => of([]))),
      incidentTypes: this.workflowConfiguration
        .getIncidentTypes()
        .pipe(catchError(() => of([]))),
      permissions: this.permissionsApi
        .getUserPermissions()
        .pipe(catchError(() => of(null))),
    }).subscribe({
      next: ({ incidents, chains, incidentTypes, permissions }) => {
        const path = this.route.snapshot.routeConfig?.path ?? "";
        const incidentRows = incidents?.data ?? [];

        if (path === "incident-types") {
          this.metrics.set([
            { label: "Configured types", value: String(incidentTypes.length) },
            {
              label: "Chains mapped to types",
              value: String(new Set(chains.map((chain) => chain.incidentTypeId)).size),
            },
            { label: "Incidents in system", value: String(incidentRows.length) },
          ]);
        } else if (path === "sla") {
          const allSteps = chains.flatMap((chain) => chain.steps);
          const avgSla =
            allSteps.length > 0
              ? Math.round(
                  allSteps.reduce((total, step) => total + step.slaMinutes, 0) /
                    allSteps.length,
                )
              : 0;
          this.metrics.set([
            { label: "Workflow steps", value: String(allSteps.length) },
            { label: "Average SLA (minutes)", value: String(avgSla) },
            {
              label: "Active incidents",
              value: String(
                incidentRows.filter(
                  (incident) =>
                    incident.status !== "RESOLVED" && incident.status !== "CLOSED",
                ).length,
              ),
            },
          ]);
        } else if (path === "roles") {
          this.metrics.set([
            { label: "Current role", value: permissions?.role ?? "N/A" },
            {
              label: "Allowed actions",
              value: String(permissions?.allowedActions.length ?? 0),
            },
            {
              label: "Department scope",
              value: permissions?.departmentName ?? "Not assigned",
            },
          ]);
        } else {
          this.metrics.set([
            { label: "Workflow chains", value: String(chains.length) },
            { label: "Incident types", value: String(incidentTypes.length) },
            { label: "Incidents", value: String(incidentRows.length) },
          ]);
        }

        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set("Unable to load administration section data.");
        this.notification.error("Failed to load administration section.");
      },
    });
  }
}
