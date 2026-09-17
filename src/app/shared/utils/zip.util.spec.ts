import { construirZip } from './zip.util';

async function leerComoUint8Array(blob: Blob): Promise<Uint8Array> {
  return new Uint8Array(await blob.arrayBuffer());
}

function leerUint32LE(bytes: Uint8Array, offset: number): number {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(offset, true);
}

describe('construirZip', () => {
  it('debería producir un Blob de tipo application/zip', () => {
    const blob = construirZip([{ nombre: 'a.txt', contenido: 'hola' }]);

    expect(blob.type).toBe('application/zip');
  });

  it('debería iniciar con la firma de encabezado local PK\\x03\\x04 (0x04034b50)', async () => {
    const bytes = await leerComoUint8Array(construirZip([{ nombre: 'a.txt', contenido: 'hola' }]));

    expect(leerUint32LE(bytes, 0)).toBe(0x04034b50);
  });

  it('debería terminar con el registro de fin de directorio central PK\\x05\\x06 (0x06054b50)', async () => {
    const bytes = await leerComoUint8Array(construirZip([{ nombre: 'a.txt', contenido: 'hola' }]));

    expect(leerUint32LE(bytes, bytes.length - 22)).toBe(0x06054b50);
  });

  it('debería reportar la cantidad correcta de entradas en el fin de directorio central', async () => {
    const bytes = await leerComoUint8Array(
      construirZip([
        { nombre: 'a.txt', contenido: 'uno' },
        { nombre: 'b.txt', contenido: 'dos' },
        { nombre: 'c.txt', contenido: 'tres' }
      ])
    );
    const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

    expect(dv.getUint16(bytes.length - 22 + 8, true)).toBe(3);
    expect(dv.getUint16(bytes.length - 22 + 10, true)).toBe(3);
  });

  it('debería incluir el nombre y el contenido de cada archivo como bytes legibles dentro del ZIP', async () => {
    const bytes = await leerComoUint8Array(construirZip([{ nombre: 'ejemplo.txt', contenido: 'contenido de prueba' }]));
    const texto = new TextDecoder().decode(bytes);

    expect(texto).toContain('ejemplo.txt');
    expect(texto).toContain('contenido de prueba');
  });

  it('debería producir un Blob vacío estructuralmente válido (solo fin de directorio) cuando no hay archivos', async () => {
    const bytes = await leerComoUint8Array(construirZip([]));

    expect(bytes.length).toBe(22);
    expect(leerUint32LE(bytes, 0)).toBe(0x06054b50);
  });
});
