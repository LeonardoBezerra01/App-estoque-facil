import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

export default function EmptyState({ title, message, actionLabel, onAction }) {
  return (
    <View style={styles.box}>
      <Text variant="titleMedium" style={styles.title}>{title}</Text>
      {!!message && <Text variant="bodyMedium" style={styles.msg}>{message}</Text>}
      {!!actionLabel && (
        <Button mode="contained" onPress={onAction} style={{ marginTop: 16 }}>{actionLabel}</Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', padding: 32 },
  title: { textAlign: 'center' },
  msg: { textAlign: 'center', marginTop: 6, opacity: 0.7 },
});
