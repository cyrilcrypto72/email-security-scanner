import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BreachData {
  email: string;
  breachCount: number;
  breaches: {
    name: string;
    breachDate: string;
    dataClasses: string[];
  }[];
  scannedAt: string;
}

const STORAGE_KEY = 'emailScanHistory';

export async function saveSearchHistory(breachData: BreachData) {
  try {
    const historyRaw = await AsyncStorage.getItem(STORAGE_KEY);
    const history = historyRaw ? JSON.parse(historyRaw) : [];

    history.unshift(breachData);

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 20))); // max 20
  } catch (err) {
    console.error('Erreur sauvegarde historique:', err);
  }
}

export async function getSearchHistory(): Promise<BreachData[]> {
  try {
    const historyRaw = await AsyncStorage.getItem(STORAGE_KEY);
    return historyRaw ? JSON.parse(historyRaw) : [];
  } catch (err) {
    console.error('Erreur récupération historique:', err);
    return [];
  }
}

export async function clearSearchHistory() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Erreur nettoyage historique:', err);
  }
}

