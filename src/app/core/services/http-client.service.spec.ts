import {
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { firstValueFrom } from "rxjs";
import { mockBackendInterceptor } from "../../api/mock-backend.interceptor";
import { DashboardApiService } from "../../api/dashboard-api.service";
import { IncidentApiService } from "../../api/incident-api.service";
import { HttpClientService } from "./http-client.service";

describe("HttpClientService", () => {
  let service: HttpClientService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HttpClientService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(HttpClientService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it("maps API envelopes to typed data and serializes array params", async () => {
    const requestPromise = firstValueFrom(
      service.get<{ id: string }[]>("/incidents", {
        params: { status: ["OPEN", "ESCALATED"], page: 1 },
      }),
    );

    const req = httpTestingController.expectOne(
      (request) =>
        request.method === "GET" &&
        request.url === "/api/incidents" &&
        request.params.getAll("status")?.join(",") === "OPEN,ESCALATED" &&
        request.params.get("page") === "1",
    );

    expect(req.request.headers.get("Accept")).toBe("application/json");
    expect(req.request.headers.has("X-Correlation-Id")).toBeTrue();

    req.flush({
      data: [{ id: "INC-001" }],
      success: true,
      timestamp: new Date().toISOString(),
      correlationId: "corr-1",
    });

    await expectAsync(requestPromise).toBeResolvedTo([{ id: "INC-001" }]);
  });

  it("does not force json content type for form data uploads", () => {
    const body = new FormData();
    body.append("fileName", "evidence.txt");

    service.post("/incidents/INC-001/attachments", body).subscribe();

    const req = httpTestingController.expectOne("/api/incidents/INC-001/attachments");
    expect(req.request.headers.has("Content-Type")).toBeFalse();
    req.flush({
      data: [],
      success: true,
      timestamp: new Date().toISOString(),
      correlationId: "corr-2",
    });
  });

  it("normalizes backend errors into ApiError objects", async () => {
    const requestPromise = firstValueFrom(service.get("/incidents/INC-404")).catch(
      (error: HttpErrorResponse | { code: string; message: string }) => error,
    );

    const req = httpTestingController.expectOne("/api/incidents/INC-404");
    req.flush(
      {
        code: "INCIDENT_NOT_FOUND",
        message: "Incident not found.",
        timestamp: new Date().toISOString(),
        correlationId: "corr-404",
      },
      { status: 404, statusText: "Not Found" },
    );

    await expectAsync(requestPromise).toBeResolvedTo(
      jasmine.objectContaining({
        code: "INCIDENT_NOT_FOUND",
        message: "Incident not found.",
      }),
    );
  });
});

describe("API services with mock backend", () => {
  let dashboardApi: DashboardApiService;
  let incidentApi: IncidentApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DashboardApiService,
        IncidentApiService,
        HttpClientService,
        provideHttpClient(withInterceptors([mockBackendInterceptor])),
      ],
    });

    dashboardApi = TestBed.inject(DashboardApiService);
    incidentApi = TestBed.inject(IncidentApiService);
  });

  it("serves dashboard summary through the shared http client", async () => {
    const summary = await firstValueFrom(dashboardApi.getDashboardSummary());
    expect(summary.kpis.length).toBeGreaterThan(0);
    expect(summary.recentIncidents.length).toBeGreaterThan(0);
  });

  it("serves incidents through the mock interceptor stack", async () => {
    const incidents = await firstValueFrom(incidentApi.getIncidents());
    expect(incidents.some((incident) => incident.status === "ESCALATED")).toBeTrue();
  });
});
