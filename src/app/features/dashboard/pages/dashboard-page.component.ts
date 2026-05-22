import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { DashboardApiService } from "../../../api/dashboard-api.service";
import { DashboardSummary } from "../../../shared/models/dashboard.model";
import { LoadingStateComponent } from "../../../shared/components/loading-state/loading-state.component";
import { ErrorStateComponent } from "../../../shared/components/error-state/error-state.component";
import { StatCardComponent } from "../../../shared/components/stat-card/stat-card.component";

@Component({
  selector: "app-dashboard-page",
  standalone: true,
  imports: [
    CommonModule,
    LoadingStateComponent,
    ErrorStateComponent,
    StatCardComponent,
  ],
  template: `
    @if (loading) {
      <app-loading-state message="Loading dashboard..." />
    } @else if (error) {
      <app-error-state [error]="error" (retry)="load()" />
    } @else {
      <section class="grid">
        @for (kpi of data?.kpis ?? []; track kpi.id) {
          <app-stat-card [kpi]="kpi" />
        }
      </section>
    }
  `,
  styles: [
    `
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 16px;
      }
    `,
  ],
})
export class DashboardPageComponent implements OnInit {
  private readonly api = inject(DashboardApiService);
  data: DashboardSummary | null = null;
  loading = true;
  error = "";

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.api.getDashboardSummary().subscribe({
      next: (data) => {
        this.data = data;
        this.loading = false;
      },
      error: () => {
        this.error = "Dashboard unavailable";
        this.loading = false;
      },
    });
  }
}
