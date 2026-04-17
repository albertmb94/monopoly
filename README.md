# 🏦 Banca Monopoly

Webapp responsiva (mobile-first) para reemplazar el dinero físico y automatizar las mecánicas de una partida de Monopoly.

## 🎮 Modos de juego

### 📱 Modo en este dispositivo (recomendado)
**Funciona out-of-the-box, sin configuración.** El admin crea la partida, da de alta a todos los jugadores y gestiona desde un único smartphone:
- Transferencias entre jugadores y banca (con motivos rápidos: alquiler, impuestos, multas…)
- Bote de Parking Gratuito automático
- Compras de propiedades, hipotecas (+10% al deshipotecar) y construcciones
- Tratos completos (dinero + propiedades + cláusulas especiales en texto libre)
- Log de movimientos en tiempo real
- Deshacer última acción
- Cálculo final de patrimonio total y podio

El estado se persiste en `localStorage`, así que la partida sobrevive a recargas y cierres del navegador.

### 🌐 Modo multi-dispositivo (requiere configuración)
Cada jugador conecta su propio móvil al mismo código de partida. **Requiere desplegar las API routes con Turso.**

#### Por qué no funciona el "join" sin esto
La versión actual sin Turso usa `localStorage`. Cada navegador tiene su propio localStorage aislado, por eso un dispositivo no puede ver las partidas creadas por otro y aparece *"código no es correcto"*.

#### Setup en 4 pasos

**1. Crear la base de datos en Turso**
```bash
turso db create monopoly-bank
turso db tokens create monopoly-bank --expiration none
turso db shell monopoly-bank
```

Dentro del shell, ejecuta:
```sql
CREATE TABLE games (
  code TEXT PRIMARY KEY,
  state TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX idx_updated ON games(updated_at);
```

**2. Configurar variables de entorno en Vercel**

Project Settings → Environment Variables:
```
TURSO_DATABASE_URL=libsql://monopoly-bank-xxx.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOi...
```

**3. Activar el cliente Turso**
```bash
npm i @libsql/client
```

Después, abre `api/games/[code].ts` y descomenta el bloque marcado con `/* ... */`.

**4. Re-deploy en Vercel**

Una vez actualizadas las env vars, Vercel desplegará automáticamente la nueva versión y el modo multi-dispositivo será funcional.

## 🚀 Despliegue en Vercel

```bash
npm install
npm run build
vercel --prod
```

O conecta el repo directamente desde el dashboard de Vercel — la build es automática.

## 🧱 Stack técnico

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS
- **Estado:** Zustand con `persist` middleware (localStorage)
- **Backend serverless:** Vercel Edge Functions
- **DB serverless:** Turso (libSQL) — opcional, solo para multi-dispositivo

## 📐 Esquema de datos

Tabla única que guarda toda la partida como JSON serializado:

```sql
CREATE TABLE games (
  code TEXT PRIMARY KEY,           -- Código de 6 caracteres
  state TEXT NOT NULL,             -- JSON con players, transactions, trades…
  updated_at INTEGER NOT NULL      -- Timestamp para polling de cambios
);
```

Esta estructura simple es suficiente porque el estado completo de una partida ronda los 10-50 KB. Para sincronización en tiempo real, los clientes hacen polling cada 1-2s sobre `updated_at` y descargan el estado completo cuando hay cambios.

## 🎨 Personalización

- Renombra cualquier calle haciendo tap sobre su nombre en el panel de propiedades.
- Elige edición *Clásica (US)* o *España* al crear la partida.
- Configura saldo inicial, Parking Gratuito, regla de Salida exacta y bancarrota.
