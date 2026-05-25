import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import {
  WorkflowChain,
  WorkflowChainStatus,
  WORKFLOW_TRIGGER_LABELS,
} from "../../../shared/models/workflow-configuration.model";

@Component({
  selector: "app-workflow-chain-list",
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="chain-list">
      <div class="chain-list__header">
        <div>
          <p class="eyebrow">Workflow chains</p>
          <h2>Configured chains</h2>
        </div>
        <div class="chain-list__summary">
          <span
            >{{ chains.length }} chain{{ chains.length === 1 ? "" : "s" }}</span
          >
          <span>{{ draftCount }} draft{{ draftCount === 1 ? "" : "s" }}</span>
          <span>{{ publishedCount }} published</span>
        </div>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Incident type</th>
              <th>Owner</th>
              <th>Trigger / approval</th>
              <th>Status</th>
              <th>Version</th>
              <th>Steps</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (chain of chains; track chain.id) {
              <tr
                class="chain-row"
                [class.chain-row--selected]="selectedChainId === chain.id"
                (click)="select.emit(chain.id)"
              >
                <td>
                  <strong>{{ chain.name }}</strong>
                  <p>{{ chain.notes || "No notes yet" }}</p>
                </td>
                <td>{{ chain.incidentTypeName }}</td>
                <td>{{ chain.ownerDepartmentName }}</td>
                <td>
                  <strong>{{ triggerLabel(chain.triggerSource) }}</strong>
                  <p>{{ chain.finalDecisionAuthority }}</p>
                </td>
                <td>
                  <span class="status-pill" [class]="statusClass(chain.status)">
                    {{ chain.status | titlecase }}
                  </span>
                </td>
                <td>v{{ chain.version }}</td>
                <td>{{ chain.steps.length }}</td>
                <td>
                  <div class="row-actions" (click)="$event.stopPropagation()">
                    <button
                      type="button"
                      class="btn btn-secondary"
                      (click)="edit.emit(chain.id)"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      class="btn btn-secondary"
                      [disabled]="chain.status === 'published'"
                      (click)="disable.emit(chain.id)"
                    >
                      Disable
                    </button>
                    <button
                      type="button"
                      class="btn btn-secondary"
                      [disabled]="chain.status === 'published'"
                      (click)="delete.emit(chain.id)"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>
  `,
  styles: [
    `
      .chain-list {
        display: grid;
        gap: 14px;
        padding: 18px;
        border: 1px solid #253248;
        border-radius: 20px;
        background: linear-gradient(180deg, #0f172a 0%, #111827 100%);
        color: #e2e8f0;
      }

      .chain-list__header,
      .row-actions {
        display: flex;
        align-items: center;
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
      p {
        margin: 0;
      }

      .chain-list__summary {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      .chain-list__summary span {
        padding: 7px 10px;
        border: 1px solid #334155;
        border-radius: 999px;
        background: #0b1220;
        color: #cbd5e1;
        font-size: 12px;
        font-weight: 700;
      }

      .table-wrap {
        overflow: auto;
        border: 1px solid #233249;
        border-radius: 16px;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        min-width: 920px;
        background: #0b1220;
      }

      thead th {
        padding: 14px;
        text-align: left;
        background: #111827;
        color: #94a3b8;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }

      tbody td {
        padding: 14px;
        border-top: 1px solid #1f2937;
        vertical-align: top;
      }

      .chain-row {
        cursor: pointer;
      }

      .chain-row:hover,
      .chain-row--selected {
        background: rgba(37, 99, 235, 0.08);
      }

      td strong {
        display: block;
        color: #f8fafc;
        margin-bottom: 4px;
      }

      td p {
        color: #94a3b8;
        font-size: 13px;
      }

      td strong {
        display: block;
        margin-bottom: 4px;
      }

      .status-pill {
        display: inline-flex;
        align-items: center;
        min-height: 28px;
        padding: 0 10px;
        border-radius: 999px;
        border: 1px solid transparent;
        font-size: 12px;
        font-weight: 700;
      }

      .status-pill--draft {
        border-color: #f59e0b;
        background: rgba(245, 158, 11, 0.15);
        color: #fbbf24;
      }

      .status-pill--published {
        border-color: #2563eb;
        background: rgba(37, 99, 235, 0.18);
        color: #bfdbfe;
      }

      .status-pill--inactive {
        border-color: #475569;
        background: rgba(71, 85, 105, 0.18);
        color: #cbd5e1;
      }

      .btn {
        min-height: 34px;
        padding: 0 12px;
        border: 1px solid #334155;
        border-radius: 10px;
        background: #111827;
        color: #e2e8f0;
        font-weight: 700;
        cursor: pointer;
      }

      .btn:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }

      @media (max-width: 900px) {
        .chain-list__header,
        .row-actions {
          align-items: flex-start;
          flex-direction: column;
        }
      }
    `,
  ],
})
export class WorkflowChainListComponent {
  @Input() chains: WorkflowChain[] = [];
  @Input() selectedChainId: string | null = null;

  @Output() select = new EventEmitter<string>();
  @Output() edit = new EventEmitter<string>();
  @Output() disable = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();

  get draftCount(): number {
    return this.chains.filter((chain) => chain.status === "draft").length;
  }

  get publishedCount(): number {
    return this.chains.filter((chain) => chain.status === "published").length;
  }

  statusClass(status: WorkflowChainStatus): string {
    return `status-pill status-pill--${status}`;
  }

  triggerLabel(trigger: keyof typeof WORKFLOW_TRIGGER_LABELS): string {
    return WORKFLOW_TRIGGER_LABELS[trigger];
  }
}
