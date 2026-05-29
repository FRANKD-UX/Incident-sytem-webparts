import { Injectable } from "@angular/core";
import { delay, Observable, of } from "rxjs";
import {
  AgentPerformanceAgent,
  AgentPerformanceReport,
} from "../shared/models/agent-performance.model";

const AGENTS: AgentPerformanceAgent[] = [
  {
    id: "aisha-ibrahim",
    displayName: "Aisha Ibrahim",
    department: "Support",
    role: "Support Lead",
  },
  {
    id: "thabo-mokoena",
    displayName: "Thabo Mokoena",
    department: "Operations",
    role: "Operations Specialist",
  },
  {
    id: "lene-van-der-merwe",
    displayName: "Lene van der Merwe",
    department: "Accounts",
    role: "Accounts Lead",
  },
];

const REPORTS: Record<string, AgentPerformanceReport> = {
  "aisha-ibrahim": {
    agent: AGENTS[0],
    periodLabel: "Last 30 days",
    ticketsClosed: 28,
    avgCloseTimeMinutes: 74,
    slaTargetMinutes: 90,
    slaMetCount: 24,
    slaBreaches: 4,
    slaCompliance: 86,
    reopenedTickets: 2,
    escalationsHandled: 6,
    closureNotes: [
      "Fastest closure came from low-complexity routing and complete checklist capture.",
      "Two SLA breaches were caused by late customer confirmation.",
    ],
    recentClosures: [
      {
        incidentId: "INC-2104",
        referenceNumber: "INC-2104",
        title: "Portal login failure",
        closedAt: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
        closeTimeMinutes: 42,
        slaTargetMinutes: 60,
        withinSla: true,
      },
      {
        incidentId: "INC-2098",
        referenceNumber: "INC-2098",
        title: "Intermittent fibre outage",
        closedAt: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
        closeTimeMinutes: 88,
        slaTargetMinutes: 90,
        withinSla: true,
      },
      {
        incidentId: "INC-2089",
        referenceNumber: "INC-2089",
        title: "Customer callback request",
        closedAt: new Date(Date.now() - 1000 * 60 * 310).toISOString(),
        closeTimeMinutes: 96,
        slaTargetMinutes: 90,
        withinSla: false,
      },
    ],
  },
  "thabo-mokoena": {
    agent: AGENTS[1],
    periodLabel: "Last 30 days",
    ticketsClosed: 34,
    avgCloseTimeMinutes: 61,
    slaTargetMinutes: 75,
    slaMetCount: 31,
    slaBreaches: 3,
    slaCompliance: 91,
    reopenedTickets: 1,
    escalationsHandled: 4,
    closureNotes: [
      "This agent is trending above the target SLA with short technical closure times.",
      "Most breaches were linked to waiting on field availability.",
    ],
    recentClosures: [
      {
        incidentId: "INC-2111",
        referenceNumber: "INC-2111",
        title: "Site power issue",
        closedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
        closeTimeMinutes: 38,
        slaTargetMinutes: 75,
        withinSla: true,
      },
      {
        incidentId: "INC-2103",
        referenceNumber: "INC-2103",
        title: "Field visit scheduling",
        closedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        closeTimeMinutes: 67,
        slaTargetMinutes: 75,
        withinSla: true,
      },
      {
        incidentId: "INC-2092",
        referenceNumber: "INC-2092",
        title: "Router replacement",
        closedAt: new Date(Date.now() - 1000 * 60 * 260).toISOString(),
        closeTimeMinutes: 82,
        slaTargetMinutes: 75,
        withinSla: false,
      },
    ],
  },
  "lene-van-der-merwe": {
    agent: AGENTS[2],
    periodLabel: "Last 30 days",
    ticketsClosed: 22,
    avgCloseTimeMinutes: 58,
    slaTargetMinutes: 70,
    slaMetCount: 20,
    slaBreaches: 2,
    slaCompliance: 91,
    reopenedTickets: 0,
    escalationsHandled: 5,
    closureNotes: [
      "Best performance came from billing amendments that were resolved in one touch.",
      "No reopenings recorded in the current period.",
    ],
    recentClosures: [
      {
        incidentId: "INC-2120",
        referenceNumber: "INC-2120",
        title: "Debit date correction",
        closedAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
        closeTimeMinutes: 33,
        slaTargetMinutes: 70,
        withinSla: true,
      },
      {
        incidentId: "INC-2108",
        referenceNumber: "INC-2108",
        title: "Refund approval review",
        closedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
        closeTimeMinutes: 61,
        slaTargetMinutes: 70,
        withinSla: true,
      },
      {
        incidentId: "INC-2099",
        referenceNumber: "INC-2099",
        title: "Invoice dispute",
        closedAt: new Date(Date.now() - 1000 * 60 * 295).toISOString(),
        closeTimeMinutes: 72,
        slaTargetMinutes: 70,
        withinSla: false,
      },
    ],
  },
};

@Injectable({ providedIn: "root" })
export class AgentPerformanceApiService {
  getAgents(): Observable<AgentPerformanceAgent[]> {
    return of(AGENTS).pipe(delay(120));
  }

  getPerformance(agentId: string): Observable<AgentPerformanceReport> {
    const report = REPORTS[agentId] ?? REPORTS[AGENTS[0].id];
    return of(report).pipe(delay(140));
  }
}
