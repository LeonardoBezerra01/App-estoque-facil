import { MD3LightTheme } from 'react-native-paper';

const theme = {
  ...MD3LightTheme,
  roundness: 3,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#0F6B5C',
    onPrimary: '#FFFFFF',
    primaryContainer: '#CFEBE3',
    onPrimaryContainer: '#06382F',
    secondary: '#3D5A80',
    secondaryContainer: '#DCE6F2',
    tertiary: '#B45309',
    tertiaryContainer: '#FDE7CC',
    error: '#B3261E',
    background: '#F4F7F6',
    surface: '#FFFFFF',
    surfaceVariant: '#E6EDEB',
    outline: '#8A9A96',
  },
};

export const colors = {
  warn: '#B45309',
  warnBg: '#FDE7CC',
  ok: '#0F6B5C',
};

export default theme;
