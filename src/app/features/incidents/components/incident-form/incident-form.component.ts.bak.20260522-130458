import { CommonModule } from "@angular/common";
import {
  Component,
  OnInit,
  inject,
} from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { IncidentApiService } from "../../../../api/incident-api.service";
import { AuthService } from "../../../../core/auth/auth.service";
import { Incident, IncidentType } from "../../../../shared/models/incident.model";
import { Department } from "../../../../shared/models/user.model";

type IntakeFlow =
  | "SUPPORT_TO_ACCOUNTS"
  | "SUPPORT_TO_OPERATIONS"
  | "OPERATIONS_TO_SUPPORT";

@Component({
  selector: "app-incident-form",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="incident-create-page">
      <div class="page-header">
        <div>
          <h1>Create incident</h1>
          <p class="subtitle">
            Support, Accounts, and Operations intake in one workflow.
          </p>
        </div>

        <div class="page-actions">
          <button type="button" class="btn btn-secondary" (click)="backToList()">
            Back to incidents
          </button>
        </div>
      </div>

      <form class="incident-form card" [formGroup]="form" (ngSubmit)="submit()">
        <section class="section">
          <h2>Choose the workflow</h2>
          <div class="mode-grid">
            @for (mode of flowOptions; track mode.value) {
              <button
                type="button"
                class="mode-card"
                [class.active]="flowType === mode.value"
                (click)="setFlowType(mode.value)"
              >
                <strong>{{ mode.label }}</strong>
                <span>{{ mode.description }}</span>
              </button>
            }
          </div>
        </section>

        <section class="section">
          <h2>Incident details</h2>
          <div class="grid">
            <label>
              <span>Title</span>
              <input formControlName="title" type="text" placeholder="Short summary" />
            </label>

            <label>
              <span>Priority</span>
              <select formControlName="priority">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </label>

            <label class="full">
              <span>Description</span>
              <textarea
                formControlName="description"
                rows="4"
                placeholder="Describe the issue or maintenance notice"
              ></textarea>
            </label>

            <label>
              <span>Customer name</span>
              <input
                formControlName="customerName"
                type="text"
                placeholder="Customer / business name"
              />
            </label>

            <label>
              <span>Reference number</span>
              <input
                formControlName="referenceNumber"
                type="text"
                placeholder="Account / fibre reference"
              />
            </label>
          </div>
        </section>

        @if (flowType === "SUPPORT_TO_ACCOUNTS") {
          <section class="section">
            <h2>Support → Accounts</h2>
            <div class="grid">
              <label>
                <span>Issue type</span>
                <select formControlName="issueType">
                  @for (option of accountsIssueOptions; track option) {
                    <option [value]="option">{{ option }}</option>
                  }
                </select>
              </label>

              <label class="full">
                <span>Requested change</span>
                <textarea
                  formControlName="accountChange"
                  rows="3"
                  placeholder="Wrong user ref, debit date change, billing correction, etc."
                ></textarea>
              </label>
            </div>
          </section>
        }

        @if (flowType === "SUPPORT_TO_OPERATIONS") {
          <section class="section">
            <h2>Support → Operations</h2>
            <div class="grid">
              <label>
                <span>Issue type</span>
                <select formControlName="issueType">
                  @for (option of operationsIssueOptions; track option) {
                    <option [value]="option">{{ option }}</option>
                  }
                </select>
              </label>

              <label class="full">
                <span>First-line evidence notes</span>
                <textarea
                  formControlName="firstLineEvidence"
                  rows="3"
                  placeholder="What Support checked before escalation"
                ></textarea>
              </label>

              <label class="full">
                <span>Customer consent</span>
                <div class="checkbox-row">
                  <input formControlName="customerConsent" type="checkbox" />
                  <span>Customer agreed to escalation / technician booking</span>
                </div>
              </label>
            </div>

            <div class="checklist-panel">
              <h3>First-line checks</h3>
              <div class="checklist-options">
                @for (check of firstLineChecks; track check.key) {
                  <label class="check-option">
                    <input
                      type="checkbox"
                      [checked]="isFirstLineCheckSelected(check.key)"
                      (change)="toggleFirstLineCheck(check.key, $event)"
                    />
                    <span>{{ check.label }}</span>
                  </label>
                }
              </div>
            </div>

            <div class="upload-panel">
              <h3>Evidence files</h3>
              <input type="file" multiple (change)="onFilesSelected($event)" />
              @if (selectedFiles.length) {
                <div class="file-chip-list">
                  @for (file of selectedFiles; track file) {
                    <span class="file-chip">{{ file }}</span>
                  }
                </div>
              }
            </div>
          </section>
        }

        @if (flowType === "OPERATIONS_TO_SUPPORT") {
          <section class="section">
            <h2>Operations → Support maintenance notice</h2>
            <div class="grid">
              <label>
                <span>Site name</span>
                <input formControlName="siteName" type="text" placeholder="Site / area affected" />
              </label>

              <label>
                <span>Maintenance start</span>
                <input formControlName="maintenanceStart" type="datetime-local" />
              </label>

              <label>
                <span>Maintenance end</span>
                <input formControlName="maintenanceEnd" type="datetime-local" />
              </label>

              <label class="full">
                <span>Client impact</span>
                <textarea
                  formControlName="maintenanceImpact"
                  rows="3"
                  placeholder="What Support should tell callers"
                ></textarea>
              </label>
            </div>

            <div class="checklist-panel">
              <h3>Maintenance briefing checks</h3>
              <div class="checklist-options">
                @for (check of maintenanceChecks; track check.key) {
                  <label class="check-option">
                    <input
                      type="checkbox"
                      [checked]="isMaintenanceCheckSelected(check.key)"
                      (change)="toggleMaintenanceCheck(check.key, $event)"
                    />
                    <span>{{ check.label }}</span>
                  </label>
                }
              </div>
            </div>
          </section>
        }

        <div class="error-banner" *ngIf="errorMessage">
          {{ errorMessage }}
        </div>

        <div class="actions">
          <button type="button" class="btn btn-secondary" (click)="backToList()">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary" [disabled]="submitting">
            {{ submitting ? "Creating..." : "Create incident" }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      .incident-create-page {
        display: grid;
        gap: 16px;
      }
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 16px;
      }
      .subtitle {
        color: var(--text-secondary);
        margin-top: 4px;
      }
      .incident-form {
        display: grid;
        gap: 20px;
      }
      .section {
        display: grid;
        gap: 14px;
        padding-bottom: 4px;
        border-bottom: 1px solid var(--border-color);
      }
      .section:last-of-type {
        border-bottom: 0;
      }
      .section h2 {
        margin: 0;
        font-size: 1.05rem;
      }
      .mode-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
      }
      .mode-card {
        text-align: left;
        border: 1px solid var(--border-color);
        background: white;
        border-radius: 14px;
        padding: 14px;
        display: grid;
        gap: 6px;
        cursor: pointer;
      }
      .mode-card.active {
        border-color: #3b82f6;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.08);
      }
      .mode-card span {
        color: var(--text-secondary);
        font-size: 0.875rem;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 14px;
      }
      label {
        display: grid;
        gap: 6px;
      }
      label.full {
        grid-column: 1 / -1;
      }
      input[type="text"],
      input[type="datetime-local"],
      select,
      textarea {
        width: 100%;
        border: 1px solid var(--border-color);
        border-radius: 10px;
        padding: 10px 12px;
        font: inherit;
        background: white;
      }
      textarea {
        resize: vertical;
      }
      .checkbox-row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        border: 1px solid var(--border-color);
        border-radius: 10px;
        background: white;
      }
      .checklist-panel,
      .upload-panel {
        display: grid;
        gap: 10px;
        padding: 14px;
        border: 1px solid var(--border-color);
        border-radius: 14px;
        background: #f8fafc;
      }
      .checklist-options {
        display: grid;
        gap: 8px;
      }
      .check-option {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .file-chip-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .file-chip {
        background: white;
        border: 1px solid var(--border-color);
        border-radius: 999px;
        padding: 6px 10px;
        font-size: 0.8rem;
      }
      .error-banner {
        padding: 12px 14px;
        border-radius: 12px;
        background: #fef2f2;
        color: #991b1b;
        border: 1px solid #fecaca;
      }
      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
      }
      @media (max-width: 900px) {
        .mode-grid,
        .grid {
          grid-template-columns: 1fr;
        }
        .page-header {
          flex-direction: column;
        }
      }
    `,
  ],
})
export class IncidentFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly incidentApi = inject(IncidentApiService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  submitting = false;
  errorMessage: string | null = null;

  selectedFiles: string[] = [];
  selectedFirstLineChecks: string[] = [];
  selectedMaintenanceChecks: string[] = [];

  flowOptions = [
    {
      value: "SUPPORT_TO_ACCOUNTS" as IntakeFlow,
      label: "Support → Accounts",
      description: "Wrong reference, debit date change, billing corrections",
    },
    {
      value: "SUPPORT_TO_OPERATIONS" as IntakeFlow,
      label: "Support → Operations",
      description: "Fault escalation after first-line checks and consent",
    },
    {
      value: "OPERATIONS_TO_SUPPORT" as IntakeFlow,
      label: "Operations → Support",
      description: "Maintenance notice so Support can brief callers",
    },
  ];

  accountsIssueOptions = [
    "Wrong user reference",
    "Debit date change",
    "Billing correction",
    "Account ownership update",
    "Other account issue",
  ];

  operationsIssueOptions = [
    "No connectivity",
    "Intermittent connectivity",
    "Slow speeds",
    "ONT / router issue",
    "Line fault",
    "Other fibre issue",
  ];

  firstLineChecks = [
    { key: "ping", label: "Ping / reachability test completed" },
    { key: "reboot", label: "ONT / router power cycled" },
    { key: "lights", label: "Device lights / LOS checked" },
    { key: "customer", label: "Customer contacted and advised" },
  ];

  maintenanceChecks = [
    { key: "window", label: "Maintenance window recorded" },
    { key: "brief", label: "Support desk briefed" },
    { key: "impact", label: "Client impact understood" },
  ];

  form = this.fb.group({
    flowType: ["SUPPORT_TO_OPERATIONS" as IntakeFlow, Validators.required],
    title: ["", Validators.required],
    description: ["", Validators.required],
    priority: ["MEDIUM", Validators.required],
    customerName: ["", Validators.required],
    referenceNumber: ["", Validators.required],
    issueType: ["", Validators.required],
    accountChange: [""],
    firstLineEvidence: [""],
    customerConsent: [false],
    siteName: [""],
    maintenanceStart: [""],
    maintenanceEnd: [""],
    maintenanceImpact: [""],
  });

  ngOnInit(): void {
    this.applyValidators(this.flowType);
    this.form.controls.flowType.valueChanges.subscribe((mode) => {
      this.applyValidators((mode ?? "SUPPORT_TO_OPERATIONS") as IntakeFlow);
      this.errorMessage = null;
    });
  }

  get flowType(): IntakeFlow {
    return (this.form.controls.flowType.value ?? "SUPPORT_TO_OPERATIONS") as IntakeFlow;
  }

  submit(): void {
    this.errorMessage = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = "Complete the required fields before submitting.";
      return;
    }

    if (this.flowType === "SUPPORT_TO_OPERATIONS" && this.selectedFirstLineChecks.length === 0) {
      this.errorMessage = "At least one first-line check is required before escalation.";
      return;
    }

    if (this.flowType === "OPERATIONS_TO_SUPPORT" && this.selectedMaintenanceChecks.length === 0) {
      this.errorMessage = "Capture the maintenance briefing checks before creating the notice.";
      return;
    }

    this.submitting = true;

    const now = new Date().toISOString();
    const payload = this.buildPayload(now);

    this.incidentApi.createIncident(payload as Partial<Incident>).subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigateByUrl("/incidents");
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err?.message ?? "Failed to create incident.";
      },
    });
  }

  backToList(): void {
    this.router.navigateByUrl("/incidents");
  }

  setFlowType(mode: IntakeFlow): void {
    this.form.controls.flowType.setValue(mode);
    this.applyValidators(mode);
  }

  toggleFirstLineCheck(key: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      if (!this.selectedFirstLineChecks.includes(key)) {
        this.selectedFirstLineChecks.push(key);
      }
    } else {
      this.selectedFirstLineChecks = this.selectedFirstLineChecks.filter((item: string) => item !== key);
    }
  }

  toggleMaintenanceCheck(key: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      if (!this.selectedMaintenanceChecks.includes(key)) {
        this.selectedMaintenanceChecks.push(key);
      }
    } else {
      this.selectedMaintenanceChecks = this.selectedMaintenanceChecks.filter((item: string) => item !== key);
    }
  }

  isFirstLineCheckSelected(key: string): boolean {
    return this.selectedFirstLineChecks.includes(key);
  }

  isMaintenanceCheckSelected(key: string): boolean {
    return this.selectedMaintenanceChecks.includes(key);
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFiles = Array.from(input.files ?? []).map((file) => file.name);
  }

  private applyValidators(mode: IntakeFlow): void {
    const controls = this.form.controls;

    const clear = (control: AbstractControl) => {
      control.clearValidators();
      control.updateValueAndValidity({ emitEvent: false });
    };

    [
      controls.issueType,
      controls.accountChange,
      controls.firstLineEvidence,
      controls.customerConsent,
      controls.siteName,
      controls.maintenanceStart,
      controls.maintenanceEnd,
      controls.maintenanceImpact,
    ].forEach(clear);

    controls.issueType.setValidators([Validators.required]);

    switch (mode) {
      case "SUPPORT_TO_ACCOUNTS":
        controls.accountChange.setValidators([Validators.required]);
        break;
      case "SUPPORT_TO_OPERATIONS":
        controls.firstLineEvidence.setValidators([Validators.required]);
        controls.customerConsent.setValidators([Validators.requiredTrue]);
        break;
      case "OPERATIONS_TO_SUPPORT":
        controls.siteName.setValidators([Validators.required]);
        controls.maintenanceStart.setValidators([Validators.required]);
        controls.maintenanceEnd.setValidators([Validators.required]);
        controls.maintenanceImpact.setValidators([Validators.required]);
        break;
    }

    Object.values(controls).forEach((control) => {
      control.updateValueAndValidity({ emitEvent: false });
    });
  }

  private buildPayload(now: string): Partial<Incident> {
    const mode = this.flowType;

    const originDepartment =
      mode === "OPERATIONS_TO_SUPPORT"
        ? this.department("OPS", "Operations")
        : this.department("SUP", "Support");

    const currentDepartment =
      mode === "SUPPORT_TO_ACCOUNTS"
        ? this.department("ACC", "Accounts")
        : mode === "SUPPORT_TO_OPERATIONS"
          ? this.department("OPS", "Operations")
          : this.department("SUP", "Support");

    const flowType = mode;

    return {
      referenceNumber: this.form.controls.referenceNumber.value ?? "",
      title: this.form.controls.title.value ?? "",
      description: this.form.controls.description.value ?? "",
      priority: (this.form.controls.priority.value ?? "MEDIUM") as Incident["priority"],
      status: "OPEN" as Incident["status"],
      originDepartment,
      currentDepartment,
      createdBy: this.authService.getUser(),
      createdAt: now,
      updatedAt: now,
      tags: [mode, this.form.controls.issueType.value ?? ""]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase().replace(/\s+/g, "-")),
      customFields: {
        flowType,
        customerName: this.form.controls.customerName.value ?? "",
        issueType: this.form.controls.issueType.value ?? "",
        accountChange: this.form.controls.accountChange.value ?? "",
        firstLineEvidence: this.form.controls.firstLineEvidence.value ?? "",
        customerConsent: this.form.controls.customerConsent.value ?? false,
        firstLineChecks: [...this.selectedFirstLineChecks],
        selectedMaintenanceChecks: [...this.selectedMaintenanceChecks],
        siteName: this.form.controls.siteName.value ?? "",
        maintenanceStart: this.form.controls.maintenanceStart.value ?? "",
        maintenanceEnd: this.form.controls.maintenanceEnd.value ?? "",
        maintenanceImpact: this.form.controls.maintenanceImpact.value ?? "",
        attachments: [...this.selectedFiles],
        createdFrom: "incident-create-form",
      },
      type: this.buildType(mode),
    };
  }

  private buildType(flow: IntakeFlow): IncidentType {
    const chain = this.buildChain(flow);

    switch (flow) {
      case "SUPPORT_TO_ACCOUNTS":
        return {
          id: "TYPE-SUP-ACC",
          name: "Support to Accounts",
          code: "SUP-ACC",
          description: "Billing and account change request",
          departmentChain: chain,
          defaultChecklists: [],
          slaRules: [],
          escalationRules: [],
          isActive: true,
        };
      case "SUPPORT_TO_OPERATIONS":
        return {
          id: "TYPE-SUP-OPS",
          name: "Support to Operations",
          code: "SUP-OPS",
          description: "Fault escalation to Operations",
          departmentChain: chain,
          defaultChecklists: [],
          slaRules: [],
          escalationRules: [],
          isActive: true,
        };
      case "OPERATIONS_TO_SUPPORT":
        return {
          id: "TYPE-OPS-SUP",
          name: "Operations to Support",
          code: "OPS-SUP",
          description: "Maintenance notice / client communication",
          departmentChain: chain,
          defaultChecklists: [],
          slaRules: [],
          escalationRules: [],
          isActive: true,
        };
    }
  }

  private buildChain(flow: IntakeFlow) {
    const support = this.department("SUP", "Support");
    const accounts = this.department("ACC", "Accounts");
    const operations = this.department("OPS", "Operations");

    const step = (
      order: number,
      department: Department,
      checklistName: string,
      expectedActions: string[],
    ) => ({
      order,
      department,
      checklist: {
        id: `CL-${department.code}-${order}`,
        name: checklistName,
        departmentId: department.id,
        incidentTypeId: "TBD",
        items: [],
      },
      expectedActions,
      sla: {
        responseTime: order === 1 ? 60 : 120,
        resolutionTime: order === 1 ? 240 : 480,
        escalationPoint: order === 1 ? 120 : 240,
      },
      isOptional: false,
    });

    switch (flow) {
      case "SUPPORT_TO_ACCOUNTS":
        return {
          id: "CHAIN-SUP-ACC",
          name: "Support to Accounts",
          allowParallel: false,
          requireStrictOrder: true,
          steps: [
            step(1, support, "Support intake checklist", [
              "Verify account reference",
              "Confirm request",
              "Log support summary",
            ]),
            step(2, accounts, "Accounts resolution checklist", [
              "Validate change",
              "Apply update",
              "Confirm completion",
            ]),
          ],
        };
      case "SUPPORT_TO_OPERATIONS":
        return {
          id: "CHAIN-SUP-OPS",
          name: "Support to Operations",
          allowParallel: false,
          requireStrictOrder: true,
          steps: [
            step(1, support, "Support first-line checks", [
              "Run first-line checks",
              "Capture consent",
              "Attach evidence",
            ]),
            step(2, operations, "Operations dispatch checklist", [
              "Assign technician",
              "Book call-out",
              "Close resolution",
            ]),
          ],
        };
      case "OPERATIONS_TO_SUPPORT":
        return {
          id: "CHAIN-OPS-SUP",
          name: "Operations to Support",
          allowParallel: false,
          requireStrictOrder: true,
          steps: [
            step(1, operations, "Maintenance planning checklist", [
              "Record maintenance window",
              "Brief Support",
              "Document impact",
            ]),
            step(2, support, "Support client notice checklist", [
              "Update call centre",
              "Monitor callers",
              "Track incident notes",
            ]),
          ],
        };
    }
  }

  private department(code: "SUP" | "ACC" | "OPS", name: string): Department {
    return { id: code, name, code, isActive: true };
  }
}
