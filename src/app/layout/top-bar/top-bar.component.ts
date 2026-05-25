import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";

@Component({
  selector: "app-top-bar",
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="topbar">
      <div class="topbar__center">
        <div class="search">
          <span class="material-icons search__icon">search</span>
          <input
            type="text"
            placeholder="Search incidents, users, departments..."
          />
          <kbd class="search__kbd">Ctrl + K</kbd>
        </div>
      </div>

      <div class="topbar__right">
        <button class="icon-btn" type="button">
          <span class="material-icons">notifications_none</span>
          <span class="badge">3</span>
        </button>

        <button class="icon-btn" type="button">
          <span class="material-icons">help_outline</span>
        </button>
      </div>
    </header>
  `,
  styleUrls: ["./top-bar.component.scss"],
})
export class TopBarComponent {}
