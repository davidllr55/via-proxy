// Serverless proxy a FinancialModelingPrep
export default async function handler(req, res) {
  try {
    const { fmp = [], ...rest } = req.query;
    const path = Array.isArray(fmp) ? fmp.join("/") : String(fmp || "");
    const url = new URL(`https://financialmodelingprep.com/api/v3/${path}`);

    // Copia query params (symbol, period, limit...)
    for (const [k, v] of Object.entries(rest)) url.searchParams.append(k, String(v));

    // Añade API key desde el entorno de Vercel
    url.searchParams.set("apikey", process.env.FMP_API_KEY || "");

    const r = await fetch(url.toString(), { headers: { accept: "application/json" } });
    const text = await r.text();

    res.status(r.status);
    res.setHeader("Content-Type", r.headers.get("content-type") || "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.send(text);
  } catch (e) {
    res.status(500).json({ error: "proxy_error", details: String(e) });
  }
}

