export const runtime = 'edge';

export default function handler() {
  return new Response(JSON.stringify({ ok: true, time: new Date().toISOString() }), {
    headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' }
  });
}
