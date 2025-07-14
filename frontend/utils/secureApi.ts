import axios from 'axios';

const BACKEND_URL = 'https://ton-backend-deployé/render/heroku/autre/verify-email';

export async function secureApiCall(email: string, apiKey: string) {
  try {
    const res = await axios.post(
      BACKEND_URL,
      { email },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`
        },
        timeout: 5000
      }
    );

    if (res.data?.isCompromised !== undefined) {
      return { success: true, data: res.data.breaches || [] };
    } else {
      return { success: false, error: 'Réponse invalide' };
    }
  } catch (err: any) {
    if (err.response?.status === 429) {
      return { success: false, rateLimited: true, remainingTime: 60 };
    }
    return { success: false, error: err.message || 'Erreur réseau' };
  }
}

