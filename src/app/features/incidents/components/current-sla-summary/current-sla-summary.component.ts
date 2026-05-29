import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { Incident, DepartmentChain, ChainStep } from "../../../../shared/models/incident.model";

@Component({
  selector: "app-current-sla-summary",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sla-card" *ngIf="incident && currentStep">
      <div class="sla-card__header">
        <div>
          <h3>Current SLA</h3>
          <p>
            {{ currentStep.department.name }} · {{ currentStep.checklist.name }}
          </p>
        </div>

        <div class="sla-chip" [class.sla-chip--warning]="isNearBreach" [class.sla-chip--danger]="isBreached">
          {{ slaLabel }}
        </div>
      </div>

      <div class="sla-grid">
        <div class="metric">
          <span>Elapsed</span>
          <strong>{{ elapsedLabel }}</strong>
        </div>

        <div class="metric">
          <span>Target</span>
          <strong>{{ targetLabel }}</strong>
        </div>

        <div class="metric">
          <span>Remaining</span>
          <strong>{{ remainingLabel }}</strong>
        </div>

        <div class="metric">
          <span>Step window</span>
          <strong>{{ currentStep.sla.resolutionTime }}m</strong>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .sla-card {
        display: grid;
        gap: 14px;
        padding: 16px;
        border-radius: 16px;
        border: 1px solid var(--border);
        background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
      }

      .sla-card__header {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        align-items: flex-start;
      }

      .sla-card__header h3 {
        margin: 0;
        font-size: 1rem;
      }

      .sla-card__header p {
        margin: 4px 0 0;
        color: var(--muted);
        font-size: 0.88rem;
      }

      .sla-chip {
        padding: 6px 10px;
        border-radius: 999px;
        font-size: 0.76rem;
        font-weight: 700;
        color: #047857;
        background: rgba(16, 185, 129, 0.12);
      }

      .sla-chip--warning {
        color: #b45309;
        background: rgba(245, 158, 11, 0.12);
      }

      .sla-chip--danger {
        color: #991b1b;
        background: rgba(239, 68, 68, 0.12);
      }

      .sla-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 10px;
      }

      .metric {
        padding: 12px;
        border: 1px solid var(--border);
        border-radius: 14px;
        background: white;
        display: grid;
        gap: 4px;
      }

      .metric span {
        color: var(--muted);
        font-size: 0.74rem;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        font-weight: 700;
      }

      .metric strong {
        color: #0f172a;
        font-size: 0.95rem;
      }

      @media (max-width: 900px) {
        .sla-grid {
          grid-template-columns: 1fr 1fr;
        }

        .sla-card__header {
          flex-direction: column;
        }
      }

      @media (max-width: 600px) {
        .sla-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class CurrentSlaSummaryComponent {
  @Input({ required: true }) incident!: Incident | null;
  @Input() chain: DepartmentChain | null = null;

  get currentStep(): ChainStep | null {
    if (!this.incident || !this.chain) return null;
    return (
      this.chain.steps.find(
        (step) => step.department.code === this.incident?.currentDepartment?.code,
      ) ?? null
    );
  }

  private get stepStartedAt(): Date | null {
    if (!this.incident?.updatedAt) return null;
    const parsed = new Date(this.incident.updatedAt);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  private get elapsedMinutes(): number {
    if (!this.stepStartedAt) return 0;
    return Math.max(0, Math.floor((Date.now() - this.stepStartedAt.getTime()) / 60000));
  }

  get targetLabel(): string {
    if (!this.currentStep) return "--";
    return `${this.currentStep.sla.resolutionTime}m`;
  }

  get elapsedLabel(): string {
    return `${this.elapsedMinutes}m`;
  }

  get remainingLabel(): string {
    if (!this.currentStep) return "--";
    const remaining = Math.max(0, this.currentStep.sla.resolutionTime - this.elapsedMinutes);
    return `${remaining}m`;
  }

  get isBreached(): boolean {
    return !!this.currentStep && this.elapsedMinutes > this.currentStep.sla.resolutionTime;
  }

  get isNearBreach(): boolean {
    return (
      !!this.currentStep &&
      !this.isBreached &&
      this.elapsedMinutes >= Math.max(0, this.currentStep.sla.resolutionTime - 30)
    );
  }

  get slaLabel(): string {
    if (this.isBreached) return "Breached";
    if (this.isNearBreach) return "Near breach";
    return "Within SLA";
  }
}
