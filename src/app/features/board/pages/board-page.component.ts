import { CommonModule } from "@angular/common";
import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { IncidentApiService } from "../../../api/incident-api.service";
import { WorkflowApiService } from "../../../api/workflow-api.service";
import { NotificationService } from "../../../core/services/notification.service";
import { Incident } from "../../../shared/models/incident.model";
import { LoadingStateComponent } from "../../../shared/components/loading-state/loading-state.component";
import { EmptyStateComponent } from "../../../shared/components/empty-state/empty-state.component";
import { ErrorStateComponent } from "../../../shared/components/error-state/error-state.component";
import { KanbanColumnComponent } from "../components/kanban-column/kanban-column.component";
import { SearchInputComponent } from "../../../shared/components/search-input/search-input.component";
import { IncidentDrawerComponent } from "../../incidents/components/incident-drawer/incident-drawer.component";
import {
  BoardFiltersComponent,
  BoardFilterState,
} from "../components/board-filters/board-filters.component";

type BoardLane = "SUP" | "ACC" | "OPS" | "COMPLETED";

@Component({
  selector: "app-board-page",
  standalone: true,
  imports: [
    CommonModule,
    LoadingStateComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    KanbanColumnComponent,
    SearchInputComponent,
    BoardFiltersComponent,
    IncidentDrawerComponent,
  ],
  template: `
    <div class="board-page">
      <div class="page-header">
        <div>
          <h1>Board</h1>
          <p class="subtitle">Department workflow view</p>
        </div>
        <app-search-input
          [value]="searchTerm()"
          placeholder="Search..."
          (search)="searchTerm.set($event)"
        />
      </div>

      <app-board-filters
        [departments]="departmentFilterOptions()"
        [assignees]="assigneeFilterOptions()"
        [value]="filters()"
        (filterChange)="filters.set($event)"
      />

      @if (loading()) {
        <app-loading-state message="Loading board..." />
      } @else if (error()) {
        <app-error-state [error]="error()!" (retry)="loadIncidents()" />
      } @else if (filtered().length === 0) {
        <app-empty-state
          icon="dashboard"
          title="No incidents match the current filters"
          description="Try clearing one or more filters."
        />
      } @else {
        <div class="board-columns">
          <app-kanban-column
            [laneId]="'SUP'"
            [laneTitle]="'Support'"
            [subtitle]="'First-line triage'"
            [departmentCode]="'SUP'"
            [color]="'#3b82f6'"
            [icon]="'support_agent'"
            [incidents]="supportIncidents()"
            [canDrag]="true"
            (incidentMoved)="moveIncident($event)"
            (incidentClick)="openDrawer($event)"
          ></app-kanban-column>
          <app-kanban-column
            [laneId]="'ACC'"
            [laneTitle]="'Accounts'"
            [subtitle]="'Billing and account actions'"
            [departmentCode]="'ACC'"
            [color]="'#f59e0b'"
            [icon]="'payments'"
            [incidents]="accountsIncidents()"
            [canDrag]="true"
            (incidentMoved)="moveIncident($event)"
            (incidentClick)="openDrawer($event)"
          ></app-kanban-column>
          <app-kanban-column
            [laneId]="'OPS'"
            [laneTitle]="'Operations'"
            [subtitle]="'Field and technical work'"
            [departmentCode]="'OPS'"
            [color]="'#10b981'"
            [icon]="'settings'"
            [incidents]="operationsIncidents()"
            [canDrag]="true"
            (incidentMoved)="moveIncident($event)"
            (incidentClick)="openDrawer($event)"
          ></app-kanban-column>
          <app-kanban-column
            [laneId]="'COMPLETED'"
            [laneTitle]="'Completed'"
            [subtitle]="'Closed and resolved work'"
            [departmentCode]="'COMPLETED'"
            [color]="'#374151'"
            [icon]="'task_alt'"
            [incidents]="completedIncidents()"
            [completed]="true"
            [canDrag]="true"
            (incidentMoved)="moveIncident($event)"
            (incidentClick)="openDrawer($event)"
          ></app-kanban-column>
        </div>
      }

      <app-incident-drawer
        [incident]="selectedIncident()"
        [isOpen]="drawerOpen()"
        (close)="closeDrawer()"
        (refresh)="loadIncidents()"
      />
    </div>
  `,
  styleUrls: ["./board-page.component.scss"],
})
export class BoardPageComponent implements OnInit {
  private readonly incidentApi = inject(IncidentApiService);
  private readonly workflowApi = inject(WorkflowApiService);
  private readonly notification = inject(NotificationService);

