import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { MockBackendService } from "./mock-backend.service";
import { Incident } from "../shared/models/incident.model";

@Injectable({ providedIn: "root" })
export class IncidentApiService {
  private readonly mock = inject(MockBackendService);

  getIncidents(): Observable<Incident[]> {
    return this.mock.getIncidents();
  }
}
