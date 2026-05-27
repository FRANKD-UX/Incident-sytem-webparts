import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { ChainStep, DepartmentChain } from "../../../../shared/models/incident.model";

@Component({
  selector: "app-chain-progress",
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (!chain || chain.steps.length === 0) {
      <div class="chain-progress chain-progress--empty">No workflow chain configured.</div>
    } @else {
      <div class="chain-progress">
        @for (step of chain.steps; track step.order) {
          <div
            class="chain-progress__node"
            [class.chain-progress__node--complete]="isComplete(step)"
            [class.chain-progress__node--current]="isCurrent(step)"
          >
            <span class="index">{{ step.order }}</span>
            <div>
              <strong>{{ step.department.name }}</strong>
              <small>SLA: {{ step.sla.responseTime }}m</small>
            </div>
          </div>
          @if (!$last) {
            <span class="material-icons chain-progress__arrow">arrow_forward</span>
          }
        }
      </div>
    }
  `,
  styles: [
    `
      .chain-progress {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      .chain-progress--empty {
        padding: 12px;
        border: 1px dashed #cbd5e1;
        border-radius: 10px;
        color: #64748b;
      }

      .chain-progress__node {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 12px;
        border: 1px solid #cbd5e1;
        border-radius: 999px;
        background: white;
      }

      .chain-progress__node--complete {
        border-color: #86efac;
        background: #f0fdf4;
      }

      .chain-progress__node--current {
        border-color: #93c5fd;
        background: #eff6ff;
      }

      .index {
        width: 22px;
        height: 22px;
        border-radius: 999px;
        display: grid;
        place-items: center;
        background: #0f172a;
        color: white;
        font-size: 12px;
      }

      small {
        display: block;
        color: #64748b;
      }

      .chain-progress__arrow {
        color: #94a3b8;
      }
    `,
  ],
})
export class ChainProgressComponent {
  @Input() chain: DepartmentChain | null = null;
  @Input() currentDepartmentCode = "";

  isCurrent(step: ChainStep): boolean {
    return (
      step.department.code === this.currentDepartmentCode ||
      step.department.id === this.currentDepartmentCode
    );
  }

  isComplete(step: ChainStep): boolean {
    const currentIndex = this.chain?.steps.findIndex((item) => this.isCurrent(item)) ?? -1;
    const index = this.chain?.steps.findIndex((item) => item.order === step.order) ?? -1;
    return currentIndex > -1 && index > -1 && index < currentIndex;
  }
}