  incidents = signal<Incident[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  searchTerm = signal("");
  filters = signal<BoardFilterState>({
    departmentCode: "",
    assigneeId: "",
    status: "",
  });
  selectedIncident = signal<Incident | null>(null);
  drawerOpen = signal(false);

  departmentFilterOptions = computed(() =>
    Array.from(
      new Map(
        this.incidents().map((incident) => [
          incident.currentDepartment.code,
          {
            id: incident.currentDepartment.code,
            label: incident.currentDepartment.name,
          },
        ]),
      ).values(),
    ),
  );

  assigneeFilterOptions = computed(() =>
    Array.from(
      new Map(
        this.incidents()
          .filter((incident) => incident.assignedTo)
          .map((incident) => [
            incident.assignedTo!.id,
            {
              id: incident.assignedTo!.id,
              label: incident.assignedTo!.displayName,
            },
          ]),
      ).values(),
    ),
  );

  filtered = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const filterState = this.filters();
    return this.incidents().filter(
      (i) =>
        (!term ||
          [
            i.referenceNumber,
            i.title,
            i.currentDepartment.name,
            i.status,
            ...i.tags,
          ]
            .join(" ")
            .toLowerCase()
            .includes(term)) &&
        (!filterState.departmentCode ||
          i.currentDepartment.code === filterState.departmentCode) &&
        (!filterState.assigneeId || i.assignedTo?.id === filterState.assigneeId) &&
        (!filterState.status || i.status === filterState.status),
    );
  });

  supportIncidents = computed(() => this.activeDepartmentIncidents("SUP"));
  accountsIncidents = computed(() => this.activeDepartmentIncidents("ACC"));
  operationsIncidents = computed(() => this.activeDepartmentIncidents("OPS"));
  completedIncidents = computed(() =>
    this.filtered().filter(
      (incident) =>
        incident.status === "RESOLVED" || incident.status === "CLOSED",
    ),
  );

  ngOnInit(): void {
    this.loadIncidents();
  }

  loadIncidents(): void {
    this.loading.set(true);
    this.error.set(null);
    this.incidentApi.getIncidents().subscribe({
      next: (response) => {
        this.incidents.set(response.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set("Unable to load board data.");
        this.loading.set(false);
        this.notification.error("Failed to load board incidents.");
      },
    });
  }

  moveIncident(event: {
    incidentId: string;
    fromDepartmentCode: string;
    toDepartmentCode: string;
  }): void {
    this.workflowApi.moveIncident(event.incidentId, event).subscribe({
      next: () => {
        this.notification.success("Incident moved.");
        this.loadIncidents();
      },
      error: () => {
        this.notification.error("Could not move incident.");
        this.loadIncidents();
      },
    });
  }

  openDrawer(incident: Incident): void {
    this.selectedIncident.set(incident);
    this.drawerOpen.set(true);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
  }

  private activeDepartmentIncidents(
    id: Exclude<BoardLane, "COMPLETED">,
  ): Incident[] {
    return this.filtered().filter(
      (incident) =>
        incident.currentDepartment.code === id &&
        incident.status !== "RESOLVED" &&
        incident.status !== "CLOSED",
    );
  }
}
