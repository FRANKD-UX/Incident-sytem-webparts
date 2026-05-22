import { Component, Input, Output, EventEmitter } from '@angular/core';
@Component({
  selector: 'app-board-filters',
  standalone: true,
  template: `<div>Board Filters</div>`
})
export class BoardFiltersComponent {
  @Input() departments: any[] = [];
  @Input() assignees: any[] = [];
  @Output() filterChange = new EventEmitter<any>();
}
