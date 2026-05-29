import { Component, Input } from '@angular/core';
@Component({
  selector: 'app-escalation-panel',
  standalone: true,
  template: `<div>Escalation Panel</div>`
})
export class EscalationPanelComponent {
  @Input() incidentId = '';
  @Input() escalations: any[] = [];
}
