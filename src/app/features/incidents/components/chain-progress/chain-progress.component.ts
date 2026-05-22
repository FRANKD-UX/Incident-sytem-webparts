import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { ChainStep, DepartmentChain } from "../../../../shared/models/incident.model";

@Component({
  selector: "app-chain-progress",
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="chain-progress">
      <h3>Department Chain Progress</h3>

      @if (!chain || chain.steps.length === 0) {
        <p>No chain steps available.</p>
      } @else {
        <div class="chain-steps">
          @for (step of chain.steps; track step.order; let last = $last) {
            <div class="step-item">
              <div class="step-circle" [ngClass]="getStepClass(step)">
                @if (isStepCompleted(step)) {
                  <span class="material-icons">check</span>
                } @else if (isStepCurrent(step)) {
                  <span class="material-icons">play_arrow</span>
                } @else if (isStepPending(step)) {
                  {{ step.order + 1 }}
                } @else {
                  <span class="material-icons">lock</span>
                }
              </div>

              @if (!last) {
                <div class="step-line" [class.completed]="isStepCompleted(step)"></div>
              }

              <div class="step-content">
                <strong>{{ step.department.name }}</strong>
                <small>Status: {{ getStepClass(step) }}</small>
                <small>SLA: {{ step.sla.responseTime }}m / {{ step.sla.resolutionTime }}m</small>
              </div>
            </div>
          }
        </div>
      }
    </section>
  `,
  styles: [
    `
      .chain-progress {
        display: grid;
        gap: 12px;
      }
      .chain-progress h3,
      .chain-progress p {
        margin: 0;
      }
      .chain-steps {
        display: flex;
        overflow-x: auto;
        gap: 0;
      }
      .step-item {
        display: flex;
        align-items: center;
        min-width: 220px;
      }
      .step-circle {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 2px solid;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        font-size: 0.75rem;
      }
      .step-circle.completed {
        background: #10b981;
        border-color: #10b981;
        color: white;
      }
      .step-circle.current {
        background: #3b82f6;
        border-color: #3b82f6;
        color: white;
      }
      .step-circle.pending {
        border-color: var(--border-color, #d1d5db);
        color: #6b7280;
      }
      .step-line {
        flex: 1;
        height: 2px;
        min-width: 40px;
        background: var(--border-color, #d1d5db);
        margin: 0 8px;
      }
      .step-line.completed {
        background: #10b981;
      }
      .step-content {
        display: grid;
        gap: 2px;
      }
    `,
  ],
})
export class ChainProgressComponent {
  @Input() chain: DepartmentChain | null = null;
  @Input() currentStepId = "";

  isStepCompleted(step: ChainStep): boolean {
    return step.order < this.currentStepOrder();
  }

  isStepCurrent(step: ChainStep): boolean {
    return step.order === this.currentStepOrder();
  }

  isStepPending(step: ChainStep): boolean {
    return step.order > this.currentStepOrder();
  }

  getStepClass(step: ChainStep): "completed" | "current" | "pending" {
    if (this.isStepCompleted(step)) {
      return "completed";
    }
    if (this.isStepCurrent(step)) {
      return "current";
    }
    return "pending";
  }

  private currentStepOrder(): number {
    if (!this.chain) {
      return 0;
    }
    const index = this.chain.steps.findIndex(
      (step) => step.checklist.id === this.currentStepId || String(step.order) === this.currentStepId,
    );
    return index >= 0 ? this.chain.steps[index].order : 0;
  }
}
