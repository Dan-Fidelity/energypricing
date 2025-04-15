export default function handler(req, res) {
  const { date } = req.query;

  res.status(200).json({
    message: "✅ API is alive",
    date: date || "none provided"
  });
}
