import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";

@Component({
  selector: "app-workflow-action-modal",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    @if (open) {
      <div class="workflow-modal-backdrop">
        <div class="workflow-modal">
          <div class="workflow-modal__header">
            <div>
              <h2>{{ title }}</h2>
              <p>{{ description }}</p>
            </div>

            <button class="close-btn" type="button" (click)="close.emit()">✕</button>
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()">
            @if (actionType === 'TECHNICIAN_SCHEDULED') {
              <div class="form-grid">
                <label>
                  Technician Name
                  <input type="text" formControlName="technicianName" />
                </label>

                <label>
                  Scheduled Date
                  <input type="datetime-local" formControlName="scheduledDate" />
                </label>
              </div>

              <label>
                Dispatch Notes
                <textarea rows="4" formControlName="notes"></textarea>
              </label>
            }

            @if (actionType === 'RETURN_TO_SUPPORT') {
              <label>
                Return Reason
                <textarea rows="5" formControlName="reason"></textarea>
              </label>
            }

            @if (actionType === 'FINANCE_VALIDATED') {
              <div class="form-grid">
                <label>
                  Approved By
                  <input type="text" formControlName="approvedBy" />
                </label>

                <label>
                  Effective Date
                  <input type="date" formControlName="effectiveDate" />
                </label>
              </div>

              <label>
                Finance Notes
                <textarea rows="4" formControlName="notes"></textarea>
              </label>
            }

            @if (actionType === 'ESCALATE_TO_OPERATIONS') {
              <label>
                Escalation Notes
                <textarea rows="5" formControlName="notes"></textarea>
              </label>
            }

            @if (actionType === 'SEND_TO_ACCOUNTS') {
              <label>
                Accounts Notes
                <textarea rows="5" formControlName="notes"></textarea>
              </label>
            }

            <div class="workflow-modal__footer">
              <button type="button" class="secondary-btn" (click)="close.emit()">
                Cancel
              </button>

              <button type="submit" class="primary-btn">
                Confirm Action
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    .workflow-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.55);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      padding: 24px;
    }

    .workflow-modal {
      width: 100%;
      max-width: 720px;
      background: white;
      border-radius: 24px;
      padding: 24px;
      display: grid;
      gap: 20px;
      box-shadow: 0 30px 60px rgba(0,0,0,0.25);
    }

    .workflow-modal__header {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: flex-start;
    }

    .workflow-modal__header h2 {
      margin: 0;
    }

    .workflow-modal__header p {
      margin: 6px 0 0;
      color: var(--muted);
    }

    .close-btn {
      border: none;
      background: transparent;
      cursor: pointer;
      font-size: 1.1rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    form {
      display: grid;
      gap: 18px;
    }

    label {
      display: grid;
      gap: 8px;
      font-size: 0.9rem;
      font-weight: 600;
    }

    input,
    textarea {
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 12px;
      font: inherit;
    }

    .workflow-modal__footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .primary-btn {
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 12px;
      padding: 12px 18px;
      cursor: pointer;
      font-weight: 600;
    }

    .secondary-btn {
      background: #e2e8f0;
      border: none;
      border-radius: 12px;
      padding: 12px 18px;
      cursor: pointer;
      font-weight: 600;
    }
  `]
})
export class WorkflowActionModalComponent {
  @Input() open = false;
  @Input() actionType = "";

  @Output() close = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<any>();

  private readonly fb = inject(FormBuilder);

  form = this.fb.group({
    technicianName: [""],
    scheduledDate: [""],
    notes: [""],
    reason: [""],
    approvedBy: [""],
    effectiveDate: [""],
  });

  get title(): string {
    switch (this.actionType) {
      case "TECHNICIAN_SCHEDULED":
        return "Schedule Technician";
      case "RETURN_TO_SUPPORT":
        return "Return Incident";
      case "FINANCE_VALIDATED":
        return "Finance Validation";
      case "ESCALATE_TO_OPERATIONS":
        return "Escalate to Operations";
      case "SEND_TO_ACCOUNTS":
        return "Send to Accounts";
      default:
        return "Workflow Action";
    }
  }

  get description(): string {
    switch (this.actionType) {
      case "TECHNICIAN_SCHEDULED":
        return "Capture technician dispatch information.";
      case "RETURN_TO_SUPPORT":
        return "Provide a reason for workflow reversal.";
      case "FINANCE_VALIDATED":
        return "Record finance validation details.";
      case "ESCALATE_TO_OPERATIONS":
        return "Capture escalation notes for Operations.";
      case "SEND_TO_ACCOUNTS":
        return "Capture notes for Accounts processing.";
      default:
        return "Complete the workflow action.";
    }
  }

  submit(): void {
    this.confirmed.emit({
      actionType: this.actionType,
      ...this.form.getRawValue(),
    });
  }
}
