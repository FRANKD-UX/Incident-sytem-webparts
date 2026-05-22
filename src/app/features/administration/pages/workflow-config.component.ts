import { CommonModule } from "@angular/common";
import { Component, OnInit, inject, signal } from "@angular/core";
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { WorkflowApiService } from "../../../api/workflow-api.service";
import { EmptyStateComponent } from "../../../shared/components/empty-state/empty-state.component";
import { DepartmentChain } from "../../../shared/models/incident.model";
import { Department } from "../../../shared/models/user.model";

@Component({
  selector: "app-workflow-config",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, EmptyStateComponent],
  template: `
    <section class="workflow-config">
      <header class="workflow-config__header">
        <div>
          <h1>Workflow Configuration</h1>
          <p>Manage department workflow chains for incidents.</p>
        </div>
        <button type="button" (click)="startNewChain()">New Chain</button>
      </header>

      @if (loading()) {
        <p>Loading workflow chains...</p>
      } @else if (chains().length === 0) {
        <app-empty-state
          icon="account_tree"
          title="No workflow chains"
          description="Create your first chain to route incidents."
          actionLabel="Create Chain"
          (action)="startNewChain()"
        />
      } @else {
        <div class="chains-grid">
          @for (chain of chains(); track chain.id) {
            <article class="chain-card">
              <header class="chain-header">
                <h3>{{ chain.name }}</h3>
                <div class="chain-meta">
                  <span>{{ chain.steps.length }} steps</span>
                  <span>{{ chain.allowParallel ? "Parallel" : "Sequential" }}</span>
                  <span>{{ chain.requireStrictOrder ? "Strict" : "Flexible" }}</span>
                </div>
              </header>

              <div class="chain-visualization">
                @for (step of chain.steps; track step.order; let last = $last) {
                  <div class="step-node" [class.optional]="step.isOptional">
                    <div class="step-circle">{{ step.order + 1 }}</div>
                    <strong>{{ step.department.name }}</strong>
                    <small>Resp: {{ step.sla.responseTime }}m · Res: {{ step.sla.resolutionTime }}m</small>
                    <small>Checklist: {{ step.checklist.items.length }} item(s)</small>
                  </div>
                  @if (!last) {
                    <span class="step-connector material-icons">arrow_forward</span>
                  }
                }
              </div>
            </article>
          }
        </div>
      }

      @if (editingChain()) {
        <form class="chain-form" [formGroup]="chainForm">
          <h2>{{ editingChain() === 'new' ? 'Create Chain' : 'Edit Chain' }}</h2>
          <label>
            Name
            <input formControlName="name" />
          </label>
          <label>
            <input type="checkbox" formControlName="allowParallel" />
            Allow Parallel Processing
          </label>
          <label>
            <input type="checkbox" formControlName="requireStrictOrder" />
            Require Strict Order
          </label>
          <div formArrayName="steps">
            @for (step of steps.controls; track $index) {
              <div [formGroupName]="$index" class="step-form-row">
                <input formControlName="departmentId" placeholder="Department ID" />
                <input type="number" formControlName="responseTime" placeholder="Response (min)" />
                <input type="number" formControlName="resolutionTime" placeholder="Resolution (min)" />
              </div>
            }
          </div>
        </form>
      }
    </section>
  `,
  styles: [
    `
      .workflow-config {
        display: grid;
        gap: 16px;
      }
      .workflow-config__header {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
      }
      .workflow-config__header h1,
      .workflow-config__header p {
        margin: 0;
      }
      .workflow-config__header button {
        height: fit-content;
        border: 1px solid var(--border-color, #d1d5db);
        border-radius: 8px;
        background: var(--bg-primary, #ffffff);
        padding: 8px 12px;
        cursor: pointer;
      }
      .chains-grid {
        display: grid;
        gap: 16px;
      }
      .chain-card {
        border: 1px solid var(--border-color, #e5e7eb);
        border-radius: 10px;
        background: var(--bg-primary, #ffffff);
        padding: 16px;
      }
      .chain-header {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        flex-wrap: wrap;
      }
      .chain-header h3 {
        margin: 0;
      }
      .chain-meta {
        display: flex;
        gap: 8px;
        color: var(--text-secondary, #6b7280);
        font-size: 0.8rem;
      }
      .chain-visualization {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 16px;
        overflow-x: auto;
      }
      .step-node {
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 120px;
        gap: 4px;
      }
      .step-node.optional {
        opacity: 0.6;
      }
      .step-circle {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #3b82f6;
        color: white;
        font-weight: 600;
      }
      .step-connector {
        color: var(--text-secondary, #6b7280);
      }
      .chain-form {
        border: 1px solid var(--border-color, #e5e7eb);
        border-radius: 10px;
        background: var(--bg-primary, #ffffff);
        padding: 16px;
        display: grid;
        gap: 12px;
      }
      .chain-form h2 {
        margin: 0;
      }
      .chain-form label {
        display: grid;
        gap: 6px;
      }
      .step-form-row {
        display: grid;
        gap: 8px;
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
      .chain-form input {
        border: 1px solid var(--border-color, #d1d5db);
        border-radius: 8px;
        padding: 8px 10px;
      }
    `,
  ],
})
export class WorkflowConfigComponent implements OnInit {
  private readonly workflowApi = inject(WorkflowApiService);
  private readonly fb = inject(FormBuilder);

  readonly chains = signal<DepartmentChain[]>([]);
  readonly departments = signal<Department[]>([]);
  readonly loading = signal(true);
  readonly editingChain = signal<string | null>(null);

  readonly chainForm = this.fb.group({
    name: this.fb.control("", { validators: [Validators.required], nonNullable: true }),
    allowParallel: this.fb.control(false, { nonNullable: true }),
    requireStrictOrder: this.fb.control(true, { nonNullable: true }),
    steps: this.fb.array([]),
  });

  get steps(): FormArray {
    return this.chainForm.controls.steps as FormArray;
  }

  ngOnInit(): void {
    this.workflowApi.getDepartments().subscribe({
      next: (departments) => this.departments.set(departments),
    });

    this.workflowApi.getDepartmentChains().subscribe({
      next: (chains) => {
        this.chains.set(chains);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  startNewChain(): void {
    this.editingChain.set("new");
    this.chainForm.reset({
      name: "",
      allowParallel: false,
      requireStrictOrder: true,
    });

    this.steps.clear();
    this.steps.push(
      this.fb.group({
        departmentId: this.fb.control(this.departments()[0]?.id ?? "", {
          nonNullable: true,
          validators: [Validators.required],
        }),
        responseTime: this.fb.control(60, { nonNullable: true }),
        resolutionTime: this.fb.control(240, { nonNullable: true }),
      }),
    );
  }
}
