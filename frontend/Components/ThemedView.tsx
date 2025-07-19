import { View, ViewProps } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

export function ThemedView(props: ViewProps) {
  const colorScheme = useColorScheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      {...props}
    />
  );
}

