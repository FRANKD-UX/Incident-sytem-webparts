import { Component, Input } from '@angular/core';
import { Incident } from '../../../../shared/models/incident.model';
@Component({
  selector: 'app-incident-summary',
  standalone: true,
  template: `<div>Incident Summary</div>`
})
export class IncidentSummaryComponent {
  @Input() incident!: Incident;
}
