import { Routes } from "@angular/router";
import { authGuard } from "./core/guards/auth.guard";

export const routes: Routes = [
  { path: "", pathMatch: "full", redirectTo: "dashboard" },
  {
    path: "dashboard",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/dashboard/pages/dashboard-page.component").then(
        (m) => m.DashboardPageComponent,
      ),
  },
  {
    path: "incidents",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/incidents/pages/incidents-list-page.component").then(
        (m) => m.IncidentsListPageComponent,
      ),
  },
  {
    path: "board",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/board/pages/board-page.component").then(
        (m) => m.BoardPageComponent,
      ),
  },
  {
    path: "administration",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/administration/pages/admin-dashboard.component").then(
        (m) => m.AdminDashboardComponent,
      ),
  },
  {
    path: "administration/workflows",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/administration/pages/workflow-config.component").then(
        (m) => m.WorkflowConfigComponent,
      ),
  },
  { path: "**", redirectTo: "dashboard" },
];
