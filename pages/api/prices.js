// /api/prices.js

export default async function handler(req, res) {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: "Missing 'date' query parameter" });
  }

  try {
    const sheet = [];
    const header = ["Time", "Market Index Price"];
    sheet.push(header);

    for (let period = 1; period <= 50; period++) {
      const url = `https://data.elexon.co.uk/bmrs/api/v1/balancing/pricing/market-index?from=${date}T00:00Z&to=${date}T23:59Z&settlementPeriodFrom=${period}&settlementPeriodTo=${period}`;
      const response = await fetch(url);

      if (!response.ok) {
        console.warn(`Failed to fetch market index data for period ${period}`);
        continue;
      }

      const json = await response.json();
      const validData = json?.data?.filter(entry => entry.price > 0);

      if (!validData || validData.length === 0) continue;

      // Use the first valid price entry (typically APX)
      const priceData = validData[0];

      const time = new Date(priceData.startTime).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Europe/London"
      });

      const row = [time, priceData.price];
      sheet.push(row);
    }

    const formatted = [sheet]; // Infogram expects data wrapped in an array of sheets

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate");
    res.status(200).json(formatted);
  } catch (error) {
    console.error("Error fetching or processing Elexon Market Index data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
