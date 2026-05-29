import { CommonModule } from "@angular/common";
import { Component, computed, signal } from "@angular/core";
import { RouterLink } from "@angular/router";

type EscalationTrack = "server" | "sql";

type EscalationLevel = {
  level: string;
  owner: string;
  focus: string;
  trigger: string;
  timeToEscalate: string;
  handoverRequired: string;
  decision: string;
};

type EscalationScenario = {
  id: string;
  label: string;
  summary: string;
  track: EscalationTrack;
  severity: "low" | "medium" | "high" | "critical";
  owner: string;
  route: string;
  sla: string;
  gatekeeper: string;
  handover: string[];
  nextStep: string;
};

const TRACK_LABELS: Record<EscalationTrack, string> = {
  server: "Server & Network",
  sql: "SQL Environment",
};

const TRACK_DESCRIPTIONS: Record<EscalationTrack, string> = {
  server: "Infrastructure faults, connectivity, hardware, and domain health.",
  sql: "Performance, permissions, deadlocks, and database recovery.",
};

const LEVELS: Record<EscalationTrack, EscalationLevel[]> = {
  server: [
    {
      level: "1st Line",
      owner: "Internal Server Resource",
      focus: "Triage and safe remediation",
      trigger: "Basic checks fail or the server remains offline",
      timeToEscalate: "15 - 30 mins",
      handoverRequired:
        "Ticket number, error code, ping result, restart attempts",
      decision: "Escalate to 2nd Line when the root cause is still unclear.",
    },
    {
      level: "2nd Line",
      owner: "Internal Server/Network Expert",
      focus: "Root cause and advanced troubleshooting",
      trigger: "Routing, firewall, patching, virtualization, or AD issues",
      timeToEscalate: "1 - 2 hours",
      handoverRequired:
        "Logs, route trace, event viewer extracts, actions tried",
      decision: "Escalate to CIO for hardware replacement or wide outage.",
    },
    {
      level: "3rd Line",
      owner: "CIO / IT Leadership",
      focus: "Continuity and financial approval",
      trigger: "Business continuity decision or disaster recovery action",
      timeToEscalate: "As required",
      handoverRequired: "Impact summary, downtime estimate, recovery options",
      decision: "Approve replacement, communication, or DR failover.",
    },
  ],
  sql: [
    {
      level: "1st Line",
      owner: "Internal SQL Resource",
      focus: "Maintenance and access control",
      trigger: "Locked tables, user-impacting slowness, or access issues",
      timeToEscalate: "30 mins",
      handoverRequired:
        "Ticket number, query name, job status, permission checks",
      decision: "Escalate to DBA when the issue needs deeper analysis.",
    },
    {
      level: "2nd Line",
      owner: "Internal DBA",
      focus: "Advanced administration",
      trigger: "Deadlocks, corruption, tuning, backup or restore scenarios",
      timeToEscalate: "1 - 2 hours",
      handoverRequired:
        "Execution plan, index notes, deadlock graph, restore point",
      decision: "Escalate to CIO for approval before any external vendor.",
    },
    {
      level: "Gatekeeper",
      owner: "CIO",
      focus: "Cost control and approval",
      trigger: "DBA confirms internal checks are complete",
      timeToEscalate: "Immediate",
      handoverRequired:
        "DBA summary, internal actions tried, vendor justification",
      decision: "Authorize or decline ISOLVE engagement.",
    },
    {
      level: "3rd Line",
      owner: "ISOLVE (External SLA)",
      focus: "Vendor support",
      trigger: "Approved external escalation",
      timeToEscalate: "Governed by SLA",
      handoverRequired: "Approved ticket, root cause notes, evidence bundle",
      decision: "Handle complex engine or recovery failures.",
    },
  ],
};

