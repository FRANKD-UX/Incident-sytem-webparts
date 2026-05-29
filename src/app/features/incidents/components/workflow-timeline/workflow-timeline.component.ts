import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { DepartmentChain, ChainStep } from "../../../../shared/models/incident.model";

@Component({
  selector: "app-workflow-timeline",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="workflow-timeline">
      <div class="workflow-timeline__header">
        <div>
          <h3>Workflow timeline</h3>
          <p>Department chain and step status</p>
        </div>
        <div class="workflow-timeline__legend">
          <span><i class="dot dot--done"></i> Completed</span>
          <span><i class="dot dot--current"></i> Current</span>
          <span><i class="dot dot--next"></i> Next</span>
          <span><i class="dot dot--blocked"></i> Blocked</span>
        </div>
      </div>

      <div class="workflow-timeline__cards">
        @for (step of steps; track step.order) {
          <div
            class="step-card"
            [class.step-card--done]="isCompleted(step)"
            [class.step-card--current]="isCurrent(step)"
            [class.step-card--next]="isNext(step)"
            [class.step-card--blocked]="isBlocked(step)"
          >
            <div class="step-card__top">
              <div
                class="department-pill"
                [style.background]="departmentColor(step.department.code)"
              >
                {{ step.department.name }}
              </div>

              <div class="step-status">
                @if (isCompleted(step)) {
                  Completed
                } @else if (isCurrent(step)) {
                  Current
                } @else if (isNext(step)) {
                  Next
                } @else {
                  Blocked
                }
              </div>
            </div>

            <div class="step-card__body">
              <strong>{{ step.checklist.name }}</strong>
              <p>{{ step.expectedActions.join(" • ") }}</p>
            </div>

            <div class="step-card__footer">
              <span>SLA: {{ step.sla.responseTime }}m / {{ step.sla.resolutionTime }}m</span>
              @if (step.completedAt) {
                <span>Done: {{ step.completedAt | date: "short" }}</span>
              }
            </div>
          </div>

          @if (!$last) {
            <div class="workflow-timeline__arrow">
              <span class="material-icons">arrow_forward</span>
            </div>
          }
        }
      </div>
    </div>
  `,
  styleUrls: ["./workflow-timeline.component.scss"],
})
export class WorkflowTimelineComponent {
  @Input() chain: DepartmentChain | null = null;
  @Input() currentStepId = "";
  @Input() currentDepartmentCode = "";

  get steps(): Array<ChainStep & { completedAt?: string }> {
    return this.chain?.steps ?? [];
  }

  isCurrent(step: ChainStep): boolean {
    return step.department.code === this.currentDepartmentCode || step.department.id === this.currentDepartmentCode;
  }

  isNext(step: ChainStep): boolean {
    const currentIndex = this.steps.findIndex((s) => this.isCurrent(s));
    const index = this.steps.findIndex((s) => s.order === step.order);
    return currentIndex >= 0 && index === currentIndex + 1;
  }

  isCompleted(step: ChainStep): boolean {
    const currentIndex = this.steps.findIndex((s) => this.isCurrent(s));
    const index = this.steps.findIndex((s) => s.order === step.order);
    return currentIndex >= 0 && index < currentIndex;
  }

  isBlocked(step: ChainStep): boolean {
    return !this.isCompleted(step) && !this.isCurrent(step) && !this.isNext(step);
  }

  departmentColor(code: string): string {
    switch (code) {
      case "SUP":
        return "rgba(59,130,246,0.16)";
      case "ACC":
        return "rgba(245,158,11,0.16)";
      case "OPS":
        return "rgba(16,185,129,0.16)";
      default:
        return "rgba(148,163,184,0.16)";
    }
  }
}
