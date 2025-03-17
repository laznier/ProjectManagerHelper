// server.js
require('dotenv').config(); // Loads variables from a .env file if present
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint that fetches data from Alpha Vantage using your secret API key
app.get('/api/alpha-vantage', async (req, res) => {
  try {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY; // Securely loaded from environment variables
    const symbol = 'IBM'; // Example symbol (change as needed)
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching data' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
