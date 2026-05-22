import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { IncidentApiService } from "../../../api/incident-api.service";
import { Incident } from "../../../shared/models/incident.model";

@Component({
  selector: "app-board-page",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="board">
      @for (status of statuses; track status) {
        <section class="col">
          <h3>{{ status }}</h3>
          @for (
            incident of incidents.filter(i => i.status === status);
            track incident.id
          ) {
            <article class="card">{{ incident.title }}</article>
          }
        </section>
      }
    </div>
  `,
  styles: [
    `
      .board {
        display: grid;
        gap: 16px;
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
      .col {
        background: #f8fbff;
        border: 1px solid rgba(15, 23, 42, 0.08);
        border-radius: 20px;
        padding: 16px;
      }
      .card {
        background: #fff;
        border-radius: 14px;
        padding: 12px;
        margin-top: 10px;
      }
    `,
  ],
})
export class BoardPageComponent implements OnInit {
  private readonly api = inject(IncidentApiService);
  statuses = ["OPEN", "IN_PROGRESS", "ESCALATED"];
  incidents: Incident[] = [];

  ngOnInit(): void {
    this.api
      .getIncidents()
      .subscribe({ next: (data) => (this.incidents = data) });
  }
}
