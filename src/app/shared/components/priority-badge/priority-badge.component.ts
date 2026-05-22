import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { Priority } from "../../models/common.model";

@Component({
  selector: "app-priority-badge",
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="priority-badge" [class.compact]="compact" [ngClass]="priorityClass">
      <span class="material-icons" *ngIf="priorityIcon">{{ priorityIcon }}</span>
      {{ priority }}
    </span>
  `,
  styles: [
    `
      .priority-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 500;
      }
      .priority-badge.compact {
        padding: 2px 8px;
      }
      .priority-badge .material-icons {
        font-size: 0.9rem;
      }
      .priority-badge.critical {
        color: #dc2626;
        background: #fee2e2;
      }
      .priority-badge.high {
        color: #ef4444;
        background: #fef2f2;
      }
      .priority-badge.medium {
        color: #f59e0b;
        background: #fffbeb;
      }
      .priority-badge.low {
        color: #10b981;
        background: #ecfdf5;
      }
    `,
  ],
})
export class PriorityBadgeComponent {
  @Input({ required: true }) priority!: Priority;
  @Input() compact = false;

  get priorityClass(): string {
    return this.priority.toLowerCase();
  }

  get priorityIcon(): string | null {
    if (this.priority === "CRITICAL") {
      return "error";
    }
    if (this.priority === "HIGH") {
      return "arrow_upward";
    }
    return null;
  }
}
