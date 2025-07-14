import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shield, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Search } from 'lucide-react-native';
import { saveSearchHistory, BreachData } from '../utils/secureStorage';
import PaymentModal from './PaymentModal';
import { hasSecurePaidAccess, processSecurePayment } from '../utils/securePayment';
import { secureApiCall } from '../utils/secureApi';
import { validateAndSanitizeEmail, secureCleanup } from '../utils/security';

export default function Scanner() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [isCompromised, setIsCompromised] = useState<boolean | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [hasFullAccess, setHasFullAccess] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  const scanEmail = async () => {
    const emailValidation = validateAndSanitizeEmail(email);
    if (!emailValidation.isValid) {
      Alert.alert('Erreur', emailValidation.error || 'Email invalide');
      return;
    }

    const sanitizedEmail = emailValidation.sanitized;

    setLoading(true);
    setResults([]);
    setIsCompromised(null);
    setHasFullAccess(false);
    setRateLimited(false);

    try {
      const apiResponse = await secureApiCall(sanitizedEmail, 'YOUR_API_KEY');

      if (!apiResponse.success) {
        if (apiResponse.rateLimited) {
          setRateLimited(true);
          setRemainingTime(apiResponse.remainingTime || 0);
          Alert.alert(
            'Limite atteinte',
            `Trop de requêtes. Réessayez dans ${apiResponse.remainingTime} secondes.`
          );
          return;
        }

        Alert.alert('Erreur', apiResponse.error || 'Erreur lors de la vérification');
        return;
      }

      const data = apiResponse.data;

      if (data && data.length > 0) {
        setResults(data);
        setIsCompromised(true);

        const paidAccess = await hasSecurePaidAccess(sanitizedEmail);
        setHasFullAccess(paidAccess);
      } else {
        setIsCompromised(false);
        setResults([]);
        setHasFullAccess(true);
      }

      const breachData: BreachData = {
        email: sanitizedEmail,
        breachCount: data.length,
        breaches: data,
        scannedAt: new Date().toISOString(),
      };
      await saveSearchHistory(breachData);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Service temporairement indisponible. Veuillez réessayer.');
    } finally {
      setLoading(false);

      setTimeout(() => {
        secureCleanup({ email: sanitizedEmail });
      }, 1000);
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      const emailValidation = validateAndSanitizeEmail(email);
      if (!emailValidation.isValid) return;

      const paymentResult = await processSecurePayment(emailValidation.sanitized, 2.99);
      if (paymentResult.success) {
        setHasFullAccess(true);
        Alert.alert('Succès', 'Paiement traité avec succès !');
      } else {
        Alert.alert('Erreur', paymentResult.error || 'Erreur de paiement');
      }
    } catch (error) {
      console.error('Erreur paiement:', error);
      Alert.alert('Erreur', 'Erreur lors du traitement du paiement');
    }
  };

  const handleViewDetails = () => {
    if (hasFullAccess) return;
    setShowPaymentModal(true);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  const getStatusColor = (): string => {
    if (isCompromised === null) return '#6B7280';
    return isCompromised ? '#EF4444' : '#10B981';
  };

  const getStatusIcon = () => {
    if (isCompromised === null) return <Shield size={24} color="#6B7280" />;
    return isCompromised
      ? <AlertTriangle size={24} color="#EF4444" />
      : <CheckCircle size={24} color="#10B981" />;
  };

  useEffect(() => {
    return () => secureCleanup({ email, results });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Shield size={48} color="#3B82F6" />
          <Text style={styles.title}>Email Security Scanner</Text>
          <Text style={styles.subtitle}>
            Vérifiez si votre adresse email a été compromise dans des fuites de données
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Entrez votre adresse email"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={[styles.scanButton, (loading || rateLimited) && styles.scanButtonDisabled]}
            onPress={scanEmail}
            disabled={loading || rateLimited}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Search size={20} color="white" />
                <Text style={styles.scanButtonText}>Scanner</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {isCompromised !== null && (
          <Animated.View style={[styles.resultContainer, { opacity: fadeAnim }]}>
            <View style={[styles.statusCard, { borderColor: getStatusColor() }]}>
              <View style={styles.statusHeader}>
                {getStatusIcon()}
                <Text style={[styles.statusText, { color: getStatusColor() }]}>
                  {isCompromised ? 'Email compromis' : 'Email sécurisé'}
                </Text>
              </View>

              {isCompromised ? (
                <Text style={styles.statusDescription}>
                  Votre adresse email a été trouvée dans {results.length} fuite(s) de données vérifiées.
                </Text>
              ) : (
                <Text style={styles.statusDescription}>
                  ✅ Votre adresse email n'a pas été trouvée dans les bases de données connues.
                </Text>
              )}
            </View>
          </Animated.View>
        )}
      </ScrollView>

      <PaymentModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSuccess={handlePaymentSuccess}
        email={email}
        breachCount={results.length}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scrollView: { flex: 1 },
  header: { alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 30 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1F2937', marginTop: 16, marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6B7280', textAlign: 'center', lineHeight: 24 },
  inputContainer: { paddingHorizontal: 20, marginBottom: 20 },
  input: { backgroundColor: 'white', padding: 16, borderRadius: 12, fontSize: 16, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 16 },
  scanButton: { backgroundColor: '#3B82F6', padding: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  scanButtonDisabled: { backgroundColor: '#9CA3AF' },
  scanButtonText: { color: 'white', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  resultContainer: { paddingHorizontal: 20 },
  statusCard: { backgroundColor: 'white', padding: 20, borderRadius: 16, borderWidth: 2, marginBottom: 20 },
  statusHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  statusText: { fontSize: 18, fontWeight: 'bold', marginLeft: 12 },
  statusDescription: { fontSize: 14, color: '#6B7280', lineHeight: 20 }
});