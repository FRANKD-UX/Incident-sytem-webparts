import * as React from 'react';
import { BasePlatformWebPart } from '../shared/BasePlatformWebPart';
import { renderPlatformRoot, PlatformWebPartProps } from '../shared/createRoot';
import { ShellHeader } from './components/ShellHeader';

export interface IShellHeaderWebPartProps extends PlatformWebPartProps {}

export default class ShellHeaderWebPart extends BasePlatformWebPart<IShellHeaderWebPartProps> {
  public render(): void {
    renderPlatformRoot(
      this.domElement,
      React.createElement(ShellHeader, { userName: this.context.pageContext.user.displayName }),
      this.properties
    );
  }
}
