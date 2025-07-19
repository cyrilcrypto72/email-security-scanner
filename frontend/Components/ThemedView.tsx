import React from 'react';
import { View, ViewProps } from 'react-native';

export const ThemedView = (props: ViewProps) => {
  return <View {...props} style={[{ backgroundColor: '#fff' }, props.style]} />;
};
