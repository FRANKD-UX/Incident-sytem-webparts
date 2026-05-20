import { IPropertyPaneConfiguration, PropertyPaneCheckbox, PropertyPaneTextField } from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { PlatformWebPartProps, unmountPlatformRoot } from './createRoot';

export abstract class BasePlatformWebPart<TProps extends PlatformWebPartProps> extends BaseClientSideWebPart<TProps> {
  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: 'Incident Operations API configuration' },
          groups: [
            {
              groupName: 'Backend API',
              groupFields: [
                PropertyPaneTextField('apiBaseUrl', { label: 'API base URL' }),
                PropertyPaneCheckbox('useMockData', { text: 'Use mock data', checked: this.properties.useMockData ?? true })
              ]
            }
          ]
        }
      ]
    };
  }

  protected onDispose(): void {
    unmountPlatformRoot(this.domElement);
  }
}
