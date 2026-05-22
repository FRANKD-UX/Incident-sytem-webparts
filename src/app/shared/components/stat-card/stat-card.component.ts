import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { DashboardKpi } from "../../models/dashboard.model";

@Component({
  selector: "app-stat-card",
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="stat-card">
      <div
        class="icon"
        [style.background]="
          'linear-gradient(135deg,' + kpi.color + '22,' + kpi.color + '44)'
        "
      >
        {{ kpi.icon }}
      </div>
      <div>
        <div class="label">{{ kpi.label }}</div>
        <div class="value">{{ kpi.value }}</div>
        <div class="change">{{ kpi.changeType }} {{ kpi.change }}%</div>
      </div>
    </article>
  `,
  styles: [
    `
      .stat-card {
        display: flex;
        gap: 16px;
        padding: 20px;
        background: #fff;
        border: 1px solid rgba(15, 23, 42, 0.08);
        border-radius: 20px;
        box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
      }
      .icon {
        width: 48px;
        height: 48px;
        border-radius: 14px;
        display: grid;
        place-items: center;
        font-weight: 800;
      }
      .label {
        color: #5b6475;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }
      .value {
        font-size: 28px;
        font-weight: 800;
        color: #0f172a;
      }
      .change {
        color: #5b6475;
        font-size: 12px;
      }
    `,
  ],
})
export class StatCardComponent {
  @Input({ required: true }) kpi!: DashboardKpi;
}
