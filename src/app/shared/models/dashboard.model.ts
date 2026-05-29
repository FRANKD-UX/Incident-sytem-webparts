import { Incident } from "./incident.model";
import { Department } from "./user.model";
import { Priority } from "./common.model";

export interface DashboardSummary {
  kpis: DashboardKpi[];
  workloadByDepartment: DepartmentWorkload[];
  trends: IncidentTrends;
  recentIncidents: Incident[];
  slaCompliance: SlaCompliance;
}

export interface DashboardKpi {
  id: string;
  label: string;
  value: number;
  change: number;
  changeType: "INCREASE" | "DECREASE" | "NEUTRAL";
  icon: string;
  color: string;
}

export interface DepartmentWorkload {
  department: Department;
  openIncidents: number;
  inProgress: number;
  escalated: number;
  avgResolutionTime: number;
  slaCompliance: number;
}

export interface IncidentTrends {
  daily: TrendData[];
  weekly: TrendData[];
  monthly: TrendData[];
}

export interface TrendData {
  date: string;
  created: number;
  resolved: number;
  escalated: number;
}

export interface SlaCompliance {
  overall: number;
  byDepartment: { departmentId: string; compliance: number }[];
  byPriority: { priority: Priority; compliance: number }[];
}

export interface AdminDashboardStats {
  incidentTypes: number;
  workflows: number;
  slaRules: number;
  roles: number;
}
