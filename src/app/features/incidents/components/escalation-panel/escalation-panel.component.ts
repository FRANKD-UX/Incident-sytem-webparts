import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { Escalation } from "../../../../shared/models/escalation.model";

@Component({
  selector: "app-escalation-panel",
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="escalation-panel">
      <h3>Escalation History</h3>

      @if (escalations.length === 0) {
        <p>No escalations recorded for this incident.</p>
      } @else {
        @for (escalation of escalations; track escalation.id) {
          <article
            class="escalation-card"
            [class.status-active]="escalation.status === 'ACTIVE'"
          >
            <header class="escalation-card__header">
              <span class="material-icons">{{ triggerIcon(escalation.triggerType) }}</span>
              <strong>{{ escalation.triggerType.replace(/_/g, " ") }}</strong>
              <span class="status-badge">{{ escalation.status }}</span>
            </header>

            <p>
              {{ escalation.escalatedFrom }} → {{ escalation.escalatedTo }}
            </p>
            <p>{{ escalation.reason }}</p>
            <small>{{ escalation.triggerTime | date: "MMM d, y h:mm a" }}</small>

            @if (escalation.notes.length > 0) {
              <ul>
                @for (note of escalation.notes; track note) {
                  <li>{{ note }}</li>
                }
              </ul>
            }
          </article>
        }
      }
    </section>
  `,
  styles: [
    `
      .escalation-panel {
        display: grid;
        gap: 12px;
      }
      .escalation-panel h3,
      .escalation-panel p {
        margin: 0;
      }
      .escalation-card {
        padding: 16px;
        border: 1px solid var(--border-color, #e5e7eb);
        border-radius: 8px;
        margin-bottom: 12px;
        display: grid;
        gap: 6px;
      }
      .escalation-card.status-active {
        border-left: 3px solid #ef4444;
        background: #fef2f2;
      }
      .escalation-card__header {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .status-badge {
        margin-left: auto;
        font-size: 0.75rem;
        background: #e5e7eb;
        border-radius: 999px;
        padding: 2px 8px;
      }
      ul {
        margin: 0;
        padding-left: 16px;
      }
    `,
  ],
})
export class EscalationPanelComponent {
  @Input({ required: true }) incidentId!: string;
  @Input() escalations: Escalation[] = [];

  triggerIcon(trigger: Escalation["triggerType"]): string {
    switch (trigger) {
      case "SLA_BREACH":
        return "timer_off";
      case "PENDING_CHECKLIST":
        return "checklist_rtl";
      case "STALE_INCIDENT":
        return "schedule";
      default:
        return "flag";
    }
  }
}
