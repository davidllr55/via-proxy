// Proxy serverless a FinancialModelingPrep usando ?path=...
export default async function handler(req, res) {
  try {
    const path = String(req.query.path || "").replace(/^\/+/, "");
    if (!path) return res.status(400).json({ error: "missing_path" });

    const url = new URL(`https://financialmodelingprep.com/api/v3/${path}`);

    // Copia el resto de parámetros (period, limit, etc.)
    for (const [k, v] of Object.entries(req.query)) {
      if (k !== "path") url.searchParams.set(k, String(v));
    }

    // Añade la API key desde Vercel
    url.searchParams.set("apikey", process.env.FMP_API_KEY || "");

    const r = await fetch(url.toString(), { headers: { accept: "application/json" } });
    const txt = await r.text();

    res.status(r.status);
    res.setHeader("Content-Type", r.headers.get("content-type") || "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send(txt);
  } catch (e) {
    res.status(500).json({ error: "proxy_error", details: String(e) });
  }
}
