// Proxy para FMP: reenvía /api/* a https://financialmodelingprep.com/api/v3/*
// Añade ?apikey= desde variable de entorno y permite CORS.

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { fmp = [], ...rest } = req.query;
    const path = Array.isArray(fmp) ? fmp.join("/") : String(fmp || "");
    const url = new URL(`https://financialmodelingprep.com/api/v3/${path}`);

    // Copia todos los query params (period, limit, symbol, etc.)
    for (const [k, v] of Object.entries(rest)) {
      url.searchParams.append(k, String(v));
    }

    // Añade tu API key
    url.searchParams.set("apikey", process.env.FMP_API_KEY);

    const upstream = await fetch(url.toString(), { headers: { accept: "application/json" } });
    const text = await upstream.text();

    res.status(upstream.status);
    res.setHeader("Content-Type", upstream.headers.get("content-type") || "application/json");
    return res.send(text);
  } catch (err) {
    return res.status(500).json({ error: "proxy_error", details: String(err) });
  }
}
