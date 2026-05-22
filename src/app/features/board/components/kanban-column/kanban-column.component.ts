import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output, signal } from "@angular/core";
import { Incident } from "../../../../shared/models/incident.model";
import { IncidentStatus } from "../../../../shared/models/common.model";
import { EmptyStateComponent } from "../../../../shared/components/empty-state/empty-state.component";
import { KanbanCardComponent } from "../kanban-card/kanban-card.component";

export interface KanbanColumn {
  id: string;
  title: string;
  status: IncidentStatus;
  color: string;
  icon: string;
  incidents: Incident[];
}

export interface IncidentMovedEvent {
  incident: Incident;
  fromColumnId: string;
  toColumnId: string;
}

@Component({
  selector: "app-kanban-column",
  standalone: true,
  imports: [CommonModule, EmptyStateComponent, KanbanCardComponent],
  template: `
    <section class="kanban-column" [style.borderTopColor]="column.color">
      <header class="column-header">
        <div class="column-header__meta">
          <span class="material-icons" [style.color]="column.color">{{ column.icon }}</span>
          <h3>{{ column.title }}</h3>
        </div>
        <span class="count-badge" [style.background]="column.color">{{ column.incidents.length }}</span>
      </header>

      <div
        class="column-content"
        (dragover)="onDragOver($event)"
        (drop)="onDrop($event)"
      >
        @if (column.incidents.length === 0) {
          <app-empty-state
            icon="inventory_2"
            title="No incidents"
            description="Drop incidents here to move workflow status."
          />
        } @else {
          @for (incident of column.incidents; track incident.id) {
            <app-kanban-card
              [incident]="incident"
              [draggable]="canDrag"
              (dragStart)="onCardDragStart($event)"
              (click)="incidentClick.emit($event)"
            />
          }
        }
      </div>

      <footer class="column-footer">Total: {{ column.incidents.length }}</footer>
    </section>
  `,
  styles: [
    `
      .kanban-column {
        width: 300px;
        background: var(--bg-secondary, #f8fafc);
        border-top: 3px solid;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        max-height: 100%;
        border: 1px solid var(--border-color, #e5e7eb);
      }
      .column-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 12px 8px;
      }
      .column-header__meta {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .column-header__meta h3 {
        margin: 0;
        font-size: 0.95rem;
      }
      .count-badge {
        padding: 2px 8px;
        border-radius: 12px;
        color: white;
        font-size: 0.75rem;
        font-weight: 600;
      }
      .column-content {
        padding: 8px;
        overflow-y: auto;
        min-height: 120px;
      }
      .column-footer {
        border-top: 1px solid var(--border-color, #e5e7eb);
        padding: 8px 12px;
        color: var(--text-secondary, #6b7280);
        font-size: 0.8rem;
      }
    `,
  ],
})
export class KanbanColumnComponent {
  @Input({ required: true }) column!: KanbanColumn;
  @Input() canDrag = false;

  @Output() incidentMoved = new EventEmitter<IncidentMovedEvent>();
  @Output() incidentClick = new EventEmitter<Incident>();

  readonly draggedIncident = signal<Incident | null>(null);

  onCardDragStart(incident: Incident): void {
    this.draggedIncident.set(incident);
  }

  onDragOver(event: DragEvent): void {
    if (!this.canDrag) {
      return;
    }
    event.preventDefault();
  }

  onDrop(event: DragEvent): void {
    if (!this.canDrag) {
      return;
    }

    event.preventDefault();
    const incident = this.draggedIncident();
    if (!incident) {
      return;
    }

    const fromColumnId = event.dataTransfer?.getData("text/plain") ?? "";
    if (!fromColumnId || fromColumnId === this.column.id) {
      this.draggedIncident.set(null);
      return;
    }

    this.incidentMoved.emit({
      incident,
      fromColumnId,
      toColumnId: this.column.id,
    });

    this.draggedIncident.set(null);
  }
}
