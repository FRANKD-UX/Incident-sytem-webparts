import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { AuditEntry } from "../../../../shared/models/audit.model";

@Component({
  selector: "app-rework-history",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rework-card" *ngIf="reworkItems.length">
      <div class="rework-card__header">
        <div>
          <h3>Rework / send-back history</h3>
          <p>Reasons and workflow reversals captured on this incident</p>
        </div>
      </div>

      <div class="rework-list">
        @for (item of reworkItems; track item.id) {
          <div class="rework-item">
            <div class="rework-item__top">
              <strong>{{ item.userName }}</strong>
              <span>{{ item.timestamp | date: "short" }}</span>
            </div>

            <div class="rework-item__reason">
              {{ item.details }}
            </div>

            <div class="rework-item__meta" *ngIf="item.metadata">
              @if (item.metadata["from"] || item.metadata["to"]) {
                <span>
                  Route:
                  {{ item.metadata["from"] || "?" }} → {{ item.metadata["to"] || "?" }}
                </span>
              }

              @if (item.metadata["reason"]) {
                <span>Reason: {{ item.metadata["reason"] }}</span>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .rework-card {
        display: grid;
        gap: 14px;
        padding: 16px;
        border: 1px solid var(--border);
        border-radius: 16px;
        background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
      }

      .rework-card__header h3 {
        margin: 0;
        font-size: 1rem;
      }

      .rework-card__header p {
        margin: 4px 0 0;
        color: var(--muted);
        font-size: 0.88rem;
      }

      .rework-list {
        display: grid;
        gap: 12px;
      }

      .rework-item {
        border: 1px solid var(--border);
        border-radius: 14px;
        background: white;
        padding: 12px 14px;
        display: grid;
        gap: 8px;
      }

      .rework-item__top {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
        color: #0f172a;
      }

      .rework-item__top span {
        color: var(--muted);
        font-size: 0.82rem;
      }

      .rework-item__reason {
        color: #334155;
        line-height: 1.45;
      }

      .rework-item__meta {
        display: flex;
        flex-wrap: wrap;
        gap: 10px 16px;
        color: var(--muted);
        font-size: 0.84rem;
      }
    `,
  ],
})
export class ReworkHistoryComponent {
  @Input() entries: AuditEntry[] = [];

  get reworkItems(): AuditEntry[] {
    return this.entries.filter((entry) => {
      const details = (entry.details ?? "").toLowerCase();
      const action = (entry.action ?? "").toUpperCase();
      return action === "UPDATED" && (details.includes("sent back") || details.includes("rework"));
    });
  }
}
