import { Component, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { DashboardKpi } from '../../models/dashboard.model';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    <div class="stat-card">
      <div class="stat-card__icon" [style.background]="'linear-gradient(135deg, ' + kpi.color + '20, ' + kpi.color + '40)'">
        <span class="material-icons" [style.color]="kpi.color">{{ kpi.icon }}</span>
      </div>
      <div class="stat-card__content">
        <span class="stat-card__label">{{ kpi.label }}</span>
        <span class="stat-card__value">{{ kpi.value | number }}</span>
        @if (kpi.change !== 0) {
          <span class="stat-card__change">
            {{ kpi.change }}%
          </span>
        }
      </div>
    </div>
  `,
  styleUrls: ['./stat-card.component.scss']
})
export class StatCardComponent {
  @Input({ required: true }) kpi!: DashboardKpi;
}
