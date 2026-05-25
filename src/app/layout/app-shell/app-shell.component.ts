import { Component } from "@angular/core";
import { TopBarComponent } from "../top-bar/top-bar.component";
import { SideNavComponent } from "../side-nav/side-nav.component";

@Component({
  selector: "app-shell",
  standalone: true,
  imports: [TopBarComponent, SideNavComponent],
  template: `
    <div class="shell">
      <app-side-nav [collapsed]="collapsed" (toggle)="collapsed = !collapsed" />
      <div class="shell__main" [class.shell__main--collapsed]="collapsed">
        <app-top-bar />
        <main class="shell__content">
          <ng-content />
        </main>
      </div>
    </div>
  `,
  styleUrls: ["./app-shell.component.scss"],
})
export class AppShellComponent {
  collapsed = false;
}
