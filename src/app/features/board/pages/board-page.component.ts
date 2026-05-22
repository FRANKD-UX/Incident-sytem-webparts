import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit, computed, inject, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription, timer } from "rxjs";
import { IncidentApiService } from "../../../api/incident-api.service";
import { PermissionsApiService } from "../../../api/permissions-api.service";
import {
  IncidentMovedEvent,
  KanbanColumn,
  KanbanColumnComponent,
} from "../components/kanban-column/kanban-column.component";
import { Incident } from "../../../shared/models/incident.model";
import { Department, User, UserPermissions } from "../../../shared/models/user.model";
import { IncidentStatus } from "../../../shared/models/common.model";
import { FilterBarComponent, FilterConfig } from "../../../shared/components/filter-bar/filter-bar.component";
import { SearchInputComponent } from "../../../shared/components/search-input/search-input.component";
import { WorkflowApiService as WorkflowServiceAlias } from "../../../api/workflow-api.service";

@Component({
  selector: "app-board-page",
  standalone: true,
  imports: [CommonModule, KanbanColumnComponent, FilterBarComponent, SearchInputComponent],
  template: `
    <section class="board-page">
      <header class="board-header">
        <div class="board-header__left">
          <h1>Incident Kanban Board</h1>
          <p>Drag incidents through workflow states.</p>
        </div>
        <div class="board-header__actions">
          <app-search-input (search)="searchQuery.set($event)" />
          <app-filter-bar
            [filters]="filterConfig"
            [activeFilters]="activeFilters()"
            (activeFiltersChange)="activeFilters.set($event)"
          />
          <button type="button" (click)="exportBoard()">
            <span class="material-icons">download</span>
            Export
          </button>
        </div>
      </header>

      @if (error()) {
        <div class="error-banner">{{ error() }}</div>
      }

      <div class="board-container" cdkDropListGroup>
        @if (loading()) {
          <div class="board-loading">Loading board...</div>
        } @else {
          <div class="board-columns">
            @for (column of filteredColumns(); track column.id) {
              <app-kanban-column
                [column]="column"
                [canDrag]="canDragIncidents()"
                (incidentMoved)="onIncidentMoved($event)"
                (incidentClick)="openIncident($event)"
              />
            }
          </div>
        }
      </div>

      @if (dragError()) {
        <div class="drag-error-toast">{{ dragError() }}</div>
      }
    </section>
  `,
  styles: [
    `
      .board-page {
        height: 100%;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .board-header {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
      }
      .board-header__left h1,
      .board-header__left p {
        margin: 0;
      }
      .board-header__actions {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }
      .board-header__actions button {
        border: 1px solid var(--border-color, #d1d5db);
        border-radius: 8px;
        padding: 8px 12px;
        background: var(--bg-primary, #ffffff);
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .board-container {
        flex: 1;
        min-height: 0;
      }
      .board-columns {
        display: flex;
        gap: 16px;
        height: 100%;
        min-width: max-content;
        overflow-x: auto;
      }
      .board-loading {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: var(--text-secondary, #6b7280);
      }
      .error-banner {
        background: #fef2f2;
        border: 1px solid #fecaca;
        color: #b91c1c;
        border-radius: 8px;
        padding: 10px 12px;
      }
      .drag-error-toast {
        position: fixed;
        right: 16px;
        bottom: 16px;
        background: #ef4444;
        color: white;
        border-radius: 8px;
        padding: 10px 14px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        z-index: 20;
      }
    `,
  ],
})
export class BoardPageComponent implements OnInit, OnDestroy {
  private readonly incidentApi = inject(IncidentApiService);
  private readonly workflowApi = inject(WorkflowServiceAlias);
  private readonly permissionsApi = inject(PermissionsApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly columns = signal<KanbanColumn[]>([]);
  readonly departments = signal<Department[]>([]);
  readonly assignees = signal<User[]>([]);
  readonly loading = signal(true);
  readonly error = signal("");
  readonly dragError = signal("");
  readonly canDragIncidents = signal(false);

  readonly searchQuery = signal("");
  readonly activeFilters = signal<Record<string, string>>({});

  readonly filterConfig: FilterConfig[] = [
    {
      key: "status",
      label: "Status",
      options: [
        { label: "Open", value: "OPEN" },
        { label: "In Progress", value: "IN_PROGRESS" },
        { label: "Escalated", value: "ESCALATED" },
        { label: "Resolved", value: "RESOLVED" },
      ],
    },
    {
      key: "department",
      label: "Department",
      options: [],
    },
  ];

  private readonly defaultColumns: Omit<KanbanColumn, "incidents">[] = [
    { id: "OPEN", title: "Open", status: "OPEN", color: "#6b7280", icon: "inbox" },
    {
      id: "IN_PROGRESS",
      title: "In Progress",
      status: "IN_PROGRESS",
      color: "#3b82f6",
      icon: "sync",
    },
    {
      id: "PENDING_CHECKLIST",
      title: "Pending Checklist",
      status: "PENDING_CHECKLIST",
      color: "#f59e0b",
      icon: "checklist",
    },
    {
      id: "PENDING_TRANSITION",
      title: "Pending Transition",
      status: "PENDING_TRANSITION",
      color: "#8b5cf6",
      icon: "pending_actions",
    },
    {
      id: "ESCALATED",
      title: "Escalated",
      status: "ESCALATED",
      color: "#ef4444",
      icon: "priority_high",
    },
    {
      id: "RESOLVED",
      title: "Resolved",
      status: "RESOLVED",
      color: "#10b981",
      icon: "task_alt",
    },
    { id: "CLOSED", title: "Closed", status: "CLOSED", color: "#1f2937", icon: "lock" },
  ];

  readonly filteredColumns = computed(() => {
    const filters = this.activeFilters();
    const query = this.searchQuery().trim().toLowerCase();
    return this.columns().map((column) => ({
      ...column,
      incidents: column.incidents.filter((incident) => {
        const matchesStatus = !filters["status"] || incident.status === filters["status"];
        const matchesDepartment =
          !filters["department"] || incident.currentDepartment.id === filters["department"];
        const matchesQuery =
          !query ||
          incident.title.toLowerCase().includes(query) ||
          incident.referenceNumber.toLowerCase().includes(query);
        return matchesStatus && matchesDepartment && matchesQuery;
      }),
    }));
  });

  private subscriptions = new Subscription();

  ngOnInit(): void {
    this.loadBoard();
    this.subscriptions.add(
      this.workflowApi.getDepartments().subscribe({
        next: (departments) => {
          this.departments.set(departments);
          const departmentFilter = this.filterConfig.find((filter) => filter.key === "department");
          if (departmentFilter) {
            departmentFilter.options = departments.map((department) => ({
              label: department.name,
              value: department.id,
            }));
          }
        },
      }),
    );

    this.subscriptions.add(
      this.permissionsApi.getUserPermissions().subscribe({
        next: (permissions: UserPermissions) => {
          this.canDragIncidents.set(
            permissions.allowedActions.includes("UPDATE") ||
              permissions.allowedActions.includes("MANAGE"),
          );
        },
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadBoard(): void {
    this.loading.set(true);
    this.error.set("");

    this.subscriptions.add(
      this.incidentApi
        .getIncidents({ view: "kanban", includeAllStatuses: true })
        .subscribe({
          next: (incidents) => {
            this.columns.set(this.organizeColumns(incidents));
            this.assignees.set(
              Array.from(
                incidents.reduce((map, incident) => {
                  if (incident.assignedTo) {
                    map.set(incident.assignedTo.id, incident.assignedTo);
                  }
                  return map;
                }, new Map<string, User>()),
              ).map((entry) => entry[1]),
            );
            this.loading.set(false);
          },
          error: () => {
            this.error.set("Failed to load board data.");
            this.loading.set(false);
          },
        }),
    );
  }

  organizeColumns(incidents: Incident[]): KanbanColumn[] {
    return this.defaultColumns.map((column) => ({
      ...column,
      incidents: incidents.filter((incident) => incident.status === column.status),
    }));
  }

  onIncidentMoved(event: IncidentMovedEvent): void {
    const previousColumns = this.columns();
    this.moveIncidentLocally(event.incident, event.fromColumnId, event.toColumnId);

    const targetStatus = event.toColumnId as IncidentStatus;
    this.subscriptions.add(
      this.workflowApi
        .moveIncident(event.incident.id, { targetStatus })
        .subscribe({
          next: (serverIncident) => {
            this.replaceIncidentInColumn(serverIncident, event.toColumnId);
          },
          error: () => {
            this.columns.set(previousColumns);
            this.dragError.set("Unable to move incident. Changes were reverted.");
            timer(5000).subscribe(() => this.dragError.set(""));
          },
        }),
    );
  }

  moveIncidentLocally(incident: Incident, fromColumnId: string, toColumnId: string): void {
    const next = this.columns().map((column) => {
      if (column.id === fromColumnId) {
        return {
          ...column,
          incidents: column.incidents.filter((item) => item.id !== incident.id),
        };
      }

      if (column.id === toColumnId) {
        return {
          ...column,
          incidents: [...column.incidents, { ...incident, status: toColumnId as IncidentStatus }],
        };
      }

      return column;
    });

    this.columns.set(next);
  }

  replaceIncidentInColumn(incident: Incident, columnId: string): void {
    this.columns.set(
      this.columns().map((column) => {
        if (column.id !== columnId) {
          return {
            ...column,
            incidents: column.incidents.filter((item) => item.id !== incident.id),
          };
        }

        const without = column.incidents.filter((item) => item.id !== incident.id);
        return { ...column, incidents: [...without, incident] };
      }),
    );
  }

  exportBoard(): void {
    const payload = JSON.stringify(this.columns(), null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "incident-board.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  openIncident(incident: Incident): void {
    const current = this.route.snapshot.queryParams["incidentId"];
    if (current === incident.id) {
      return;
    }
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { incidentId: incident.id },
      queryParamsHandling: "merge",
    });
  }
}
