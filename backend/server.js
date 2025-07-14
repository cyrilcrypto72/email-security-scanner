app.post('/verify-email', async (req, res) => {
  const email = req.body.email;
  const clientApiKey = req.headers['x-api-key'];

  console.log('Clé client reçue :', clientApiKey);
  console.log('Clé serveur attendue :', process.env.HIBP_API_KEY);

  if (!email) {
    return res.status(400).json({ success: false, error: 'Email manquant.' });
  }

  // Vérification que le client envoie bien la clé attendue (facultatif)
  if (clientApiKey !== process.env.HIBP_API_KEY) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    const hibpApiKey = process.env.HIBP_API_KEY;

    const response = await axios.get(
      `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}`,
      {
        headers: {
          'hibp-api-key': hibpApiKey,
          'user-agent': 'email-security-scanner',
        },
        params: {
          truncateResponse: false,
        },
      }
    );

    res.json({ success: true, data: response.data });
  } catch (err) {
    if (err.response) {
      if (err.response.status === 404) {
        res.json({ success: true, data: [] });
      } else if (err.response.status === 429) {
        res.json({ success: false, rateLimited: true, remainingTime: 60 });
      } else {
        res
          .status(err.response.status)
          .json({ success: false, error: err.response.statusText });
      }
    } else {
      res.status(500).json({ success: false, error: err.message });
    }
  }
});