import { MapeoArchivoSustento } from '../../sustentoAiv/models/sustentoAiv.model';
import { construirZip } from './zip.util';

export const NOMBRE_PLANTILLA_CSV_MAPEO = 'plantilla_mapeo_sustentos.csv';
export const NOMBRE_ZIP_EJEMPLO_SUSTENTOS = 'ejemplo_carga_masiva_sustentos.zip';

/** Códigos únicos de ejemplo usados tanto en el ZIP de ejemplo como en la plantilla CSV de mapeo. */
const CODIGOS_UNICOS_EJEMPLO = ['CU-CG0001-900001-0001', 'CU-CG0001-900001-0002'];

export interface FilaMapeoInvalida {
  numeroFila: number;
  motivo: string;
}

export interface ResultadoParseoMapeoCsv {
  mapeo: MapeoArchivoSustento[];
  filasInvalidas: FilaMapeoInvalida[];
}

const ENCABEZADOS_NOMBRE_ARCHIVO = ['nombre de archivo', 'nombrearchivo', 'archivo'];
const ENCABEZADOS_CODIGO_UNICO = ['codigo unico', 'codigounico', 'codigo unico atencion', 'codigounicoatencion'];

function normalizar(texto: string): string {
  return texto.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/**
 * Parsea la plantilla CSV de mapeo (Nombre de archivo / Código único) para la carga masiva
 * de sustentos AIV. Formato simple (una columna por valor, separado por coma, sin comillas
 * ni comas dentro de un valor) porque los datos esperados son nombres de archivo y códigos
 * únicos, que no contienen comas.
 */
export function parsearMapeoCsv(contenido: string): ResultadoParseoMapeoCsv {
  const lineas = contenido.split(/\r\n|\n/).map((linea) => linea.trim()).filter((linea) => linea.length > 0);
  if (lineas.length === 0) {
    return { mapeo: [], filasInvalidas: [] };
  }

  const encabezados = lineas[0].split(',').map((h) => normalizar(h));
  const indiceNombre = encabezados.findIndex((h) => ENCABEZADOS_NOMBRE_ARCHIVO.includes(h));
  const indiceCodigo = encabezados.findIndex((h) => ENCABEZADOS_CODIGO_UNICO.includes(h));
  if (indiceNombre === -1 || indiceCodigo === -1) {
    throw new Error('La plantilla debe tener las columnas "Nombre de archivo" y "Código único"');
  }

  const mapeo: MapeoArchivoSustento[] = [];
  const filasInvalidas: FilaMapeoInvalida[] = [];
  for (let i = 1; i < lineas.length; i++) {
    const columnas = lineas[i].split(',').map((c) => c.trim());
    const nombreArchivo = columnas[indiceNombre];
    const codigoUnicoAtencion = columnas[indiceCodigo];
    if (!nombreArchivo || !codigoUnicoAtencion) {
      filasInvalidas.push({ numeroFila: i + 1, motivo: 'Falta nombre de archivo o código único' });
      continue;
    }
    mapeo.push({ nombreArchivo, codigoUnicoAtencion });
  }
  return { mapeo, filasInvalidas };
}

/** Plantilla CSV descargable con las columnas y el formato exactos que espera {@link parsearMapeoCsv}. */
export function generarPlantillaCsvMapeo(): string {
  const filas = CODIGOS_UNICOS_EJEMPLO.map((codigoUnico) => `${codigoUnico}.pdf,${codigoUnico}`);
  return ['Nombre de archivo,Código único', ...filas].join('\r\n');
}

function generarInstructivoZip(): string {
  return [
    'INSTRUCTIVO - Carga masiva de sustentos AIV (archivo ZIP)',
    '',
    'Cada archivo dentro del ZIP debe llamarse exactamente con el código único',
    'de atención del registro, seguido de su extensión original. Ejemplo:',
    '',
    '  CU-CG0001-900001-0001.pdf',
    '  CU-CG0001-900001-0002.docx',
    '',
    'El sistema asocia cada archivo al registro correspondiente automáticamente',
    'a partir de ese nombre. Se admite cualquier tipo de archivo.',
    '',
    'Si no puede nombrar los archivos con el código único (por ejemplo, porque',
    'ya vienen nombrados de otro sistema), use además la plantilla CSV de mapeo',
    '(columnas "Nombre de archivo" y "Código único") junto con el ZIP.',
    '',
    'Límites: tamaño máximo 50 MB por archivo, hasta 500 archivos por ZIP.'
  ].join('\r\n');
}

function generarContenidoEjemplo(codigoUnico: string): string {
  return [
    `Este es un archivo de EJEMPLO para el registro con código único ${codigoUnico}.`,
    '',
    'Para su carga real:',
    '  1. Reemplace este archivo por el sustento real de este registro',
    '     (se admite cualquier tipo de archivo: PDF, Word, imagen, etc.).',
    `  2. Nombre su archivo exactamente igual a este: ${codigoUnico}.<extensión>`,
    `     (ejemplo: ${codigoUnico}.pdf).`,
    '  3. Incluya el archivo dentro del ZIP que va a cargar en el sistema.',
    '',
    'Si su archivo no puede llamarse así, use la plantilla CSV de mapeo',
    '(columnas "Nombre de archivo" y "Código único") en vez de renombrarlo.',
    '',
    'Vea LEEME.txt para el instructivo completo.'
  ].join('\r\n');
}

/**
 * Arma un ZIP de ejemplo (construido en el navegador, sin llamar al backend) con el
 * instructivo de nombrado y dos archivos de muestra correctamente nombrados, para que el
 * usuario vea la estructura esperada antes de preparar su propia carga masiva.
 */
export function generarZipEjemploSustentos(): Blob {
  return construirZip([
    { nombre: 'LEEME.txt', contenido: generarInstructivoZip() },
    ...CODIGOS_UNICOS_EJEMPLO.map((codigoUnico) => ({
      nombre: `${codigoUnico}.txt`,
      contenido: generarContenidoEjemplo(codigoUnico)
    }))
  ]);
}
