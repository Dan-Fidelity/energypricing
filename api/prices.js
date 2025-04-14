export default async function handler(req, res) {
  const { dno, voltage, start, end } = req.query;

  if (!dno || !voltage || !start || !end) {
    return res.status(400).json({ error: "Missing required parameters." });
  }

  const url = `https://odegdcpnma.execute-api.eu-west-2.amazonaws.com/development/prices?dno=${dno}&voltage=${voltage}&start=${start}&end=${end}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    res.setHeader("Access-Control-Allow-Origin", "*"); // 👈 allows HubSpot to fetch it
    res.status(200).json(data);
  } catch (err) {
    console.error("API fetch failed:", err);
    res.status(500).json({ error: "Failed to fetch data from source API." });
  }
}
