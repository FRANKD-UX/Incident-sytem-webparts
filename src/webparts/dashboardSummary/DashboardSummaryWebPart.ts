import * as React from 'react';
import { BasePlatformWebPart } from '../shared/BasePlatformWebPart';
import { PlatformWebPartProps, renderPlatformRoot } from '../shared/createRoot';
import { DashboardSummary } from './components/DashboardSummary';

export interface IDashboardSummaryWebPartProps extends PlatformWebPartProps {}

export default class DashboardSummaryWebPart extends BasePlatformWebPart<IDashboardSummaryWebPartProps> {
  public render(): void {
    renderPlatformRoot(this.domElement, React.createElement(DashboardSummary), this.properties);
  }
}
