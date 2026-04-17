// Servicio de sincronización con Turso a través de las API routes de Vercel

const API_BASE = '/api/games';

export interface CloudResponse {
  state: any;
  updatedAt: number;
}

export interface CloudError {
  error: string;
  hint?: string;
}

/**
 * Obtener el estado de una partida desde Turso
 */
export async function fetchGameState(code: string): Promise<CloudResponse | null> {
  const res = await fetch(`${API_BASE}/${code.toUpperCase()}`);
  if (res.status === 404) return null;
  if (!res.ok) {
    const body: CloudError = await res.json().catch(() => ({ error: 'Error de red' }));
    throw new Error(body.error || `Error ${res.status}`);
  }
  return res.json();
}

/**
 * Guardar el estado de una partida en Turso
 */
export async function pushGameState(code: string, state: any): Promise<number> {
  const res = await fetch(`${API_BASE}/${code.toUpperCase()}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ state }),
  });
  if (!res.ok) {
    const body: CloudError = await res.json().catch(() => ({ error: 'Error de red' }));
    throw new Error(body.error || `Error ${res.status}`);
  }
  const data = await res.json();
  return data.updatedAt as number;
}

/**
 * Verificar si el backend está configurado (no devuelve 503)
 */
export async function checkBackend(): Promise<'ok' | 'not_configured' | 'error'> {
  try {
    const res = await fetch(`${API_BASE}/__health__`, { method: 'GET' });
    if (res.status === 503) return 'not_configured';
    return 'ok';
  } catch {
    // Si ni siquiera responde (ej: desarrollo local sin API), asumimos error
    return 'error';
  }
}
