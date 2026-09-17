import { excedeTamanioMaximo, TAMANIO_MAX_ARCHIVO_BYTES, descargarBlob } from './archivo.util';

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

describe('descargarBlob', () => {
  it('debería crear un enlace temporal, asignarle el nombre de archivo y disparar el click', () => {
    const enlace = jasmine.createSpyObj('a', ['click']);
    spyOn(document, 'createElement').and.returnValue(enlace);
    spyOn(URL, 'createObjectURL').and.returnValue('blob:mock-url');
    const revokeSpy = spyOn(URL, 'revokeObjectURL');

    descargarBlob(new Blob(['contenido']), 'archivo.txt');

    expect(enlace.href).toBe('blob:mock-url');
    expect(enlace.download).toBe('archivo.txt');
    expect(enlace.click).toHaveBeenCalled();
    expect(revokeSpy).toHaveBeenCalledWith('blob:mock-url');
  });
});
