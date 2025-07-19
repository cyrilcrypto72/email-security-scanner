// components/HapticTab.tsx
import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import * as Haptics from 'expo-haptics';

export function HapticTab({ label, onPress }: { label: string; onPress: () => void }) {
  const handlePress = () => {
    Haptics.selectionAsync();
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <View style={{ padding: 10 }}>
        <Text>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

