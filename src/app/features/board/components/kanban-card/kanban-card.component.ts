import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output, signal } from "@angular/core";
import { Incident } from "../../../../shared/models/incident.model";
import { PriorityBadgeComponent } from "../../../../shared/components/priority-badge/priority-badge.component";
import { UserAvatarComponent } from "../../../../shared/components/user-avatar/user-avatar.component";

@Component({
  selector: "app-kanban-card",
  standalone: true,
  imports: [CommonModule, PriorityBadgeComponent, UserAvatarComponent],
  template: `
    <article
      class="kanban-card"
      [class.escalated]="incident.status === 'ESCALATED'"
      [class.priority-critical]="incident.priority === 'CRITICAL'"
      [class.dragging]="isDragging()"
      [attr.draggable]="draggable"
      (dragstart)="onDragStart($event)"
      (dragend)="onDragEnd()"
      (click)="onClick()"
    >
      <header class="card-header">
        <span class="card-reference">{{ incident.referenceNumber }}</span>
        <app-priority-badge [priority]="incident.priority" [compact]="true" />
        <button class="card-menu" type="button" aria-label="More actions">
          <span class="material-icons">more_vert</span>
        </button>
      </header>

      <h4 class="card-title">{{ incident.title }}</h4>

      <div class="card-meta">
        <div class="meta-item">
          <span class="material-icons">apartment</span>
          <span>{{ incident.currentDepartment.name }}</span>
        </div>
        @if (incident.assignedTo) {
          <div class="meta-item">
            <app-user-avatar [user]="incident.assignedTo" size="xsmall" />
            <span>{{ incident.assignedTo.displayName }}</span>
          </div>
        }
      </div>

      <div class="card-footer">
        <span class="sla-indicator" [class.breached]="incident.status === 'ESCALATED'">
          SLA {{ incident.status === "ESCALATED" ? "Risk" : "OK" }}
        </span>
        <div class="tags">
          @for (tag of incident.tags.slice(0, 3); track tag) {
            <span class="tag">{{ tag }}</span>
          }
          @if (incident.tags.length > 3) {
            <span class="tag">+{{ incident.tags.length - 3 }}</span>
          }
        </div>
        <span class="date">{{ incident.updatedAt | date: "MMM d, y" }}</span>
      </div>

      @if (incident.status === "ESCALATED") {
        <div class="escalation-banner">
          <span class="material-icons">warning</span>
          <span>Escalated incident</span>
        </div>
      }
    </article>
  `,
  styles: [
    `
      .kanban-card {
        background: var(--bg-primary, #ffffff);
        border: 1px solid var(--border-color, #e5e7eb);
        border-radius: 6px;
        padding: 12px;
        margin-bottom: 8px;
        cursor: pointer;
        transition: box-shadow 0.15s ease, transform 0.15s ease;
      }
      .kanban-card:hover {
        box-shadow: 0 8px 16px rgba(15, 23, 42, 0.08);
        transform: translateY(-1px);
      }
      .kanban-card.escalated {
        border-left: 3px solid #ef4444;
      }
      .kanban-card.priority-critical {
        border-left: 3px solid #dc2626;
      }
      .kanban-card.dragging {
        opacity: 0.5;
        transform: rotate(2deg);
      }
      .card-header {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .card-reference {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
          "Courier New", monospace;
        color: #2563eb;
        font-size: 0.75rem;
        margin-right: auto;
      }
      .card-menu {
        opacity: 0;
        border: 0;
        background: transparent;
        cursor: pointer;
        display: inline-flex;
      }
      .kanban-card:hover .card-menu,
      .card-menu:hover {
        opacity: 1;
      }
      .card-title {
        margin: 10px 0;
        font-size: 0.95rem;
      }
      .card-meta {
        display: flex;
        flex-direction: column;
        gap: 6px;
        color: var(--text-secondary, #6b7280);
        font-size: 0.8rem;
      }
      .meta-item {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .card-footer {
        margin-top: 10px;
        display: grid;
        gap: 8px;
      }
      .sla-indicator {
        font-size: 0.75rem;
        color: #10b981;
      }
      .sla-indicator.breached {
        color: #ef4444;
      }
      .tags {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      }
      .tag {
        background: #eef2ff;
        color: #4338ca;
        border-radius: 999px;
        padding: 2px 8px;
        font-size: 0.7rem;
      }
      .date {
        color: var(--text-secondary, #6b7280);
        font-size: 0.75rem;
      }
      .escalation-banner {
        margin-top: 8px;
        border-radius: 6px;
        padding: 6px 8px;
        background: #fee2e2;
        color: #b91c1c;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 0.75rem;
      }
    `,
  ],
})
export class KanbanCardComponent {
  @Input({ required: true }) incident!: Incident;
  @Input() draggable = true;

  @Output() dragStart = new EventEmitter<Incident>();
  @Output() click = new EventEmitter<Incident>();

  readonly isDragging = signal(false);

  onDragStart(event: DragEvent): void {
    if (!this.draggable) {
      event.preventDefault();
      return;
    }

    this.isDragging.set(true);
    event.dataTransfer?.setData("text/plain", this.incident.status);
    this.dragStart.emit(this.incident);
  }

  onDragEnd(): void {
    this.isDragging.set(false);
  }

  onClick(): void {
    this.click.emit(this.incident);
  }
}
