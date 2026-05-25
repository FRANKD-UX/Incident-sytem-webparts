import { CommonModule } from "@angular/common";
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  inject,
} from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Incident } from "../../../../shared/models/incident.model";
import { WorkflowStateService } from "../../../../api/workflow-engine/workflow-state.service";

@Component({
  selector: "app-accounts-processing-panel",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="accounts-panel" *ngIf="incident">
      <div class="accounts-panel__header">
        <div>
          <h3>Accounts Processing</h3>
          <p>Billing corrections, reference changes, and account maintenance</p>
        </div>
      </div>

      <form [formGroup]="form" class="accounts-panel__form">
        <div class="grid">
          <label>
            <span>Action Type</span>
            <select formControlName="actionType">
              <option value="WRONG_USER_REF">Wrong User Reference</option>
              <option value="DEBIT_DATE_CHANGE">Debit Date Change</option>
              <option value="BILLING_CORRECTION">Billing Correction</option>
              <option value="OWNERSHIP_UPDATE">Ownership Update</option>
              <option value="OTHER">Other</option>
            </select>
          </label>

          <label>
            <span>Requested Value</span>
            <input
              type="text"
              formControlName="requestedValue"
              placeholder="New debit date / account value"
            />
          </label>

          <label class="full">
            <span>Resolution Notes</span>
            <textarea
              rows="4"
              formControlName="notes"
              placeholder="Describe what Accounts changed"
            ></textarea>
          </label>

          <label>
            <span>Approved By</span>
            <input
              type="text"
              formControlName="approvedBy"
              placeholder="Accounts Agent"
            />
          </label>

          <label>
            <span>Effective Date</span>
            <input type="date" formControlName="effectiveDate" />
          </label>
        </div>

        <div class="accounts-panel__actions">
          <button
            type="button"
            class="btn btn-secondary"
            (click)="saveAccountsWork()"
          >
            Save Work
          </button>

          <button
            type="button"
            class="btn btn-primary"
            (click)="completeAccountsStep()"
          >
            Complete Accounts Step
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      .accounts-panel {
        display: grid;
        gap: 16px;
        padding: 20px;
        border-radius: 16px;
        border: 1px solid var(--border);
        background: #fff;
      }

      .accounts-panel__header h3 {
        margin: 0;
        font-size: 1rem;
      }

      .accounts-panel__header p {
        margin: 4px 0 0;
        color: var(--muted);
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 14px;
      }

      .full {
        grid-column: 1 / -1;
      }

      label {
        display: grid;
        gap: 6px;
      }

      label span {
        font-size: 0.85rem;
        font-weight: 600;
      }

      input,
      select,
      textarea {
        width: 100%;
        border-radius: 12px;
        border: 1px solid var(--border);
        padding: 10px 12px;
      }

      .accounts-panel__actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 10px;
      }
    `,
  ],
})
export class AccountsProcessingPanelComponent implements OnChanges {
  @Input({ required: true }) incident!: Incident | null;
  @Output() saved = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly workflow = inject(WorkflowStateService);

  form = this.fb.group({
    actionType: ["WRONG_USER_REF", Validators.required],
    requestedValue: ["", Validators.required],
    notes: [""],
    approvedBy: ["", Validators.required],
    effectiveDate: [""],
  });

  ngOnChanges(): void {}

  saveAccountsWork(): void {
    if (!this.incident) return;

    this.workflow.updateAccountsProcessing(this.incident.id, {
      actionType: this.form.value.actionType ?? "",
      requestedValue: this.form.value.requestedValue ?? "",
      notes: this.form.value.notes ?? "",
      approvedBy: this.form.value.approvedBy ?? "",
      effectiveDate: this.form.value.effectiveDate ?? "",
    });

    this.saved.emit();
  }

  completeAccountsStep(): void {
    if (!this.incident) return;

    this.saveAccountsWork();
    this.workflow.completeCurrentStep(this.incident.id);
    this.saved.emit();
  }
}
