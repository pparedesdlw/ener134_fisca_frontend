export interface ArchivoZip {
  nombre: string;
  contenido: string;
}

const FIRMA_ENCABEZADO_LOCAL = 0x04034b50;
const FIRMA_ENCABEZADO_CENTRAL = 0x02014b50;
const FIRMA_FIN_DIRECTORIO_CENTRAL = 0x06054b50;
/** 01/01/1980 00:00, la fecha mínima representable en el formato DOS que usa ZIP. */
const FECHA_DOS_FIJA = (0 << 9) | (1 << 5) | 1;
const HORA_DOS_FIJA = 0;

const TABLA_CRC32 = construirTablaCrc32();

function construirTablaCrc32(): Uint32Array {
  const tabla = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    tabla[i] = c >>> 0;
  }
  return tabla;
}

function calcularCrc32(datos: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < datos.length; i++) {
    crc = TABLA_CRC32[(crc ^ datos[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/**
 * Construye un archivo ZIP válido en memoria, sin depender de ninguna librería externa.
 * Usa el método "stored" (sin compresión): suficiente para archivos de ejemplo pequeños y
 * evita incorporar una dependencia npm nueva solo para este caso de uso puntual.
 */
export function construirZip(archivos: ArchivoZip[]): Blob {
  const codificador = new TextEncoder();
  const partesLocales: Uint8Array[] = [];
  const partesCentrales: Uint8Array[] = [];
  let offset = 0;

  for (const archivo of archivos) {
    const nombreBytes = codificador.encode(archivo.nombre);
    const contenidoBytes = codificador.encode(archivo.contenido);
    const crc = calcularCrc32(contenidoBytes);

    const encabezadoLocal = new DataView(new ArrayBuffer(30));
    encabezadoLocal.setUint32(0, FIRMA_ENCABEZADO_LOCAL, true);
    encabezadoLocal.setUint16(4, 20, true); // versión mínima para extraer
    encabezadoLocal.setUint16(6, 0, true); // flags
    encabezadoLocal.setUint16(8, 0, true); // método: stored
    encabezadoLocal.setUint16(10, HORA_DOS_FIJA, true);
    encabezadoLocal.setUint16(12, FECHA_DOS_FIJA, true);
    encabezadoLocal.setUint32(14, crc, true);
    encabezadoLocal.setUint32(18, contenidoBytes.length, true); // tamaño comprimido
    encabezadoLocal.setUint32(22, contenidoBytes.length, true); // tamaño original
    encabezadoLocal.setUint16(26, nombreBytes.length, true);
    encabezadoLocal.setUint16(28, 0, true); // extra field length

    partesLocales.push(new Uint8Array(encabezadoLocal.buffer), nombreBytes, contenidoBytes);

    const encabezadoCentral = new DataView(new ArrayBuffer(46));
    encabezadoCentral.setUint32(0, FIRMA_ENCABEZADO_CENTRAL, true);
    encabezadoCentral.setUint16(4, 20, true); // versión que lo creó
    encabezadoCentral.setUint16(6, 20, true); // versión mínima para extraer
    encabezadoCentral.setUint16(8, 0, true); // flags
    encabezadoCentral.setUint16(10, 0, true); // método: stored
    encabezadoCentral.setUint16(12, HORA_DOS_FIJA, true);
    encabezadoCentral.setUint16(14, FECHA_DOS_FIJA, true);
    encabezadoCentral.setUint32(16, crc, true);
    encabezadoCentral.setUint32(20, contenidoBytes.length, true);
    encabezadoCentral.setUint32(24, contenidoBytes.length, true);
    encabezadoCentral.setUint16(28, nombreBytes.length, true);
    encabezadoCentral.setUint16(30, 0, true); // extra field length
    encabezadoCentral.setUint16(32, 0, true); // comment length
    encabezadoCentral.setUint16(34, 0, true); // disk number start
    encabezadoCentral.setUint16(36, 0, true); // internal attributes
    encabezadoCentral.setUint32(38, 0, true); // external attributes
    encabezadoCentral.setUint32(42, offset, true); // offset del encabezado local

    partesCentrales.push(new Uint8Array(encabezadoCentral.buffer), nombreBytes);

    offset += encabezadoLocal.byteLength + nombreBytes.length + contenidoBytes.length;
  }

  const tamanioDirectorioCentral = partesCentrales.reduce((total, parte) => total + parte.length, 0);
  const finDirectorio = new DataView(new ArrayBuffer(22));
  finDirectorio.setUint32(0, FIRMA_FIN_DIRECTORIO_CENTRAL, true);
  finDirectorio.setUint16(4, 0, true);
  finDirectorio.setUint16(6, 0, true);
  finDirectorio.setUint16(8, archivos.length, true);
  finDirectorio.setUint16(10, archivos.length, true);
  finDirectorio.setUint32(12, tamanioDirectorioCentral, true);
  finDirectorio.setUint32(16, offset, true);
  finDirectorio.setUint16(20, 0, true); // comment length

  return new Blob([...partesLocales, ...partesCentrales, new Uint8Array(finDirectorio.buffer)], {
    type: 'application/zip'
  });
}
