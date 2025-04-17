// /api/prices.js

export default async function handler(req, res) {
  try {
    const sheet = [];
    const header = ["Date", "Market Index Price"];
    sheet.push(header);

    const today = new Date();

    // Fetch data for the last 365 days
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split("T")[0];

      const url = `https://data.elexon.co.uk/bmrs/api/v1/balancing/pricing/market-index?from=${dateString}T00:00Z&to=${dateString}T23:59Z`;
      const response = await fetch(url);

      if (!response.ok) {
        console.warn(`Failed to fetch market index data for ${dateString}`);
        continue;
      }

      const json = await response.json();
      const validData = json?.data?.filter(entry => entry.price > 0);

      if (!validData || validData.length === 0) continue;

      // Calculate average market index price for the day
      const averagePrice = validData.reduce((sum, entry) => sum + entry.price, 0) / validData.length;

      const row = [dateString, Math.round(averagePrice * 100) / 100];
      sheet.push(row);
    }

    const formatted = [sheet]; // Infogram expects data wrapped in an array of sheets

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate");
    res.status(200).json(formatted);
  } catch (error) {
    console.error("Error fetching or processing Elexon Market Index data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
