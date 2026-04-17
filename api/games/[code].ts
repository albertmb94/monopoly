// Vercel Serverless Function — GET / PUT estado de una partida
// Requisitos:
//   1. Variables de entorno en Vercel:
//        TURSO_DATABASE_URL=libsql://...
//        TURSO_AUTH_TOKEN=eyJhbGc...
//   2. Tabla en Turso:
//        CREATE TABLE games (
//          code TEXT PRIMARY KEY,
//          state TEXT NOT NULL,
//          updated_at INTEGER NOT NULL
//        );
//
// Para activar: instalar `@libsql/client` con `npm i @libsql/client` y descomentar el código.

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const code = url.pathname.split('/').pop()?.toUpperCase();
  if (!code) {
    return new Response(JSON.stringify({ error: 'Missing game code' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  // Descomenta cuando configures Turso:
  /*
  const { createClient } = await import('@libsql/client/web');
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  if (req.method === 'GET') {
    const result = await client.execute({
      sql: 'SELECT state, updated_at FROM games WHERE code = ?',
      args: [code],
    });
    if (result.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Game not found' }), {
        status: 404, headers: { 'content-type': 'application/json' },
      });
    }
    const row = result.rows[0] as any;
    return new Response(
      JSON.stringify({ state: JSON.parse(row.state), updatedAt: row.updated_at }),
      { headers: { 'content-type': 'application/json' } }
    );
  }

  if (req.method === 'PUT') {
    const body = await req.json();
    await client.execute({
      sql: `INSERT INTO games (code, state, updated_at) VALUES (?, ?, ?)
            ON CONFLICT(code) DO UPDATE SET state = excluded.state, updated_at = excluded.updated_at`,
      args: [code, JSON.stringify(body.state), Date.now()],
    });
    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'content-type': 'application/json' },
    });
  }
  */

  return new Response(
    JSON.stringify({
      error: 'Modo multi-dispositivo no configurado',
      hint: 'Configura TURSO_DATABASE_URL y TURSO_AUTH_TOKEN en Vercel y descomenta el código en api/games/[code].ts',
    }),
    { status: 501, headers: { 'content-type': 'application/json' } }
  );
}
