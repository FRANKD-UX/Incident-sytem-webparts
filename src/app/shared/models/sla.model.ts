import { Priority, SlaStatus } from "./common.model";

export interface SlaState {
  incidentId: string;
  metrics: SlaMetricState[];
  overallStatus: SlaStatus;
  nextBreach?: string;
  breaches: SlaBreach[];
}

export interface SlaMetricState {
  metric: SlaMetric;
  target: number;
  elapsed: number;
  status: SlaStatus;
  deadline: string;
  breachAt: string;
}

export interface SlaBreach {
  id: string;
  metric: SlaMetric;
  breachedAt: string;
  severity: "WARNING" | "MAJOR" | "CRITICAL";
  acknowledged: boolean;
}

export type SlaMetric =
  | "INITIAL_RESPONSE"
  | "RESOLUTION"
  | "ESCALATION_RESPONSE";
