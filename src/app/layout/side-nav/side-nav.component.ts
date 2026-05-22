import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";

@Component({
  selector: "app-side-nav",
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="side-nav">
      @for (item of items; track item.route) {
        <a [routerLink]="item.route" routerLinkActive="active" class="item">
          <span>{{ item.label }}</span>
          <small>{{ item.description }}</small>
        </a>
      }
    </nav>
  `,
  styles: [
    `
      .side-nav {
        background: #111b34;
        color: #cbd5e1;
        padding: 16px;
        display: grid;
        gap: 10px;
      }
      .item {
        display: grid;
        gap: 2px;
        padding: 14px 16px;
        border-radius: 16px;
        color: inherit;
        text-decoration: none;
        background: rgba(255, 255, 255, 0.04);
      }
      .item.active {
        background: rgba(24, 73, 255, 0.18);
        color: #fff;
      }
      small {
        opacity: 0.7;
      }
    `,
  ],
})
export class SideNavComponent {
  readonly items = [
    { route: "/dashboard", label: "Dashboard", description: "Overview" },
    { route: "/incidents", label: "Incidents", description: "Grid and detail" },
    { route: "/board", label: "Board", description: "Kanban flow" },
    {
      route: "/administration",
      label: "Administration",
      description: "Configuration",
    },
  ];
}
