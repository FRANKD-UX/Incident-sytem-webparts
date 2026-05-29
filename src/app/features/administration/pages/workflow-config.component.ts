import { CommonModule } from "@angular/common";
import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { forkJoin } from "rxjs";
import { WorkflowConfigurationService } from "../../../api/workflow-configuration.service";
import { NotificationService } from "../../../core/services/notification.service";
import { EmptyStateComponent } from "../../../shared/components/empty-state/empty-state.component";
import { LoadingStateComponent } from "../../../shared/components/loading-state/loading-state.component";
import { ConfirmationDialogComponent } from "../../../shared/components/confirmation-dialog/confirmation-dialog.component";
import { Department } from "../../../shared/models/user.model";
import {
  WorkflowChain,
  WorkflowIncidentTypeOption,
  cloneWorkflowChain,
} from "../../../shared/models/workflow-configuration.model";
import { WorkflowChainEditorComponent } from "./workflow-chain-editor.component";
import { WorkflowChainListComponent } from "./workflow-chain-list.component";

@Component({
  selector: "app-workflow-config",
  standalone: true,
  imports: [
    CommonModule,
    LoadingStateComponent,
    EmptyStateComponent,
    ConfirmationDialogComponent,
    WorkflowChainListComponent,
    WorkflowChainEditorComponent,
  ],
  template: `
    <div class="workflow-config">
      <div class="page-header">
        <div>
          <p class="eyebrow">Administration</p>
          <h1>Workflow Configuration</h1>
          <p class="subtitle">
            Configure alert-driven chains that update the UI automatically,
            while final approval remains with the manager or CTO.
          </p>
        </div>

        <div class="page-header__actions">
          <button
            class="btn btn-secondary"
            type="button"
            [disabled]="loading() || actionInProgress()"
            (click)="refresh()"
          >
            <span class="material-icons">refresh</span>
            Refresh
          </button>
          <button
            class="btn btn-primary"
            type="button"
            [disabled]="actionInProgress()"
            (click)="createNewChain()"
          >
            <span class="material-icons">add</span>
            New Chain
          </button>
        </div>
      </div>

      @if (loading()) {
        <app-loading-state message="Loading workflow configuration..." />
      } @else {
        @if (operationError()) {
          <div class="error-banner">
            <strong>Action failed</strong>
            <p>{{ operationError() }}</p>
          </div>
        }

        @if (chains().length === 0) {
          <app-empty-state
            icon="account_tree"
            title="No workflow chains"
            description="Create the first alert-triggered chain to configure UI updates, handover steps, and final approval routing."
            actionLabel="Create First Chain"
            (action)="createNewChain()"
          />
        } @else {
          <app-workflow-chain-list
            [chains]="chains()"
            [selectedChainId]="selectedChainId()"
            (select)="openChain($event)"
            (edit)="openChain($event)"
            (disable)="disableChain($event)"
            (delete)="deleteChain($event)"
          />
        }
      }

      @if (editorVisible() && draftChain()) {
        @if (actionInProgress()) {
          <app-loading-state
            [overlay]="true"
            message="Saving workflow chain..."
          />
        }
        <app-workflow-chain-editor
          [chain]="draftChain()"
          [departments]="departments()"
          [incidentTypes]="incidentTypes()"
          [canDelete]="canDeleteSelectedChain()"
          (close)="closeEditor()"
          (saveDraftClicked)="saveDraft($event)"
          (publishClicked)="publishChain($event)"
          (disableClicked)="disableDraft($event)"
          (deleteClicked)="deleteDraft($event)"
        />
      }

      @if (deleteConfirmationChainId()) {
        <app-confirmation-dialog
          title="Delete workflow chain?"
          message="This action cannot be undone."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          (confirm)="confirmDelete()"
          (cancel)="deleteConfirmationChainId.set(null)"
        />
      }
    </div>
  `,
  styleUrls: ["./workflow-config.component.scss"],
})
export class WorkflowConfigComponent implements OnInit {
  private readonly workflowConfiguration = inject(WorkflowConfigurationService);
  private readonly notification = inject(NotificationService);

  readonly loading = signal(true);
  readonly actionInProgress = signal(false);
  readonly operationError = signal<string | null>(null);
  readonly chains = signal<WorkflowChain[]>([]);
  readonly departments = signal<Department[]>([]);
  readonly incidentTypes = signal<WorkflowIncidentTypeOption[]>([]);
  readonly editorVisible = signal(false);
  readonly selectedChainId = signal<string | null>(null);
  readonly draftChain = signal<WorkflowChain | null>(null);
  readonly deleteConfirmationChainId = signal<string | null>(null);

  readonly selectedChain = computed(
    () =>
      this.chains().find((chain) => chain.id === this.selectedChainId()) ??
      null,
  );

  readonly canDeleteSelectedChain = computed(() => {
    const draft = this.draftChain();
    return draft ? this.workflowConfiguration.canDeleteChain(draft) : false;
  });

