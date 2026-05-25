import { CommonModule } from "@angular/common";
import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { forkJoin } from "rxjs";
import { WorkflowConfigurationService } from "../../../api/workflow-configuration.service";
import { EmptyStateComponent } from "../../../shared/components/empty-state/empty-state.component";
import { LoadingStateComponent } from "../../../shared/components/loading-state/loading-state.component";
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
            class="btn btn-primary"
            type="button"
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
    </div>
  `,
  styleUrls: ["./workflow-config.component.scss"],
})
export class WorkflowConfigComponent implements OnInit {
  private readonly workflowConfiguration = inject(WorkflowConfigurationService);

  readonly loading = signal(true);
  readonly operationError = signal<string | null>(null);
  readonly chains = signal<WorkflowChain[]>([]);
  readonly departments = signal<Department[]>([]);
  readonly incidentTypes = signal<WorkflowIncidentTypeOption[]>([]);
  readonly editorVisible = signal(false);
  readonly selectedChainId = signal<string | null>(null);
  readonly draftChain = signal<WorkflowChain | null>(null);

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
    this.workflowConfiguration.saveDraft(chain).subscribe({
      next: (savedChain) => this.commitSavedChain(savedChain),
      error: (error: unknown) => this.handleOperationError(error),
    });
  }

  publishChain(chain: WorkflowChain): void {
    this.operationError.set(null);
    this.workflowConfiguration.publishChain(chain).subscribe({
      next: (savedChain) => this.commitSavedChain(savedChain),
      error: (error: unknown) => this.handleOperationError(error),
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
    this.workflowConfiguration.disableChain(chainId).subscribe({
      next: (savedChain) => this.commitSavedChain(savedChain),
      error: (error: unknown) => this.handleOperationError(error),
    });
  }

  deleteChain(chainId: string): void {
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
    this.workflowConfiguration.deleteChain(chainId).subscribe({
      next: () => {
        this.draftChain.set(null);
        this.editorVisible.set(false);
        this.selectedChainId.set(null);
        this.chains.update((chains) =>
          chains.filter((chain) => chain.id !== chainId),
        );
      },
      error: (error: unknown) => this.handleOperationError(error),
    });
  }

  private loadData(): void {
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
    const message =
      error instanceof Error
        ? error.message
        : "Unexpected workflow configuration error.";
    this.operationError.set(message);
  }
}
