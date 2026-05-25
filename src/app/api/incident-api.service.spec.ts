import { TestBed, fakeAsync, tick } from "@angular/core/testing";
import { IncidentApiService } from "./incident-api.service";

describe("IncidentApiService", () => {
  let service: IncidentApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IncidentApiService);
  });

  it("returns paginated incidents response", fakeAsync(() => {
    let totalItems = 0;

    service.getIncidents().subscribe((response) => {
      totalItems = response.pagination.totalItems;
      expect(response.success).toBeTrue();
      expect(response.data.length).toBeGreaterThan(0);
    });

    tick(61);
    expect(totalItems).toBeGreaterThan(0);
  }));

  it("creates incident with typed defaults", fakeAsync(() => {
    let createdId = "";

    service
      .createIncident({ title: "Test incident from spec" })
      .subscribe((incident) => {
        createdId = incident.id;
        expect(incident.referenceNumber).toBeTruthy();
        expect(incident.currentDepartment.code).toBe("SUP");
      });

    tick(121);
    expect(createdId).toContain("INC-");
  }));
});
