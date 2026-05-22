import { Routes } from "@angular/router";
import { authGuard } from "./core/auth/auth.guard";
import { roleGuard } from "./core/auth/role.guard";

export const routes: Routes = [
  {
    path: "",
    pathMatch: "full",
    redirectTo: "dashboard",
  },
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
    children: [
      {
        path: "new",
        loadComponent: () =>
          import("./features/incidents/components/incident-form/incident-form.component").then(
            (m) => m.IncidentFormComponent,
          ),
        data: { permissions: ["CREATE_INCIDENT"] },
      },
      {
        path: "",
        loadComponent: () =>
          import("./features/incidents/pages/incidents-list-page.component").then(
            (m) => m.IncidentsListPageComponent,
          ),
        data: { permissions: ["VIEW_INCIDENTS"] },
      },
      {
        path: ":id",
        loadComponent: () =>
          import("./features/incidents/pages/incident-detail-page.component").then(
            (m) => m.IncidentDetailPageComponent,
          ),
        data: { permissions: ["VIEW_INCIDENT_DETAILS"] },
      },
    ],
  },
  {
    path: "board",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/board/pages/board-page.component").then(
        (m) => m.BoardPageComponent,
      ),
    data: { permissions: ["VIEW_BOARD"] },
  },
  {
    path: "administration",
    canActivate: [authGuard, roleGuard],
    loadChildren: () =>
      import("./features/administration/administration.module").then(
        (m) => m.AdministrationModule,
      ),
    data: { roles: ["ADMIN", "SYSTEM_ADMIN"] },
  },
  {
    path: "unauthorized",
    loadComponent: () =>
      import("./features/errors/unauthorized.component").then(
        (m) => m.UnauthorizedComponent,
      ),
  },
  {
    path: "**",
    redirectTo: "dashboard",
  },
];
