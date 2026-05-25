import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit, inject, signal } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { Subscription } from "rxjs";
import { AgentPerformanceApiService } from "../../../api/agent-performance-api.service";
import {
  AgentPerformanceAgent,
  AgentPerformanceReport,
} from "../../../shared/models/agent-performance.model";
import { LoadingStateComponent } from "../../../shared/components/loading-state/loading-state.component";

@Component({
  selector: "app-agent-performance",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    LoadingStateComponent,
  ],
  template: `
    <div class="agent-performance">
      <a class="agent-performance__back" routerLink="/administration">
        <span class="material-icons">arrow_back</span>
        Back to administration
      </a>

      <div class="agent-performance__hero">
        <div>
          <p class="eyebrow">Management only</p>
          <h1>Agent Performance</h1>
          <p class="subtitle">
            Track ticket closures, close times, SLA adherence, and breach rates
            per agent.
          </p>
        </div>

        <label class="agent-select">
          <span>Agent</span>
          <select [formControl]="selectedAgentControl">
            @for (agent of agents(); track agent.id) {
              <option [value]="agent.id">{{ agent.displayName }}</option>
            }
          </select>
        </label>
      </div>

      @if (loadingAgents() || loadingReport()) {
        <app-loading-state message="Loading agent performance..." />
      } @else if (report()) {
        <div class="agent-performance__summary">
          <div class="summary-card summary-card--primary">
            <span>Tickets Closed</span>
            <strong>{{ report()!.ticketsClosed }}</strong>
            <small>{{ report()!.periodLabel }}</small>
          </div>
          <div class="summary-card">
            <span>Average Close Time</span>
            <strong>{{ report()!.avgCloseTimeMinutes }}m</strong>
            <small>SLA target: {{ report()!.slaTargetMinutes }}m</small>
          </div>
          <div class="summary-card">
            <span>SLA Compliance</span>
            <strong>{{ report()!.slaCompliance }}%</strong>
            <small
              >{{ report()!.slaMetCount }} met,
              {{ report()!.slaBreaches }} breached</small
            >
          </div>
          <div class="summary-card">
            <span>Reopened / Escalated</span>
            <strong
              >{{ report()!.reopenedTickets }} /
              {{ report()!.escalationsHandled }}</strong
            >
            <small>Reopens and escalations handled</small>
          </div>
        </div>

        <div class="agent-performance__grid">
          <section class="panel">
            <div class="panel__header">
              <div>
                <h2>{{ report()!.agent.displayName }}</h2>
                <p>
                  {{ report()!.agent.role }} · {{ report()!.agent.department }}
                </p>
              </div>
              <span
                class="status-pill"
                [class.status-pill--good]="report()!.slaCompliance >= 85"
              >
                {{
                  report()!.slaCompliance >= 85
                    ? "Keeping to SLA"
                    : "Needs attention"
                }}
              </span>
            </div>

            <div class="panel__metrics">
              <div>
                <span>Closed within SLA</span>
                <strong>{{ report()!.slaMetCount }}</strong>
              </div>
              <div>
                <span>Closed outside SLA</span>
                <strong>{{ report()!.slaBreaches }}</strong>
              </div>
              <div>
                <span>Reopened incidents</span>
                <strong>{{ report()!.reopenedTickets }}</strong>
              </div>
            </div>

            <div class="sla-bar">
              <div class="sla-bar__label">
                <span>SLA adherence</span>
                <strong>{{ report()!.slaCompliance }}%</strong>
              </div>
              <div class="sla-bar__track">
                <span
                  class="sla-bar__fill"
                  [style.width.%]="report()!.slaCompliance"
                ></span>
              </div>
            </div>

            <div class="notes">
              <h3>Performance notes</h3>
              <ul>
                @for (note of report()!.closureNotes; track note) {
                  <li>{{ note }}</li>
                }
              </ul>
            </div>
          </section>

          <section class="panel">
            <div class="panel__header">
              <div>
                <h2>Recent Closures</h2>
                <p>
                  Ticket duration and SLA position update when you change
                  agents.
                </p>
              </div>
            </div>

            <div class="closure-list">
              @for (item of report()!.recentClosures; track item.incidentId) {
                <article class="closure-item">
                  <div>
                    <strong>{{ item.referenceNumber }}</strong>
                    <p>{{ item.title }}</p>
                  </div>
                  <div class="closure-item__meta">
                    <span>{{ item.closeTimeMinutes }}m closed</span>
                    <span>SLA {{ item.slaTargetMinutes }}m</span>
                    <span
                      class="closure-status"
                      [class.closure-status--good]="item.withinSla"
                    >
                      {{ item.withinSla ? "Within SLA" : "Breached" }}
                    </span>
                  </div>
                </article>
              }
            </div>
          </section>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .agent-performance {
        display: grid;
        gap: 18px;
      }

      .agent-performance__back {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: #245bd1;
        font-weight: 700;
        text-decoration: none;
      }

      .agent-performance__hero {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 16px;
        padding: 20px;
        border: 1px solid #dbe3ef;
        border-radius: 20px;
        background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      }

      .eyebrow {
        margin: 0 0 6px;
        color: #245bd1;
        font-size: 12px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.12em;
      }

      .agent-performance__hero h1 {
        margin: 0;
        font-size: 30px;
      }

      .subtitle {
        margin: 8px 0 0;
        color: #475569;
      }

      .agent-select {
        display: grid;
        gap: 8px;
        min-width: 260px;
      }

      .agent-select span {
        font-size: 12px;
        font-weight: 800;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }

      .agent-select select {
        min-height: 42px;
        padding: 0 14px;
        border: 1px solid #cbd5e1;
        border-radius: 12px;
        background: white;
        color: #0f172a;
        font-weight: 600;
      }

      .agent-performance__summary {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 14px;
      }

      .summary-card {
        display: grid;
        gap: 6px;
        padding: 16px;
        border: 1px solid #dbe3ef;
        border-radius: 16px;
        background: white;
      }

      .summary-card--primary {
        background: linear-gradient(180deg, #eff6ff 0%, #ffffff 100%);
      }

      .summary-card span {
        font-size: 12px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #64748b;
      }

      .summary-card strong {
        font-size: 28px;
        color: #0f172a;
      }

      .summary-card small {
        color: #64748b;
      }

      .agent-performance__grid {
        display: grid;
        grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
        gap: 16px;
      }

      .panel {
        padding: 18px;
        border: 1px solid #dbe3ef;
        border-radius: 18px;
        background: white;
      }

      .panel__header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 16px;
      }

      .panel__header h2,
      .notes h3 {
        margin: 0;
      }

      .panel__header p {
        margin: 6px 0 0;
        color: #64748b;
      }

      .status-pill,
      .closure-status {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 6px 10px;
        border-radius: 999px;
        background: #fee2e2;
        color: #b91c1c;
        font-size: 12px;
        font-weight: 800;
      }

      .status-pill--good,
      .closure-status--good {
        background: #dcfce7;
        color: #166534;
      }

      .panel__metrics {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 10px;
        margin-bottom: 16px;
      }

      .panel__metrics div {
        padding: 12px;
        border-radius: 14px;
        background: #f8fafc;
      }

      .panel__metrics span {
        display: block;
        margin-bottom: 6px;
        color: #64748b;
        font-size: 12px;
        font-weight: 700;
      }

      .panel__metrics strong {
        font-size: 22px;
        color: #0f172a;
      }

      .sla-bar {
        display: grid;
        gap: 8px;
        margin-bottom: 18px;
      }

      .sla-bar__label {
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: #334155;
        font-size: 14px;
        font-weight: 700;
      }

      .sla-bar__track {
        height: 12px;
        border-radius: 999px;
        background: #e2e8f0;
        overflow: hidden;
      }

      .sla-bar__fill {
        display: block;
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(90deg, #22c55e, #2f6fed);
      }

      .notes ul {
        display: grid;
        gap: 10px;
        margin: 12px 0 0;
        padding-left: 18px;
        color: #334155;
      }

      .closure-list {
        display: grid;
        gap: 12px;
      }

      .closure-item {
        display: grid;
        gap: 10px;
        padding: 14px;
        border-radius: 14px;
        background: #f8fafc;
      }

      .closure-item strong {
        display: block;
        color: #0f172a;
      }

      .closure-item p {
        margin: 4px 0 0;
        color: #475569;
      }

      .closure-item__meta {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .closure-item__meta span {
        font-size: 12px;
        font-weight: 700;
        color: #334155;
      }

      @media (max-width: 960px) {
        .agent-performance__summary,
        .agent-performance__grid,
        .panel__metrics {
          grid-template-columns: 1fr;
        }

        .agent-performance__hero {
          align-items: flex-start;
          flex-direction: column;
        }

        .agent-select {
          width: 100%;
          min-width: 0;
        }
      }
    `,
  ],
})
export class AgentPerformanceComponent implements OnInit, OnDestroy {
  private readonly performanceApi = inject(AgentPerformanceApiService);

