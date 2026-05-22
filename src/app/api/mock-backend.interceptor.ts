import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpHeaders,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from "@angular/common/http";
import { inject } from "@angular/core";
import { Observable, of, throwError } from "rxjs";
import { environment } from "../../environments/environment";
import { ApiError, ApiResponse } from "../shared/models/common.model";
import { MockBackendError, MockBackendService } from "./mock-backend.service";

export const mockBackendInterceptor: HttpInterceptorFn = (req, next) => {
  if (!environment.useMockApi || !isApiRequest(req.url)) {
    return next(req);
  }

  const mockBackend = inject(MockBackendService);

  try {
    return handleMockRequest(req, next, mockBackend);
  } catch (error) {
    return throwError(() => toHttpErrorResponse(error, req));
  }
};

function handleMockRequest(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  mockBackend: MockBackendService,
): Observable<HttpEvent<unknown>> {
  const { pathname } = new URL(req.url, "http://localhost");
  const correlationId = req.headers.get("X-Correlation-Id") ?? createCorrelationId();

  if (req.method === "GET" && pathname === "/api/dashboard/summary") {
    return ok(req, mockBackend.getDashboardSummary(), correlationId);
  }

  if (req.method === "GET" && pathname === "/api/dashboard/admin-stats") {
    return ok(req, mockBackend.getAdminStats(), correlationId);
  }

  if (req.method === "GET" && pathname === "/api/incidents") {
    return ok(req, mockBackend.getIncidents(), correlationId);
  }

  const incidentIdMatch = pathname.match(/^\/api\/incidents\/([^/]+)$/);
  if (incidentIdMatch) {
    const incidentId = decodeURIComponent(incidentIdMatch[1]);

    if (req.method === "GET") {
      return ok(req, mockBackend.getIncident(incidentId), correlationId);
    }

    if (req.method === "PATCH") {
      return ok(
        req,
        mockBackend.updateIncident(incidentId, (req.body as Record<string, unknown>) ?? {}),
        correlationId,
      );
    }

    if (req.method === "DELETE") {
      return ok(req, mockBackend.deleteIncident(incidentId), correlationId);
    }
  }

  if (req.method === "POST" && pathname === "/api/incidents") {
    return ok(
      req,
      mockBackend.createIncident((req.body as Record<string, unknown>) ?? {}),
      correlationId,
      201,
    );
  }

  const checklistMatch = pathname.match(/^\/api\/incidents\/([^/]+)\/checklist$/);
  if (req.method === "GET" && checklistMatch) {
    return ok(req, mockBackend.getChecklist(decodeURIComponent(checklistMatch[1])), correlationId);
  }

  const checklistItemMatch = pathname.match(
    /^\/api\/incidents\/([^/]+)\/checklist\/([^/]+)$/,
  );
  if (req.method === "PATCH" && checklistItemMatch) {
    return ok(
      req,
      mockBackend.updateChecklistItem(
        decodeURIComponent(checklistItemMatch[1]),
        decodeURIComponent(checklistItemMatch[2]),
        (req.body as { isCompleted?: boolean }) ?? {},
      ),
      correlationId,
    );
  }

  const attachmentsMatch = pathname.match(/^\/api\/incidents\/([^/]+)\/attachments$/);
  if (attachmentsMatch) {
    const incidentId = decodeURIComponent(attachmentsMatch[1]);

    if (req.method === "GET") {
      return ok(req, mockBackend.getAttachments(incidentId), correlationId);
    }

    if (req.method === "POST") {
      return ok(req, mockBackend.uploadAttachment(incidentId, req), correlationId, 201);
    }
  }

  const attachmentItemMatch = pathname.match(
    /^\/api\/incidents\/([^/]+)\/attachments\/([^/]+)$/,
  );
  if (attachmentItemMatch) {
    const incidentId = decodeURIComponent(attachmentItemMatch[1]);
    const attachmentId = decodeURIComponent(attachmentItemMatch[2]);

    if (req.method === "PATCH") {
      return ok(
        req,
        mockBackend.updateAttachment(
          incidentId,
          attachmentId,
          (req.body as Record<string, unknown>) ?? {},
        ),
        correlationId,
      );
    }

    if (req.method === "DELETE") {
      return ok(req, mockBackend.deleteAttachment(incidentId, attachmentId), correlationId);
    }
  }

  const auditMatch = pathname.match(/^\/api\/incidents\/([^/]+)\/audit$/);
  if (req.method === "GET" && auditMatch) {
    return ok(req, mockBackend.getAuditTrail(decodeURIComponent(auditMatch[1])), correlationId);
  }

  const escalationMatch = pathname.match(/^\/api\/incidents\/([^/]+)\/escalations$/);
  if (req.method === "GET" && escalationMatch) {
    return ok(req, mockBackend.getEscalations(decodeURIComponent(escalationMatch[1])), correlationId);
  }

  const slaMatch = pathname.match(/^\/api\/incidents\/([^/]+)\/sla$/);
  if (req.method === "GET" && slaMatch) {
    return ok(req, mockBackend.getSlaState(decodeURIComponent(slaMatch[1])), correlationId);
  }

  const moveMatch = pathname.match(/^\/api\/incidents\/([^/]+)\/move$/);
  if (req.method === "POST" && moveMatch) {
    return ok(
      req,
      mockBackend.moveIncident(
        decodeURIComponent(moveMatch[1]),
        (req.body as { targetDepartmentId?: string; targetStatus?: string }) ?? {},
      ),
      correlationId,
    );
  }

  if (req.method === "GET" && pathname === "/api/workflows/chains") {
    return ok(req, mockBackend.getDepartmentChains(), correlationId);
  }

  const workflowChainMatch = pathname.match(/^\/api\/workflows\/chains\/([^/]+)$/);
  if (req.method === "DELETE" && workflowChainMatch) {
    return ok(
      req,
      mockBackend.deleteDepartmentChain(decodeURIComponent(workflowChainMatch[1])),
      correlationId,
    );
  }

  if (req.method === "GET" && pathname === "/api/departments") {
    return ok(req, mockBackend.getDepartments(), correlationId);
  }

  if (req.method === "GET" && pathname === "/api/me/permissions") {
    return ok(req, mockBackend.getUserPermissions(), correlationId);
  }

  return next(req);
}

