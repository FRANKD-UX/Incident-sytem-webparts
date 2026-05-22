import { Component, Input } from '@angular/core';
@Component({
  selector: 'app-sla-indicator',
  standalone: true,
  template: `<span>SLA</span>`,
  styles: []
})
export class SlaIndicatorComponent {
  @Input() incidentId = '';
  @Input() compact = false;
  @Input() showText = true;
}
