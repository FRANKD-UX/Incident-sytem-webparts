import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ChecklistApiService } from "../../../../api/checklist-api.service";
import { Checklist, ChecklistItem } from "../../../../shared/models/checklist.model";

@Component({
  selector: "app-checklist-panel",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="checklist-panel">
      <div class="panel-header">
        <div>
          <h3>Checklist</h3>
          <p *ngIf="departmentName" class="subtitle">{{ departmentName }}</p>
        </div>
        <div class="progress">
          <div>{{ completedCount }}/{{ totalCount }}</div>
          <div class="progress-bar">
            <div class="progress-fill" [style.width.%]="progressPercentage"></div>
          </div>
        </div>
      </div>

      <div *ngIf="!checklist?.items?.length" class="empty">
        No checklist loaded
      </div>

      <div *ngFor="let item of checklist?.items" class="item">
        <div class="item-row">
          <button class="toggle" type="button" (click)="toggleItem(item)">
            {{ item.isCompleted ? "✓" : "○" }}
          </button>
          <div class="item-body">
            <div class="title">{{ item.description }}</div>
            <div class="meta">
              <span *ngIf="item.isRequired">Required</span>
              <span *ngIf="item.evidenceRequired">{{ item.evidenceType }}</span>
            </div>
            <div *ngIf="!item.isCompleted && item.evidenceRequired && item.evidenceType === 'NOTE'">
              <textarea [(ngModel)]="evidenceNotes[item.id]" placeholder="Enter notes"></textarea>
            </div>
          </div>
        </div>

        <div class="actions">
          <button
            type="button"
            class="btn btn-primary btn-sm"
            (click)="completeItem(item)"
            [disabled]="item.isCompleted"
          >
            Mark complete
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .checklist-panel { display: grid; gap: 16px; }
      .panel-header { display: flex; justify-content: space-between; gap: 16px; }
      .subtitle { color: var(--text-secondary); margin: 0; }
      .progress { min-width: 220px; }
      .progress-bar { height: 8px; background: #e5e7eb; border-radius: 999px; overflow: hidden; }
      .progress-fill { height: 100%; background: #3b82f6; }
      .item { border: 1px solid var(--border-color); border-radius: 12px; padding: 12px; display: grid; gap: 10px; }
      .item-row { display: flex; gap: 12px; align-items: flex-start; }
      .toggle { border: 0; background: transparent; font-size: 1.1rem; cursor: pointer; }
      .item-body { flex: 1; display: grid; gap: 6px; }
      .title { font-weight: 600; }
      .meta { display: flex; gap: 8px; color: var(--text-secondary); font-size: 0.85rem; }
      textarea { width: 100%; min-height: 72px; border: 1px solid var(--border-color); border-radius: 10px; padding: 10px; }
      .actions { display: flex; justify-content: flex-end; }
      .empty { color: var(--text-secondary); padding: 16px 0; }
    `,
  ],
})
export class ChecklistPanelComponent {
  @Input({ required: true }) incidentId!: string;
  @Input() checklist: Checklist | null = null;
  @Input() departmentName = "";
  @Output() checklistUpdated = new EventEmitter<void>();

  private readonly checklistApi = inject(ChecklistApiService);

  evidenceNotes: Record<string, string> = {};

  get totalCount(): number {
    return this.checklist?.items?.length ?? 0;
  }

  get completedCount(): number {
    return this.checklist?.items?.filter((i) => i.isCompleted).length ?? 0;
  }

  get progressPercentage(): number {
    return this.totalCount ? Math.round((this.completedCount / this.totalCount) * 100) : 0;
  }

  toggleItem(item: ChecklistItem): void {
    if (!item.isCompleted) {
      this.completeItem(item);
    }
  }

  completeItem(item: ChecklistItem): void {
    this.checklistApi.updateChecklistItem(this.incidentId, item.id, {
      isCompleted: true,
      evidence: this.evidenceNotes[item.id] ?? null,
    }).subscribe({
      next: () => this.checklistUpdated.emit(),
    });
  }
}
