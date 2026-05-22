import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
}

@Component({
  selector: "app-filter-bar",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="filter-bar">
      <label *ngFor="let filter of filters" class="filter-item">
        <span>{{ filter.label }}</span>
        <select
          [value]="toSelectValue(activeFilters[filter.key])"
          (change)="onFilterChange(filter.key, $event)"
        >
          <option value="">All</option>
          <option *ngFor="let option of filter.options" [value]="option.value">
            {{ option.label }}
          </option>
        </select>
      </label>
    </div>
  `,
  styles: [
    `
      .filter-bar {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }
      .filter-item {
        display: grid;
        gap: 4px;
        font-size: 0.875rem;
        color: #4b5563;
      }
      .filter-item select {
        min-width: 140px;
        border: 1px solid var(--border-color, #d1d5db);
        border-radius: 8px;
        padding: 6px 10px;
        font: inherit;
        background: var(--bg-primary, #ffffff);
      }
    `,
  ],
})
export class FilterBarComponent {
  @Input() filters: FilterConfig[] = [];
  @Input() activeFilters: Record<string, string> = {};
  @Output() activeFiltersChange = new EventEmitter<Record<string, string>>();

  onFilterChange(key: string, event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.activeFiltersChange.emit({ ...this.activeFilters, [key]: select.value });
  }

  toSelectValue(value: string | undefined): string {
    return value ?? "";
  }
}
