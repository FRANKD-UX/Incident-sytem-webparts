import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { InfrastructureEscalationComponent } from "./pages/infrastructure-escalation.component";
import { AgentPerformanceComponent } from "./pages/agent-performance.component";
import { AdminDashboardComponent } from "./pages/admin-dashboard.component";
import { AdminSectionComponent } from "./pages/admin-section.component";
import { WorkflowConfigComponent } from "./pages/workflow-config.component";

const routes: Routes = [
  {
    path: "",
    component: AdminDashboardComponent,
  },
  {
    path: "workflows",
    component: WorkflowConfigComponent,
    data: {
      title: "Workflow Configuration",
      subtitle: "Manage department chains and transition rules",
      icon: "account_tree",
      summary: [
        "Review the active department chain for each incident type.",
        "Edit step order, SLA targets, and transition ownership.",
        "Use the workflow board to validate live incident routing.",
      ],
    },
  },
  {
    path: "agent-performance",
    component: AgentPerformanceComponent,
  },
  {
    path: "infrastructure-escalation",
    component: InfrastructureEscalationComponent,
  },
  {
    path: "incident-types",
    component: AdminSectionComponent,
    data: {
      title: "Incident Types",
      subtitle: "Configure categories, defaults, and intake rules.",
      icon: "category",
      summary: [
        "Group incidents by operational category.",
        "Define default departments and escalation rules.",
        "Keep intake behavior aligned with workflow ownership.",
      ],
    },
  },
  {
    path: "sla",
    component: AdminSectionComponent,
    data: {
      title: "SLA Configuration",
      subtitle: "Tune response and resolution targets.",
      icon: "timer",
      summary: [
        "Set breach thresholds per incident type.",
        "Adjust warning windows for support, accounts, and operations.",
        "Review SLA performance against live incident states.",
      ],
    },
  },
  {
    path: "roles",
    component: AdminSectionComponent,
    data: {
      title: "Roles & Permissions",
      subtitle: "Manage access by role and department.",
      icon: "shield",
      summary: [
        "Map roles to allowed incident actions.",
        "Control who can view board and workflow controls.",
        "Keep admin access limited to trusted operators.",
      ],
    },
  },
  {
    path: "settings",
    component: AdminSectionComponent,
    data: {
      title: "System Settings",
      subtitle: "Review platform-wide configuration and integrations.",
      icon: "settings",
      summary: [
        "Inspect integration hooks and operational defaults.",
        "Capture housekeeping actions for environment changes.",
        "Keep the platform aligned with support operations.",
      ],
    },
  },
];

@NgModule({ imports: [RouterModule.forChild(routes)] })
export class AdministrationModule {}
