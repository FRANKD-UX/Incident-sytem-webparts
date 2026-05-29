import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import {
  ApiResponse,
  CommandResponse,
  PaginatedResponse,
  PaginationMetadata,
} from "../shared/models/common.model";
import { Incident } from "../shared/models/incident.model";
import { Department, UserRole } from "../shared/models/user.model";
import { HttpClientService } from "../core/services/http-client.service";

interface ChecklistCompletionPayload {
  completedByUserId: string;
  notes?: string | null;
}

interface CloseIncidentPayload {
  requestingUserId: string;
  requestingDepartmentId: string;
}

@Injectable({
  providedIn: "root",
})
export class IncidentApiService {
  constructor(private readonly http: HttpClientService) {}

  getIncidents(): Observable<PaginatedResponse<Incident>> {
    return this.http.get<Incident[]>("/incidents").pipe(
      map((response) => this.mapPaginatedResponse(response)),
    );
  }

  getIncidentsByDepartment(
    departmentId: string,
  ): Observable<PaginatedResponse<Incident>> {
    return this.http
      .get<Incident[]>(`/incidents/department/${departmentId}`)
      .pipe(map((response) => this.mapPaginatedResponse(response)));
  }

  getIncident(id: string): Observable<Incident | null> {
    return this.http
      .get<Incident>(`/incidents/${id}`)
      .pipe(map((response) => this.mapIncidentOrNull((response as any).data ?? response)));
  }

  createIncident(incident: Partial<Incident>): Observable<Incident> {
    return this.http
      .post<Incident>("/incidents", incident)
      .pipe(map((response) => this.mapIncident((response as any).data ?? response)));
  }

  updateIncident(
    id: string,
    updates: Partial<Incident>,
  ): Observable<Incident | null> {
    return this.http
      .put<Incident>(`/incidents/${id}`, updates)
      .pipe(map((response) => this.mapIncidentOrNull((response as any).data ?? response)));
  }

  getIncidentChain(
    incidentId: string,
  ): Observable<Incident["type"]["departmentChain"] | null> {
    return this.getIncident(incidentId).pipe(
      map((incident) => incident?.type?.departmentChain ?? null),
    );
  }

  completeChecklist(
    incidentId: string,
    checklistId: string,
    payload: ChecklistCompletionPayload,
  ): Observable<CommandResponse> {
    return this.http
      .post<CommandResponse>(
        `/incidents/${incidentId}/checklist/${checklistId}/complete`,
        payload,
      )
      .pipe(map((response) => (response as any).data ?? response));
  }

  closeIncident(
    incidentId: string,
    requestingUserId: string,
    requestingDepartmentId: string,
  ): Observable<CommandResponse> {
    const payload: CloseIncidentPayload = {
      requestingUserId,
      requestingDepartmentId,
    };
    return this.http
      .post<CommandResponse>(`/incidents/${incidentId}/close`, payload)
      .pipe(map((response) => (response as any).data ?? response));
  }

  private mapPaginatedResponse(
    response: ApiResponse<Incident[]>,
  ): PaginatedResponse<Incident> {
    const incidents = (response as any).items ?? (response as any).data ?? [];
    return {
      ...response,
      data: incidents.map((incident: any) => this.mapIncident(incident)),
      pagination: this.extractPagination(response, incidents.length),
    };
  }

  private extractPagination(
    response: ApiResponse<Incident[]>,
    totalItems: number,
  ): PaginationMetadata {
    const r = response as any;
    if (r.total != null) {
      return {
        currentPage: r.page ?? 1,
        pageSize: r.pageSize ?? totalItems,
        totalItems: r.total,
        totalPages: r.totalPages ?? 1,
        hasNextPage: (r.page ?? 1) < (r.totalPages ?? 1),
        hasPreviousPage: (r.page ?? 1) > 1,
      };
    }
    if ("pagination" in response) {
      return (response as PaginatedResponse<Incident>).pagination;
    }
    return {
      currentPage: 1,
      pageSize: totalItems,
      totalItems,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    };
  }

  private mapIncidentOrNull(incident?: any): Incident | null {
    if (!incident) return null;
    return this.mapIncident(incident);
  }

  private mapDepartment(id: any, name: any): Department {
    const nameStr = name ?? "";
    const codeMap: Record<string, string> = {
      "Support": "SUP",
      "Operations": "OPS",
      "Accounts": "ACC",
      "IT": "IT",
      "Complaints": "COMP",
    };
    const code = codeMap[nameStr] ?? nameStr.substring(0, 3).toUpperCase();
    return {
      id: String(id ?? ""),
      name: nameStr,
      code,
      isActive: true,
    };
  }

  private mapRole(): UserRole {
    return {
      id: "",
      name: "User",
      departmentId: "",
      permissions: [],
    };
  }

  private mapIncident(incident: any): Incident {
    return {
      id: String(incident.incidentId ?? incident.id ?? ""),
      referenceNumber: incident.referenceNumber ?? `INC-${incident.incidentId}`,
      title: incident.title ?? "",
      description: incident.description ?? "",
      status: incident.status ?? "Logged",
      priority: incident.priority ?? "P3",
      createdAt: incident.createdAt ?? "",
      updatedAt: incident.updatedAt ?? "",
      closedAt: incident.closedAt ?? undefined,
      tags: incident.tags ?? [],
      customFields: incident.customFields ?? {},
      type: {
        id: String(incident.incidentTypeId ?? ""),
        name: incident.incidentTypeName ?? "",
        code: incident.incidentTypeName ?? "",
        description: "",
        departmentChain: {
          id: "",
          name: "",
          steps: [],
          allowParallel: false,
          requireStrictOrder: true,
        },
        defaultChecklists: [],
        slaRules: [],
        escalationRules: [],
        isActive: true,
      },
      currentDepartment: this.mapDepartment(
        incident.currentDepartmentId,
        incident.currentDepartmentName,
      ),
      originDepartment: this.mapDepartment(
        incident.originDepartmentId,
        incident.originDepartmentName,
      ),
      createdBy: {
        id: String(incident.createdByUserId ?? ""),
        displayName: incident.createdByUserName ?? "Unknown",
        email: "",
        role: this.mapRole(),
        permissions: [],
        department: this.mapDepartment(
          incident.originDepartmentId,
          incident.originDepartmentName,
        ),
      },
    };
  }
}