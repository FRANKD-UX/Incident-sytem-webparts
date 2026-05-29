import { CommonModule } from "@angular/common";
import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { forkJoin } from "rxjs";
import { IncidentApiService } from "../../../api/incident-api.service";
import { NotificationService } from "../../../core/services/notification.service";
import { EmptyStateComponent } from "../../../shared/components/empty-state/empty-state.component";
import { ErrorStateComponent } from "../../../shared/components/error-state/error-state.component";
import { LoadingStateComponent } from "../../../shared/components/loading-state/loading-state.component";
import { Incident } from "../../../shared/models/incident.model";
import { ChainProgressComponent } from "../components/chain-progress/chain-progress.component";
import { IncidentDrawerComponent } from "../components/incident-drawer/incident-drawer.component";
import { WorkflowTimelineComponent } from "../components/workflow-timeline/workflow-timeline.component";

@Component({
  selector: "app-incident-detail-page",
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LoadingStateComponent,
    ErrorStateComponent,
    EmptyStateComponent,
    WorkflowTimelineComponent,
    ChainProgressComponent,
    IncidentDrawerComponent,
  ],
  template: `
    <div class="incident-detail-page">
      <a class="back-link" routerLink="/incidents">
        <span class="material-icons">arrow_back</span>
        Back to incidents
      </a>

      @if (loading()) {
        <app-loading-state message="Loading incident details..." />
      } @else if (error()) {
        <app-error-state [error]="error()!" (retry)="load()" />
      } @else if (!incident()) {
        <app-empty-state
          icon="search_off"
          title="Incident not found"
          description="The incident may have been removed or is not accessible."
          actionLabel="Back to incidents"
          (action)="goBack()"
        />
      } @else {
        <section class="detail-card">
          <div class="detail-card__head">
            <div>
              <p class="eyebrow">{{ incident()!.referenceNumber }}</p>
              <h1>{{ incident()!.title }}</h1>
              <p class="subtitle">{{ incident()!.description }}</p>
            </div>
            <button type="button" class="btn btn-primary" (click)="openDrawer()">
              Open detail drawer
            </button>
          </div>

          <div class="meta-grid">
            <div>
              <span>Status</span>
              <strong>{{ incident()!.status }}</strong>
            </div>
            <div>
              <span>Priority</span>
              <strong>{{ incident()!.priority }}</strong>
            </div>
            <div>
              <span>Current department</span>
              <strong>{{ incident()!.currentDepartment.name }}</strong>
            </div>
            <div>
              <span>Incident type</span>
              <strong>{{ incident()!.type.name }}</strong>
            </div>
          </div>

          <app-chain-progress
            [chain]="chain()"
            [currentDepartmentIdentifier]="incident()!.currentDepartment.code"
          />

          <app-workflow-timeline
            [chain]="chain()"
            [currentDepartmentCode]="incident()!.currentDepartment.code"
          />
        </section>
      }

      <app-incident-drawer
        [incident]="selectedIncident()"
        [isOpen]="drawerOpen()"
        (close)="drawerOpen.set(false)"
        (refresh)="load()"
      />
    </div>
  `,
  styles: [
    `
      .incident-detail-page {
        display: grid;
        gap: 14px;
      }
      .back-link {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: #245bd1;
        text-decoration: none;
        font-weight: 700;
      }
      .detail-card {
        padding: 18px;
        border: 1px solid #dbe3ef;
        border-radius: 16px;
        background: white;
        display: grid;
        gap: 16px;
      }
      .detail-card__head {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
      }
      h1 {
        margin: 0;
      }
      .eyebrow {
        margin: 0;
        color: #64748b;
        font-weight: 700;
      }
      .subtitle {
        margin: 8px 0 0;
        color: #475569;
      }
      .meta-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: 10px;
      }
      .meta-grid div {
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 10px;
        background: #f8fafc;
      }
      .meta-grid span {
        display: block;
        color: #64748b;
        font-size: 12px;
      }
      .btn {
        min-height: 36px;
        padding: 0 12px;
        border: 1px solid #2f6fed;
        border-radius: 10px;
        background: #2f6fed;
        color: white;
        font-weight: 700;
        cursor: pointer;
      }
    `,
  ],
})
export class IncidentDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly incidentApi = inject(IncidentApiService);
  private readonly notification = inject(NotificationService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly incident = signal<Incident | null>(null);
  readonly chain = signal<Incident["type"]["departmentChain"] | null>(null);
  readonly drawerOpen = signal(false);
  readonly selectedIncident = computed(() => this.incident());

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    const incidentId = this.route.snapshot.paramMap.get("id");
    if (!incidentId) {
      this.error.set("Incident identifier is missing.");
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      incident: this.incidentApi.getIncident(incidentId),
      chain: this.incidentApi.getIncidentChain(incidentId),
    }).subscribe({
      next: ({ incident, chain }) => {
        this.incident.set(incident);
        this.chain.set(chain);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set("Failed to load incident details.");
        this.notification.error("Unable to load incident details.");
      },
    });
  }

  goBack(): void {
    history.back();
  }  openDrawer(): void {
    if (!this.incident()) {
      return;
    }

    this.drawerOpen.set(true);
  }
}
