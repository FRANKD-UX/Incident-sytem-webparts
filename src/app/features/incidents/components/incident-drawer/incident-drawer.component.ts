// src/app/features/incidents/components/incident-drawer/incident-drawer.component.ts

import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  inject,
  signal,
  computed,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { forkJoin } from "rxjs";
import { Incident } from "../../../../shared/models/incident.model";
import { Checklist } from "../../../../shared/models/checklist.model";
import { Attachment } from "../../../../shared/models/attachment.model";
import { AuditEntry } from "../../../../shared/models/audit.model";
import { Escalation } from "../../../../shared/models/escalation.model";
import { SlaState } from "../../../../shared/models/sla.model";
import { IncidentApiService } from "../../../../api/incident-api.service";
import { ChecklistApiService } from "../../../../api/checklist-api.service";
import { AttachmentApiService } from "../../../../api/attachment-api.service";
import { AuditApiService } from "../../../../api/audit-api.service";
import { EscalationApiService } from "../../../../api/escalation-api.service";
import { SlaApiService } from "../../../../api/sla-api.service";
import { WorkflowApiService } from "../../../../api/workflow-api.service";
import { IncidentSummaryComponent } from "../incident-summary/incident-summary.component";
import { ChecklistPanelComponent } from "../checklist-panel/checklist-panel.component";
import { AttachmentsPanelComponent } from "../attachments-panel/attachments-panel.component";
import { AuditTimelineComponent } from "../audit-timeline/audit-timeline.component";
import { EscalationPanelComponent } from "../escalation-panel/escalation-panel.component";
import { SlaPanelComponent } from "../sla-panel/sla-panel.component";
import { LoadingStateComponent } from "../../../../shared/components/loading-state/loading-state.component";
import { WorkflowTimelineComponent } from "../workflow-timeline/workflow-timeline.component";
import { CurrentSlaSummaryComponent } from "../current-sla-summary/current-sla-summary.component";
import { ReworkHistoryComponent } from "../rework-history/rework-history.component";
import { WorkflowActionPanelComponent } from "../workflow-action-panel/workflow-action-panel.component";
import { WorkflowActionModalComponent } from "../workflow-action-modal/workflow-action-modal.component";
import { AccountsProcessingPanelComponent } from "../accounts-processing-panel/accounts-processing-panel.component";

type DetailTab =
  | "summary"
  | "checklist"
  | "attachments"
  | "audit"
  | "escalations"
  | "sla";

