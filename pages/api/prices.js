// /api/prices.js

export default async function handler(req, res) {
  try {
    const sheet = [];
    const header = ["Date", "Market Index Price"];
    sheet.push(header);

    const today = new Date();
    const maxDays = 365;
    const concurrencyLimit = 10; // Limit the number of parallel requests
    const allDates = [];

    for (let i = 0; i < maxDays; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split("T")[0];
      allDates.push(dateString);
    }

    async function fetchBatch(dates) {
      return Promise.allSettled(
        dates.map(async (dateString) => {
          const url = `https://data.elexon.co.uk/bmrs/api/v1/balancing/pricing/market-index?from=${dateString}T00:00Z&to=${dateString}T23:59Z`;
          const res = await fetch(url);
          const json = await res.json();
          return { date: dateString, json };
        })
      );
    }

    for (let i = 0; i < allDates.length; i += concurrencyLimit) {
      const batch = allDates.slice(i, i + concurrencyLimit);
      const results = await fetchBatch(batch);

      for (const result of results) {
        if (result.status !== "fulfilled") continue;
        const { date, json } = result.value;

        const validData = json?.data?.filter(entry => entry.price > 0);
        if (!validData || validData.length === 0) continue;

        const averagePrice = validData.reduce((sum, entry) => sum + entry.price, 0) / validData.length;
        sheet.push([date, Math.round(averagePrice * 100) / 100]);
      }
    }

    const formatted = [sheet];

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate");
    res.status(200).json(formatted);
  } catch (error) {
    console.error("Error fetching or processing Elexon Market Index data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
