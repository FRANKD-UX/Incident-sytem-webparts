import { CommonModule } from "@angular/common";
import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import { IncidentApiService } from "../../../api/incident-api.service";
import { Incident } from "../../../shared/models/incident.model";
import { PaginationMetadata } from "../../../shared/models/common.model";
import { IncidentTableComponent } from "../components/Incident-table/incident-table.component";
import { SearchInputComponent } from "../../../shared/components/search-input/search-input.component";
import { FilterBarComponent, FilterConfig } from "../../../shared/components/filter-bar/filter-bar.component";
import { LoadingStateComponent } from "../../../shared/components/loading-state/loading-state.component";
import { EmptyStateComponent } from "../../../shared/components/empty-state/empty-state.component";
import { ErrorStateComponent } from "../../../shared/components/error-state/error-state.component";
import { IncidentDrawerComponent } from "../components/incident-drawer/incident-drawer.component";

type SortDirection = "asc" | "desc";

@Component({
  selector: "app-incidents-list-page",
  standalone: true,
  imports: [
    CommonModule,
    IncidentTableComponent,
    SearchInputComponent,
    FilterBarComponent,
    LoadingStateComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    IncidentDrawerComponent,
  ],
  template: `
    <div class="incidents-page">
      <div class="page-header">
        <div>
          <h1>Incidents</h1>
          <p class="subtitle">System of record for all incidents</p>
        </div>
        <button class="btn btn-primary" type="button" (click)="createIncident()">
          <span class="material-icons">add</span>
          Create incident
        </button>
      </div>

      <div class="toolbar card">
        <app-search-input [value]="searchTerm()" placeholder="Search..." (search)="searchTerm.set($event)" />
        <app-filter-bar
          [filters]="filters"
          [activeFilters]="activeFilters()"
          (activeFiltersChange)="activeFilters.set($event)"
        />
      </div>

      @if (loading()) {
        <app-loading-state message="Loading incidents..." />
      } @else if (visibleIncidents().length === 0) {
        <app-empty-state icon="inbox" title="No incidents" description="Create one to start the workflow." />
      } @else {
        <div class="card">
          <app-incident-table
            [incidents]="visibleIncidents()"
            [sortColumn]="sortColumn()"
            [sortDirection]="sortDirection()"
            (sortChange)="onSortChange($event)"
            (rowClick)="openDrawer($event)"
          />
        </div>
      }

      <app-incident-drawer
        [incident]="selectedIncident()"
        [isOpen]="drawerOpen()"
        (close)="drawerOpen.set(false)"
        (refresh)="loadIncidents()"
      />
    </div>
  `,
  styleUrls: ["./incidents-list-page.component.scss"],
})
export class IncidentsListPageComponent implements OnInit {
  private readonly incidentApi = inject(IncidentApiService);
  private readonly router = inject(Router);

  incidents = signal<Incident[]>([]);
  pagination = signal<PaginationMetadata | null>(null);
  loading = signal(false);
  searchTerm = signal("");
  activeFilters = signal<Record<string, string>>({});
  sortColumn = signal("createdAt");
  sortDirection = signal<SortDirection>("desc");
  selectedIncident = signal<Incident | null>(null);
  drawerOpen = signal(false);

  filters: FilterConfig[] = [
    {
      key: "status",
      label: "Status",
      options: [
        { label: "Open", value: "OPEN" },
        { label: "In Progress", value: "IN_PROGRESS" },
        { label: "Pending Checklist", value: "PENDING_CHECKLIST" },
        { label: "Pending Transition", value: "PENDING_TRANSITION" },
        { label: "Resolved", value: "RESOLVED" },
        { label: "Closed", value: "CLOSED" },
      ],
    },
  ];

  visibleIncidents = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const status = this.activeFilters()["status"];
    const rows = this.incidents().filter((i) => {
      const searchable = [i.referenceNumber, i.title, i.description, i.currentDepartment.name, ...i.tags].join(" ").toLowerCase();
      if (term && !searchable.includes(term)) return false;
      if (status && i.status !== status) return false;
      return true;
    });
    const key = this.sortColumn();
    const dir = this.sortDirection();
    return [...rows].sort((a, b) => {
      const av = this.sortValue(a, key);
      const bv = this.sortValue(b, key);
      const cmp = av.localeCompare(bv);
      return dir === "asc" ? cmp : -cmp;
    });
  });

  ngOnInit(): void {
    this.loadIncidents();
  }

  loadIncidents(): void {
    this.loading.set(true);
    this.incidentApi.getIncidents().subscribe({
      next: (response) => {
        this.incidents.set(response.data);
        this.pagination.set(response.pagination);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  createIncident(): void {
    this.router.navigateByUrl("/incidents/new");
  }

  onSortChange(event: { column: string; direction: SortDirection }): void {
    this.sortColumn.set(event.column);
    this.sortDirection.set(event.direction);
  }

  openDrawer(incident: Incident): void {
    this.selectedIncident.set(incident);
    this.drawerOpen.set(true);
  }

  private sortValue(incident: Incident, column: string): string {
    switch (column) {
      case "referenceNumber": return incident.referenceNumber;
      case "title": return incident.title;
      case "status": return incident.status;
      case "createdAt": return incident.createdAt;
      default: return "";
    }
  }
}
