const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/verify-email', async (req, res) => {
  const email = req.body.email;

  if (!email) {
    return res.status(400).json({ success: false, error: 'Email manquant.' });
  }

  try {
    const apiKey = process.env.HIBP_API_KEY;
    const response = await axios.get(
      `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}`,
      {
        headers: {
          'hibp-api-key': apiKey,
          'user-agent': 'email-security-scanner'
        },
        params: {
          truncateResponse: false
        }
      }
    );

    res.json({ success: true, data: response.data });
  } catch (err) {
    if (err.response) {
      if (err.response.status === 404) {
        // Pas trouvé => pas compromis
        res.json({ success: true, data: [] });
      } else if (err.response.status === 429) {
        res.json({ success: false, rateLimited: true, remainingTime: 60 });
      } else {
        res.status(err.response.status).json({ success: false, error: err.response.statusText });
      }
    } else {
      res.status(500).json({ success: false, error: err.message });
    }
  }
});

app.listen(port, () => {
  console.log(`✅ Backend en cours sur http://localhost:${port}`);
});