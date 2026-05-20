import * as React from 'react';
import { BasePlatformWebPart } from '../shared/BasePlatformWebPart';
import { PlatformWebPartProps, renderPlatformRoot } from '../shared/createRoot';
import { AdminFilters } from './components/AdminFilters';

export interface IAdminFiltersWebPartProps extends PlatformWebPartProps {}

export default class AdminFiltersWebPart extends BasePlatformWebPart<IAdminFiltersWebPartProps> {
  public render(): void {
    renderPlatformRoot(this.domElement, React.createElement(AdminFilters), this.properties);
  }
}
