export default async function handler(req, res) {
  let { date, period } = req.query;

  // Default to yesterday if no date provided
  if (!date) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    date = yesterday.toISOString().split("T")[0];
  }

  const headers = {
    "User-Agent": "FidelityEnergyAPI/1.0"
  };

  // API 1: Indicative Imbalance Prices (SBP/SSP)
  const imbalanceURL = `https://data.elexon.co.uk/bmrs/api/v1/balancing/imbalance-prices?settlementDate=${date}`;

  // API 2: Accepted Balancing Trades (BOAs)
  const acceptedURL = period
    ? `https://data.elexon.co.uk/bmrs/api/v1/balancing/acceptances/all?settlementDate=${date}&settlementPeriod=${period}&format=json`
    : null;

  try {
    const [imbalanceRes, acceptedRes] = await Promise.all([
      fetch(imbalanceURL, { headers }),
      period ? fetch(acceptedURL, { headers }) : Promise.resolve(null)
    ]);

    const imbalanceData = await imbalanceRes.json();
    const acceptedData = acceptedRes ? await acceptedRes.json() : null;

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json({
      date,
      ...(period && { settlementPeriod: Number(period) }),
      indicativePrices: imbalanceData,
      acceptedTrades: acceptedData?.data || []
    });
  } catch (error) {
    console.error("❌ API error:", error.message);
    res.status(500).json({ error: "Failed to retrieve price data from Elexon." });
  }
}
