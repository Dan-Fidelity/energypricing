export default async function handler(req, res) {
  const { date = new Date().toISOString().split("T")[0] } = req.query;

  const url = `https://data.elexon.co.uk/bmrs/api/v1/balancing/imbalance-prices?settlementDate=${date}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(data);
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ error: "Failed to retrieve data from Elexon." });
  }
}
