export function validateAndSanitizeEmail(email: string) {
  const trimmed = email.trim().toLowerCase();

  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!regex.test(trimmed)) {
    return { isValid: false, sanitized: '', error: 'Adresse email invalide' };
  }

  return { isValid: true, sanitized: trimmed };
}

export function secureCleanup(data: any) {
  // Ici tu peux par exemple « nettoyer » la mémoire en supprimant les données sensibles
  if (data.email) data.email = '';
  if (data.results) data.results = [];
}