  readonly agents = signal<AgentPerformanceAgent[]>([]);
  readonly report = signal<AgentPerformanceReport | null>(null);
  readonly loadingAgents = signal(false);
  readonly loadingReport = signal(false);
  readonly selectedAgentControl = new FormControl<string>("", {
    nonNullable: true,
  });

  private agentsSubscription?: Subscription;
  private reportSubscription?: Subscription;

  ngOnInit(): void {
    this.loadingAgents.set(true);

    this.agentsSubscription = this.performanceApi.getAgents().subscribe({
      next: (agents) => {
        this.agents.set(agents);
        this.loadingAgents.set(false);

        const initialAgentId = agents[0]?.id ?? "";
        if (initialAgentId) {
          this.selectedAgentControl.setValue(initialAgentId, {
            emitEvent: false,
          });
          this.loadReport(initialAgentId);
        }
      },
      error: () => {
        this.loadingAgents.set(false);
      },
    });

    this.selectedAgentControl.valueChanges.subscribe((agentId) => {
      if (!agentId) {
        return;
      }

      this.loadReport(agentId);
    });
  }

  ngOnDestroy(): void {
    this.agentsSubscription?.unsubscribe();
    this.reportSubscription?.unsubscribe();
  }

  private loadReport(agentId: string): void {
    this.loadingReport.set(true);
    this.reportSubscription?.unsubscribe();
    this.reportSubscription = this.performanceApi
      .getPerformance(agentId)
      .subscribe({
        next: (report) => {
          this.report.set(report);
          this.loadingReport.set(false);
        },
        error: () => {
          this.loadingReport.set(false);
        },
      });
  }
}
