export default async function handler(req, res) {
  const { date, period } = req.query;

  if (!date || !period) {
    return res.status(400).json({ error: "Missing 'date' or 'period' query parameter" });
  }

  const endpoint = `https://data.elexon.co.uk/bmrs/api/v1/balancing/settlement/system-prices/${date}/${period}?format=json`;

  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`Elexon API returned ${response.status}`);
    }

    const data = await response.json();

    return res.status(200).json({
      date,
      settlementPeriod: period,
      systemPrices: data,
    });
  } catch (error) {
    console.error("Failed to fetch Elexon system prices:", error);
    return res.status(500).json({ error: "Failed to fetch data", details: error.message });
  }
}
