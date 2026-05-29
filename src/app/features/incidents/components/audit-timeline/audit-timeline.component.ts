import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditEntry } from '../../../../shared/models/audit.model';

@Component({
  selector: 'app-audit-timeline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="audit-timeline">
      <div class="panel-header">
        <h3>Audit Trail</h3>
        <span>{{ entries.length }} entries</span>
      </div>
      <div *ngIf="entries.length; else empty" class="timeline">
        <div *ngFor="let entry of entries" class="timeline-item">
          <div class="timeline-marker">{{ getActionIcon(entry.action) }}</div>
          <div>
            <strong>{{ entry.action }}</strong>
            <p>{{ entry.details }}</p>
            <small>{{ entry.userName }} - {{ entry.timestamp | date:'short' }}</small>
          </div>
        </div>
      </div>
      <ng-template #empty>No audit entries.</ng-template>
    </div>
  `,
  styles: []
})
export class AuditTimelineComponent {
  @Input({ required: true }) entries: AuditEntry[] = [];

  getActionIcon(action: string): string {
    return action === 'CREATED' ? 'add_circle' : 'info';
  }
}
