export default async function handler(req, res) {
  const { dno, voltage, start, end } = req.query;

  if (!dno || !voltage || !start || !end) {
    return res.status(400).json({ error: "Missing required parameters." });
  }

  const url = `https://odegdcpnma.execute-api.eu-west-2.amazonaws.com/development/prices?dno=${dno}&voltage=${voltage}&start=${start}&end=${end}`;

  try {
    const response = await fetch(url);
    const text = await response.text();

    console.log("🔗 Fetch URL:", url);
    console.log("📦 Status:", response.status);
    console.log("🧾 Body:", text);

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = JSON.parse(text);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(data);
  } catch (err) {
    console.error("❌ API fetch failed:", err.message);
    res.status(500).json({ error: err.message || "API fetch failed." });
  }
}
