import { Text, TextProps } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

export function ThemedText(props: TextProps) {
  const colorScheme = useColorScheme();

  return (
    <Text
      style={{ color: colorScheme === 'dark' ? 'white' : 'black' }}
      {...props}
    />
  );
}
