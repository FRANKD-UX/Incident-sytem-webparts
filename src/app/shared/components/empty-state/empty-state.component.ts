import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: "app-empty-state",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty-state">
      <span class="material-icons icon">{{ icon }}</span>
      <h3>{{ title }}</h3>
      <p *ngIf="description">{{ description }}</p>
      <button *ngIf="actionLabel" type="button" (click)="action.emit()">
        {{ actionLabel }}
      </button>
    </div>
  `,
  styles: [
    `
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 48px 24px;
        color: #5b6475;
        text-align: center;
      }
      .icon {
        font-size: 48px;
        opacity: 0.3;
      }
      h3,
      p {
        margin: 0;
      }
      button {
        margin-top: 8px;
        border: 1px solid var(--border-color, #d1d5db);
        background: var(--bg-primary, #ffffff);
        padding: 8px 14px;
        border-radius: 8px;
        cursor: pointer;
      }
    `,
  ],
})
export class EmptyStateComponent {
  @Input() icon = "inbox";
  @Input() title = "No data";
  @Input() description?: string;
  @Input() actionLabel?: string;
  @Output() action = new EventEmitter<void>();
}
