// Serverless proxy simple a FinancialModelingPrep
export default async function handler(req, res) {
  try {
    // Lee el path de destino, por ejemplo: "income-statement/AAPL"
    const path = String(req.query.path || "").replace(/^\/+/, "");
    if (!path) return res.status(400).json({ error: "missing_path" });

    const url = new URL(`https://financialmodelingprep.com/api/v3/${path}`);

    // Copia el resto de query params (period, limit, etc.)
    for (const [k, v] of Object.entries(req.query)) {
      if (k !== "path") url.searchParams.set(k, String(v));
    }

    // Añade tu API key desde Vercel
    url.searchParams.set("apikey", process.env.FMP_API_KEY || "");

    const upstream = await fetch(url.toString(), { headers: { accept: "application/json" } });
    const txt = await upstream.text();

    res.status(upstream.status);
    res.setHeader("Content-Type", upstream.headers.get("content-type") || "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send(txt);
  } catch (e) {
    res.status(500).json({ error: "proxy_error", details: String(e) });
  }
}
