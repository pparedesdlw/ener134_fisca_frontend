import { MapeoArchivoSustento } from '../../sustentoAiv/models/sustentoAiv.model';

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