@Component({
  selector: "app-incident-drawer",
  standalone: true,
  imports: [
    CommonModule,
    IncidentSummaryComponent,
    ChecklistPanelComponent,
    AttachmentsPanelComponent,
    AuditTimelineComponent,
    EscalationPanelComponent,
    SlaPanelComponent,
    LoadingStateComponent,
    WorkflowTimelineComponent,
    CurrentSlaSummaryComponent,
    ReworkHistoryComponent,
    WorkflowActionPanelComponent,
    WorkflowActionModalComponent,
    AccountsProcessingPanelComponent,
  ],
  template: `
    <div class="drawer-overlay" [class.open]="isOpen" (click)="close.emit()">
      <div
        class="drawer"
        [class.open]="isOpen"
        (click)="$event.stopPropagation()"
      >
        <div class="drawer__header">
          <div>
            <div class="incident-ref">
              <span class="ref-badge">{{ incident?.referenceNumber }}</span>
              <span class="status-badge">{{ incident?.status }}</span>
            </div>
            <h2>{{ incident?.title }}</h2>
            <div *ngIf="currentDepartmentName()" class="current-step">
              Current department: <strong>{{ currentDepartmentName() }}</strong>
            </div>
          </div>

          <div class="drawer__header-actions">
            <button class="btn-icon" (click)="refresh.emit()">
              <span class="material-icons">refresh</span>
            </button>
            <button class="btn-icon" (click)="close.emit()">
              <span class="material-icons">close</span>
            </button>
          </div>
        </div>

        <div class="drawer__tabs">
          @for (tab of tabs; track tab.id) {
            <button
              class="tab"
              [class.active]="activeTab === tab.id"
              (click)="setActiveTab(tab.id)"
            >
              <span class="material-icons">{{ tab.icon }}</span>
              <span>{{ tab.label }}</span>
            </button>
          }
        </div>

        <div class="drawer__content">
          @if (loading()) {
            <app-loading-state message="Loading incident details..." />
          } @else {
            @switch (activeTab) {
              @case ("summary") {
                <app-incident-summary [incident]="incident!" />

                <app-workflow-timeline
                  [chain]="chain()"
                  [currentDepartmentCode]="
                    incident?.currentDepartment?.code ?? ''
                  "
                />

                <div class="step-cards" *ngIf="currentStepActions().length">
                  <div class="step-actions-card">
                    <div class="step-actions-card__title">
                      Current step actions
                    </div>
                    <div class="step-actions-card__list">
                      @for (action of currentStepActions(); track action) {
                        <div class="step-actions-card__item">{{ action }}</div>
                      }
                    </div>
                  </div>

                  <div class="step-actions-card step-actions-card--accent">
                    <div class="step-actions-card__title">
                      Operational status
                    </div>
                    <div class="step-actions-card__list">
                      <div class="step-actions-card__item">
                        Checklist gate controls movement
                      </div>
                      <div class="step-actions-card__item">
                        Send-back is workflow-approved only
                      </div>
                      <div class="step-actions-card__item">
                        Completed steps remain historical
                      </div>
                    </div>
                  </div>
                </div>
              }
              @case ("checklist") {
                <app-checklist-panel
                  [incidentId]="incident!.id"
                  [checklist]="checklist()"
                  [departmentName]="currentDepartmentName()"
                  [readOnly]="
                    incident?.status === 'RESOLVED' ||
                    incident?.status === 'CLOSED'
                  "
                  (checklistUpdated)="loadChecklist()"
                />
                <div class="drawer-actions">
                  <button
                    class="btn btn-secondary"
                    type="button"
                    (click)="sendBack()"
                  >
                    Send back
                  </button>
                  <button
                    class="btn btn-primary"
                    type="button"
                    (click)="completeStep()"
                  >
                    Complete step
                  </button>
                </div>
              }
              @case ("attachments") {
                <app-attachments-panel
                  [incidentId]="incident!.id"
                  [attachments]="attachments()"
                  (attachmentsUpdated)="loadAttachments()"
                />
              }
              @case ("audit") {
                <app-audit-timeline [entries]="auditTrail()" />
              }
              @case ("escalations") {
                <app-escalation-panel
                  [incidentId]="incident!.id"
                  [escalations]="escalations()"
                />
              }
              @case ("sla") {
                <app-sla-panel [slaState]="slaState()" />
              }
            }
          }
        </div>
      </div>
    </div>
  `,
  styleUrls: ["./incident-drawer.component.scss"],
})
export class IncidentDrawerComponent implements OnInit, OnChanges {
  @Input({ required: true }) incident!: Incident | null;
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() refresh = new EventEmitter<void>();

  private readonly incidentApi = inject(IncidentApiService);
  private readonly checklistApi = inject(ChecklistApiService);
  private readonly attachmentApi = inject(AttachmentApiService);
  private readonly auditApi = inject(AuditApiService);
  private readonly escalationApi = inject(EscalationApiService);
  private readonly slaApi = inject(SlaApiService);
  private readonly workflowApi = inject(WorkflowApiService);

  activeTab: DetailTab = "summary";
  loading = signal(false);
  chain = signal<Incident["type"]["departmentChain"] | null>(null);
  checklist = signal<Checklist | null>(null);
  attachments = signal<Attachment[]>([]);
  auditTrail = signal<AuditEntry[]>([]);
  escalations = signal<Escalation[]>([]);
  slaState = signal<SlaState | null>(null);
  workflowModalOpen = signal(false);
  selectedWorkflowAction = signal("");

