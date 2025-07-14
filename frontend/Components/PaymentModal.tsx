import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function PaymentModal({ visible, onClose, onPaymentSuccess, email, breachCount }: {
  visible: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
  email: string;
  breachCount: number;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Débloquer les détails</Text>
          <Text style={styles.text}>
            Pour voir les détails complets des {breachCount} fuites détectées pour {email}, un paiement est requis.
          </Text>
          <TouchableOpacity style={styles.button} onPress={onPaymentSuccess}>
            <Text style={styles.buttonText}>Payer 2,99€</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancel}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modal: { backgroundColor: 'white', padding: 20, borderRadius: 12, width: '80%' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  text: { marginBottom: 20 },
  button: { backgroundColor: '#3B82F6', padding: 12, borderRadius: 8 },
  buttonText: { color: 'white', textAlign: 'center' },
  cancel: { marginTop: 12, textAlign: 'center', color: 'red' },
});