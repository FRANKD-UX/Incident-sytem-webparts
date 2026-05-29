import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, OnChanges, Output, inject } from "@angular/core";
import { ReactiveFormsModule, NonNullableFormBuilder } from "@angular/forms";

export interface BoardFilterOption {
  id: string;
  label: string;
}

export interface BoardFilterState {
  departmentCode: string;
  assigneeId: string;
  status: string;
}

@Component({
  selector: "app-board-filters",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="form" class="board-filters">
      <label>
        <span>Department</span>
        <select formControlName="departmentCode">
          <option value="">All departments</option>
          @for (department of departments; track department.id) {
            <option [value]="department.id">{{ department.label }}</option>
          }
        </select>
      </label>

      <label>
        <span>Assignee</span>
        <select formControlName="assigneeId">
          <option value="">All assignees</option>
          @for (assignee of assignees; track assignee.id) {
            <option [value]="assignee.id">{{ assignee.label }}</option>
          }
        </select>
      </label>

      <label>
        <span>Status</span>
        <select formControlName="status">
          <option value="">All statuses</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="PENDING_CHECKLIST">Pending checklist</option>
          <option value="PENDING_TRANSITION">Pending transition</option>
          <option value="ESCALATED">Escalated</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
      </label>

      <button type="button" class="btn btn-secondary" (click)="clearFilters()">
        Clear
      </button>
    </form>
  `,
  styles: [
    `
      .board-filters {
        display: flex;
        align-items: end;
        gap: 12px;
        flex-wrap: wrap;
      }

      label {
        display: grid;
        gap: 6px;
        min-width: 180px;
      }

      span {
        font-size: 12px;
        color: #64748b;
        font-weight: 700;
      }

      select {
        min-height: 36px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        padding: 0 10px;
        background: white;
      }

      .btn {
        min-height: 36px;
        padding: 0 12px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        background: white;
        font-weight: 700;
        cursor: pointer;
      }
    `,
  ],
})
export class BoardFiltersComponent implements OnChanges {
  private readonly formBuilder = inject(NonNullableFormBuilder);

  @Input() departments: BoardFilterOption[] = [];
  @Input() assignees: BoardFilterOption[] = [];
  @Input() value: BoardFilterState = {
    departmentCode: "",
    assigneeId: "",
    status: "",
  };
  @Output() filterChange = new EventEmitter<BoardFilterState>();

  readonly form = this.formBuilder.group({
    departmentCode: "",
    assigneeId: "",
    status: "",
  });

  constructor() {
    this.form.valueChanges.subscribe(() => {
      this.filterChange.emit({
        departmentCode: this.form.controls.departmentCode.value,
        assigneeId: this.form.controls.assigneeId.value,
        status: this.form.controls.status.value,
      });
    });
  }

  ngOnChanges(): void {
    this.form.patchValue(this.value, { emitEvent: false });
  }

  clearFilters(): void {
    this.form.setValue({
      departmentCode: "",
      assigneeId: "",
      status: "",
    });
  }
}
