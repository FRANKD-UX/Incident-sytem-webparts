// src/app/features/board/components/kanban-column/kanban-column.component.ts

import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Incident } from "../../../../shared/models/incident.model";
import { KanbanCardComponent } from "../kanban-card/kanban-card.component";

@Component({
  selector: "app-kanban-column",
  standalone: true,
  imports: [CommonModule, KanbanCardComponent],
  template: `
    <div
      class="kanban-column"
      [attr.data-column-id]="departmentCode"
      [style.borderTopColor]="color"
      [class.drop-target]="isDropTarget"
      [class.completed-column]="completed"
      (dragover)="onDragOver($event)"
      (dragleave)="onDragLeave()"
      (drop)="onDrop($event)"
    >
      <div class="column-header">
        <div class="column-title">
          <span class="material-icons column-icon" [style.color]="color">
            {{ icon }}
          </span>

          <div class="column-heading">
            <h3 class="column-heading__title">{{ laneTitle }}</h3>
            <span class="column-heading__subtitle">
              {{ subtitle || (completed ? "Closed queue" : "Active queue") }}
            </span>
          </div>

          <span class="count-badge" [style.background]="color">
            {{ incidents.length }}
          </span>
        </div>

        @if (limit) {
          <div class="column-limit">
            <span>{{ incidents.length }}/{{ limit }}</span>
          </div>
        }
      </div>

      <div
        class="column-content"
        [class.column-content--empty]="incidents.length === 0"
      >
        @if (incidents.length > 0) {
          @for (incident of incidents; track incident.id) {
            <app-kanban-card
              [incident]="incident"
              [draggable]="canDrag"
              (dragStart)="onCardDragStart($event, incident)"
              (click)="incidentClick.emit(incident)"
            />
          }
        }
      </div>

      <div class="column-footer">
        <span class="total-incidents">
          {{ incidents.length }} incident{{
            incidents.length !== 1 ? "s" : ""
          }}
        </span>

        <span class="column-footer__note">
          {{ completed ? "Closed lane" : "Work queue" }}
        </span>
      </div>
    </div>
  `,
  styleUrls: ["./kanban-column.component.scss"],
})
export class KanbanColumnComponent {
  @Input() laneId = "";
  @Input() laneTitle = "";
  @Input() departmentCode = "";
  @Input() incidents: Incident[] = [];
  @Input() limit?: number;
  @Input() color = "#64748b";
  @Input() icon = "";
  @Input() completed = false;
  @Input() subtitle = "";
  @Input() canDrag = false;

  @Output() incidentMoved = new EventEmitter<{
    incidentId: string;
    fromDepartmentCode: string;
    toDepartmentCode: string;
  }>();
  @Output() incidentClick = new EventEmitter<Incident>();

  isDropTarget = false;
  private draggedIncidentId: string | null = null;
  private draggedFromDepartmentCode: string | null = null;

  onCardDragStart(event: DragEvent, incident: Incident): void {
    this.draggedIncidentId = incident.id;
    this.draggedFromDepartmentCode = incident.currentDepartment.code;

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", incident.id);
      event.dataTransfer.setData("application/x-incident-id", incident.id);
      event.dataTransfer.setData(
        "application/x-source-department-code",
        incident.currentDepartment.code,
      );
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDropTarget = true;
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }
  }

  onDragLeave(): void {
    this.isDropTarget = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDropTarget = false;

    const incidentId =
      event.dataTransfer?.getData("application/x-incident-id") ||
      event.dataTransfer?.getData("text/plain") ||
      this.draggedIncidentId;

    const fromDepartmentCode =
      event.dataTransfer?.getData("application/x-source-department-code") ||
      this.draggedFromDepartmentCode ||
      "";

    if (
      incidentId &&
      fromDepartmentCode &&
      fromDepartmentCode !== this.departmentCode
    ) {
      this.incidentMoved.emit({
        incidentId,
        fromDepartmentCode,
        toDepartmentCode: this.departmentCode,
      });
    }

    this.draggedIncidentId = null;
    this.draggedFromDepartmentCode = null;
  }
}
