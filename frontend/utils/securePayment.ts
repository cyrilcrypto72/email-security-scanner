import * as RNIap from 'react-native-iap';
import { Platform } from 'react-native';

const PRODUCT_ID = 'unlock_email_details'; // identifiant que tu configures dans App Store Connect

export async function initIAP() {
  try {
    const result = await RNIap.initConnection();
    console.log('✅ IAP Connection: ', result);

    // Optionnel : consommer les achats en attente (Android)
    if (Platform.OS === 'android') {
      await RNIap.flushFailedPurchasesCachedAsPendingAndroid();
    }
  } catch (err) {
    console.error('Erreur IAP init:', err);
  }
}

export function endIAP() {
  try {
    RNIap.endConnection();
    console.log('🚪 IAP connection fermée.');
  } catch (err) {
    console.error('Erreur IAP end:', err);
  }
}

export async function purchaseProduct() {
  try {
    const products = await RNIap.getProducts([PRODUCT_ID]);
    if (!products || products.length === 0) {
      return { success: false, error: 'Produit introuvable' };
    }

    const purchase = await RNIap.requestPurchase({
      skus: [PRODUCT_ID],
      andDangerouslyFinishTransactionAutomatically: true,
    });

    if (purchase.transactionReceipt) {
      // Ici tu peux éventuellement valider le reçu côté serveur si tu veux encore plus sécurisé
      return { success: true };
    }

    return { success: false, error: 'Aucun reçu' };
  } catch (err: any) {
    console.error('Erreur d’achat:', err);
    return { success: false, error: err.message || 'Erreur inconnue' };
  }
}

export async function checkIfUserHasPurchased(): Promise<boolean> {
  try {
    const purchases = await RNIap.getAvailablePurchases();

    const hasProduct = purchases.some(p => {
      return p.productId === PRODUCT_ID;
    });

    console.log('🎫 Achats trouvés:', purchases);

    return hasProduct;
  } catch (err) {
    console.error('Erreur check achats:', err);
    return false;
  }
}

