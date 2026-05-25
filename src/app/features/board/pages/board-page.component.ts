import { CommonModule } from "@angular/common";
import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { IncidentApiService } from "../../../api/incident-api.service";
import { WorkflowApiService } from "../../../api/workflow-api.service";
import { Incident } from "../../../shared/models/incident.model";
import { LoadingStateComponent } from "../../../shared/components/loading-state/loading-state.component";
import { KanbanColumnComponent } from "../components/kanban-column/kanban-column.component";
import { SearchInputComponent } from "../../../shared/components/search-input/search-input.component";
import { IncidentDrawerComponent } from "../../incidents/components/incident-drawer/incident-drawer.component";

type BoardLane = "SUP" | "ACC" | "OPS" | "COMPLETED";

@Component({
  selector: "app-board-page",
  standalone: true,
  imports: [
    CommonModule,
    LoadingStateComponent,
    KanbanColumnComponent,
    SearchInputComponent,
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

      @if (loading()) {
        <app-loading-state message="Loading board..." />
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

  incidents = signal<Incident[]>([]);
  loading = signal(false);
  searchTerm = signal("");
  selectedIncident = signal<Incident | null>(null);
  drawerOpen = signal(false);

  filtered = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    return this.incidents().filter(
      (i) =>
        !term ||
        [
          i.referenceNumber,
          i.title,
          i.currentDepartment.name,
          i.status,
          ...i.tags,
        ]
          .join(" ")
          .toLowerCase()
          .includes(term),
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
    this.incidentApi.getIncidents().subscribe({
      next: (response) => {
        this.incidents.set(response.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  moveIncident(event: {
    incidentId: string;
    fromDepartmentCode: string;
    toDepartmentCode: string;
  }): void {
    this.workflowApi.moveIncident(event.incidentId, event).subscribe({
      next: () => this.loadIncidents(),
      error: () => this.loadIncidents(),
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
