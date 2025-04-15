export default async function handler(req, res) {
  let { date } = req.query;

  if (!date) {
    const today = new Date().toISOString().split("T")[0];
    date = today;
  }

  const url = `https://data.elexon.co.uk/bmrs/api/v1/balancing/imbalance-prices?settlementDate=${date}`;

  try {
    console.log("🔗 Fetching:", url);
    const response = await fetch(url);
    const text = await response.text();

    console.log("📦 Status:", response.status);
    console.log("🧾 Raw Response:", text);

    if (!response.ok) throw new Error(`Elexon API returned ${response.status}`);

    const data = JSON.parse(text);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(data);
  } catch (error) {
    console.error("❌ Fetch error:", error.message);
    res.status(500).json({ error: "Failed to retrieve data from Elexon." });
  }
}
