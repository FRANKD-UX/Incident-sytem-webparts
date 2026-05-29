import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { IncidentStatus } from "../../models/common.model";

@Component({
  selector: "app-status-badge",
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="status-badge" [class.compact]="compact" [ngClass]="statusClass">
      {{ statusLabel }}
    </span>
  `,
  styles: [
    `
      .status-badge {
        display: inline-flex;
        align-items: center;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 500;
        white-space: nowrap;
      }
      .status-badge.compact {
        padding: 2px 8px;
      }
      .status-badge.open {
        color: #6b7280;
        background: #f3f4f6;
      }
      .status-badge.in-progress {
        color: #3b82f6;
        background: #dbeafe;
      }
      .status-badge.escalated {
        color: #ef4444;
        background: #fee2e2;
      }
      .status-badge.resolved {
        color: #10b981;
        background: #d1fae5;
      }
      .status-badge.closed {
        color: #374151;
        background: #e5e7eb;
      }
      .status-badge.default {
        color: #6b7280;
        background: #f3f4f6;
      }
    `,
  ],
})
export class StatusBadgeComponent {
  @Input({ required: true }) status!: IncidentStatus;
  @Input() compact = false;

  get statusLabel(): string {
    return this.status.replace(/_/g, " ");
  }

  get statusClass(): string {
    switch (this.status) {
      case "OPEN":
        return "open";
      case "IN_PROGRESS":
        return "in-progress";
      case "ESCALATED":
        return "escalated";
      case "RESOLVED":
        return "resolved";
      case "CLOSED":
        return "closed";
      default:
        return "default";
    }
  }
}
