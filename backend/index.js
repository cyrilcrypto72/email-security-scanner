require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const API_KEY = process.env.HIBP_API_KEY;

app.post('/verify-email', async (req, res) => {
    const email = req.body.email;
    if (!email) {
        return res.status(400).json({ error: 'Email requis.' });
    }

    try {
        const response = await axios.get(
            `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}`,
            {
                headers: {
                    'hibp-api-key': API_KEY,
                    'user-agent': 'email-security-scanner'
                },
                params: {
                    truncateResponse: false
                }
            }
        );
        res.json({ success: true, data: response.data });
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return res.json({ success: true, data: [] });
        }
        res.json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Backend en écoute sur le port ${PORT}`);
});