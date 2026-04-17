// Vercel Edge Function — GET / PUT estado de una partida en Turso
// Variables de entorno necesarias en Vercel:
//   TURSO_DATABASE_URL=libsql://monopoly-bank-xxx.aws-eu1.turso.io
//   TURSO_AUTH_TOKEN=eyJhbGciOiJF...

export const config = { runtime: 'edge' };

const HEADERS = {
  'content-type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: HEADERS });
  }

  const url = new URL(req.url);
  const segments = url.pathname.split('/').filter(Boolean);
  const code = segments[segments.length - 1]?.toUpperCase();

  if (!code || code.length < 1) {
    return new Response(JSON.stringify({ error: 'Código de partida no proporcionado' }), {
      status: 400,
      headers: HEADERS,
    });
  }

  // Dynamically import Turso client
  let client: any;
  try {
    const { createClient } = await import('@libsql/client/web');
    const dbUrl = process.env.TURSO_DATABASE_URL;
    const dbToken = process.env.TURSO_AUTH_TOKEN;
    if (!dbUrl || !dbToken) {
      return new Response(
        JSON.stringify({
          error: 'Base de datos no configurada',
          hint: 'Configura TURSO_DATABASE_URL y TURSO_AUTH_TOKEN como variables de entorno en Vercel → Settings → Environment Variables.',
        }),
        { status: 503, headers: HEADERS }
      );
    }
    client = createClient({ url: dbUrl, authToken: dbToken });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: 'Error al conectar con Turso: ' + err.message }),
      { status: 500, headers: HEADERS }
    );
  }

  try {
    // ──── GET: obtener estado de partida ────
    if (req.method === 'GET') {
      const result = await client.execute({
        sql: 'SELECT state, updated_at FROM games WHERE code = ?',
        args: [code],
      });
      if (result.rows.length === 0) {
        return new Response(JSON.stringify({ error: 'Partida no encontrada' }), {
          status: 404,
          headers: HEADERS,
        });
      }
      const row = result.rows[0];
      const state = typeof row.state === 'string' ? JSON.parse(row.state) : row.state;
      const updatedAt = Number(row.updated_at);
      return new Response(JSON.stringify({ state, updatedAt }), { headers: HEADERS });
    }

    // ──── PUT: crear o actualizar partida ────
    if (req.method === 'PUT') {
      const body = await req.json();
      const stateStr = typeof body.state === 'string' ? body.state : JSON.stringify(body.state);
      const now = Date.now();
      await client.execute({
        sql: `INSERT INTO games (code, state, updated_at) VALUES (?, ?, ?)
              ON CONFLICT(code) DO UPDATE SET state = excluded.state, updated_at = excluded.updated_at`,
        args: [code, stateStr, now],
      });
      return new Response(JSON.stringify({ ok: true, updatedAt: now }), { headers: HEADERS });
    }

    return new Response(JSON.stringify({ error: 'Método no permitido' }), {
      status: 405,
      headers: HEADERS,
    });
  } catch (err: any) {
    console.error('Turso error:', err);
    return new Response(JSON.stringify({ error: 'Error de base de datos: ' + (err.message || String(err)) }), {
      status: 500,
      headers: HEADERS,
    });
  }
}
