import * as React from 'react';
import { BasePlatformWebPart } from '../shared/BasePlatformWebPart';
import { PlatformWebPartProps, renderPlatformRoot } from '../shared/createRoot';
import { MyBoard } from './components/MyBoard';

export interface IMyBoardWebPartProps extends PlatformWebPartProps {}

export default class MyBoardWebPart extends BasePlatformWebPart<IMyBoardWebPartProps> {
  public render(): void {
    renderPlatformRoot(this.domElement, React.createElement(MyBoard), this.properties);
  }
}
