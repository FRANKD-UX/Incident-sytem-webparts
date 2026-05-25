import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output, inject } from "@angular/core";
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { AuthService } from "../../core/auth/auth.service";
import { HasRoleDirective } from "../../shared/directives/has-permission.directive";

@Component({
  selector: "app-side-nav",
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, HasRoleDirective],
  template: `
    <aside class="sidenav" [class.sidenav--collapsed]="collapsed">
      <div class="sidenav__brand">
        <div class="sidenav__brand-mark">⚡</div>

        <button
          class="sidenav__toggle"
          type="button"
          [attr.aria-label]="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
          (click)="toggle.emit()"
        >
          <span class="material-icons">
            {{ collapsed ? "chevron_right" : "chevron_left" }}
          </span>
        </button>

        <div class="sidenav__brand-copy" *ngIf="!collapsed">
          <strong>IncidentOps</strong>
          <span>Incident Management</span>
        </div>
      </div>

      <nav class="sidenav__nav">
        <div class="sidenav__section" *ngIf="!collapsed">Workspace</div>

        <a
          routerLink="/dashboard"
          routerLinkActive="active"
          class="sidenav__item"
        >
          <span class="material-icons">space_dashboard</span>
          <span class="sidenav__label" *ngIf="!collapsed">Dashboard</span>
        </a>

        <a
          routerLink="/incidents"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: true }"
          class="sidenav__item"
        >
          <span class="material-icons">confirmation_number</span>
          <span class="sidenav__label" *ngIf="!collapsed">Incidents</span>
        </a>

        <a routerLink="/board" routerLinkActive="active" class="sidenav__item">
          <span class="material-icons">view_kanban</span>
          <span class="sidenav__label" *ngIf="!collapsed">Board</span>
        </a>

        <a
          routerLink="/administration"
          routerLinkActive="active"
          class="sidenav__item"
        >
          <span class="material-icons">settings</span>
          <span class="sidenav__label" *ngIf="!collapsed">Administration</span>
        </a>

        <ng-container *hasRole="['ADMIN', 'SYSTEM_ADMIN']">
          <div
            class="sidenav__section sidenav__section--spaced"
            *ngIf="!collapsed"
          >
            Escalations
          </div>

          <a
            routerLink="/administration/infrastructure-escalation"
            routerLinkActive="active"
            class="sidenav__item"
          >
            <span class="material-icons">lan</span>
            <span class="sidenav__label" *ngIf="!collapsed"
              >Infrastructure Escalation Matrix</span
            >
          </a>
        </ng-container>
      </nav>

      <div class="sidenav__footer" *ngIf="!collapsed">
        <div class="user-menu" [class.user-menu--open]="userMenuOpen">
          <button
            class="user-pill"
            type="button"
            (click)="toggleUserMenu($event)"
          >
            <div class="user-pill__avatar">JD</div>
            <div class="user-pill__meta">
              <strong>John Doe</strong>
              <span>Administrator</span>
            </div>
            <span class="material-icons user-pill__caret">expand_more</span>
          </button>

          <div class="user-menu__dropdown" *ngIf="userMenuOpen">
            <button class="user-menu__item" type="button" (click)="signOut()">
              <span class="material-icons">logout</span>
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  `,
  styleUrls: ["./side-nav.component.scss"],
})
export class SideNavComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  @Input() collapsed = false;
  @Output() toggle = new EventEmitter<void>();
  userMenuOpen = false;

  toggleUserMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.userMenuOpen = !this.userMenuOpen;
  }

  signOut(): void {
    this.userMenuOpen = false;
    this.authService.logout();
    this.router.navigateByUrl("/login");
  }
}
