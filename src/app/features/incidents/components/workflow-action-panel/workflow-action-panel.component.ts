import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Incident } from "../../../../shared/models/incident.model";

@Component({
  selector: "app-workflow-action-panel",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="workflow-actions" *ngIf="incident">
      <div class="workflow-actions__header">
        <h3>Workflow Actions</h3>
        <p>Operational routing and workflow state controls</p>
      </div>

      <div class="workflow-actions__grid">

        @if (incident.currentDepartment?.code === 'SUP') {

          <button class="action-btn primary"
            (click)="emitAction('ESCALATE_TO_OPERATIONS')">
            Escalate to Operations
          </button>

          <button class="action-btn"
            (click)="emitAction('SEND_TO_ACCOUNTS')">
            Send to Accounts
          </button>
        }

        @if (incident.currentDepartment?.code === 'OPS') {

          <button class="action-btn primary"
            (click)="emitAction('TECHNICIAN_SCHEDULED')">
            Technician Scheduled
          </button>

          <button class="action-btn success"
            (click)="emitAction('TECHNICIAN_COMPLETED')">
            Technician Completed
          </button>

          <button class="action-btn warning"
            (click)="emitAction('RETURN_TO_SUPPORT')">
            Return to Support
          </button>
        }

        @if (incident.currentDepartment?.code === 'ACC') {

          <button class="action-btn primary"
            (click)="emitAction('FINANCE_VALIDATED')">
            Finance Validated
          </button>

          <button class="action-btn warning"
            (click)="emitAction('RETURN_TO_SUPPORT')">
            Return to Support
          </button>
        }

      </div>
    </div>
  `,
  styles: [`
    .workflow-actions {
      display: grid;
      gap: 16px;
      padding: 16px;
      border-radius: 16px;
      border: 1px solid var(--border);
      background: #fff;
    }

    .workflow-actions__header h3 {
      margin: 0;
      font-size: 1rem;
    }

    .workflow-actions__header p {
      margin: 4px 0 0;
      color: var(--muted);
      font-size: 0.85rem;
    }

    .workflow-actions__grid {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }

    .action-btn {
      border: none;
      border-radius: 12px;
      padding: 12px 16px;
      font-weight: 600;
      cursor: pointer;
      background: #e2e8f0;
      color: #0f172a;
      transition: all 0.2s ease;
    }

    .action-btn:hover {
      transform: translateY(-1px);
    }

    .action-btn.primary {
      background: #2563eb;
      color: white;
    }

    .action-btn.success {
      background: #16a34a;
      color: white;
    }

    .action-btn.warning {
      background: #ea580c;
      color: white;
    }
  `]
})
export class WorkflowActionPanelComponent {

  @Input({ required: true })
  incident!: Incident | null;

  @Output()
  actionSelected = new EventEmitter<string>();

  emitAction(action: string): void {
    this.actionSelected.emit(action);
  }
}
