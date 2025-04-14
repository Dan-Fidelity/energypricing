export default async function handler(req, res) {
  const { dno, voltage, start, end } = req.query;

  if (!dno || !voltage || !start || !end) {
    return res.status(400).json({ error: "Missing required parameters." });
  }

  const url = `https://odegdcpnma.execute-api.eu-west-2.amazonaws.com/development/prices?dno=10&voltage=HV&start=01-06-2021&end=03-06-2021`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(data);
  } catch (err) {
    console.error("API fetch failed:", err);
    res.status(500).json({ error: "Failed to fetch data from source API." });
  }
}
