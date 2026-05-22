import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: "app-error-state",
  standalone: true,
  template: `
    <div class="error-state">
      <strong>Something went wrong</strong>
      <p>{{ error }}</p>
      <button type="button" (click)="retry.emit()">Retry</button>
    </div>
  `,
  styles: [
    `
      .error-state {
        display: grid;
        gap: 12px;
        padding: 24px;
        background: #fff1f2;
        border: 1px solid #fecdd3;
        border-radius: 16px;
        color: #9f1239;
      }
      button {
        justify-self: start;
        background: #9f1239;
        color: white;
        border: 0;
        padding: 10px 14px;
        border-radius: 10px;
        cursor: pointer;
      }
    `,
  ],
})
export class ErrorStateComponent {
  @Input() error = "Unexpected error";
  @Output() retry = new EventEmitter<void>();
}
