import * as React from 'react';
import { BasePlatformWebPart } from '../shared/BasePlatformWebPart';
import { PlatformWebPartProps, renderPlatformRoot } from '../shared/createRoot';
import { TicketsGrid } from './components/TicketsGrid';

export interface ITicketsGridWebPartProps extends PlatformWebPartProps {}

export default class TicketsGridWebPart extends BasePlatformWebPart<ITicketsGridWebPartProps> {
  public render(): void {
    renderPlatformRoot(this.domElement, React.createElement(TicketsGrid), this.properties);
  }
}
