import React from 'react';
import { TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';

export const HapticTab = ({ children, onPress, style }: any) => (
  <TouchableOpacity
    style={style}
    onPress={() => {
      Haptics.selectionAsync();
      onPress && onPress();
    }}
  >
    {children}
  </TouchableOpacity>
);
