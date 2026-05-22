// src/app/features/board/components/kanban-column/kanban-column.component.ts

import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Incident } from "../../../../shared/models/incident.model";
import { KanbanCardComponent } from "../kanban-card/kanban-card.component";

interface KanbanColumn {
  id: string;
  title: string;
  departmentCode: string;
  incidents: Incident[];
  limit?: number;
  color: string;
  icon: string;
  completed?: boolean;
}

@Component({
  selector: "app-kanban-column",
  standalone: true,
  imports: [CommonModule, KanbanCardComponent],
  template: `
    <div
      class="kanban-column"
      [attr.data-column-id]="column.departmentCode"
      [style.borderTopColor]="column.color"
      [class.drop-target]="isDropTarget"
      [class.completed-column]="column.completed"
      (dragover)="onDragOver($event)"
      (dragleave)="onDragLeave()"
      (drop)="onDrop($event)"
    >
      <div class="column-header">
        <div class="column-title">
          <span class="material-icons" [style.color]="column.color">{{
            column.icon
          }}</span>
          <h3>{{ column.title }}</h3>
          <span class="count-badge" [style.background]="column.color">
            {{ column.incidents.length }}
          </span>
        </div>
        @if (column.limit) {
          <div class="column-limit">
            <span>{{ column.incidents.length }}/{{ column.limit }}</span>
          </div>
        }
      </div>

      <div class="column-content">
        @if (column.incidents.length === 0) {
          <div class="empty-column">
            <span class="material-icons">inbox</span>
            <p>No incidents</p>
          </div>
        } @else {
          @for (incident of column.incidents; track incident.id) {
            <app-kanban-card
              [incident]="incident"
              [draggable]="canDrag"
              (dragStart)="onCardDragStart($event, incident)"
              (click)="incidentClick.emit(incident)"
            />
          }
        }
      </div>

      @if (column.incidents.length > 0) {
        <div class="column-footer">
          <span class="total-incidents">
            {{ column.incidents.length }} incident{{
              column.incidents.length !== 1 ? "s" : ""
            }}
          </span>
        </div>
      }
    </div>
  `,
  styleUrls: ["./kanban-column.component.scss"],
})
export class KanbanColumnComponent {
  @Input({ required: true }) column!: KanbanColumn;
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

    if (incidentId && fromDepartmentCode && fromDepartmentCode !== this.column.departmentCode) {
      this.incidentMoved.emit({
        incidentId,
        fromDepartmentCode,
        toDepartmentCode: this.column.departmentCode,
      });
    }

    this.draggedIncidentId = null;
    this.draggedFromDepartmentCode = null;
  }
}
