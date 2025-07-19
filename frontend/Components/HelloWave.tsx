import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

export const HelloWave = () => (
  <View style={styles.container}>
    <Text style={styles.text}>👋 Hello, welcome to Email Security Scanner!</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center' },
  text: { fontSize: 18, fontWeight: '600' }
});

