import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Department } from "../../../shared/models/user.model";
import {
  WorkflowChainStep,
  cloneWorkflowStep,
} from "../../../shared/models/workflow-configuration.model";

@Component({
  selector: "app-workflow-step-editor",
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="step-card">
      <div class="step-card__header">
        <div>
          <p class="eyebrow">Step {{ step.sequence }}</p>
          <h4>{{ step.departmentName || "Untitled step" }}</h4>
        </div>

        <div class="step-card__actions">
          <button
            type="button"
            class="icon-button"
            [disabled]="!canMoveUp"
            (click)="moveUp.emit()"
            title="Move step up"
          >
            <span class="material-icons">keyboard_arrow_up</span>
          </button>
          <button
            type="button"
            class="icon-button"
            [disabled]="!canMoveDown"
            (click)="moveDown.emit()"
            title="Move step down"
          >
            <span class="material-icons">keyboard_arrow_down</span>
          </button>
          <button
            type="button"
            class="icon-button icon-button--danger"
            (click)="remove.emit()"
            title="Remove step"
          >
            <span class="material-icons">delete</span>
          </button>
        </div>
      </div>

      <div class="step-grid">
        <label>
          <span>Sequence</span>
          <input
            type="number"
            [value]="step.sequence"
            min="1"
            (input)="updateNumberField('sequence', $event)"
          />
        </label>

        <label>
          <span>Department</span>
          <select
            [value]="step.departmentId"
            (change)="updateDepartment($event)"
          >
            <option value="">Select department</option>
            @for (department of departments; track department.id) {
              <option [value]="department.id">{{ department.name }}</option>
            }
          </select>
        </label>

        <label>
          <span>SLA minutes</span>
          <input
            type="number"
            [value]="step.slaMinutes"
            min="1"
            (input)="updateNumberField('slaMinutes', $event)"
          />
        </label>

        <label>
          <span>Send-back target</span>
          <select
            [value]="step.sendBackTargetDepartmentId || ''"
            (change)="
              updateNullableDepartment('sendBackTargetDepartmentId', $event)
            "
          >
            <option value="">None</option>
            @for (department of departments; track department.id) {
              <option [value]="department.id">{{ department.name }}</option>
            }
          </select>
        </label>

        <label>
          <span>Escalation target</span>
          <select
            [value]="step.escalationTargetDepartmentId || ''"
            (change)="
              updateNullableDepartment('escalationTargetDepartmentId', $event)
            "
          >
            <option value="">None</option>
            @for (department of departments; track department.id) {
              <option [value]="department.id">{{ department.name }}</option>
            }
          </select>
        </label>

        <label class="field--full">
          <span>Allowed actions</span>
          <textarea
            rows="2"
            [value]="
              step.allowedActions.join(
                '
'
              )
            "
            (input)="updateListField('allowedActions', $event)"
            placeholder="One action per line"
          ></textarea>
        </label>

        <label class="field--full">
          <span>Required checklist items</span>
          <textarea
            rows="3"
            [value]="
              step.requiredChecklistItems.join(
                '
'
              )
            "
            (input)="updateListField('requiredChecklistItems', $event)"
            placeholder="One checklist item per line"
          ></textarea>
        </label>

        <label class="field--full">
          <span>Notes</span>
          <textarea
            rows="3"
            [value]="step.notes"
            (input)="updateTextField('notes', $event)"
            placeholder="Optional step notes"
          ></textarea>
        </label>
      </div>
    </section>
  `,
  styles: [
    `
      .step-card {
        display: grid;
        gap: 14px;
        padding: 16px;
        border: 1px solid #263247;
        border-radius: 18px;
        background: linear-gradient(180deg, #111827 0%, #0f172a 100%);
        color: #e2e8f0;
      }

      .step-card__header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
      }

      .eyebrow {
        margin: 0 0 4px;
        color: #93c5fd;
        font-size: 11px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.14em;
      }

      h4 {
        margin: 0;
        font-size: 16px;
        color: #f8fafc;
      }

      .step-card__actions {
        display: flex;
        gap: 8px;
      }

      .icon-button {
        width: 34px;
        height: 34px;
        display: grid;
        place-items: center;
        border: 1px solid #334155;
        border-radius: 10px;
        background: #0b1220;
        color: #e2e8f0;
        cursor: pointer;
      }

      .icon-button:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }

      .icon-button--danger {
        border-color: #7f1d1d;
        color: #fecaca;
      }

      .step-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }

      label {
        display: grid;
        gap: 8px;
      }

      .field--full {
        grid-column: 1 / -1;
      }

      span {
        font-size: 12px;
        font-weight: 700;
        color: #cbd5e1;
      }

      input,
      select,
      textarea {
        width: 100%;
        border: 1px solid #334155;
        border-radius: 12px;
        background: #0b1220;
        color: #f8fafc;
        padding: 10px 12px;
        font: inherit;
      }

      textarea {
        resize: vertical;
      }

      @media (max-width: 760px) {
        .step-grid {
          grid-template-columns: 1fr;
        }

        .step-card__header {
          flex-direction: column;
        }
      }
    `,
  ],
})
export class WorkflowStepEditorComponent {
  @Input({ required: true }) step!: WorkflowChainStep;
  @Input() departments: Department[] = [];
  @Input() canMoveUp = false;
  @Input() canMoveDown = false;

  @Output() stepChange = new EventEmitter<WorkflowChainStep>();
  @Output() moveUp = new EventEmitter<void>();
  @Output() moveDown = new EventEmitter<void>();
  @Output() remove = new EventEmitter<void>();

  updateTextField(field: "notes", event: Event): void {
    const value = this.getInputValue(event);
    this.emitStep({ ...cloneWorkflowStep(this.step), [field]: value });
  }

  updateNumberField(field: "sequence" | "slaMinutes", event: Event): void {
    const parsed = Number(this.getInputValue(event));
    this.emitStep({
      ...cloneWorkflowStep(this.step),
      [field]: Number.isNaN(parsed) ? 0 : parsed,
    });
  }

  updateDepartment(event: Event): void {
    const departmentId = this.getInputValue(event);
    const department = this.departments.find(
      (item) => item.id === departmentId,
    );

    this.emitStep({
      ...cloneWorkflowStep(this.step),
      departmentId,
      departmentCode: department?.code ?? departmentId,
      departmentName: department?.name ?? departmentId,
    });
  }

  updateNullableDepartment(
    field: "sendBackTargetDepartmentId" | "escalationTargetDepartmentId",
    event: Event,
  ): void {
    const departmentId = this.getInputValue(event) || null;
    const department = this.departments.find(
      (item) => item.id === departmentId,
    );

    this.emitStep({
      ...cloneWorkflowStep(this.step),
      [field]: departmentId,
      [field === "sendBackTargetDepartmentId"
        ? "sendBackTargetDepartmentName"
        : "escalationTargetDepartmentName"]: department?.name ?? null,
    });
  }

  updateListField(
    field: "allowedActions" | "requiredChecklistItems",
    event: Event,
  ): void {
    const values = this.getInputValue(event)
      .split(/\r?\n/)
      .map((value) => value.trim())
      .filter((value) => value.length > 0);

    this.emitStep({
      ...cloneWorkflowStep(this.step),
      [field]: values,
    });
  }

  private emitStep(step: WorkflowChainStep): void {
    this.stepChange.emit(step);
  }

  private getInputValue(event: Event): string {
    return (
      event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    ).value;
  }
}
