// src/app/core/config/app-config.service.ts

import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable } from "rxjs";
import { tap } from "rxjs/operators";

interface AppConfig {
  features: Record<string, boolean>;
  ui: {
    theme: string;
    dateFormat: string;
    timezone: string;
    itemsPerPage: number;
  };
  sla: {
    warningThreshold: number;
    criticalThreshold: number;
  };
  departments: {
    allowCrossDepartmentView: boolean;
    defaultDepartment: string;
  };
  attachments: {
    maxFileSize: number;
    allowedTypes: string[];
    maxFilesPerUpload: number;
  };
}

@Injectable({ providedIn: "root" })
export class AppConfigService {
  private readonly http = inject(HttpClient);
  private readonly configSubject = new BehaviorSubject<AppConfig | null>(null);

  readonly config$ = this.configSubject.asObservable();

  loadConfig(): Observable<AppConfig> {
    return this.http
      .get<AppConfig>("/api/config")
      .pipe(tap((config) => this.configSubject.next(config)));
  }

  getConfig(): AppConfig | null {
    return this.configSubject.value;
  }

  isFeatureEnabled(feature: string): boolean {
    return this.configSubject.value?.features[feature] ?? false;
  }

  getUiConfig() {
    return this.configSubject.value?.ui;
  }
}
