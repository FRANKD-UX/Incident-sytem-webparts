import { CommonModule } from "@angular/common";
import {
  Component,
  EventEmitter,
  Input,
  Output,
  computed,
  inject,
  signal,
} from "@angular/core";
import { Department } from "../../../shared/models/user.model";
import {
  WorkflowChain,
  WorkflowChainStep,
  WorkflowIncidentTypeOption,
  WORKFLOW_TRIGGER_LABELS,
  cloneWorkflowChain,
} from "../../../shared/models/workflow-configuration.model";
import { WorkflowConfigurationService } from "../../../api/workflow-configuration.service";
import { WorkflowStepEditorComponent } from "./workflow-step-editor.component";

@Component({
  selector: "app-workflow-chain-editor",
  standalone: true,
  imports: [CommonModule, WorkflowStepEditorComponent],
  template: `
    @if (draft()) {
      <aside class="drawer">
        <div class="drawer__backdrop" (click)="close.emit()"></div>

        <section class="drawer__panel">
          <header class="drawer__header">
            <div>
              <p class="eyebrow">Workflow chain editor</p>
              <h2>{{ draft()!.name || "New workflow chain" }}</h2>
              <p class="subtitle">
                {{ draft()!.incidentTypeName }} · Version {{ draft()!.version }}
              </p>
            </div>

            <div class="drawer__status">
              <span
                class="status-pill"
                [class.status-pill--published]="draft()!.status === 'published'"
              >
                {{ draft()!.status | titlecase }}
              </span>
              <button type="button" class="close-button" (click)="close.emit()">
                <span class="material-icons">close</span>
              </button>
            </div>
          </header>

          @if (validationErrors().length > 0) {
            <div class="validation-summary">
              <strong>Fix these issues before saving</strong>
              <ul>
                @for (error of validationErrors(); track error) {
                  <li>{{ error }}</li>
                }
              </ul>
            </div>
          }

          <div class="drawer__body">
            <section class="editor-panel">
              <div class="editor-grid">
                <label>
                  <span>Name</span>
                  <input
                    type="text"
                    [value]="draft()!.name"
                    (input)="updateName($event)"
                    placeholder="Workflow chain name"
                  />
                </label>

                <label>
                  <span>Incident type</span>
                  <select
                    [value]="draft()!.incidentTypeId"
                    (change)="updateIncidentType($event)"
                  >
                    <option value="">Select incident type</option>
                    @for (
                      incidentType of incidentTypes;
                      track incidentType.id
                    ) {
                      <option [value]="incidentType.id">
                        {{ incidentType.name }}
                      </option>
                    }
                  </select>
                </label>

                <label>
                  <span>Owner department</span>
                  <select
                    [value]="draft()!.ownerDepartmentId"
                    (change)="updateOwnerDepartment($event)"
                  >
                    <option value="">Select owner department</option>
                    @for (department of departments; track department.id) {
                      <option [value]="department.id">
                        {{ department.name }}
                      </option>
                    }
                  </select>
                </label>

                <label>
                  <span>Status</span>
                  <select
                    [value]="draft()!.status"
                    (change)="updateStatus($event)"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </label>

                <label>
                  <span>Version</span>
                  <input type="number" [value]="draft()!.version" readonly />
                </label>

                <label class="field--full">
                  <span>Notes</span>
                  <textarea
                    rows="3"
                    [value]="draft()!.notes"
                    (input)="updateNotes($event)"
                    placeholder="Operational notes, approvals, or handover context"
                  ></textarea>
                </label>
              </div>
            </section>

            <section class="editor-panel editor-panel--steps">
              <div class="section-header">
                <div>
                  <h3>Ordered steps</h3>
                  <p>
                    Reorder steps and keep sequence contiguous starting at 1.
                    <label>
                      <span>Trigger source</span>
                      <select
                        [value]="draft()!.triggerSource"
                        (change)="updateTriggerSource($event)"
                      >
                        @for (option of triggerOptions; track option.key) {
                          <option [value]="option.key">
                            {{ option.label }}
                          </option>
                        }
                      </select>
                    </label>

                    <label>
                      <span>Final decision authority</span>
                      <input
                        type="text"
                        [value]="draft()!.finalDecisionAuthority"
                        (input)="updateFinalDecisionAuthority($event)"
                        placeholder="Manager / CTO"
                      />
                    </label>

                    <label class="field--full checkbox-field">
                      <input
                        type="checkbox"
                        [checked]="draft()!.autoUpdateUi"
                        (change)="updateAutoUpdateUi($event)"
                      />
                      <span
                        >Update the UI automatically as the chain advances</span
                      >
                    </label>
                  </p>
                </div>
                <button
                  type="button"
                  class="btn btn-secondary"
                  (click)="addStep()"
                >
                  <span class="material-icons">add</span>
                  Add step
                </button>
              </div>

              <div class="steps-list">
                @for (
                  step of draft()!.steps;
                  track step.id;
                  let index = $index
                ) {
                  <app-workflow-step-editor
                    [step]="step"
                    [departments]="departments"
                    [canMoveUp]="index > 0"
                    [canMoveDown]="index < draft()!.steps.length - 1"
                    (stepChange)="updateStep($event)"
                    (moveUp)="moveStep(step.sequence, -1)"
                    (moveDown)="moveStep(step.sequence, 1)"
                    (remove)="removeStep(step.sequence)"
                  />
                }
              </div>
            </section>

            <section class="editor-panel editor-panel--preview">
              <div class="section-header">
                <div>
                  <h3>Preview mode</h3>
                  <p>
                    Preview the chain as configured for the selected incident
                    type.
                  </p>
                </div>
                <span class="preview-pill">{{
                  selectedIncidentType()?.code || "UNASSIGNED"
                }}</span>
              </div>

              <div class="preview-card">
                <div class="preview-card__header">
                  <div>
                    <strong>{{
                      selectedIncidentType()?.name || "Select incident type"
                    }}</strong>
                    <p>
                      {{
                        selectedIncidentType()?.description ||
                          "No incident type selected yet."
                      }}
                    </p>
                  </div>
                  <span>{{ draft()!.steps.length }} steps</span>
                </div>

                <div class="preview-list">
                  @for (step of draft()!.steps; track step.id) {
                    <div class="preview-row">
                      <div>
                        <strong>{{ step.sequence }}.</strong>
                        <span>{{ step.departmentName }}</span>
                      </div>
                      <small>
                        {{
                          step.allowedActions.join(" · ") ||
                            "No actions defined"
                        }}
                      </small>
                      <small>
                        Target: {{ resolveTargetLabel(step) }} · SLA
                        {{ step.slaMinutes }}m
                      </small>
                    </div>
                  }
                </div>
              </div>
            </section>
          </div>

          <footer class="drawer__footer">
            <div class="footer-meta">
              <span>{{ draft()!.steps.length }} steps</span>
              <span>Owner: {{ draft()!.ownerDepartmentName }}</span>
            </div>

            <div class="footer-actions">
              <button
                type="button"
                class="btn btn-secondary"
                (click)="saveDraft()"
              >
                Save Draft
              </button>
              <button type="button" class="btn btn-primary" (click)="publish()">
                Publish
              </button>
              <button
                type="button"
                class="btn btn-secondary"
                (click)="disable()"
                [disabled]="draft()!.status === 'inactive'"
              >
                Disable
              </button>
              <button
                type="button"
                class="btn btn-danger"
                [disabled]="!canDelete"
                (click)="deleteChain()"
              >
                Delete
              </button>
            </div>
          </footer>
        </section>
      </aside>
    }
  `,
  styles: [
    `
      .drawer {
        position: fixed;
        inset: 0;
        z-index: 30;
      }

      .drawer__backdrop {
        position: absolute;
        inset: 0;
        background: rgba(2, 6, 23, 0.62);
      }

      .drawer__panel {
        position: absolute;
        top: 12px;
        right: 12px;
        bottom: 12px;
        width: min(920px, calc(100vw - 24px));
        display: grid;
        grid-template-rows: auto 1fr auto;
        gap: 16px;
        padding: 20px;
        border: 1px solid #223047;
        border-radius: 24px;
        background: linear-gradient(180deg, #0f172a 0%, #111827 100%);
        color: #e2e8f0;
        box-shadow: 0 30px 60px rgba(15, 23, 42, 0.45);
        overflow: hidden;
      }

      .drawer__header,
      .drawer__footer,
      .section-header,
      .preview-card__header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
      }

      .eyebrow {
        margin: 0 0 6px;
        color: #93c5fd;
        font-size: 12px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.14em;
      }

      h2,
      h3,
      p {
        margin: 0;
      }

      .subtitle,
      .section-header p,
      .preview-card__header p {
        color: #94a3b8;
      }

      .drawer__status {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .status-pill,
      .preview-pill,
      .footer-meta span {
        padding: 8px 12px;
        border-radius: 999px;
        border: 1px solid #334155;
        background: #0b1220;
        color: #cbd5e1;
        font-size: 12px;
        font-weight: 700;
      }

      .status-pill--published {
        border-color: #1d4ed8;
        background: rgba(37, 99, 235, 0.18);
        color: #bfdbfe;
      }

      .close-button {
        width: 40px;
        height: 40px;
        display: grid;
        place-items: center;
        border: 1px solid #334155;
        border-radius: 12px;
        background: #0b1220;
        color: #e2e8f0;
        cursor: pointer;
      }

      .validation-summary {
        padding: 14px 16px;
        border: 1px solid #7f1d1d;
        border-radius: 16px;
        background: rgba(127, 29, 29, 0.18);
        color: #fecaca;
      }

      .validation-summary ul {
        margin: 10px 0 0;
        padding-left: 18px;
        display: grid;
        gap: 6px;
      }

      .drawer__body {
        display: grid;
        gap: 16px;
        overflow: auto;
        padding-right: 4px;
      }

      .editor-panel {
        padding: 16px;
        border: 1px solid #223047;
        border-radius: 20px;
        background: rgba(15, 23, 42, 0.72);
      }

      .editor-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }

      .field--full {
        grid-column: 1 / -1;
      }

      label {
        display: grid;
        gap: 8px;
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

      input[readonly] {
        opacity: 0.8;
      }

      textarea {
        resize: vertical;
      }

      .steps-list {
        display: grid;
        gap: 12px;
        margin-top: 14px;
      }

      .preview-card {
        display: grid;
        gap: 14px;
        margin-top: 12px;
        padding: 14px;
        border-radius: 18px;
        border: 1px solid #233249;
        background: linear-gradient(180deg, #0b1220 0%, #111827 100%);
      }

      .preview-card__header p {
        max-width: 500px;
        margin-top: 4px;
      }

      .preview-list {
        display: grid;
        gap: 10px;
      }

      .preview-row {
        display: grid;
        gap: 6px;
        padding: 12px;
        border: 1px solid #223047;
        border-radius: 14px;
        background: #0b1220;
      }

      .preview-row div {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      .preview-row strong,
      .preview-row span {
        color: #f8fafc;
      }

      .preview-row small {
        color: #94a3b8;
      }

      .drawer__footer {
        align-items: center;
      }

      .footer-meta,
      .footer-actions {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }

      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        min-height: 40px;
        padding: 0 14px;
        border: 1px solid #334155;
        border-radius: 12px;
        background: #111827;
        color: #e2e8f0;
        font-weight: 700;
        cursor: pointer;
      }

      .btn-primary {
        border-color: #2563eb;
        background: linear-gradient(135deg, #2563eb, #1d4ed8);
        color: white;
      }

      .btn-secondary {
        background: #0b1220;
      }

      .btn-danger {
        border-color: #7f1d1d;
        background: rgba(127, 29, 29, 0.2);
        color: #fecaca;
      }

      .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      @media (max-width: 900px) {
        .drawer__panel {
          top: 0;
          right: 0;
          bottom: 0;
          width: 100vw;
          border-radius: 0;
        }

        .drawer__header,
        .drawer__footer,
        .section-header,
        .preview-card__header {
          flex-direction: column;
        }

        .editor-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class WorkflowChainEditorComponent {
  private readonly workflowConfig = inject(WorkflowConfigurationService);

  readonly draft = signal<WorkflowChain | null>(null);
  readonly validationErrors = signal<string[]>([]);

  @Input() set chain(value: WorkflowChain | null) {
    this.draft.set(value ? cloneWorkflowChain(value) : null);
    this.validationErrors.set([]);
  }

  @Input() departments: Department[] = [];
  @Input() incidentTypes: WorkflowIncidentTypeOption[] = [];
  @Input() canDelete = false;

  @Output() close = new EventEmitter<void>();
  @Output() saveDraftClicked = new EventEmitter<WorkflowChain>();
  @Output() publishClicked = new EventEmitter<WorkflowChain>();
  @Output() disableClicked = new EventEmitter<WorkflowChain>();
  @Output() deleteClicked = new EventEmitter<WorkflowChain>();

  readonly triggerOptions = Object.entries(WORKFLOW_TRIGGER_LABELS).map(
    ([key, label]) => ({ key, label }),
  ) as Array<{ key: keyof typeof WORKFLOW_TRIGGER_LABELS; label: string }>;

  readonly selectedIncidentType = computed(() => {
    const current = this.draft();
    if (!current) {
      return null;
    }

    return (
      this.incidentTypes.find(
        (incidentType) => incidentType.id === current.incidentTypeId,
      ) ?? null
    );
  });

  updateName(event: Event): void {
    this.patchDraft({ name: this.readValue(event) });
  }

  updateNotes(event: Event): void {
    this.patchDraft({ notes: this.readValue(event) });
  }

  updateStatus(event: Event): void {
    this.patchDraft({
      status: this.readValue(event) as WorkflowChain["status"],
    });
  }

  updateTriggerSource(event: Event): void {
    this.patchDraft({
      triggerSource: this.readValue(event) as WorkflowChain["triggerSource"],
    });
  }

  updateFinalDecisionAuthority(event: Event): void {
    this.patchDraft({ finalDecisionAuthority: this.readValue(event) });
  }

  updateAutoUpdateUi(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.patchDraft({ autoUpdateUi: checked });
  }

  updateIncidentType(event: Event): void {
    const incidentTypeId = this.readValue(event);
    const incidentType = this.incidentTypes.find(
      (item) => item.id === incidentTypeId,
    );

    this.patchDraft({
      incidentTypeId,
      incidentTypeName: incidentType?.name ?? incidentTypeId,
    });
  }

  updateOwnerDepartment(event: Event): void {
    const ownerDepartmentId = this.readValue(event);
    const department = this.departments.find(
      (item) => item.id === ownerDepartmentId,
    );

    this.patchDraft({
      ownerDepartmentId,
      ownerDepartmentName: department?.name ?? ownerDepartmentId,
    });
  }

  addStep(): void {
    const current = this.requireDraft();
    this.draft.set(this.workflowConfig.addStep(current));
  }

  removeStep(sequence: number): void {
    const current = this.requireDraft();
    this.draft.set(this.workflowConfig.removeStep(current, sequence));
  }

  moveStep(sequence: number, direction: -1 | 1): void {
    const current = this.requireDraft();
    this.draft.set(this.workflowConfig.moveStep(current, sequence, direction));
  }

  updateStep(step: WorkflowChainStep): void {
    const current = this.requireDraft();
    const steps = current.steps.map((item) =>
      item.id === step.id ? step : item,
    );

    this.draft.set({
      ...cloneWorkflowChain(current),
      steps,
      updatedAt: new Date().toISOString(),
    });
  }

  saveDraft(): void {
    const current = this.requireDraft();
    const errors = this.workflowConfig.validateChain({
      ...current,
      status: "draft",
    });

    this.validationErrors.set(errors.errors);
    if (!errors.valid) {
      return;
    }

    this.saveDraftClicked.emit({
      ...current,
      status: "draft",
    });
  }

  publish(): void {
    const current = this.requireDraft();
    const errors = this.workflowConfig.validateChain({
      ...current,
      status: "published",
    });

    this.validationErrors.set(errors.errors);
    if (!errors.valid) {
      return;
    }

    this.publishClicked.emit({
      ...current,
      status: "published",
    });
  }

  disable(): void {
    const current = this.requireDraft();
    this.disableClicked.emit({
      ...current,
      status: "inactive",
    });
  }

  deleteChain(): void {
    const current = this.requireDraft();
    if (!this.canDelete) {
      return;
    }

    this.deleteClicked.emit(current);
  }

  resolveTargetLabel(step: WorkflowChainStep): string {
    const targetName =
      step.sendBackTargetDepartmentName ?? step.escalationTargetDepartmentName;
    return targetName ?? "No target";
  }

  private patchDraft(patch: Partial<WorkflowChain>): void {
    const current = this.requireDraft();
    this.draft.set({
      ...current,
      ...patch,
      updatedAt: new Date().toISOString(),
    });
  }

  private requireDraft(): WorkflowChain {
    const current = this.draft();
    if (!current) {
      throw new Error("Workflow chain draft is missing.");
    }

    return current;
  }

  private readValue(event: Event): string {
    return (
      event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    ).value;
  }
}
