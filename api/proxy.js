// Proxy serverless a FinancialModelingPrep que acepta:
//   /api/proxy/<cualquier-subruta>  (ej: /api/proxy/ratios/AAPL)
//   o /api/proxy?path=ratios/AAPL&...
export default async function handler(req, res) {
  try {
    // Construye la URL absoluta a partir de la petición
    const base = `http://${req.headers.host}`;
    const urlIn = new URL(req.url, base);

    // Subruta tras /api/proxy/
    const sub = urlIn.pathname.replace(/^\/api\/proxy\/?/, "");
    // Si no viene subruta, admite ?path=...
    const path = sub || String(req.query.path || "").replace(/^\/+/, "");
    if (!path) return res.status(400).json({ error: "missing_path" });

    const target = new URL(`https://financialmodelingprep.com/api/v3/${path}`);

    // Copia todos los query params excepto 'path'
    for (const [k, v] of Object.entries(req.query)) {
      if (k !== "path") target.searchParams.set(k, String(v));
    }

    // Añade tu API key desde Vercel
    target.searchParams.set("apikey", process.env.FMP_API_KEY || "");

    const upstream = await fetch(target.toString(), { headers: { accept: "application/json" } });
    const text = await upstream.text();

    res.status(upstream.status);
    res.setHeader("Content-Type", upstream.headers.get("content-type") || "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send(text);
  } catch (e) {
    res.status(500).json({ error: "proxy_error", details: String(e) });
  }
}
