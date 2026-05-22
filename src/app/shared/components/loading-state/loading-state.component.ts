import { Component, Input } from "@angular/core";

@Component({
  selector: "app-loading-state",
  standalone: true,
  template: `
    <div class="loading-state" [class.loading-state--overlay]="overlay">
      <div class="spinner"></div>
      <p>{{ message }}</p>
    </div>
  `,
  styles: [
    `
      .loading-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        padding: 32px;
        color: #5b6475;
      }
      .loading-state--overlay {
        position: absolute;
        inset: 0;
        background: rgba(255, 255, 255, 0.75);
        z-index: 10;
        justify-content: center;
      }
      .spinner {
        width: 40px;
        height: 40px;
        border: 3px solid var(--border-color, #d1d5db);
        border-top-color: #3b82f6;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class LoadingStateComponent {
  @Input() message = "Loading...";
  @Input() overlay = false;
}
