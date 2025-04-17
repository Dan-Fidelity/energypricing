// /api/prices.js

export default async function handler(req, res) {
  const { date, period } = req.query;

  if (!date || !period) {
    return res.status(400).json({ error: "Missing 'date' or 'period' query parameter" });
  }

  try {
    const url = `https://data.elexon.co.uk/bmrs/api/v1/balancing/settlement/system-prices/${date}/${period}?format=json`;
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch data from Elexon' });
    }

    const data = await response.json();
    const priceData = data?.data?.[0];

    if (!priceData) {
      return res.status(404).json({ error: 'No system price data found for this period' });
    }

    const simplified = {
      date,
      period,
      prices: [
        {
          settlementPeriod: priceData.settlementPeriod,
          buyPrice: priceData.systemBuyPrice,
          sellPrice: priceData.systemSellPrice,
          imbalanceVolume: Math.round(priceData.netImbalanceVolume * 100) / 100,
          startTime: priceData.startTime
        }
      ]
    };

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    res.status(200).json(simplified);
  } catch (error) {
    console.error('Error fetching or processing Elexon data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
