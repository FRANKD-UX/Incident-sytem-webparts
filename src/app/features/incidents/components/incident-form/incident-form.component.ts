import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
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
    <div class="create-page">
      <div class="page-header">
        <div>
          <h1>Create incident</h1>
          <p class="subtitle">Route the work to the right department from the start.</p>
        </div>
        <button class="btn btn-secondary" type="button" (click)="backToList()">
          Back to incidents
        </button>
      </div>

      <div class="hero card">
        <div class="hero__left">
          <div class="hero__tag">Workflow intake</div>
          <h2>Choose the operational path</h2>
          <p>
            Support logs account changes, fault escalations, or maintenance notices.
            The form captures evidence and the chain is derived from the selected path.
          </p>
        </div>

        <div class="hero__right">
          <div class="quick-grid">
            @for (mode of flowOptions; track mode.value) {
              <button
                type="button"
                class="path-card"
                [class.active]="flowType === mode.value"
                (click)="setFlowType(mode.value)"
              >
                <div class="path-card__top">
                  <strong>{{ mode.label }}</strong>
                  <span class="path-badge">{{ mode.short }}</span>
                </div>
                <span>{{ mode.description }}</span>
              </button>
            }
          </div>
        </div>
      </div>

      <form class="form card" [formGroup]="form" (ngSubmit)="submit()">
        <section class="section">
          <div class="section__header">
            <h3>Incident details</h3>
            <span class="section__note">Required fields first</span>
          </div>

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

            <label>
              <span>Customer / site name</span>
              <input formControlName="customerName" type="text" placeholder="Customer name" />
            </label>

            <label>
              <span>Reference number</span>
              <input formControlName="referenceNumber" type="text" placeholder="Account / fibre ref" />
            </label>

            <label class="full">
              <span>Description</span>
              <textarea
                formControlName="description"
                rows="4"
                placeholder="Describe the issue, maintenance, or request"
              ></textarea>
            </label>
          </div>
        </section>

        @if (flowType === "SUPPORT_TO_ACCOUNTS") {
          <section class="section">
            <div class="section__header">
              <h3>Support → Accounts</h3>
              <span class="section__note">Billing and account changes</span>
            </div>

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
                  rows="4"
                  placeholder="Wrong user ref, debit date change, billing correction, etc."
                ></textarea>
              </label>
            </div>
          </section>
        }

        @if (flowType === "SUPPORT_TO_OPERATIONS") {
          <section class="section">
            <div class="section__header">
              <h3>Support → Operations</h3>
              <span class="section__note">Fault escalation with evidence</span>
            </div>

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
                <span>First-line evidence</span>
                <textarea
                  formControlName="firstLineEvidence"
                  rows="4"
                  placeholder="What Support checked before escalation"
                ></textarea>
              </label>

              <label class="full">
                <span>Customer consent</span>
                <div class="checkbox-row">
                  <input formControlName="customerConsent" type="checkbox" />
                  <span>Customer agreed to escalation and technician booking</span>
                </div>
              </label>
            </div>

            <div class="sub-card">
              <div class="sub-card__header">
                <strong>First-line checks</strong>
                <span>Tick what was completed before sending to Operations</span>
              </div>

              <div class="check-grid">
                @for (check of firstLineChecks; track check.key) {
                  <label class="check-item">
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

            <div class="sub-card">
              <div class="sub-card__header">
                <strong>Evidence uploads</strong>
                <span>Logs, screenshots, or call notes</span>
              </div>

              <input type="file" multiple (change)="onFilesSelected($event)" />
              @if (selectedFiles.length) {
                <div class="chip-list">
                  @for (file of selectedFiles; track file) {
                    <span class="chip">{{ file }}</span>
                  }
                </div>
              }
            </div>
          </section>
        }

        @if (flowType === "OPERATIONS_TO_SUPPORT") {
          <section class="section">
            <div class="section__header">
              <h3>Operations → Support</h3>
              <span class="section__note">Maintenance notice / call-centre brief</span>
            </div>

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
                  rows="4"
                  placeholder="What Support should tell callers"
                ></textarea>
              </label>
            </div>

            <div class="sub-card">
              <div class="sub-card__header">
                <strong>Maintenance briefing checks</strong>
                <span>Record what Operations has prepared</span>
              </div>

              <div class="check-grid">
                @for (check of maintenanceChecks; track check.key) {
                  <label class="check-item">
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

        @if (errorMessage) {
          <div class="error-banner">{{ errorMessage }}</div>
        }

        <div class="actions">
          <button type="button" class="btn btn-secondary" (click)="backToList()">Cancel</button>
          <button type="submit" class="btn btn-primary" [disabled]="submitting">
            {{ submitting ? "Creating..." : "Create incident" }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      .create-page {
        display: grid;
        gap: 16px;
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        align-items: flex-start;
      }

      .subtitle {
        color: var(--muted);
        margin-top: 4px;
      }

      .hero {
        display: grid;
        grid-template-columns: 1.1fr 1fr;
        gap: 18px;
        padding: 18px;
      }

      .hero__tag {
        display: inline-flex;
        align-items: center;
        padding: 5px 10px;
        border-radius: 999px;
        background: rgba(47, 111, 237, 0.12);
        color: #2f6fed;
        font-size: 0.78rem;
        font-weight: 700;
        margin-bottom: 10px;
      }

      .hero h2 {
        margin: 0 0 8px;
        font-size: 1.4rem;
      }

      .hero p {
        margin: 0;
        color: var(--muted);
        line-height: 1.5;
      }

      .quick-grid {
        display: grid;
        gap: 10px;
      }

      .path-card {
        width: 100%;
        text-align: left;
        border: 1px solid var(--border);
        background: white;
        border-radius: 16px;
        padding: 14px;
        display: grid;
        gap: 8px;
        cursor: pointer;
        transition: all 0.18s ease;
      }

      .path-card:hover {
        border-color: rgba(47, 111, 237, 0.3);
        box-shadow: var(--shadow-sm);
      }

      .path-card.active {
        border-color: rgba(47, 111, 237, 0.45);
        box-shadow: 0 0 0 3px rgba(47, 111, 237, 0.1);
        background: linear-gradient(180deg, #eff6ff 0%, #ffffff 100%);
      }

      .path-card__top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .path-card span {
        color: var(--muted);
        font-size: 0.9rem;
      }

      .path-badge {
        padding: 4px 8px;
        border-radius: 999px;
        background: #eef2ff;
        color: #4338ca;
        font-size: 0.72rem !important;
        font-weight: 700;
      }

      .form {
        display: grid;
        gap: 18px;
        padding: 18px;
      }

      .section {
        display: grid;
        gap: 14px;
        padding-bottom: 6px;
        border-bottom: 1px solid var(--border);
      }

      .section:last-of-type {
        border-bottom: 0;
      }

      .section__header {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        align-items: baseline;
      }

      .section__header h3 {
        margin: 0;
        font-size: 1.02rem;
      }

      .section__note {
        color: var(--muted);
        font-size: 0.82rem;
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

      label span {
        color: #334155;
        font-weight: 600;
        font-size: 0.88rem;
      }

      label.full {
        grid-column: 1 / -1;
      }

      input[type="text"],
      input[type="datetime-local"],
      select,
      textarea {
        width: 100%;
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 11px 12px;
        background: white;
        outline: none;
        transition: all 0.18s ease;
      }

      input:focus,
      select:focus,
      textarea:focus {
        border-color: rgba(47, 111, 237, 0.5);
        box-shadow: 0 0 0 4px rgba(47, 111, 237, 0.08);
      }

      textarea {
        resize: vertical;
      }

      .checkbox-row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px;
        border: 1px solid var(--border);
        border-radius: 12px;
        background: white;
      }

      .sub-card {
        display: grid;
        gap: 12px;
        padding: 14px;
        border: 1px solid var(--border);
        border-radius: 16px;
        background: #f8fafc;
      }

      .sub-card__header {
        display: grid;
        gap: 4px;
      }

      .sub-card__header strong {
        font-size: 0.95rem;
      }

      .sub-card__header span {
        color: var(--muted);
        font-size: 0.84rem;
      }

      .check-grid {
        display: grid;
        gap: 10px;
      }

      .check-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        background: white;
      }

      .chip-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .chip {
        display: inline-flex;
        align-items: center;
        padding: 6px 10px;
        border-radius: 999px;
        background: white;
        border: 1px solid var(--border);
        font-size: 0.8rem;
        color: #334155;
      }

      .error-banner {
        padding: 12px 14px;
        border-radius: 12px;
        background: #fef2f2;
        border: 1px solid #fecaca;
        color: #991b1b;
      }

      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
      }

      @media (max-width: 1100px) {
        .hero {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 900px) {
        .grid {
          grid-template-columns: 1fr;
        }

        .page-header {
          flex-direction: column;
        }

        .section__header {
          flex-direction: column;
          align-items: flex-start;
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
      short: "A",
      label: "Support → Accounts",
      description: "Wrong ref, debit date change, billing correction, account edits.",
    },
    {
      value: "SUPPORT_TO_OPERATIONS" as IntakeFlow,
      short: "O",
      label: "Support → Operations",
      description: "Faults after first-line checks and customer consent.",
    },
    {
      value: "OPERATIONS_TO_SUPPORT" as IntakeFlow,
      short: "M",
      label: "Operations → Support",
      description: "Maintenance notice so Support can brief callers.",
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

    this.incidentApi.createIncident(this.buildPayload(now) as Partial<Incident>).subscribe({
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

    Object.values(controls).forEach((control) => control.updateValueAndValidity({ emitEvent: false }));
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
        flowType: mode,
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
        createdFrom: "incident-create-workspace",
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