  ngOnInit(): void {
    this.loadData();
  }

  refresh(): void {
    this.loadData(true);
  }

  createNewChain(): void {
    this.operationError.set(null);
    const draft = this.workflowConfiguration.createDraftChain();
    this.selectedChainId.set(draft.id);
    this.draftChain.set(draft);
    this.editorVisible.set(true);
  }

  openChain(chainId: string): void {
    const chain = this.chains().find((item) => item.id === chainId);
    if (!chain) {
      return;
    }

    this.operationError.set(null);
    this.selectedChainId.set(chain.id);
    this.draftChain.set(cloneWorkflowChain(chain));
    this.editorVisible.set(true);
  }

  closeEditor(): void {
    this.editorVisible.set(false);
    this.draftChain.set(null);
  }

  saveDraft(chain: WorkflowChain): void {
    this.operationError.set(null);
    this.actionInProgress.set(true);
    this.workflowConfiguration.saveDraft(chain).subscribe({
      next: (savedChain) => {
        this.commitSavedChain(savedChain);
        this.notification.success("Workflow draft saved.");
      },
      error: (error: unknown) => this.handleOperationError(error),
      complete: () => this.actionInProgress.set(false),
    });
  }

  publishChain(chain: WorkflowChain): void {
    this.operationError.set(null);
    this.actionInProgress.set(true);
    this.workflowConfiguration.publishChain(chain).subscribe({
      next: (savedChain) => {
        this.commitSavedChain(savedChain);
        this.notification.success("Workflow chain published.");
      },
      error: (error: unknown) => this.handleOperationError(error),
      complete: () => this.actionInProgress.set(false),
    });
  }

  disableDraft(chain: WorkflowChain): void {
    this.disableChain(chain.id);
  }

  deleteDraft(chain: WorkflowChain): void {
    this.deleteChain(chain.id);
  }

  disableChain(chainId: string): void {
    this.operationError.set(null);
    this.actionInProgress.set(true);
    this.workflowConfiguration.disableChain(chainId).subscribe({
      next: (savedChain) => {
        this.commitSavedChain(savedChain);
        this.notification.info("Workflow chain disabled.");
      },
      error: (error: unknown) => this.handleOperationError(error),
      complete: () => this.actionInProgress.set(false),
    });
  }

  deleteChain(chainId: string): void {
    this.deleteConfirmationChainId.set(chainId);
  }

  confirmDelete(): void {
    const chainId = this.deleteConfirmationChainId();
    if (!chainId) {
      return;
    }

    this.deleteConfirmationChainId.set(null);
    const selected = this.chains().find((chain) => chain.id === chainId);
    if (!selected) {
      return;
    }

    if (!this.workflowConfiguration.canDeleteChain(selected)) {
      this.operationError.set(
        "Published chains must be disabled before deletion.",
      );
      return;
    }

    this.operationError.set(null);
    this.actionInProgress.set(true);
    this.workflowConfiguration.deleteChain(chainId).subscribe({
      next: () => {
        this.draftChain.set(null);
        this.editorVisible.set(false);
        this.selectedChainId.set(null);
        this.chains.update((chains) =>
          chains.filter((chain) => chain.id !== chainId),
        );
        this.notification.success("Workflow chain deleted.");
      },
      error: (error: unknown) => this.handleOperationError(error),
      complete: () => this.actionInProgress.set(false),
    });
  }

  private loadData(showNotification = false): void {
    this.loading.set(true);
    this.operationError.set(null);

    forkJoin({
      chains: this.workflowConfiguration.getChains(),
      departments: this.workflowConfiguration.getDepartments(),
      incidentTypes: this.workflowConfiguration.getIncidentTypes(),
    }).subscribe({
      next: ({ chains, departments, incidentTypes }) => {
        this.chains.set(chains);
        this.departments.set(departments);
        this.incidentTypes.set(incidentTypes);
        this.loading.set(false);
        if (showNotification) {
          this.notification.info("Workflow data refreshed.");
        }
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.handleOperationError(error);
      },
    });
  }

  private loadChainsOnly(): void {
    this.workflowConfiguration.getChains().subscribe({
      next: (chains) => this.chains.set(chains),
      error: (error: unknown) => this.handleOperationError(error),
    });
  }

  private commitSavedChain(savedChain: WorkflowChain): void {
    const clonedChain = cloneWorkflowChain(savedChain);
    this.chains.update((chains) => {
      const nextChains = chains.filter((chain) => chain.id !== clonedChain.id);
      nextChains.unshift(clonedChain);
      return nextChains;
    });
    this.draftChain.set(clonedChain);
    this.selectedChainId.set(clonedChain.id);
    this.editorVisible.set(true);
  }

  private handleOperationError(error: unknown): void {
    this.actionInProgress.set(false);
    const message =
      error instanceof Error
        ? error.message
        : "Unexpected workflow configuration error.";
    this.operationError.set(message);
    this.notification.error(message);
  }
}
