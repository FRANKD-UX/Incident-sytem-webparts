import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";

type SectionKey = "dashboard" | "tickets" | "board" | "admin";

interface MetricCard {
  label: string;
  value: string;
  delta: string;
  tone: "blue" | "green" | "amber" | "red";
}

interface TicketItem {
  id: string;
  title: string;
  status: string;
  priority: string;
  owner: string;
}

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})
export class AppComponent {
  protected readonly sections: Array<{
    key: SectionKey;
    label: string;
    description: string;
  }> = [
    {
      key: "dashboard",
      label: "Dashboard",
      description: "Live operations overview",
    },
    {
      key: "tickets",
      label: "Tickets",
      description: "Incoming work and escalations",
    },
    {
      key: "board",
      label: "Board",
      description: "Priority flow and ownership",
    },
    { key: "admin", label: "Admin", description: "Governance and saved views" },
  ];

  protected readonly metrics: MetricCard[] = [
    { label: "Open incidents", value: "128", delta: "+12 today", tone: "blue" },
    { label: "Escalated", value: "24", delta: "+3 today", tone: "amber" },
    { label: "At risk SLA", value: "9", delta: "-2 this hour", tone: "red" },
    {
      label: "Resolved",
      value: "76%",
      delta: "+4% week over week",
      tone: "green",
    },
  ];

  protected readonly tickets: TicketItem[] = [
    {
      id: "INC-4812",
      title: "Finance portal outage",
      status: "Escalated",
      priority: "P1",
      owner: "A. Mensah",
    },
    {
      id: "INC-4807",
      title: "Email routing delay",
      status: "Pending",
      priority: "P2",
      owner: "L. Dlamini",
    },
    {
      id: "INC-4798",
      title: "VPN authentication errors",
      status: "Open",
      priority: "P1",
      owner: "Unassigned",
    },
  ];

  protected activeSection: SectionKey = "dashboard";

  protected selectSection(key: SectionKey): void {
    this.activeSection = key;
  }
}
