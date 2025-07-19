import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator, Animated, StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shield, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Search } from 'lucide-react-native';
import * as RNIap from 'react-native-iap';

import { secureApiCall } from '../utils/secureApi';
import { saveSearchHistory, BreachData } from '../utils/secureStorage';
import { validateAndSanitizeEmail, secureCleanup } from '../utils/security';

const productIds = ['premium_access'];

export default function Scanner() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [isCompromised, setIsCompromised] = useState<boolean | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [hasFullAccess, setHasFullAccess] = useState(false);

  const initIAP = async () => {
    try {
      await RNIap.initConnection();
      console.log('IAP connecté');
    } catch (err) {
      console.error('Erreur IAP init:', err);
    }
  };

  const endIAP = () => {
    RNIap.endConnection();
  };

  useEffect(() => {
    initIAP();
    return () => {
      endIAP();
      secureCleanup({ email, results });
    };
  }, []);

  const scanEmail = async () => {
    const validation = validateAndSanitizeEmail(email);
    if (!validation.isValid) {
      Alert.alert('Erreur', validation.error || 'Email invalide');
      return;
    }

    const sanitizedEmail = validation.sanitized;

    setLoading(true);
    setResults([]);
    setIsCompromised(null);

    try {
      const apiResponse = await secureApiCall(sanitizedEmail);

      if (!apiResponse.success) {
        Alert.alert('Erreur', apiResponse.error || 'Erreur API');
        return;
      }

      const data = apiResponse.data;

      if (data.length > 0) {
        setResults(data);
        setIsCompromised(true);
        setHasFullAccess(false); // Nécessite paiement pour détails
      } else {
        setResults([]);
        setIsCompromised(false);
        setHasFullAccess(true);
      }

      const breachData: BreachData = {
        email: sanitizedEmail,
        breachCount: data.length,
        breaches: data.map(b => ({
          name: b.Name,
          breachDate: b.BreachDate,
          dataClasses: b.DataClasses,
        })),
        scannedAt: new Date().toISOString(),
      };
      await saveSearchHistory(breachData);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } catch (err) {
      console.error(err);
      Alert.alert('Erreur', 'Impossible de scanner');
    } finally {
      setLoading(false);
      setTimeout(() => secureCleanup({ email: sanitizedEmail }), 1000);
    }
  };

  const buyPremium = async () => {
    try {
      const products = await RNIap.getProducts(productIds);
      if (!products.length) {
        Alert.alert('Erreur', 'Aucun produit trouvé');
        return;
      }
      const purchase = await RNIap.requestPurchase({ sku: productIds[0] });
      console.log('Achat réussi:', purchase);
      setHasFullAccess(true);
      Alert.alert('Merci', 'Accès Premium activé !');
    } catch (err) {
      console.error(err);
      Alert.alert('Erreur', 'Paiement échoué');
    }
  };

  const getStatusIcon = () => {
    if (isCompromised === null) return <Shield size={24} color="#6B7280" />;
    return isCompromised
      ? <AlertTriangle size={24} color="#EF4444" />
      : <CheckCircle size={24} color="#10B981" />;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Shield size={48} color="#3B82F6" />
          <Text style={styles.title}>Email Security Scanner</Text>
          <Text style={styles.subtitle}>
            Vérifiez si votre adresse email a été compromise.
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Entrez votre email"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={[styles.scanButton, loading && styles.scanButtonDisabled]}
            onPress={scanEmail}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Search size={20} color="#fff" />
                <Text style={styles.scanButtonText}>Scanner</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {isCompromised !== null && (
          <Animated.View style={[styles.resultContainer, { opacity: fadeAnim }]}>
            <View style={styles.statusCard}>
              {getStatusIcon()}
              <Text style={styles.statusText}>
                {isCompromised
                  ? `Email compromis dans ${results.length} fuite(s)`
                  : `Email sécurisé`}
              </Text>
            </View>

            {isCompromised && !hasFullAccess && (
              <TouchableOpacity onPress={buyPremium} style={styles.premiumButton}>
                <Text style={styles.premiumButtonText}>Débloquer détails premium</Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scrollView: { flex: 1 },
  header: { alignItems: 'center', marginVertical: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1F2937' },
  subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 8 },
  inputContainer: { margin: 20 },
  input: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, fontSize: 16,
    borderColor: '#E5E7EB', borderWidth: 1, marginBottom: 12
  },
  scanButton: {
    backgroundColor: '#3B82F6', padding: 16, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center'
  },
  scanButtonDisabled: { backgroundColor: '#9CA3AF' },
  scanButtonText: { color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  resultContainer: { marginHorizontal: 20 },
  statusCard: {
    backgroundColor: '#fff', padding: 20, borderRadius: 12, alignItems: 'center', marginBottom: 20
  },
  statusText: { fontSize: 16, color: '#1F2937', marginTop: 12 },
  premiumButton: {
    backgroundColor: '#10B981', padding: 12, borderRadius: 8, alignItems: 'center'
  },
  premiumButtonText: { color: '#fff', fontWeight: '600' },
});