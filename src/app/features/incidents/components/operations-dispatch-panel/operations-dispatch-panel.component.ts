import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, OnChanges, Output, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Incident } from "../../../../shared/models/incident.model";
import { WorkflowStateService } from "../../../../api/workflow-engine/workflow-state.service";

type OperationsCalloutStatus =
  | "PENDING_BOOKING"
  | "BOOKED"
  | "ON_SITE"
  | "COMPLETED"
  | "AWAITING_CLOSURE";

@Component({
  selector: "app-operations-dispatch-panel",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="ops-panel" *ngIf="isOperationsIncident()">
      <div class="ops-panel__header">
        <div>
          <h3>Operations dispatch</h3>
          <p>Technician booking, call-out progress, and completion tracking</p>
        </div>

        <div class="ops-panel__status">
          <span class="status-pill">{{ currentStatusLabel }}</span>
        </div>
      </div>

      <form class="ops-panel__form" [formGroup]="form" (ngSubmit)="saveBooking()">
        <div class="grid">
          <label>
            <span>Technician name</span>
            <input formControlName="technicianName" type="text" placeholder="Assigned technician" />
          </label>

          <label>
            <span>Booking date</span>
            <input formControlName="bookingDate" type="datetime-local" />
          </label>

          <label>
            <span>Booking window</span>
            <input formControlName="bookingWindow" type="text" placeholder="e.g. 09:00 - 12:00" />
          </label>

          <label>
            <span>Call-out status</span>
            <select formControlName="calloutStatus">
              <option value="PENDING_BOOKING">Pending booking</option>
              <option value="BOOKED">Booked</option>
              <option value="ON_SITE">On site</option>
              <option value="AWAITING_CLOSURE">Awaiting closure</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </label>

          <label class="full">
            <span>Operational notes</span>
            <textarea
              formControlName="notes"
              rows="4"
              placeholder="Booking notes, field updates, technician comments, customer communication"
            ></textarea>
          </label>
        </div>

        <div class="ops-panel__summary">
          <div class="summary-card">
            <span>Technician</span>
            <strong>{{ dispatchData.technicianName || "Unassigned" }}</strong>
          </div>
          <div class="summary-card">
            <span>Booking</span>
            <strong>{{ dispatchData.bookingDate || "Not booked" }}</strong>
          </div>
          <div class="summary-card">
            <span>Window</span>
            <strong>{{ dispatchData.bookingWindow || "Not set" }}</strong>
          </div>
          <div class="summary-card">
            <span>Status</span>
            <strong>{{ dispatchData.calloutStatus || "Pending booking" }}</strong>
          </div>
        </div>

        <div class="ops-panel__actions">
          <button type="button" class="btn btn-secondary" (click)="saveBooking()">
            Save booking
          </button>

          <button
            type="button"
            class="btn btn-primary"
            (click)="markCalloutCompleted()"
            [disabled]="!canComplete()"
          >
            Mark call-out completed
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      .ops-panel {
        display: grid;
        gap: 16px;
        padding: 18px;
        border: 1px solid var(--border);
        border-radius: 16px;
        background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
      }

      .ops-panel__header {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        align-items: flex-start;
      }

      .ops-panel__header h3 {
        margin: 0;
        font-size: 1rem;
      }

      .ops-panel__header p {
        margin: 4px 0 0;
        color: var(--muted);
        font-size: 0.88rem;
      }

      .status-pill {
        display: inline-flex;
        align-items: center;
        padding: 6px 10px;
        border-radius: 999px;
        background: rgba(47, 111, 237, 0.12);
        color: #2f6fed;
        font-size: 0.78rem;
        font-weight: 700;
      }

      .ops-panel__form {
        display: grid;
        gap: 16px;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 14px;
      }

      label {
        display: grid;
        gap: 6px;
      }

      label.full {
        grid-column: 1 / -1;
      }

      label span {
        color: #334155;
        font-weight: 600;
        font-size: 0.88rem;
      }

      input,
      select,
      textarea {
        width: 100%;
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 11px 12px;
        background: white;
        outline: none;
      }

      input:focus,
      select:focus,
      textarea:focus {
        border-color: rgba(47, 111, 237, 0.5);
        box-shadow: 0 0 0 4px rgba(47, 111, 237, 0.08);
      }

      textarea {
        resize: vertical;
      }

      .ops-panel__summary {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 10px;
      }

      .summary-card {
        border: 1px solid var(--border);
        border-radius: 14px;
        padding: 12px;
        background: white;
        display: grid;
        gap: 4px;
      }

      .summary-card span {
        font-size: 0.76rem;
        color: var(--muted);
        text-transform: uppercase;
        letter-spacing: 0.06em;
        font-weight: 700;
      }

      .summary-card strong {
        font-size: 0.92rem;
        color: #0f172a;
      }

      .ops-panel__actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        flex-wrap: wrap;
      }

      @media (max-width: 900px) {
        .grid,
        .ops-panel__summary {
          grid-template-columns: 1fr;
        }

        .ops-panel__header {
          flex-direction: column;
        }
      }
    `,
  ],
})
export class OperationsDispatchPanelComponent implements OnChanges {
  @Input({ required: true }) incident!: Incident | null;
  @Output() saved = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly workflow = inject(WorkflowStateService);

  dispatchData: {
    technicianName: string;
    bookingDate: string;
    bookingWindow: string;
    calloutStatus: OperationsCalloutStatus;
    notes: string;
  } = {
    technicianName: "",
    bookingDate: "",
    bookingWindow: "",
    calloutStatus: "PENDING_BOOKING",
    notes: "",
  };

  currentStatusLabel = "Pending booking";

  form = this.fb.group({
    technicianName: [""],
    bookingDate: [""],
    bookingWindow: [""],
    calloutStatus: ["PENDING_BOOKING" as OperationsCalloutStatus, Validators.required],
    notes: [""],
  });

  ngOnChanges(): void {
    this.syncFromIncident();
  }

  isOperationsIncident(): boolean {
    return this.incident?.currentDepartment?.code === "OPS";
  }

  canComplete(): boolean {
    return !!this.form.controls.bookingDate.value && !!this.form.controls.technicianName.value;
  }

  saveBooking(): void {
    if (!this.incident) return;

    const payload = {
      technicianName: this.form.controls.technicianName.value ?? "",
      bookingDate: this.form.controls.bookingDate.value ?? "",
      bookingWindow: this.form.controls.bookingWindow.value ?? "",
      calloutStatus: (this.form.controls.calloutStatus.value ?? "PENDING_BOOKING") as OperationsCalloutStatus,
      notes: this.form.controls.notes.value ?? "",
    };

    this.workflow.updateOperationsDispatch(this.incident.id, payload);
    this.saved.emit();
  }

  markCalloutCompleted(): void {
    if (!this.incident) return;

    const payload = {
      technicianName: this.form.controls.technicianName.value ?? "",
      bookingDate: this.form.controls.bookingDate.value ?? "",
      bookingWindow: this.form.controls.bookingWindow.value ?? "",
      calloutStatus: "COMPLETED" as OperationsCalloutStatus,
      notes: `${this.form.controls.notes.value ?? ""}\nCall-out completed at ${new Date().toISOString()}`.trim(),
    };

    this.workflow.updateOperationsDispatch(this.incident.id, payload);
    this.workflow.completeCurrentStep(this.incident.id);
    this.saved.emit();
  }

  private syncFromIncident(): void {
    const dispatch = (this.incident?.customFields?.["operationsDispatch"] as any) ?? {};
    this.dispatchData = {
      technicianName: dispatch.technicianName ?? "",
      bookingDate: dispatch.bookingDate ?? "",
      bookingWindow: dispatch.bookingWindow ?? "",
      calloutStatus: (dispatch.calloutStatus ?? "PENDING_BOOKING") as OperationsCalloutStatus,
      notes: dispatch.notes ?? "",
    };

    this.currentStatusLabel = this.labelForStatus(this.dispatchData.calloutStatus);

    this.form.reset({
      technicianName: this.dispatchData.technicianName,
      bookingDate: this.dispatchData.bookingDate,
      bookingWindow: this.dispatchData.bookingWindow,
      calloutStatus: this.dispatchData.calloutStatus,
      notes: this.dispatchData.notes,
    });
  }

  private labelForStatus(status: OperationsCalloutStatus): string {
    switch (status) {
      case "PENDING_BOOKING":
        return "Pending booking";
      case "BOOKED":
        return "Booked";
      case "ON_SITE":
        return "On site";
      case "AWAITING_CLOSURE":
        return "Awaiting closure";
      case "COMPLETED":
        return "Completed";
    }
  }
}
