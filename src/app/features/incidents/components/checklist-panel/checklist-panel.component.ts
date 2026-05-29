import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ChecklistApiService } from "../../../../api/checklist-api.service";
import { Checklist, ChecklistItem, ChecklistItemUpdatePayload } from "../../../../shared/models/checklist.model";

@Component({
  selector: "app-checklist-panel",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="checklist-panel">
      <div class="panel-header">
        <div>
          <h3>Checklist</h3>
          <p class="subtitle">
            {{ departmentName || "Current workflow gate" }}
          </p>
        </div>

        <div class="panel-status">
          <span class="status-pill" [class.status-pill--locked]="readOnly">
            {{ readOnly ? "Locked" : "Active" }}
          </span>
        </div>
      </div>

      @if (readOnly) {
        <div class="locked-banner">
          This step is locked. Historical steps stay read-only unless the incident is sent back.
        </div>
      }

      @if (!checklist?.items?.length) {
        <div class="empty-state">
          No checklist loaded
        </div>
      } @else {
        <div class="progress-wrap">
          <div class="progress-meta">
            <strong>{{ completedCount }}</strong>/<span>{{ totalCount }}</span> completed
          </div>
          <div class="progress-bar">
            <div class="progress-fill" [style.width.%]="progressPercentage"></div>
          </div>
        </div>

        <div class="items">
          @for (item of checklist?.items; track item.id) {
            <div class="item" [class.item--completed]="item.isCompleted" [class.item--locked]="readOnly">
              <div class="item__main">
                <button
                  type="button"
                  class="toggle"
                  (click)="toggleItem(item)"
                  [disabled]="readOnly || item.isCompleted"
                >
                  {{ item.isCompleted ? "âœ“" : "â—‹" }}
                </button>

                <div class="item__body">
                  <div class="item__title-row">
                    <div class="item__title">{{ item.description }}</div>
                    <div class="item__badges">
                      @if (item.isRequired) {
                        <span class="badge badge--required">Required</span>
                      }
                      @if (item.evidenceRequired) {
                        <span class="badge badge--evidence">{{ item.evidenceType }}</span>
                      }
                    </div>
                  </div>

                  <div class="item__meta">
                    <span>Category: {{ item.category }}</span>
                    <span>Order: {{ item.order }}</span>
                    @if (item.completedAt) {
                      <span>Completed: {{ item.completedAt | date: "short" }}</span>
                    }
                  </div>

                  @if (!item.isCompleted && item.evidenceRequired && item.evidenceType === "NOTE") {
                    <textarea
                      [(ngModel)]="evidenceNotes[item.id]"
                      [disabled]="readOnly"
                      placeholder="Enter notes required to complete this item"
                    ></textarea>
                  }
                </div>
              </div>

              <div class="item__footer">
                <span class="item__state">
                  {{ item.isCompleted ? "Completed" : "Pending" }}
                </span>

                <button
                  type="button"
                  class="btn btn-primary btn-sm"
                  (click)="completeItem(item)"
                  [disabled]="readOnly || item.isCompleted"
                >
                  Mark complete
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .checklist-panel {
        display: grid;
        gap: 16px;
      }

      .panel-header {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        align-items: flex-start;
      }

      .subtitle {
        margin: 4px 0 0;
        color: var(--muted);
      }

      .status-pill {
        display: inline-flex;
        align-items: center;
        padding: 6px 10px;
        border-radius: 999px;
        background: rgba(16, 185, 129, 0.12);
        color: #047857;
        font-size: 0.78rem;
        font-weight: 700;
      }

      .status-pill--locked {
        background: rgba(71, 85, 105, 0.12);
        color: #334155;
      }

      .locked-banner {
        padding: 12px 14px;
        border-radius: 12px;
        border: 1px solid #cbd5e1;
        background: #f8fafc;
        color: #334155;
      }

      .progress-wrap {
        display: grid;
        gap: 8px;
      }

      .progress-meta {
        color: var(--muted);
      }

      .progress-bar {
        height: 8px;
        border-radius: 999px;
        background: #e2e8f0;
        overflow: hidden;
      }

      .progress-fill {
        height: 100%;
        background: #2f6fed;
      }

      .items {
        display: grid;
        gap: 12px;
      }

      .item {
        border: 1px solid var(--border);
        border-radius: 16px;
        background: #fff;
        padding: 14px;
        display: grid;
        gap: 12px;
      }

      .item--completed {
        background: #f8fafc;
      }

      .item--locked {
        opacity: 0.92;
      }

      .item__main {
        display: flex;
        align-items: flex-start;
        gap: 12px;
      }

      .toggle {
        width: 34px;
        height: 34px;
        border: 1px solid var(--border);
        border-radius: 10px;
        background: white;
        cursor: pointer;
        flex: 0 0 auto;
      }

      .item__body {
        flex: 1 1 auto;
        display: grid;
        gap: 8px;
      }

      .item__title-row {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        align-items: flex-start;
      }

      .item__title {
        font-weight: 600;
      }

      .item__badges {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }

      .badge {
        padding: 3px 8px;
        border-radius: 999px;
        font-size: 0.72rem;
        font-weight: 700;
      }

      .badge--required {
        background: #fef3c7;
        color: #92400e;
      }

      .badge--evidence {
        background: #dbeafe;
        color: #1d4ed8;
      }

      .item__meta {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        color: var(--muted);
        font-size: 0.84rem;
      }

      textarea {
        width: 100%;
        min-height: 82px;
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 10px 12px;
        resize: vertical;
      }

      .item__footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
      }

      .item__state {
        color: var(--muted);
        font-size: 0.85rem;
        font-weight: 600;
      }

      .empty-state {
        padding: 16px 0;
        color: var(--muted);
      }
    `,
  ],
})
export class ChecklistPanelComponent {
  @Input() activeStep: any = null;
  @Input() checklistItems: any[] = [];

  @Input({ required: true }) incidentId!: string;
  @Input() checklist: Checklist | null = null;
  @Input() departmentName = "";
  @Input() readOnly = false;

  @Output() checklistUpdated = new EventEmitter<void>();

  private readonly checklistApi = inject(ChecklistApiService);

  evidenceNotes: Record<string, string> = {};

  get totalCount(): number {
    return this.checklist?.items?.length ?? 0;
  }

  get completedCount(): number {
    return this.checklist?.items?.filter((item) => item.isCompleted).length ?? 0;
  }

  get progressPercentage(): number {
    return this.totalCount === 0 ? 0 : Math.round((this.completedCount / this.totalCount) * 100);
  }

  toggleItem(item: ChecklistItem): void {
    if (this.readOnly || item.isCompleted) return;
    this.completeItem(item);
  }

  completeItem(item: ChecklistItem): void {
    if (this.readOnly || !this.checklist) return;

    const payload: ChecklistItemUpdatePayload = {
      isCompleted: true,
      evidence: this.evidenceNotes[item.id] ?? null,
    };

    this.checklistApi.updateChecklistItem(this.incidentId, item.id, payload).subscribe({
      next: () => this.checklistUpdated.emit(),
    });
  }
}


