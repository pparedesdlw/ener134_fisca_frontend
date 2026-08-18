/**
 * Rutas navegables/visibles para roles distintos de TISEC-ADMIN. Fuente única
 * consumida por el guard de rutas (auth/guards/role.guard.ts) y el filtro del
 * menú lateral (layout/main-layout.component.ts) — antes estaban duplicadas
 * en ambos archivos y se desincronizaron: el menú mostraba las pantallas AIV
 * de Fase 2 pero el guard las rechazaba, dejando esas pantallas inaccesibles
 * por completo para todo rol que no fuera TISEC-ADMIN.
 */
export const RUTAS_PERMITIDAS_NO_ADMIN: readonly string[] = [
  '/home',
  '/cit/calculo',
  '/atencionesComerciales',
  '/periodos',
  '/registros-cerrados',
  '/muestra-aiv',
  '/evaluacion-aiv',
  '/sustento-aiv',
  '/historico-aiv',
  '/indicadores-graficos'
];
