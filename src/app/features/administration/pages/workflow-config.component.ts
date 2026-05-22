// src/app/features/administration/pages/workflow-config.component.ts

import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { WorkflowApiService } from "../../../api/workflow-api.service";
import {
  DepartmentChain,
  ChainStep,
} from "../../../shared/models/incident.model";
import { Department } from "../../../shared/models/user.model";
import { LoadingStateComponent } from "../../../shared/components/loading-state/loading-state.component";
import { EmptyStateComponent } from "../../../shared/components/empty-state/empty-state.component";

@Component({
  selector: "app-workflow-config",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LoadingStateComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="workflow-config">
      <div class="page-header">
        <div>
          <h1>Workflow Configuration</h1>
          <p class="subtitle">Manage department chains and transition rules</p>
        </div>
        <button class="btn btn-primary" (click)="createNewChain()">
          <span class="material-icons">add</span>
          New Chain
        </button>
      </div>

      @if (loading()) {
        <app-loading-state message="Loading workflows..." />
      } @else if (chains().length === 0) {
        <app-empty-state
          icon="account_tree"
          title="No workflow chains"
          description="Define department chains for incident types"
          actionLabel="Create First Chain"
          (action)="createNewChain()"
        />
      } @else {
        <div class="chains-grid">
          @for (chain of chains(); track chain.id) {
            <div class="chain-card">
              <div class="chain-header">
                <div>
                  <h3>{{ chain.name }}</h3>
                  <div class="chain-meta">
                    <span>{{ chain.steps.length }} steps</span>
                    <span>{{
                      chain.allowParallel ? "Parallel" : "Sequential"
                    }}</span>
                    <span>{{
                      chain.requireStrictOrder ? "Strict Order" : "Flexible"
                    }}</span>
                  </div>
                </div>
                <div class="chain-actions">
                  <button
                    class="btn btn-secondary btn-sm"
                    (click)="editChain(chain)"
                  >
                    <span class="material-icons">edit</span>
                  </button>
                  <button
                    class="btn btn-secondary btn-sm"
                    (click)="deleteChain(chain)"
                  >
                    <span class="material-icons">delete</span>
                  </button>
                </div>
              </div>

              <!-- Chain Visualization -->
              <div class="chain-visualization">
                @for (
                  step of chain.steps;
                  track step.order;
                  let isLast = $last
                ) {
                  <div class="chain-step">
                    <div class="step-node" [class.optional]="step.isOptional">
                      <span class="step-number">{{ step.order }}</span>
                      <div class="step-info">
                        <strong>{{ step.department.name }}</strong>
                        @if (step.sla) {
                          <span class="step-sla">
                            Response: {{ step.sla.responseTime }}m | Resolution:
                            {{ step.sla.resolutionTime }}m
                          </span>
                        }
                      </div>
                    </div>
                    @if (!isLast) {
                      <div class="step-connector">
                        <span class="material-icons">arrow_forward</span>
                      </div>
                    }
                  </div>
                }
              </div>

              <!-- Checklist Summary -->
              <div class="chain-checklist-summary">
                <h4>Checklists</h4>
                @for (step of chain.steps; track step.order) {
                  <div class="step-checklist">
                    <span class="department-label">{{
                      step.department.code
                    }}</span>
                    <span>{{ step.checklist?.items?.length || 0 }} items</span>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styleUrls: ["./workflow-config.component.scss"],
})
export class WorkflowConfigComponent implements OnInit {
  private readonly workflowApi = inject(WorkflowApiService);
  private readonly fb = inject(FormBuilder);

  chains = signal<DepartmentChain[]>([]);
  departments = signal<Department[]>([]);
  loading = signal(false);
  editingChain = signal<DepartmentChain | null>(null);

  chainForm = this.fb.group({
    name: ["", Validators.required],
    allowParallel: [false],
    requireStrictOrder: [true],
    steps: this.fb.array([]),
  });

  ngOnInit(): void {
    this.loadChains();
    this.loadDepartments();
  }

  private loadChains(): void {
    this.loading.set(true);
    this.workflowApi.getDepartmentChains().subscribe({
      next: (chains) => {
        this.chains.set(chains);
        this.loading.set(false);
      },
      error: (err) => {
        console.error("Failed to load chains:", err);
        this.loading.set(false);
      },
    });
  }

  private loadDepartments(): void {
    this.workflowApi.getDepartments().subscribe({
      next: (departments) => {
        this.departments.set(departments);
      },
    });
  }

  createNewChain(): void {
    // Open chain creation modal/form
    this.editingChain.set({
      id: "",
      name: "New Chain",
      steps: [],
      allowParallel: false,
      requireStrictOrder: true,
    });
  }

  editChain(chain: DepartmentChain): void {
    this.editingChain.set(chain);
  }

  deleteChain(chain: DepartmentChain): void {
    if (confirm(`Are you sure you want to delete "${chain.name}"?`)) {
      this.workflowApi.deleteDepartmentChain(chain.id).subscribe({
        next: () => this.loadChains(),
        error: (err) => console.error("Failed to delete chain:", err),
      });
    }
  }
}
