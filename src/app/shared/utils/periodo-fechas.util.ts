import { Periodo } from '../../periodos/models/periodo.model';

export interface RangoFechasPeriodo {
  min: Date | null;
  max: Date;
}

/**
 * Calcula el rango de fechas habilitado en un datepicker según el periodo de fiscalización
 * seleccionado: el mínimo es el inicio del periodo y el máximo es el menor entre el fin del
 * periodo y `maxDate` (para no perder la regla existente de "no permitir fechas futuras").
 * Sin periodo seleccionado, no hay mínimo y el máximo es `maxDate`.
 */
export function calcularRangoFechasPeriodo(
  codigoPeriodo: string | null, periodos: Periodo[], maxDate: Date
): RangoFechasPeriodo {
  const periodo = codigoPeriodo ? periodos.find((p) => p.codigoPeriodo === codigoPeriodo) : undefined;
  if (!periodo) {
    return { min: null, max: maxDate };
  }
  const finPeriodo = parseFechaDdMmYyyy(periodo.fechaFin);
  return {
    min: parseFechaDdMmYyyy(periodo.fechaInicio),
    max: finPeriodo < maxDate ? finPeriodo : maxDate
  };
}

/** PeriodoResponse (backend) serializa fechaInicio/fechaFin como "dd/MM/yyyy", no ISO. */
function parseFechaDdMmYyyy(fecha: string): Date {
  const [dia, mes, anio] = fecha.split('/').map(Number);
  return new Date(anio, mes - 1, dia);
}

/** Indica si una fecha ya seleccionada quedó fuera del rango habilitado por el periodo actual. */
export function fechaFueraDeRango(fecha: Date | null, rango: RangoFechasPeriodo): boolean {
  if (!fecha) return false;
  if (rango.min && fecha < rango.min) return true;
  return fecha > rango.max;
}
