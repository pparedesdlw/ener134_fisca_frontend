import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { IndicadoresGraficosComponent } from './indicadoresGraficos.component';
import { IndicadoresGraficosService } from '../../services/indicadoresGraficos.service';
import { ComparativoIndicadoresResponse, EvolucionIndicadoresResponse } from '../../models/indicadores.model';
import { PeriodoService } from '../../../periodos/services/periodo.service';
import { EmpresaConcesionariaService } from '../../../empresas/services/empresa-concesionaria.service';
import { Periodo } from '../../../periodos/models/periodo.model';
import { EmpresaConcesionaria } from '../../../empresas/models/empresa-concesionaria.model';

describe('IndicadoresGraficosComponent', () => {
  let component: IndicadoresGraficosComponent;
  let fixture: ComponentFixture<IndicadoresGraficosComponent>;
  let service: jasmine.SpyObj<IndicadoresGraficosService>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  const mockPeriodos: Periodo[] = [{ codigoPeriodo: 'PER-2025-01', fechaInicio: '2025-01-01', fechaFin: '2025-03-31', estadoActivo: true }];
  const mockEmpresas: EmpresaConcesionaria[] = [{ id: 1, codigoEmpresa: '10', razonSocial: 'Empresa 1' }];
  const mockEvolucion: EvolucionIndicadoresResponse = {
    puntos: [{ codigoPeriodo: 'PER-2025-01', indicadorAiv: 2.5, numeroRegistrosNoConformes: 3, muestraDefinitiva: 40, indicadorCit: 1.2 }],
    toleranciaAiv: 5, toleranciaCit: 3
  };
  const mockComparativo: ComparativoIndicadoresResponse = {
    puntos: [{ codigoEmpresa: 1, indicadorAiv: 2.5, numeroRegistrosNoConformes: 3, indicadorCit: 1.2 }],
    toleranciaAiv: 5, toleranciaCit: 3
  };

  beforeEach(async () => {
    const serviceSpy = jasmine.createSpyObj('IndicadoresGraficosService', ['evolucion', 'comparativo']);
    const periodoServiceSpy = jasmine.createSpyObj('PeriodoService', ['listarPorEstado']);
    const empresaServiceSpy = jasmine.createSpyObj('EmpresaConcesionariaService', ['listarTodos']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    periodoServiceSpy.listarPorEstado.and.returnValue(of(mockPeriodos));
    empresaServiceSpy.listarTodos.and.returnValue(of(mockEmpresas));

    await TestBed.configureTestingModule({
      imports: [IndicadoresGraficosComponent, NoopAnimationsModule],
      providers: [
        { provide: IndicadoresGraficosService, useValue: serviceSpy },
        { provide: PeriodoService, useValue: periodoServiceSpy },
        { provide: EmpresaConcesionariaService, useValue: empresaServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    }).compileComponents();

    service = TestBed.inject(IndicadoresGraficosService) as jasmine.SpyObj<IndicadoresGraficosService>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

    fixture = TestBed.createComponent(IndicadoresGraficosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería cargar periodos y empresas al iniciar', () => {
    expect(component.periodos()).toEqual(mockPeriodos);
    expect(component.empresas()).toEqual(mockEmpresas);
  });

  it('cargarEvolucion no debería llamar al servicio sin empresa seleccionada', () => {
    component.empresaSeleccionada = null;
    component.cargarEvolucion();
    expect(service.evolucion).not.toHaveBeenCalled();
  });

  it('cargarEvolucion debería consultar y exponer los labels/valores por periodo', () => {
    component.empresaSeleccionada = 1;
    service.evolucion.and.returnValue(of(mockEvolucion));

    component.cargarEvolucion();

    expect(service.evolucion).toHaveBeenCalledWith(1);
    expect(component.evolucion()).toEqual(mockEvolucion);
    expect(component.labelsEvolucion()).toEqual(['PER-2025-01']);
    expect(component.valoresAivEvolucion()).toEqual([2.5]);
    expect(component.valoresCitEvolucion()).toEqual([1.2]);
  });

  it('cargarComparativo no debería llamar al servicio sin periodo seleccionado', () => {
    component.periodoSeleccionado = null;
    component.cargarComparativo();
    expect(service.comparativo).not.toHaveBeenCalled();
  });

  it('cargarComparativo debería consultar y exponer los labels/valores por empresa', () => {
    component.periodoSeleccionado = 'PER-2025-01';
    service.comparativo.and.returnValue(of(mockComparativo));

    component.cargarComparativo();

    expect(service.comparativo).toHaveBeenCalledWith('PER-2025-01');
    expect(component.comparativo()).toEqual(mockComparativo);
    expect(component.labelsComparativo()).toEqual(['10']);
    expect(component.valoresAivComparativo()).toEqual([2.5]);
    expect(component.valoresCitComparativo()).toEqual([1.2]);
  });

  it('etiquetaEmpresa debería devolver el código de empresa cuando existe', () => {
    expect(component.etiquetaEmpresa(1)).toBe('10');
  });

  it('etiquetaEmpresa debería devolver el id como string si no encuentra la empresa', () => {
    expect(component.etiquetaEmpresa(99)).toBe('99');
  });

  it('no debería marcar "sin datos" mientras no se haya realizado una búsqueda', () => {
    expect(component.sinDatosEvolucion()).toBeFalse();
    expect(component.sinDatosComparativo()).toBeFalse();
    expect(component.hayEvolucion()).toBeFalse();
    expect(component.hayComparativo()).toBeFalse();
  });

  it('evolución sin puntos debería activar el mensaje "sin datos" y no renderizar gráficos', () => {
    component.empresaSeleccionada = 1;
    service.evolucion.and.returnValue(of({ puntos: [], toleranciaAiv: 5, toleranciaCit: 5 }));

    component.cargarEvolucion();
    fixture.detectChanges();

    expect(component.hayEvolucion()).toBeFalse();
    expect(component.sinDatosEvolucion()).toBeTrue();
    const texto: string = fixture.nativeElement.textContent;
    expect(texto).toContain(component.MENSAJE_SIN_DATOS);
    expect(fixture.nativeElement.querySelectorAll('app-bar-chart').length).toBe(0);
  });

  it('comparativo sin puntos debería activar el mensaje "sin datos" y no renderizar gráficos', () => {
    component.periodoSeleccionado = 'PER-2025-01';
    service.comparativo.and.returnValue(of({ puntos: [], toleranciaAiv: 5, toleranciaCit: 5 }));

    component.cargarComparativo();
    fixture.detectChanges();

    expect(component.hayComparativo()).toBeFalse();
    expect(component.sinDatosComparativo()).toBeTrue();
    expect(fixture.nativeElement.querySelectorAll('app-bar-chart').length).toBe(0);
  });

  it('evolución con puntos debería renderizar los gráficos y no mostrar el mensaje', () => {
    component.empresaSeleccionada = 1;
    service.evolucion.and.returnValue(of(mockEvolucion));

    component.cargarEvolucion();
    fixture.detectChanges();

    expect(component.hayEvolucion()).toBeTrue();
    expect(component.sinDatosEvolucion()).toBeFalse();
    expect(fixture.nativeElement.querySelectorAll('app-bar-chart').length).toBe(2);
  });

  it('cargarEvolucion debería mostrar un mensaje de error y no dejar el spinner encendido si falla el servicio', () => {
    component.empresaSeleccionada = 1;
    service.evolucion.and.returnValue(throwError(() => new Error('fallo de red')));

    component.cargarEvolucion();

    expect(component.evolucion()).toBeNull();
    expect(component.cargandoEvolucion()).toBeFalse();
    expect(snackBar.open).toHaveBeenCalledWith(
      'No se pudo cargar la evolución de indicadores', 'Cerrar', jasmine.any(Object)
    );
  });

  it('cargarComparativo debería mostrar un mensaje de error y no dejar el spinner encendido si falla el servicio', () => {
    component.periodoSeleccionado = 'PER-2025-01';
    service.comparativo.and.returnValue(throwError(() => new Error('fallo de red')));

    component.cargarComparativo();

    expect(component.comparativo()).toBeNull();
    expect(component.cargandoComparativo()).toBeFalse();
    expect(snackBar.open).toHaveBeenCalledWith(
      'No se pudo cargar el comparativo de indicadores', 'Cerrar', jasmine.any(Object)
    );
  });

  it('RF11: el filtro de empresa debe ser una grilla de tiles (selección única), no un combo', () => {
    // El diseño de RF11 muestra "Empresa" y "Periodo" como grillas de botones seleccionables,
    // no un mat-select desplegable.
    expect(fixture.nativeElement.querySelector('mat-select')).toBeNull();
    const tilesEmpresa: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll(
      '.grid-selector[aria-label="Empresa"] .tile-selector'
    );
    expect(tilesEmpresa.length).toBe(mockEmpresas.length);
    expect(tilesEmpresa[0].textContent?.trim()).toBe('10');
  });

  it('RF11: clic en un tile de empresa debería seleccionarla y disparar la carga automáticamente', () => {
    service.evolucion.and.returnValue(of(mockEvolucion));

    const tile: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.grid-selector[aria-label="Empresa"] .tile-selector'
    );
    tile.click();
    fixture.detectChanges();

    expect(component.empresaSeleccionada).toBe(1);
    expect(service.evolucion).toHaveBeenCalledWith(1);
    expect(tile.classList).toContain('seleccionado');
  });

  it('RF11: clic en un tile de periodo debería seleccionarlo y disparar la carga automáticamente', () => {
    service.comparativo.and.returnValue(of(mockComparativo));

    const tile: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.grid-selector[aria-label="Periodo"] .tile-selector'
    );
    tile.click();
    fixture.detectChanges();

    expect(component.periodoSeleccionado).toBe('PER-2025-01');
    expect(service.comparativo).toHaveBeenCalledWith('PER-2025-01');
    expect(tile.classList).toContain('seleccionado');
  });
});
