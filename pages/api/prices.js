// /api/prices.js

export default async function handler(req, res) {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: "Missing 'date' query parameter" });
  }

  try {
    const sheet = [];
    const header = ["Time", "System Buy Price", "System Sell Price"];
    sheet.push(header);

    for (let period = 1; period <= 50; period++) {
      const url = `https://data.elexon.co.uk/bmrs/api/v1/balancing/settlement/system-prices/${date}/${period}?format=json`;
      const response = await fetch(url);

      if (!response.ok) {
        console.warn(`Failed to fetch data for period ${period}`);
        continue;
      }

      const json = await response.json();
      const priceData = json?.data?.[0];

      if (!priceData) continue;

      const time = new Date(priceData.startTime).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Europe/London"
      });

      const row = [time, priceData.systemBuyPrice, priceData.systemSellPrice];
      sheet.push(row);
    }

    const formatted = [sheet]; // Infogram expects data wrapped in an array of sheets

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate");
    res.status(200).json(formatted);
  } catch (error) {
    console.error("Error fetching or processing Elexon data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
