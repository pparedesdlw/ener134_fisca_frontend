import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
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

    periodoServiceSpy.listarPorEstado.and.returnValue(of(mockPeriodos));
    empresaServiceSpy.listarTodos.and.returnValue(of(mockEmpresas));

    await TestBed.configureTestingModule({
      imports: [IndicadoresGraficosComponent, NoopAnimationsModule],
      providers: [
        { provide: IndicadoresGraficosService, useValue: serviceSpy },
        { provide: PeriodoService, useValue: periodoServiceSpy },
        { provide: EmpresaConcesionariaService, useValue: empresaServiceSpy }
      ]
    }).compileComponents();

    service = TestBed.inject(IndicadoresGraficosService) as jasmine.SpyObj<IndicadoresGraficosService>;

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
});
