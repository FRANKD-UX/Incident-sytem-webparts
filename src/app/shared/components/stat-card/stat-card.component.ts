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
        class="stat-card__icon"
        [style.background]="
          'linear-gradient(135deg,' + kpi.color + '22,' + kpi.color + '44)'
        "
      >
        <span class="material-icons" [style.color]="kpi.color">{{ kpi.icon }}</span>
      </div>
      <div class="stat-card__content">
        <div class="stat-card__label">{{ kpi.label }}</div>
        <div class="stat-card__value">{{ kpi.value | number }}</div>
        <div
          *ngIf="kpi.change !== null && kpi.change !== undefined && kpi.change !== 0"
          class="stat-card__change"
          [class.positive]="kpi.change > 0"
          [class.negative]="kpi.change < 0"
        >
          <span class="material-icons">{{
            kpi.change > 0 ? "arrow_upward" : "arrow_downward"
          }}</span>
          <span>{{ kpi.change | number: "1.0-2" }}%</span>
        </div>
      </div>
    </article>
  `,
  styles: [
    `
      .stat-card {
        background: var(--bg-primary, #ffffff);
        border: 1px solid var(--border-color, rgba(15, 23, 42, 0.12));
        border-radius: 8px;
        padding: 24px;
        display: flex;
        gap: 16px;
        transition: box-shadow 0.2s ease;
      }
      .stat-card:hover {
        box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
      }
      .stat-card__icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .stat-card__content {
        display: grid;
        gap: 4px;
      }
      .stat-card__label {
        color: #5b6475;
        font-size: 0.875rem;
      }
      .stat-card__value {
        font-size: 2rem;
        font-weight: 600;
        color: #0f172a;
      }
      .stat-card__change {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        color: #5b6475;
        font-size: 0.875rem;
      }
      .stat-card__change .material-icons {
        font-size: 1rem;
      }
      .stat-card__change.positive {
        color: #10b981;
      }
      .stat-card__change.negative {
        color: #ef4444;
      }
    `,
  ],
})
export class StatCardComponent {
  @Input({ required: true }) kpi!: DashboardKpi;
}