const SCENARIOS: EscalationScenario[] = [
  {
    id: "server-offline",
    label: "Server offline",
    summary: "Host unreachable after initial checks.",
    track: "server",
    severity: "critical",
    owner: "Internal Server Resource",
    route: "Track A: 1st Line -> 2nd Line -> CIO",
    sla: "15 - 30 mins",
    gatekeeper: "CIO only if outage continues",
    handover: [
      "Ticket number",
      "Ping and connectivity result",
      "Restart attempts",
      "Event log reference",
    ],
    nextStep: "Move to 2nd Line with logs and a concise failure summary.",
  },
  {
    id: "network-latency",
    label: "Network latency",
    summary: "Slow response across a segment or site.",
    track: "server",
    severity: "high",
    owner: "Internal Server/Network Expert",
    route: "Track A: 2nd Line investigation",
    sla: "1 - 2 hours",
    gatekeeper: "CIO if a broad segment is impacted",
    handover: [
      "Trace route output",
      "Firewall and routing evidence",
      "Affected subnet details",
      "Checks already performed",
    ],
    nextStep:
      "Run deeper network diagnostics before any management escalation.",
  },
  {
    id: "sql-deadlock",
    label: "SQL deadlock",
    summary: "Users hit blocked sessions and query contention.",
    track: "sql",
    severity: "high",
    owner: "Internal DBA",
    route: "Track B: 1st Line -> 2nd Line -> CIO gatekeeper",
    sla: "30 mins to first handoff",
    gatekeeper: "CIO approval before external vendor",
    handover: [
      "Ticket number",
      "Deadlock graph",
      "Query and table names",
      "Scripts already run",
    ],
    nextStep:
      "DBA evaluates query tuning and if needed prepares vendor approval.",
  },
  {
    id: "sql-permissions",
    label: "SQL permissions",
    summary: "User access or account unlock request.",
    track: "sql",
    severity: "medium",
    owner: "Internal SQL Resource",
    route: "Track B: 1st Line closure path",
    sla: "30 mins",
    gatekeeper: "Not required unless issue becomes complex",
    handover: [
      "Username",
      "Database and role",
      "Permission change requested",
      "Attempted reset steps",
    ],
    nextStep:
      "Resolve internally first and keep the issue out of the external queue.",
  },
];

