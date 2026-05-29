export interface AgentPerformanceAgent {
  id: string;
  displayName: string;
  department: string;
  role: string;
}

export interface AgentPerformanceIncident {
  incidentId: string;
  referenceNumber: string;
  title: string;
  closedAt: string;
  closeTimeMinutes: number;
  slaTargetMinutes: number;
  withinSla: boolean;
}

export interface AgentPerformanceReport {
  agent: AgentPerformanceAgent;
  periodLabel: string;
  ticketsClosed: number;
  avgCloseTimeMinutes: number;
  slaTargetMinutes: number;
  slaMetCount: number;
  slaBreaches: number;
  slaCompliance: number;
  reopenedTickets: number;
  escalationsHandled: number;
  closureNotes: string[];
  recentClosures: AgentPerformanceIncident[];
}
