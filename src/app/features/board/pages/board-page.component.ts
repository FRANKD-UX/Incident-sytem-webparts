import { CommonModule } from "@angular/common";
import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { IncidentApiService } from "../../../api/incident-api.service";
import { Incident } from "../../../shared/models/incident.model";
import { LoadingStateComponent } from "../../../shared/components/loading-state/loading-state.component";
import { ErrorStateComponent } from "../../../shared/components/error-state/error-state.component";
import { EmptyStateComponent } from "../../../shared/components/empty-state/empty-state.component";
import { KanbanColumnComponent } from "../components/kanban-column/kanban-column.component";
import { SearchInputComponent } from "../../../shared/components/search-input/search-input.component";

type BoardLane = "SUP" | "ACC" | "OPS" | "COMPLETED";

@Component({
  selector: "app-board-page",
  standalone: true,
  imports: [
    CommonModule,
    LoadingStateComponent,
    ErrorStateComponent,
    EmptyStateComponent,
    KanbanColumnComponent,
    SearchInputComponent,
  ],
  template: `
    <div class="board-page">
      <div class="page-header">
        <div>
          <h1>Board</h1>
          <p class="subtitle">Department workflow view</p>
        </div>
        <app-search-input [value]="searchTerm()" placeholder="Search..." (search)="searchTerm.set($event)" />
      </div>

      @if (loading()) {
        <app-loading-state message="Loading board..." />
      } @else {
        <div class="board-columns">
          @for (lane of lanes; track lane.id) {
            <app-kanban-column
              [column]="laneView(lane.id)"
              [canDrag]="true"
              (incidentMoved)="moveIncident($event)"
            />
          }
        </div>
      }
    </div>
  `,
  styleUrls: ["./board-page.component.scss"],
})
export class BoardPageComponent implements OnInit {
  private readonly incidentApi = inject(IncidentApiService);

  incidents = signal<Incident[]>([]);
  loading = signal(false);
  searchTerm = signal("");

  lanes = [
    { id: "SUP" as BoardLane, title: "Support", color: "#3b82f6", icon: "support_agent" },
    { id: "ACC" as BoardLane, title: "Accounts", color: "#f59e0b", icon: "payments" },
    { id: "OPS" as BoardLane, title: "Operations", color: "#10b981", icon: "settings" },
    { id: "COMPLETED" as BoardLane, title: "Completed", color: "#374151", icon: "task_alt" },
  ];

  filtered = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    return this.incidents().filter((i) =>
      !term || [i.referenceNumber, i.title, i.currentDepartment.name, i.status, ...i.tags].join(" ").toLowerCase().includes(term),
    );
  });

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

  laneView(id: BoardLane) {
    return {
      id,
      title: this.lanes.find((l) => l.id === id)!.title,
      departmentCode: id,
      incidents:
        id === "COMPLETED"
          ? this.filtered().filter((i) => i.status === "RESOLVED" || i.status === "CLOSED")
          : this.filtered().filter((i) => i.currentDepartment.code === id && i.status !== "RESOLVED" && i.status !== "CLOSED"),
      color: this.lanes.find((l) => l.id === id)!.color,
      icon: this.lanes.find((l) => l.id === id)!.icon,
      completed: id === "COMPLETED",
    };
  }

  moveIncident(event: { incidentId: string; fromDepartmentCode: string; toDepartmentCode: string }): void {
    const wf = (window as any).__workflowState;
    wf?.moveIncident?.(event.incidentId, event);
    this.loadIncidents();
  }
}