function ok<T>(
  req: HttpRequest<unknown>,
  data: T,
  correlationId: string,
  status = 200,
): Observable<HttpEvent<unknown>> {
  const body: ApiResponse<T> = {
    data,
    success: true,
    timestamp: new Date().toISOString(),
    correlationId,
  };

  return of(
    new HttpResponse({
      status,
      body,
      url: req.url,
      headers: new HttpHeaders({
        "X-Correlation-Id": correlationId,
      }),
    }),
  );
}

function toHttpErrorResponse(
  error: unknown,
  req: HttpRequest<unknown>,
): HttpErrorResponse {
  const correlationId = req.headers.get("X-Correlation-Id") ?? createCorrelationId();

  if (error instanceof MockBackendError) {
    const body: ApiError = {
      code: error.code,
      message: error.message,
      details: error.details,
      timestamp: new Date().toISOString(),
      correlationId,
    };

    return new HttpErrorResponse({
      status: error.status,
      error: body,
      url: req.url,
      headers: new HttpHeaders({ "X-Correlation-Id": correlationId }),
      statusText: error.message,
    });
  }

  const body: ApiError = {
    code: "MOCK_BACKEND_ERROR",
    message: "The mock backend failed to process the request.",
    details: error,
    timestamp: new Date().toISOString(),
    correlationId,
  };

  return new HttpErrorResponse({
    status: 500,
    error: body,
    url: req.url,
    headers: new HttpHeaders({ "X-Correlation-Id": correlationId }),
    statusText: body.message,
  });
}

function isApiRequest(url: string): boolean {
  return new URL(url, "http://localhost").pathname.startsWith("/api/");
}

function createCorrelationId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
