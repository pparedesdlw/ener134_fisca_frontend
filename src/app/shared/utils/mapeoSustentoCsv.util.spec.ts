import { parsearMapeoCsv } from './mapeoSustentoCsv.util';

describe('parsearMapeoCsv', () => {
  it('debería parsear filas válidas con encabezados exactos', () => {
    const csv = 'Nombre de archivo,Código único\nfactura1.pdf,21-260010024801\nfactura2.pdf,21-260010024389';

    const resultado = parsearMapeoCsv(csv);

    expect(resultado.mapeo).toEqual([
      { nombreArchivo: 'factura1.pdf', codigoUnicoAtencion: '21-260010024801' },
      { nombreArchivo: 'factura2.pdf', codigoUnicoAtencion: '21-260010024389' }
    ]);
    expect(resultado.filasInvalidas).toEqual([]);
  });

  it('debería reconocer encabezados sin tildes ni mayúsculas', () => {
    const csv = 'nombre de archivo,codigo unico\narchivo.pdf,21-260010024801';

    const resultado = parsearMapeoCsv(csv);

    expect(resultado.mapeo).toEqual([{ nombreArchivo: 'archivo.pdf', codigoUnicoAtencion: '21-260010024801' }]);
  });

  it('debería ignorar líneas en blanco', () => {
    const csv = 'Nombre de archivo,Código único\n\nfactura1.pdf,21-260010024801\n\n';

    const resultado = parsearMapeoCsv(csv);

    expect(resultado.mapeo.length).toBe(1);
  });

  it('debería marcar como inválida una fila con una columna vacía', () => {
    const csv = 'Nombre de archivo,Código único\nfactura1.pdf,\n,21-260010024801\nfactura3.pdf,21-260010024390';

    const resultado = parsearMapeoCsv(csv);

    expect(resultado.mapeo).toEqual([{ nombreArchivo: 'factura3.pdf', codigoUnicoAtencion: '21-260010024390' }]);
    expect(resultado.filasInvalidas).toEqual([
      { numeroFila: 2, motivo: 'Falta nombre de archivo o código único' },
      { numeroFila: 3, motivo: 'Falta nombre de archivo o código único' }
    ]);
  });

  it('debería lanzar un error si faltan las columnas esperadas', () => {
    const csv = 'Columna A,Columna B\nvalor1,valor2';

    expect(() => parsearMapeoCsv(csv)).toThrowError(
      'La plantilla debe tener las columnas "Nombre de archivo" y "Código único"'
    );
  });

  it('debería devolver arreglos vacíos si el archivo está vacío', () => {
    const resultado = parsearMapeoCsv('');

    expect(resultado.mapeo).toEqual([]);
    expect(resultado.filasInvalidas).toEqual([]);
  });
});
