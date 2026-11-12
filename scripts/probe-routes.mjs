#!/usr/bin/env node
/**
 * CBE-113 — Probe de rutas contra la API real de QvaPay.
 *
 * Uso: node scripts/probe-routes.mjs
 *
 * Para cada ruta se hace un GET sin autenticación (Accept: application/json),
 * con timeout de 15s, y se prueba también la variante con prefijo /v2.
 * Solo se imprimen el status HTTP y un resumen del cuerpo (claves de primer
 * nivel, o longitud si es un array). Nunca se imprimen cuerpos completos.
 *
 * Interpretación:
 *   401 / 403 -> la ruta existe y requiere autenticación
 *   404       -> la ruta no existe
 *   2xx       -> la ruta existe y es pública
 *   405       -> existe pero el método es equivocado
 */

const BASE_URL = "https://api.qvapay.com";

const ROUTES = [
  "/user",
  "/transaction?page=1",
  "/transactions",
  "/coins",
  "/coins/v2?enabled_p2p=1",
  "/coins/price-history/BTC?timeframe=24H",
  "/coins/BTC/history?timeframe=24H",
  "/p2p/averages",
  "/p2p?coin=BANK_CUP&type=buy",
  "/p2p/index?coin=BANK_CUP&type=buy",
];

const TIMEOUT_MS = 15_000;

function interpret(status) {
  if (status >= 200 && status < 300) return "existe (pública)";
  if (status === 401 || status === 403) return "existe (requiere auth)";
  if (status === 404) return "no existe";
  if (status === 405) return "método equivocado";
  return "otro";
}

function summarizeBody(body) {
  if (Array.isArray(body)) return `array(${body.length})`;
  if (body !== null && typeof body === "object") {
    const keys = Object.keys(body);
    if (keys.length === 0) return "{}";
    return keys.join(", ");
  }
  if (body === null) return "null";
  return String(body).slice(0, 80);
}

function pad(value, width) {
  const text = String(value);
  return text.length >= width ? text : text + " ".repeat(width - text.length);
}

async function probe(path) {
  const url = BASE_URL + path;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
      redirect: "follow",
    });

    let summary = "-";
    if (response.status >= 200 && response.status < 300) {
      try {
        const body = await response.json();
        summary = summarizeBody(body);
      } catch {
        summary = "(respuesta no-JSON)";
      }
    } else {
      try {
        await response.arrayBuffer();
      } catch {
        /* el cuerpo no nos interesa en respuestas de error */
      }
    }

    return {
      route: path,
      status: response.status,
      body: summary,
      interpretation: interpret(response.status),
    };
  } catch (error) {
    const message = error?.name === "AbortError" ? "timeout 15s" : String(error?.message ?? error);
    return { route: path, status: "ERR", body: message, interpretation: "sin respuesta" };
  } finally {
    clearTimeout(timer);
  }
}

function printTable(rows) {
  const routeWidth = Math.max("RUTA".length, ...rows.map((r) => r.route.length)) + 2;
  const statusWidth = Math.max("STATUS".length, ...rows.map((r) => String(r.status).length)) + 2;

  console.log(pad("RUTA", routeWidth) + pad("STATUS", statusWidth) + "RESUMEN / INTERPRETACIÓN");

  let lastRoute = null;
  for (const row of rows) {
    const routeLabel = row.route === lastRoute ? "" : row.route;
    lastRoute = row.route;
    const status = String(row.status);
    console.log(
      pad(routeLabel, routeWidth) +
        pad(status, statusWidth) +
        `${row.body} [${row.interpretation}]`,
    );
  }
}

async function main() {
  console.log(`Probe de rutas — ${BASE_URL}`);
  console.log("GET sin autenticación, Accept: application/json, timeout 15s\n");

  const tasks = [];
  for (const route of ROUTES) {
    tasks.push(probe(route));
    tasks.push(probe("/v2" + route));
  }

  const results = await Promise.all(tasks);
  printTable(results);
}

main().catch((error) => {
  console.error("Fallo inesperado:", error);
  process.exit(1);
});