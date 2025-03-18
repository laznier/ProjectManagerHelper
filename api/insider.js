'use strict';

const express = require('express');
const router = express.Router();

// If you're on Node < 18 or do not have fetch globally, you need:
// const fetch = require('node-fetch');

router.get('/', async (req, res) => {
  // Allow cross-origin requests
  res.setHeader("Access-Control-Allow-Origin", "*");
  
  // Get the symbol from query params or default to IBM
  const symbol = req.query.symbol || 'IBM';
  
  // Use the API key from environment (ensure it's set in Vercel as ALPHA_VANTAGE_KEY)
  const apiKey = process.env.ALPHA_VANTAGE_KEY;
  console.log("ENV KEY in insider route:", apiKey);

  if (!apiKey) {
    return res.status(500).json({ error: "Missing ALPHA_VANTAGE_KEY env var" });
  }

  // Construct the Alpha Vantage URL for insider transactions
  const url = `https://www.alphavantage.co/query?function=INSIDER_TRANSACTIONS&symbol=${symbol}&apikey=${apiKey}`;
  
  try {
    // Fetch data from Alpha Vantage
    const response = await fetch(url);
    const data = await response.json();

    // Log the entire response to see what alpha vantage returned
    console.log("Alpha Vantage insider response:", data);
    
    // Check if data contains the expected insider transactions array
    if (!data.data) {
      return res.status(500).json({
        error: "Error fetching insider data from Alpha Vantage",
        details: data
      });
    }
    
    // Return the fetched data to the client
    res.json(data);
  } catch (err) {
    console.error("Error in insider route:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
