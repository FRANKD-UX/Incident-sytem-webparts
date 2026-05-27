import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { TopBarComponent } from "../top-bar/top-bar.component";
import { SideNavComponent } from "../side-nav/side-nav.component";
import { NotificationService } from "../../core/services/notification.service";

@Component({
  selector: "app-shell",
  standalone: true,
  imports: [CommonModule, TopBarComponent, SideNavComponent],
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
    <div class="toast-stack">
      @for (message of notification.messages(); track message.id) {
        <div class="toast" [class]="'toast toast--' + message.level">
          <span>{{ message.text }}</span>
          <button type="button" (click)="notification.dismiss(message.id)">
            <span class="material-icons">close</span>
          </button>
        </div>
      }
    </div>
  `,
  styleUrls: ["./app-shell.component.scss"],
})
export class AppShellComponent {
  readonly notification = inject(NotificationService);
  collapsed = false;
}
