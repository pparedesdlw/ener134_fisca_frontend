import { calcularRangoFechasPeriodo, fechaFueraDeRango } from './periodo-fechas.util';
import { Periodo } from '../../periodos/models/periodo.model';

describe('calcularRangoFechasPeriodo', () => {
  const maxDate = new Date(2026, 7, 8);
  const periodos: Periodo[] = [
    { codigoPeriodo: 'PER-2026-01', fechaInicio: '2026-01-01', fechaFin: '2026-03-31', estadoActivo: true },
    { codigoPeriodo: 'PER-2026-02', fechaInicio: '2026-06-01', fechaFin: '2026-12-31', estadoActivo: true }
  ];

  it('sin periodo seleccionado, no debería tener mínimo y el máximo debería ser maxDate', () => {
    const rango = calcularRangoFechasPeriodo(null, periodos, maxDate);
    expect(rango.min).toBeNull();
    expect(rango.max).toEqual(maxDate);
  });

  it('con un periodo cuyo fin ya pasó, el rango debería ser exactamente el del periodo', () => {
    const rango = calcularRangoFechasPeriodo('PER-2026-01', periodos, maxDate);
    expect(rango.min).toEqual(new Date(2026, 0, 1));
    expect(rango.max).toEqual(new Date(2026, 2, 31));
  });

  it('con un periodo cuyo fin es posterior a hoy, el máximo debería ser maxDate, no el fin del periodo', () => {
    const rango = calcularRangoFechasPeriodo('PER-2026-02', periodos, maxDate);
    expect(rango.min).toEqual(new Date(2026, 5, 1));
    expect(rango.max).toEqual(maxDate);
  });

  it('con un código de periodo que no existe en la lista, debería comportarse como sin periodo', () => {
    const rango = calcularRangoFechasPeriodo('NO-EXISTE', periodos, maxDate);
    expect(rango.min).toBeNull();
    expect(rango.max).toEqual(maxDate);
  });
});

describe('fechaFueraDeRango', () => {
  const rango = { min: new Date(2026, 0, 1), max: new Date(2026, 2, 31) };

  it('debería retornar false para null', () => {
    expect(fechaFueraDeRango(null, rango)).toBe(false);
  });

  it('debería retornar false para una fecha dentro del rango', () => {
    expect(fechaFueraDeRango(new Date(2026, 1, 15), rango)).toBe(false);
  });

  it('debería retornar true para una fecha anterior al mínimo', () => {
    expect(fechaFueraDeRango(new Date(2025, 11, 31), rango)).toBe(true);
  });

  it('debería retornar true para una fecha posterior al máximo', () => {
    expect(fechaFueraDeRango(new Date(2026, 3, 1), rango)).toBe(true);
  });
});
