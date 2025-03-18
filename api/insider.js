'use strict';

const express = require('express');
const request = require('request');
const router = express.Router();

/**
 * GET /api/insider
 * Optional query param: ?symbol=IBM
 * Example: /api/insider?symbol=AAPL
 */
router.get('/', (req, res) => {
  // If the client doesn't pass a symbol, default to IBM:
  const symbol = req.query.symbol || 'IBM';

  // Use an environment variable for your real API key, or fallback to "demo"
  const apikey = process.env.ALPHA_VANTAGE_API_KEY || 'demo';

  // Construct the Alpha Vantage insider URL
  const url = `https://www.alphavantage.co/query?function=INSIDER_TRANSACTIONS&symbol=${symbol}&apikey=${apikey}`;

  // Make the request
  request.get(
    {
      url: url,
      json: true, // automatically parses JSON
      headers: { 'User-Agent': 'request' }
    },
    (err, response, data) => {
      if (err) {
        console.error('Error:', err);
        return res.status(500).json({ error: 'Error fetching insider data' });
      } else if (response.statusCode !== 200) {
        console.error('Status:', response.statusCode);
        return res.status(response.statusCode).json({ error: `Status code: ${response.statusCode}` });
      } else {
        // data is successfully parsed as a JSON object
        // You can transform or filter data here if needed before sending to client
        return res.json(data);
      }
    }
  );
});

module.exports = router;
