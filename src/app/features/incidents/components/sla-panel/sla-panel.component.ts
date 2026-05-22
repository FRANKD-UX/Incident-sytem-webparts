// src/app/features/incidents/components/sla-panel/sla-panel.component.ts

import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  SlaState,
  SlaMetricState,
  SlaBreach,
} from "../../../../shared/models/sla.model";
import { EmptyStateComponent } from "../../../../shared/components/empty-state/empty-state.component";

@Component({
  selector: "app-sla-panel",
  standalone: true,
  imports: [CommonModule, EmptyStateComponent],
  template: `
    <div class="sla-panel">
      <div class="panel-header">
        <h3>SLA Performance</h3>
        @if (slaState) {
          <div
            class="overall-status"
            [class]="'status-' + slaState.overallStatus.toLowerCase()"
          >
            <span class="status-dot"></span>
            <span>{{ formatStatus(slaState.overallStatus) }}</span>
          </div>
        }
      </div>

      @if (!slaState) {
        <app-empty-state
          icon="timer"
          title="No SLA data"
          description="SLA tracking is not configured for this incident"
        />
      } @else {
        <!-- Next Breach Warning -->
        @if (slaState.nextBreach) {
          <div class="breach-warning">
            <span class="material-icons">warning</span>
            <div>
              <strong>Approaching SLA Breach</strong>
              <p>Next breach at {{ slaState.nextBreach | date: "medium" }}</p>
            </div>
          </div>
        }

        <!-- SLA Metrics -->
        <div class="metrics-grid">
          @for (metric of slaState.metrics; track metric.metric) {
            <div
              class="metric-card"
              [class]="'status-' + metric.status.toLowerCase()"
            >
              <div class="metric-header">
                <span class="metric-name">{{
                  formatMetric(metric.metric)
                }}</span>
                <span class="metric-status">{{
                  formatStatus(metric.status)
                }}</span>
              </div>

              <div class="metric-progress">
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    [style.width]="getMetricProgress(metric) + '%'"
                    [class]="getProgressClass(metric)"
                  ></div>
                </div>
                <div class="progress-stats">
                  <span>{{ formatDuration(metric.elapsed) }} elapsed</span>
                  <span>{{ formatDuration(metric.target) }} target</span>
                </div>
              </div>

              <div class="metric-deadline">
                <span class="material-icons">schedule</span>
                <span
                  >Deadline:
                  {{ metric.deadline | date: "MMM d, y HH:mm" }}</span
                >
              </div>
            </div>
          }
        </div>

        <!-- SLA Breaches -->
        @if (slaState.breaches.length) {
          <div class="breaches-section">
            <h4>SLA Breaches</h4>
            @for (breach of slaState.breaches; track breach.id) {
              <div
                class="breach-card"
                [class]="'severity-' + breach.severity.toLowerCase()"
              >
                <div class="breach-header">
                  <span class="material-icons">error</span>
                  <div>
                    <strong>{{ formatMetric(breach.metric) }}</strong>
                    <p>Breached at {{ breach.breachedAt | date: "medium" }}</p>
                  </div>
                  <span class="severity-badge">{{ breach.severity }}</span>
                </div>
                @if (!breach.acknowledged) {
                  <div class="breach-actions">
                    <button class="btn btn-secondary btn-sm">
                      Acknowledge
                    </button>
                  </div>
                }
              </div>
            }
          </div>
        }
      }
    </div>
  `,
  styleUrls: ["./sla-panel.component.scss"],
})
export class SlaPanelComponent {
  @Input() slaState: SlaState | null = null;

  formatStatus(status: string): string {
    return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  }

  formatMetric(metric: string): string {
    return metric.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }

  getMetricProgress(metric: SlaMetricState): number {
    if (metric.target === 0) return 100;
    return Math.min((metric.elapsed / metric.target) * 100, 100);
  }

  getProgressClass(metric: SlaMetricState): string {
    if (metric.status === "BREACHED") return "breached";
    if (metric.status === "APPROACHING_BREACH") return "approaching";
    return "within";
  }
}
