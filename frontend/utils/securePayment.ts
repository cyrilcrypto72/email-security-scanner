export async function hasSecurePaidAccess(email: string): Promise<boolean> {
  // Ici tu dois interroger ton backend pour vérifier si la personne a payé
  // Mock pour l'instant
  return false;
}

export async function processSecurePayment(email: string, amount: number): Promise<{ success: boolean; error?: string }> {
  // Ici tu déclencheras le paiement In-App Purchase réel sur iOS
  // Mock pour l'instant
  return { success: true };
}