@Component({
  selector: "app-infrastructure-escalation",
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="infra-page">
      <a class="infra-page__back" routerLink="/administration">
        <span class="material-icons">arrow_back</span>
        Back to administration
      </a>

      <section class="infra-hero">
        <p class="infra-hero__eyebrow">Vukela Company Internal Process</p>
        <h1>Infrastructure Escalation Matrix</h1>
        <p>{{ trackDescription() }}</p>
      </section>

      <section class="control-panel">
        <div class="control-panel__header">
          <div>
            <h2>Choose Track</h2>
            <p>Switching track updates the matrix and decision path below.</p>
          </div>
          <span class="control-panel__pill">Management only</span>
        </div>

        <div class="track-switch">
          @for (track of tracks; track track.key) {
            <button
              type="button"
              class="track-switch__button"
              [class.track-switch__button--active]="
                selectedTrack() === track.key
              "
              (click)="selectTrack(track.key)"
            >
              <strong>{{ track.label }}</strong>
              <span>{{ track.description }}</span>
            </button>
          }
        </div>
      </section>

      <section class="solution-grid">
        <article class="matrix-card">
          <div class="matrix-card__header">
            <div>
              <p class="track-card__eyebrow">Live matrix</p>
              <h2>{{ currentTrackLabel() }}</h2>
            </div>
            <span class="track-badge">{{
              currentScenario().severity | titlecase
            }}</span>
          </div>

          <div class="scenario-strip">
            @for (scenario of currentScenarios(); track scenario.id) {
              <button
                type="button"
                class="scenario-chip"
                [class.scenario-chip--active]="
                  selectedScenarioId() === scenario.id
                "
                (click)="selectScenario(scenario.id)"
              >
                <strong>{{ scenario.label }}</strong>
                <span>{{ scenario.summary }}</span>
              </button>
            }
          </div>

          <div class="level-list">
            @for (level of currentLevels(); track level.level) {
              <div class="level-row">
                <div class="level-row__top">
                  <strong>{{ level.level }}</strong>
                  <span>{{ level.owner }}</span>
                </div>
                <p><strong>Focus:</strong> {{ level.focus }}</p>
                <p><strong>Trigger:</strong> {{ level.trigger }}</p>
                <div class="level-row__meta">
                  <span>{{ level.timeToEscalate }}</span>
                  <span>{{ level.handoverRequired }}</span>
                </div>
                <small>{{ level.decision }}</small>
              </div>
            }
          </div>
        </article>

        <article class="decision-card">
          <div class="decision-card__header">
            <div>
              <p class="track-card__eyebrow">Decision output</p>
              <h2>{{ currentScenario().label }}</h2>
            </div>
            <span class="track-badge track-badge--sql">{{
              currentScenario().track | titlecase
            }}</span>
          </div>

          <div class="decision-card__summary">
            <div>
              <span>Route</span>
              <strong>{{ currentScenario().route }}</strong>
            </div>
            <div>
              <span>Current owner</span>
              <strong>{{ currentScenario().owner }}</strong>
            </div>
            <div>
              <span>SLA window</span>
              <strong>{{ currentScenario().sla }}</strong>
            </div>
            <div>
              <span>Gatekeeper</span>
              <strong>{{ currentScenario().gatekeeper }}</strong>
            </div>
          </div>

          <div class="decision-card__block">
            <h3>Handover packet</h3>
            <ul>
              @for (item of currentScenario().handover; track item) {
                <li>{{ item }}</li>
              }
            </ul>
          </div>

          <div class="decision-card__block decision-card__block--accent">
            <h3>Next step</h3>
            <p>{{ currentScenario().nextStep }}</p>
          </div>

          <div class="decision-card__footer">
            <div>
              <span>Escalation route selected</span>
              <strong>{{ currentTrackLabel() }}</strong>
            </div>
            <div>
              <span>Control status</span>
              <strong>Active</strong>
            </div>
          </div>
        </article>
      </section>
    </div>
  `,
  styles: [
    `
      .infra-page {
        display: grid;
        gap: 18px;
      }

      .infra-page__back {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: #245bd1;
        font-weight: 700;
        text-decoration: none;
      }

      .infra-hero,
      .control-panel,
      .matrix-card,
      .decision-card {
        border: 1px solid #dbe3ef;
        border-radius: 20px;
        background: white;
        box-shadow: 0 8px 18px rgba(15, 23, 42, 0.04);
      }

      .infra-hero {
        padding: 22px;
        background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      }

      .infra-hero__eyebrow,
      .track-card__eyebrow {
        margin: 0 0 8px;
        color: #245bd1;
        font-size: 12px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.12em;
      }

      .infra-hero h1,
      .matrix-card h2,
      .decision-card h2,
      .decision-card h3 {
        margin: 0;
      }

      .infra-hero p {
        margin: 10px 0 0;
        color: #475569;
        max-width: 900px;
      }

      .control-panel {
        padding: 18px;
      }

      .control-panel__header,
      .matrix-card__header,
      .decision-card__header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
      }

      .control-panel__header h2,
      .decision-card__header h2 {
        margin: 0;
      }

      .control-panel__header p,
      .decision-card__header p {
        margin: 6px 0 0;
        color: #64748b;
      }

      .control-panel__pill {
        padding: 8px 11px;
        border-radius: 999px;
        background: #eff6ff;
        color: #245bd1;
        font-size: 12px;
        font-weight: 800;
      }

      .track-switch {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
        margin-top: 14px;
      }

      .track-switch__button,
      .scenario-chip {
        width: 100%;
        display: grid;
        gap: 4px;
        padding: 14px;
        border: 1px solid #dbe3ef;
        border-radius: 16px;
        background: #f8fafc;
        color: #0f172a;
        cursor: pointer;
        text-align: left;
      }

      .track-switch__button--active,
      .scenario-chip--active {
        border-color: #2f6fed;
        background: #eff6ff;
        box-shadow: inset 0 0 0 1px rgba(47, 111, 237, 0.16);
      }

      .track-switch__button strong,
      .scenario-chip strong {
        font-size: 14px;
      }

      .track-switch__button span,
      .scenario-chip span,
      .decision-card__summary span,
      .decision-card__footer span {
        color: #64748b;
        font-size: 12px;
      }

      .solution-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
      }

      .matrix-card,
      .decision-card {
        padding: 18px;
      }

      .scenario-strip {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
        margin: 14px 0;
      }

      .level-list {
        display: grid;
        gap: 12px;
      }

      .level-row,
      .decision-card__block,
      .decision-card__summary div,
      .decision-card__footer div {
        border-radius: 16px;
        background: #f8fafc;
      }

      .level-row {
        padding: 14px;
        display: grid;
        gap: 8px;
      }

      .level-row__top,
      .decision-card__summary {
        display: grid;
        gap: 4px;
      }

      .level-row__top {
        grid-template-columns: 1fr auto;
        align-items: center;
      }

      .level-row__top strong,
      .decision-card__summary strong,
      .decision-card__footer strong {
        color: #0f172a;
      }

      .level-row p,
      .level-row small,
      .decision-card__block p,
      .decision-card__block li {
        color: #475569;
      }

      .level-row__meta {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .level-row__meta span {
        padding: 6px 10px;
        border-radius: 999px;
        background: white;
        color: #334155;
        font-size: 12px;
        font-weight: 700;
      }

      .decision-card {
        display: grid;
        gap: 14px;
      }

      .decision-card__summary {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
      }

      .decision-card__summary div,
      .decision-card__footer div {
        padding: 12px;
      }

      .decision-card__summary strong {
        font-size: 14px;
      }

      .decision-card__block {
        padding: 14px;
      }

      .decision-card__block ul {
        margin: 10px 0 0;
        padding-left: 18px;
        display: grid;
        gap: 8px;
      }

      .decision-card__block--accent {
        background: linear-gradient(180deg, #eff6ff 0%, #ffffff 100%);
      }

      .decision-card__footer {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
      }

      .track-badge {
        padding: 7px 11px;
        border-radius: 999px;
        background: #e0f2fe;
        color: #075985;
        font-size: 12px;
        font-weight: 800;
      }

      .track-badge--sql {
        background: #fef3c7;
        color: #92400e;
      }

      @media (max-width: 900px) {
        .solution-grid,
        .track-switch,
        .scenario-strip,
        .decision-card__summary,
        .decision-card__footer {
          grid-template-columns: 1fr;
        }

        .control-panel__header,
        .matrix-card__header,
        .decision-card__header {
          flex-direction: column;
        }
      }
    `,
  ],
})
export class InfrastructureEscalationComponent {
  readonly tracks = [
    {
      key: "server" as EscalationTrack,
      label: TRACK_LABELS.server,
      description: TRACK_DESCRIPTIONS.server,
    },
    {
      key: "sql" as EscalationTrack,
      label: TRACK_LABELS.sql,
      description: TRACK_DESCRIPTIONS.sql,
    },
  ];

  readonly selectedTrack = signal<EscalationTrack>("server");
  readonly selectedScenarioId = signal<string>(SCENARIOS[0].id);

  readonly currentTrackLabel = computed(
    () => TRACK_LABELS[this.selectedTrack()],
  );

  readonly trackDescription = computed(
    () => TRACK_DESCRIPTIONS[this.selectedTrack()],
  );

  readonly currentScenarios = computed(() =>
    SCENARIOS.filter((scenario) => scenario.track === this.selectedTrack()),
  );

  readonly currentScenario = computed(
    () =>
      this.currentScenarios().find(
        (scenario) => scenario.id === this.selectedScenarioId(),
      ) ??
      this.currentScenarios()[0] ??
      SCENARIOS[0],
  );

  readonly currentLevels = computed(() => LEVELS[this.selectedTrack()]);

  selectTrack(track: EscalationTrack): void {
    this.selectedTrack.set(track);
    this.selectedScenarioId.set(
      SCENARIOS.find((scenario) => scenario.track === track)?.id ?? "",
    );
  }

  selectScenario(scenarioId: string): void {
    this.selectedScenarioId.set(scenarioId);
  }
}
