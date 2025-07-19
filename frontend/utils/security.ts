export function validateAndSanitizeEmail(email: string): { isValid: boolean; sanitized: string; error?: string } {
  const sanitized = email.trim().toLowerCase();

  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(sanitized)) {
    return { isValid: false, sanitized, error: 'Email invalide.' };
  }

  return { isValid: true, sanitized };
}

export function secureCleanup(data: any) {
  try {
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        delete data[key];
      }
    }
  } catch (err) {
    console.error('Erreur nettoyage:', err);
  }
}
