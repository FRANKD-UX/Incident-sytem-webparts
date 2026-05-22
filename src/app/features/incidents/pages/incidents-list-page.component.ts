import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { IncidentApiService } from "../../../api/incident-api.service";
import { Incident } from "../../../shared/models/incident.model";
import { LoadingStateComponent } from "../../../shared/components/loading-state/loading-state.component";

@Component({
  selector: "app-incidents-list-page",
  standalone: true,
  imports: [CommonModule, LoadingStateComponent],
  template: `
    @if (loading) {
      <app-loading-state message="Loading incidents..." />
    } @else {
      <div class="list">
        @for (incident of incidents; track incident.id) {
          <article class="item">
            <strong>{{ incident.referenceNumber }}</strong>
            <div>{{ incident.title }}</div>
            <small>{{ incident.status }} · {{ incident.priority }}</small>
          </article>
        }
      </div>
    }
  `,
  styles: [
    `
      .list {
        display: grid;
        gap: 12px;
      }
      .item {
        background: #fff;
        border: 1px solid rgba(15, 23, 42, 0.08);
        border-radius: 16px;
        padding: 16px;
      }
    `,
  ],
})
export class IncidentsListPageComponent implements OnInit {
  private readonly api = inject(IncidentApiService);
  incidents: Incident[] = [];
  loading = true;

  ngOnInit(): void {
    this.api.getIncidents().subscribe({
      next: (data) => {
        this.incidents = data;
        this.loading = false;
      },
    });
  }
}
