import { excedeTamanioMaximo, TAMANIO_MAX_ARCHIVO_BYTES } from './archivo.util';

describe('excedeTamanioMaximo', () => {
  function archivoDeTamanio(bytes: number): File {
    return { size: bytes } as File;
  }

  it('debería retornar false para un archivo dentro del límite', () => {
    expect(excedeTamanioMaximo(archivoDeTamanio(1024))).toBe(false);
    expect(excedeTamanioMaximo(archivoDeTamanio(TAMANIO_MAX_ARCHIVO_BYTES))).toBe(false);
  });

  it('debería retornar true para un archivo que excede el límite', () => {
    expect(excedeTamanioMaximo(archivoDeTamanio(TAMANIO_MAX_ARCHIVO_BYTES + 1))).toBe(true);
  });
});
