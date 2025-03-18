// api/insider.js

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    const symbol = req.query.symbol;
    if (!symbol) {
      return res
        .status(400)
        .json({ error: "Please provide a stock symbol (e.g. ?symbol=IBM)" });
    }

    const apiKey = process.env.ALPHA_VANTAGE_KEY;
    if (!apiKey) {
      return res
        .status(500)
        .json({ error: "Missing ALPHA_VANTAGE_KEY env var" });
    }

    const url = `https://www.alphavantage.co/query?function=INSIDER_TRANSACTIONS&symbol=${symbol}&apikey=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.data) {
      return res
        .status(500)
        .json({
          error: "Error fetching insider data from Alpha Vantage",
          details: data,
        });
    }

    return res.json(data);
  } catch (error) {
    console.error("Error in /api/insider route:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
