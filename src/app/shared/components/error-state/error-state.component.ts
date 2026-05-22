import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ApiError } from "../../models/common.model";

@Component({
  selector: "app-error-state",
  standalone: true,
  template: `
    <div class="error-state">
      <span class="material-icons error-icon">error_outline</span>
      <div class="error-content">
        <h3>Something went wrong</h3>
        <p>{{ errorMessage }}</p>
        <button type="button" (click)="retry.emit()">Try Again</button>
      </div>
    </div>
  `,
  styles: [
    `
      .error-state {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 24px;
        background: #fef2f2;
        border: 1px solid #fecaca;
        border-radius: 8px;
      }
      .error-icon {
        color: #ef4444;
        font-size: 2rem;
      }
      .error-content h3,
      .error-content p {
        margin: 0;
      }
      .error-content {
        display: grid;
        gap: 8px;
      }
      button {
        justify-self: start;
        background: #ef4444;
        color: white;
        border: 0;
        padding: 10px 14px;
        border-radius: 8px;
        cursor: pointer;
      }
    `,
  ],
})
export class ErrorStateComponent {
  @Input({ required: true }) error!: string | ApiError;
  @Output() retry = new EventEmitter<void>();

  get errorMessage(): string {
    return typeof this.error === "string" ? this.error : this.error.message;
  }
}
