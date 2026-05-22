import { Component, Input } from "@angular/core";

@Component({
  selector: "app-empty-state",
  standalone: true,
  template: `
    <div class="empty-state">
      <div class="icon">{{ icon }}</div>
      <h3>{{ title }}</h3>
      <p>{{ description }}</p>
    </div>
  `,
  styles: [
    `
      .empty-state {
        display: grid;
        gap: 8px;
        justify-items: center;
        padding: 40px;
        color: #5b6475;
        text-align: center;
      }
      .icon {
        width: 56px;
        height: 56px;
        border-radius: 16px;
        display: grid;
        place-items: center;
        background: #eef3fb;
        font-size: 20px;
      }
      h3,
      p {
        margin: 0;
      }
    `,
  ],
})
export class EmptyStateComponent {
  @Input() icon = "inbox";
  @Input() title = "Nothing here yet";
  @Input() description = "No records available.";
}
