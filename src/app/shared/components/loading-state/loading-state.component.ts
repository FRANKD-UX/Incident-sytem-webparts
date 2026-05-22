import { Component, Input } from "@angular/core";

@Component({
  selector: "app-loading-state",
  standalone: true,
  template: `
    <div class="loading-state">
      <div class="spinner"></div>
      <p>{{ message }}</p>
    </div>
  `,
  styles: [
    `
      .loading-state {
        display: grid;
        gap: 12px;
        place-items: center;
        padding: 32px;
        color: #5b6475;
      }
      .spinner {
        width: 32px;
        height: 32px;
        border: 3px solid #dbeafe;
        border-top-color: #1849ff;
        border-radius: 50%;
        animation: spin 0.9s linear infinite;
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
}
