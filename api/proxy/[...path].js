// Proxy a FinancialModelingPrep que acepta /api/proxy/<lo-que-sea>
// y también /api/proxy?path=<lo-que-sea>
export default async function handler(req, res) {
  try {
    // Construimos la URL de la petición
    const base = `http://${req.headers.host}`;
    const inUrl = new URL(req.url, base);

    // subruta tras /api/proxy/
    const sub = inUrl.pathname.replace(/^\/api\/proxy\/?/, "");
    // o parámetro ?path=
    const qpath = (inUrl.searchParams.get("path") || "").replace(/^\/+/, "");
    const path = sub || qpath;
    if (!path) return res.status(400).json({ error: "missing_path" });

    const target = new URL(`https://financialmodelingprep.com/api/v3/${path}`);

    // Copia todos los query params excepto 'path'
    inUrl.searchParams.forEach((v, k) => {
      if (k !== "path") target.searchParams.set(k, v);
    });

    // Añade tu API key (definida en Vercel)
    target.searchParams.set("apikey", process.env.FMP_API_KEY || "");

    const upstream = await fetch(target.toString(), { headers: { accept: "application/json" } });
    const body = await upstream.text();

    res.status(upstream.status);
    res.setHeader("Content-Type", upstream.headers.get("content-type") || "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send(body);
  } catch (e) {
    res.status(500).json({ error: "proxy_error", details: String(e) });
  }
}
