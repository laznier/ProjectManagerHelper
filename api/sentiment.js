// api/sentiment.js

export default async function handler(req, res) {
    try {
      // 1. Grab the symbol from the query string, e.g. /api/sentiment?symbol=TSLA
      const symbol = req.query.symbol;
      if (!symbol) {
        return res
          .status(400)
          .json({ error: "Please provide a stock symbol (e.g. ?symbol=TSLA)" });
      }
  
      // 2. Use your hidden API key
      const apiKey = process.env.ALPHA_VANTAGE_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Missing ALPHA_VANTAGE_KEY env var" });
      }
  
      // 3. Build the Alpha Vantage URL
      const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${symbol}&apikey=${apiKey}`;
  
      // 4. Fetch data
      const response = await fetch(url);
      const data = await response.json();
  
      // 5. Check if the data is valid
      if (!data.feed) {
        return res.status(500).json({
          error: "Error fetching news sentiment data from Alpha Vantage",
          details: data,
        });
      }
  
      // 6. Return data
      return res.json(data);
    } catch (error) {
      console.error("Error in /api/sentiment route:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
  