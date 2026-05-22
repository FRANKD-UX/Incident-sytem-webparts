import { Component, Input } from '@angular/core';
@Component({
  selector: 'app-chain-progress',
  standalone: true,
  template: `<div>Chain Progress</div>`
})
export class ChainProgressComponent {
  @Input() chain: any = null;
  @Input() currentStepId = '';
}
