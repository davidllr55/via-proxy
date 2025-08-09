// Edge Function: proxy a FinancialModelingPrep
export const runtime = 'edge';

export default async function handler(req) {
  const reqUrl = new URL(req.url);

  // todo lo que venga tras /api/ lo usamos como ruta hacia FMP
  const path = reqUrl.pathname.replace(/^\/api\//, '');
  const target = new URL(`https://financialmodelingprep.com/api/v3/${path}`);

  // copia todos los query params (symbol, period, limit, etc.)
  reqUrl.searchParams.forEach((v, k) => target.searchParams.set(k, v));

  // añade tu API key desde la variable de entorno de Vercel
  target.searchParams.set('apikey', process.env.FMP_API_KEY || '');

  const upstream = await fetch(target.toString(), {
    headers: { accept: 'application/json' }
  });

  const body = await upstream.text();

  return new Response(body, {
    status: upstream.status,
    headers: {
      'content-type': upstream.headers.get('content-type') || 'application/json',
      'access-control-allow-origin': '*'
    }
  });
}
