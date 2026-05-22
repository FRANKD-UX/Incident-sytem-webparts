import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { TopBarComponent } from "../top-bar/top-bar.component";
import { SideNavComponent } from "../side-nav/side-nav.component";

@Component({
  selector: "app-shell",
  standalone: true,
  imports: [CommonModule, RouterOutlet, TopBarComponent, SideNavComponent],
  template: `
    <div class="shell">
      <app-top-bar />
      <div class="shell__body">
        <app-side-nav />
        <main class="shell__content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
      }
      .shell {
        min-height: 100vh;
        background: #eef3fb;
        color: #0f172a;
      }
      .shell__body {
        display: grid;
        grid-template-columns: 280px minmax(0, 1fr);
        min-height: calc(100vh - 64px);
      }
      .shell__content {
        padding: 24px;
        min-width: 0;
      }
      @media (max-width: 900px) {
        .shell__body {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class AppShellComponent {}
