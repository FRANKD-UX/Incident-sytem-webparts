import { TestBed } from "@angular/core/testing";
import { WorkflowApiService } from "./workflow-api.service";

describe("WorkflowApiService", () => {
  let service: WorkflowApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkflowApiService);
  });

  it("moves an incident between departments via workflow service", () => {
    let movedDepartment = "";

    service
      .moveIncident("INC-1001", {
        fromDepartmentCode: "OPS",
        toDepartmentCode: "SUP",
      })
      .subscribe((incident) => {
        movedDepartment = incident?.currentDepartment.code ?? "";
      });

    expect(movedDepartment).toBe("SUP");
  });

  it("sendBack returns workflow state in support department", () => {
    let currentDepartment = "";

    service.sendBack("INC-1002", "Needs support review").subscribe((state) => {
      currentDepartment = state?.currentDepartment ?? "";
    });

    expect(currentDepartment).toBe("Support");
  });
});
