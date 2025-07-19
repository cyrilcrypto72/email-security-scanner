import axios from 'axios';

const BACKEND_URL = 'https://email-security-scanner.onrender.com';

export async function secureApiCall(email: string, apiKey: string) {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/verify-email`,
      { email },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        timeout: 5000,
      }
    );

    return { success: true, data: response.data };
  } catch (err: any) {
    if (err.response?.status === 429) {
      return {
        success: false,
        rateLimited: true,
        remainingTime: 60,
        error: 'Trop de requêtes, réessayez plus tard.',
      };
    }
    console.error('secureApiCall error:', err);
    return { success: false, error: err.message || 'Erreur API' };
  }
}

