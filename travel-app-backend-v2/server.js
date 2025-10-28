require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;
const RESROBOT_API_KEY = process.env.RESROBOT_API_KEY;

// --- Authentication Middleware ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401); // Unauthorized

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Forbidden
    req.user = user;
    next();
  });
};

// --- 1. Authentication ---
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  // Simple hardcoded user for now
  if (email === 'test' && password === 'test') {
    const user = { email: 'test@test.com' };
    const accessToken = jwt.sign(user, JWT_SECRET, { expiresIn: '1d' });
    return res.json({ token: accessToken });
  }

  // We will add Stripe logic here in Phase 4
  return res.status(401).json({ message: 'Felaktigt användarnamn eller lösenord' });
});

// --- 2. API Proxies ---

const RESROBOT_BASE_URL = 'https://api.resrobot.se/v2.1';

// Proxy for Location Autocomplete
app.get('/api/proxy/location', authenticateToken, async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ message: 'Query is required' });

  try {
    const url = `${RESROBOT_BASE_URL}/location.name?key=${RESROBOT_API_KEY}&input=${encodeURIComponent(query)}&format=json`;
    const apiResponse = await fetch(url);
    const data = await apiResponse.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Serverfel vid hämtning av platser' });
  }
});

// Proxy for Trip Search
app.get('/api/proxy/trip', authenticateToken, async (req, res) => {
  const { fromId, toId, date, time } = req.query;
  if (!fromId || !toId) return res.status(400).json({ message: 'From and To are required' });

  try {
    const params = new URLSearchParams({
      key: RESROBOT_API_KEY,
      originExtId: fromId,
      destExtId: toId,
      format: 'json',
    });
    if (date) params.append('date', date);
    if (time) params.append('time', time);

    const url = `${RESROBOT_BASE_URL}/trip?${params.toString()}`;
    const apiResponse = await fetch(url);
    const data = await apiResponse.json();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Serverfel vid hämtning av resor' });
  }
});


app.listen(PORT, () => {
  console.log(`Clean backend running on http://localhost:${PORT}`);
});
