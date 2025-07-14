import * as SecureStore from 'expo-secure-store';

export interface BreachData {
  email: string;
  breachCount: number;
  breaches: any[];
  scannedAt: string;
}

export async function saveSearchHistory(data: BreachData) {
  const existing = await SecureStore.getItemAsync('history');
  let history: BreachData[] = [];
  if (existing) {
    history = JSON.parse(existing);
  }
  history.push(data);
  await SecureStore.setItemAsync('history', JSON.stringify(history));
}

export async function getSearchHistory(): Promise<BreachData[]> {
  const data = await SecureStore.getItemAsync('history');
  if (data) {
    return JSON.parse(data);
  }
  return [];
}

