import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

export default function Screen({ children, style }) {
  const theme = useTheme();
  return <View style={[styles.root, { backgroundColor: theme.colors.background }, style]}>{children}</View>;
}

const styles = StyleSheet.create({ root: { flex: 1 } });