  currentDepartmentName = computed(
    () => this.incident?.currentDepartment?.name ?? "",
  );

  currentStepActions = computed(() => {
    const chain = this.chain();
    const dept = this.incident?.currentDepartment?.code;
    if (!chain || !dept) return [];
    const step = chain.steps.find((s) => s.department.code === dept);
    return step?.expectedActions ?? [];
  });

  tabs = [
    { id: "summary" as DetailTab, label: "Summary", icon: "info" },
    { id: "checklist" as DetailTab, label: "Checklist", icon: "checklist" },
    {
      id: "attachments" as DetailTab,
      label: "Attachments",
      icon: "attach_file",
    },
    { id: "audit" as DetailTab, label: "Audit Trail", icon: "timeline" },
    { id: "escalations" as DetailTab, label: "Escalations", icon: "warning" },
    { id: "sla" as DetailTab, label: "SLA", icon: "timer" },
  ];

  ngOnInit(): void {
    if (this.incident) this.loadDetailData();
  }

  ngOnChanges(): void {
    if (this.incident && this.isOpen) this.loadDetailData();
  }

  private loadDetailData(): void {
    if (!this.incident) return;
    this.loading.set(true);

    forkJoin({
      chain: this.incidentApi.getIncidentChain(this.incident.id),
      checklist: this.checklistApi.getChecklist(this.incident.id),
      attachments: this.attachmentApi.getAttachments(this.incident.id),
      auditTrail: this.auditApi.getAuditTrail(this.incident.id),
      escalations: this.escalationApi.getEscalations(this.incident.id),
      slaState: this.slaApi.getSlaState(this.incident.id),
    }).subscribe({
      next: ({
        chain,
        checklist,
        attachments,
        auditTrail,
        escalations,
        slaState,
      }) => {
        this.chain.set(chain);
        this.checklist.set(checklist);
        this.attachments.set(attachments);
        this.auditTrail.set(auditTrail);
        this.escalations.set(escalations);
        this.slaState.set(slaState);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  loadChecklist(): void {
    this.checklistApi
      .getChecklist(this.incident!.id)
      .subscribe((checklist) => this.checklist.set(checklist));
  }

  loadAttachments(): void {
    this.attachmentApi
      .getAttachments(this.incident!.id)
      .subscribe((attachments) => this.attachments.set(attachments));
  }

  private loadAuditTrail(): void {
    this.auditApi
      .getAuditTrail(this.incident!.id)
      .subscribe((entries) => this.auditTrail.set(entries));
  }

  private loadEscalations(): void {
    this.escalationApi
      .getEscalations(this.incident!.id)
      .subscribe((escalations) => this.escalations.set(escalations));
  }

  private loadSlaState(): void {
    this.slaApi
      .getSlaState(this.incident!.id)
      .subscribe((sla) => this.slaState.set(sla));
  }

  completeStep(): void {
    if (!this.incident) return;

    this.workflowApi.completeCurrentStep(this.incident.id).subscribe({
      next: () => this.refresh.emit(),
      error: () => this.refresh.emit(),
    });
  }

  sendBack(): void {
    if (!this.incident) return;
    const reason = prompt("Reason for send back:", "Rework required");
    if (!reason) return;

    this.workflowApi.sendBack(this.incident.id, reason).subscribe({
      next: () => this.refresh.emit(),
      error: () => this.refresh.emit(),
    });
  }

  setActiveTab(tab: DetailTab): void {
    this.activeTab = tab;
  }

  handleWorkflowAction(action: string): void {
    this.selectedWorkflowAction.set(action);
    this.workflowModalOpen.set(true);
  }

  closeWorkflowModal(): void {
    this.workflowModalOpen.set(false);
    this.selectedWorkflowAction.set("");
  }

  confirmWorkflowAction(payload: any): void {
    console.log("Workflow payload:", payload);

    this.workflowModalOpen.set(false);
    this.selectedWorkflowAction.set("");

    alert("Workflow action captured successfully.");
  }
}
