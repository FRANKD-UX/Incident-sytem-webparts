import { Theme, webLightTheme } from '@fluentui/react-components';

export const platformFluentTheme: Theme = {
  ...webLightTheme,
  colorBrandBackground: '#2563eb',
  colorBrandForeground1: '#174ea6',
  colorNeutralBackground1: '#ffffff',
  colorNeutralBackground2: '#f4f6f9',
  colorNeutralForeground1: '#172033',
  colorNeutralForeground2: '#667085',
  colorNeutralStroke1: '#d8dee8'
};

export const applyPlatformTheme = (element: HTMLElement, theme: Theme): void => {
  element.style.setProperty('--ops-focus', theme.colorBrandBackground);
  element.style.setProperty('--ops-panel', theme.colorNeutralBackground1);
  element.style.setProperty('--ops-bg', theme.colorNeutralBackground2);
  element.style.setProperty('--ops-text', theme.colorNeutralForeground1);
  element.style.setProperty('--ops-muted', theme.colorNeutralForeground2);
  element.style.setProperty('--ops-border', theme.colorNeutralStroke1);
};
