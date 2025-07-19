import React from 'react';
import { View, Text } from 'react-native';

export const IconSymbol = ({ icon, label }: any) => (
  <View style={{ alignItems: 'center' }}>
    <Text>{icon}</Text>
    <Text>{label}</Text>
  </View>
);

