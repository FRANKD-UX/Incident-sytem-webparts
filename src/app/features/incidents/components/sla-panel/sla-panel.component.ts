import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { SlaMetricState, SlaState } from "../../../../shared/models/sla.model";

@Component({
  selector: "app-sla-panel",
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="sla-panel">
      @if (!slaState) {
        <p>No SLA data available.</p>
      } @else {
        <div class="status-row">
          <span class="status-badge" [ngClass]="formatStatus(slaState.overallStatus)">
            {{ formatStatus(slaState.overallStatus) }}
          </span>
        </div>

        @if (slaState.nextBreach) {
          <div class="warning-banner">
            <span class="material-icons">warning</span>
            Next breach at {{ slaState.nextBreach | date: "MMM d, y h:mm a" }}
          </div>
        }

        <div class="metrics-grid">
          @for (metric of slaState.metrics; track metric.metric) {
            <article class="metric-card" [class.status-breached]="metric.status === 'BREACHED'">
              <h4>{{ formatMetric(metric.metric) }}</h4>
              <div class="progress-bar">
                <div
                  [style.width.%]="getMetricProgress(metric)"
                  [ngClass]="{
                    breached: metric.status === 'BREACHED',
                    approaching: metric.status === 'APPROACHING_BREACH',
                    within: metric.status === 'WITHIN_SLA'
                  }"
                ></div>
              </div>
              <div class="metric-stats">
                <span>Elapsed: {{ formatDuration(metric.elapsed) }}</span>
                <span>Target: {{ formatDuration(metric.target) }}</span>
              </div>
              <small>Deadline: {{ metric.deadline | date: "MMM d, y h:mm a" }}</small>
            </article>
          }
        </div>

        @if (slaState.breaches.length > 0) {
          <section class="breaches">
            <h4>Breaches</h4>
            @for (breach of slaState.breaches; track breach.id) {
              <article class="breach-card">
                <strong>{{ formatMetric(breach.metric) }}</strong>
                <span>{{ breach.severity }}</span>
                <small>{{ breach.breachedAt | date: "MMM d, y h:mm a" }}</small>
                @if (!breach.acknowledged) {
                  <button type="button" (click)="acknowledge.emit(breach.id)">Acknowledge</button>
                }
              </article>
            }
          </section>
        }
      }
    </section>
  `,
  styles: [
    `
      .sla-panel {
        display: grid;
        gap: 12px;
      }
      .status-row {
        display: flex;
      }
      .status-badge {
        border-radius: 999px;
        padding: 4px 10px;
        font-size: 0.75rem;
        font-weight: 600;
      }
      .status-badge.WITHIN_SLA {
        color: #10b981;
        background: #ecfdf5;
      }
      .status-badge.APPROACHING_BREACH {
        color: #f59e0b;
        background: #fffbeb;
      }
      .status-badge.BREACHED {
        color: #ef4444;
        background: #fef2f2;
      }
      .warning-banner {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        border-radius: 8px;
        padding: 8px 10px;
        background: #fffbeb;
        color: #b45309;
      }
      .metrics-grid {
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      }
      .metric-card {
        padding: 16px;
        border: 1px solid var(--border-color, #e5e7eb);
        border-radius: 8px;
        display: grid;
        gap: 8px;
      }
      .metric-card.status-breached {
        border-color: #ef4444;
        background: #fef2f2;
      }
      .metric-card h4 {
        margin: 0;
      }
      .progress-bar {
        height: 8px;
        background: var(--bg-tertiary, #e5e7eb);
        border-radius: 4px;
        overflow: hidden;
      }
      .progress-bar div {
        height: 100%;
      }
      .progress-bar .breached {
        background: #ef4444;
      }
      .progress-bar .approaching {
        background: #f59e0b;
      }
      .progress-bar .within {
        background: #10b981;
      }
      .metric-stats {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        font-size: 0.85rem;
      }
      .breaches {
        display: grid;
        gap: 8px;
      }
      .breach-card {
        display: flex;
        align-items: center;
        gap: 10px;
        border: 1px solid var(--border-color, #e5e7eb);
        border-radius: 8px;
        padding: 10px;
      }
      .breach-card button {
        margin-left: auto;
        border: 0;
        background: #ef4444;
        color: white;
        border-radius: 6px;
        padding: 6px 10px;
        cursor: pointer;
      }
    `,
  ],
})
export class SlaPanelComponent {
  @Input() slaState: SlaState | null = null;
  @Output() acknowledge = new EventEmitter<string>();

  formatStatus(status: SlaState["overallStatus"]): string {
    return status;
  }

  formatMetric(metric: SlaMetricState["metric"]): string {
    return metric.replace(/_/g, " ");
  }

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }

  getMetricProgress(metric: SlaMetricState): number {
    if (metric.target <= 0) {
      return 0;
    }
    return Math.min((metric.elapsed / metric.target) * 100, 100);
  }
}
