/**************************************
 * server.js - Improved Version
 **************************************/
require("dotenv").config(); // Load variables from .env
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure API Key is set
if (!process.env.ALPHA_VANTAGE_KEY) {
  console.error("❌ Missing ALPHA_VANTAGE_KEY in .env file!");
  process.exit(1);
}

// Enable CORS for frontend requests
app.use(cors());

// Fetch historical stock data
app.get("/api/historical", async (req, res) => {
  try {
    const symbol = req.query.symbol;
    if (!symbol) {
      return res.status(400).json({ error: "Please provide a stock symbol (e.g. ?symbol=TSLA)" });
    }

    const apiKey = process.env.ALPHA_VANTAGE_KEY;
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${symbol}&outputsize=full&apikey=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data["Note"]) {
      return res.status(429).json({ error: "Rate limit exceeded. Please wait and try again.", details: data["Note"] });
    }

    if (data["Error Message"] || !data["Time Series (Daily)"]) {
      return res.status(500).json({ error: "Error fetching historical data from Alpha Vantage", details: data });
    }

    res.json(data);
  } catch (error) {
    console.error("Error in /api/historical:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Fetch sentiment analysis data
app.get("/api/sentiment", async (req, res) => {
  try {
    const symbol = req.query.symbol;
    if (!symbol) {
      return res.status(400).json({ error: "Please provide a stock symbol (e.g. ?symbol=TSLA)" });
    }

    const apiKey = process.env.ALPHA_VANTAGE_KEY;
    const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${symbol}&apikey=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data["Note"]) {
      return res.status(429).json({ error: "Rate limit exceeded. Please wait and try again.", details: data["Note"] });
    }

    if (!data.feed) {
      return res.status(500).json({ error: "Error fetching news sentiment data from Alpha Vantage", details: data });
    }

    res.json(data);
  } catch (error) {
    console.error("Error in /api/sentiment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the server and handle port errors
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
}).on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} is already in use. Try a different port.`);
    process.exit(1);
  } else {
    console.error("❌ Server error:", err);
  }
});
