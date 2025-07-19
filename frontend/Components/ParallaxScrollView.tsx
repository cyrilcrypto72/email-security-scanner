import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';

export default function ParallaxScrollView({ children }: any) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View>{children}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
});

