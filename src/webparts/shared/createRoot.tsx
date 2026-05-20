import * as React from 'react';
import * as ReactDom from 'react-dom';
import { ApiProvider } from '../../common/hooks/useApiContext';
import { applyPlatformTheme, platformFluentTheme } from '../../common/styles/fluentTheme';
import { resolvePlatformConfig } from '../../services/api/httpClient';

export interface PlatformWebPartProps {
  apiBaseUrl?: string;
  useMockData?: boolean;
}

export const renderPlatformRoot = (
  element: HTMLElement,
  component: React.ReactElement,
  props: PlatformWebPartProps
): void => {
  const config = resolvePlatformConfig(props.apiBaseUrl);
  applyPlatformTheme(element, platformFluentTheme);

  ReactDom.render(<ApiProvider config={{ ...config, useMockData: props.useMockData ?? config.useMockData }}>{component}</ApiProvider>, element);
};

export const unmountPlatformRoot = (element: HTMLElement): void => {
  ReactDom.unmountComponentAtNode(element);
};
