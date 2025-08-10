// Proxy serverless a FinancialModelingPrep con token
export default async function handler(req, res) {
  try {
    // 1) Requiere un token (en query ?key= o header x-proxy-key)
    const incomingKey = String(req.query.key || req.headers["x-proxy-key"] || "");
    const expectedKey = String(process.env.PROXY_TOKEN || "");
    if (!expectedKey || incomingKey !== expectedKey) {
      return res.status(401).json({ error: "unauthorized" });
    }

    // 2) Ruta destino (path=... ej: ratios/AAPL)
    const path = String(req.query.path || "").replace(/^\/+/, "");
    if (!path) return res.status(400).json({ error: "missing_path" });

    const url = new URL(`https://financialmodelingprep.com/api/v3/${path}`);

    // 3) Copia el resto de parámetros (period, limit, symbol, etc.)
    for (const [k, v] of Object.entries(req.query)) {
      if (k !== "path" && k !== "key") url.searchParams.set(k, String(v));
    }

    // 4) Añade tu API key de FMP (entorno Vercel)
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
