/**
 * Límite de tamaño de archivo para cargas de sustentos AIV (individual y ZIP), en bytes.
 * Debe coincidir con TAMANIO_MAX_BYTES de SustentoAivServiceImpl (backend) — la validación
 * aquí es solo de UX (evitar que el navegador intente leer un archivo enorme a Base64 antes
 * de enviarlo); el servidor sigue siendo la fuente de verdad.
 */
export const TAMANIO_MAX_ARCHIVO_BYTES = 50 * 1024 * 1024;

export function excedeTamanioMaximo(archivo: File): boolean {
  return archivo.size > TAMANIO_MAX_ARCHIVO_BYTES;
}
