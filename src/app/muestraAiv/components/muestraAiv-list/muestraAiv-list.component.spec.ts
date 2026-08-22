import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { MuestraAivListComponent } from './muestraAiv-list.component';
import { MuestraAivService } from '../../services/muestraAiv.service';
import { MuestraAivResponse } from '../../models/muestraAiv.model';
import { PeriodoService } from '../../../periodos/services/periodo.service';
import { EmpresaConcesionariaService } from '../../../empresas/services/empresa-concesionaria.service';
import { AsuntoService } from '../../../asuntos/services/asunto.service';
import { DepartamentoService } from '../../../ubigeos/services/departamento.service';
import { ProvinciaService } from '../../../ubigeos/services/provincia.service';
import { DistritoService } from '../../../ubigeos/services/distrito.service';
import { Periodo } from '../../../periodos/models/periodo.model';
import { EmpresaConcesionaria } from '../../../empresas/models/empresa-concesionaria.model';
import { Asunto } from '../../../asuntos/models/asunto.model';
import { Departamento } from '../../../ubigeos/models/departamento.model';

describe('MuestraAivListComponent', () => {
  let component: MuestraAivListComponent;
  let fixture: ComponentFixture<MuestraAivListComponent>;
  let service: jasmine.SpyObj<MuestraAivService>;
  let provinciaService: jasmine.SpyObj<ProvinciaService>;
  let distritoService: jasmine.SpyObj<DistritoService>;
  let router: jasmine.SpyObj<Router>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  const mockPeriodos: Periodo[] = [{ codigoPeriodo: 'PER-2025-01', fechaInicio: '01/01/2025', fechaFin: '31/03/2025', estadoActivo: true }];
  const mockEmpresas: EmpresaConcesionaria[] = [{ id: 1, codigoEmpresa: '10', razonSocial: 'Empresa 1' }];
  const mockAsuntos: Asunto[] = [{ codigoAsunto: '174', descripcion: 'Consumo excesivo', estado: '1' }];
  const mockDepartamentos: Departamento[] = [{ codigoDepartamento: '15', descripcionDepartamento: 'Lima' }];
  const mockMuestra: MuestraAivResponse = {
    id: 1, codigoPeriodo: 'PER-2025-01', codigoEmpresa: 10, poblacion: 100, tamanioBase: 40,
    porcentajeAdicional: 10, tamanioFinal: 44, estadoMuestra: 'GENERADA', seedAleatorio: 123,
    fechaGeneracion: '2025-01-05T10:00:00', detalle: [], distribucion: []
  };

  const routeStub: { snapshot: { queryParamMap: ReturnType<typeof convertToParamMap> } } = {
    snapshot: { queryParamMap: convertToParamMap({}) }
  };

  function crearComponente(params: Record<string, string> = {}): void {
    routeStub.snapshot.queryParamMap = convertToParamMap(params);
    fixture = TestBed.createComponent(MuestraAivListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    const serviceSpy = jasmine.createSpyObj('MuestraAivService', ['generar', 'reemplazar', 'vigente']);
    const periodoServiceSpy = jasmine.createSpyObj('PeriodoService', ['listarPorEstado']);
    const empresaServiceSpy = jasmine.createSpyObj('EmpresaConcesionariaService', ['listarTodos']);
    const asuntoServiceSpy = jasmine.createSpyObj('AsuntoService', ['listarPorEstado']);
    const departamentoServiceSpy = jasmine.createSpyObj('DepartamentoService', ['listarTodos']);
    const provinciaServiceSpy = jasmine.createSpyObj('ProvinciaService', ['listarTodos']);
    const distritoServiceSpy = jasmine.createSpyObj('DistritoService', ['listarTodos']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    periodoServiceSpy.listarPorEstado.and.returnValue(of(mockPeriodos));
    empresaServiceSpy.listarTodos.and.returnValue(of(mockEmpresas));
    asuntoServiceSpy.listarPorEstado.and.returnValue(of(mockAsuntos));
    departamentoServiceSpy.listarTodos.and.returnValue(of(mockDepartamentos));

    await TestBed.configureTestingModule({
      imports: [MuestraAivListComponent, NoopAnimationsModule],
      providers: [
        { provide: MuestraAivService, useValue: serviceSpy },
        { provide: PeriodoService, useValue: periodoServiceSpy },
        { provide: EmpresaConcesionariaService, useValue: empresaServiceSpy },
        { provide: AsuntoService, useValue: asuntoServiceSpy },
        { provide: DepartamentoService, useValue: departamentoServiceSpy },
        { provide: ProvinciaService, useValue: provinciaServiceSpy },
        { provide: DistritoService, useValue: distritoServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: ActivatedRoute, useValue: routeStub }
      ]
    }).compileComponents();

    service = TestBed.inject(MuestraAivService) as jasmine.SpyObj<MuestraAivService>;
    provinciaService = TestBed.inject(ProvinciaService) as jasmine.SpyObj<ProvinciaService>;
    distritoService = TestBed.inject(DistritoService) as jasmine.SpyObj<DistritoService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
  });

  it('debería cargar catálogos y precargar filtros desde los query params', () => {
    crearComponente({ periodo: 'PER-2025-01', empresa: '10', fechaInicio: '2025-01-01', fechaFin: '2025-01-31' });
    expect(component.periodos()).toEqual(mockPeriodos);
    expect(component.empresas()).toEqual(mockEmpresas);
    expect(component.asuntos()).toEqual(mockAsuntos);
    expect(component.departamentos()).toEqual(mockDepartamentos);
    expect(component.periodoSeleccionado).toBe('PER-2025-01');
    expect(component.empresaSeleccionada).toBe('10');
  });

  describe('rango de fechas según periodo seleccionado', () => {
    it('sin periodo seleccionado, no debería restringir el mínimo', () => {
      crearComponente();
      component.periodoSeleccionado = null;
      expect(component.periodoMinDate).toBeNull();
      expect(component.periodoMaxDate).toEqual(component.maxDate);
    });

    it('con un periodo seleccionado, debería acotar el rango a sus fechas', () => {
      crearComponente();
      component.periodoSeleccionado = 'PER-2025-01';
      expect(component.periodoMinDate).toEqual(new Date(2025, 0, 1));
      expect(component.periodoMaxDate).toEqual(new Date(2025, 2, 31));
    });

    it('al cambiar de periodo, debería autocompletar fecha inicio y fecha fin con el rango del periodo', () => {
      crearComponente();
      component.periodoSeleccionado = 'PER-2025-01';
      component.fechaInicio = new Date(2024, 11, 1);
      component.fechaFin = new Date(2025, 5, 1);

      component.onPeriodoChange();

      expect(component.fechaInicio).toEqual(new Date(2025, 0, 1));
      expect(component.fechaFin).toEqual(new Date(2025, 2, 31));
    });
  });

  it('generar debería avisar si faltan filtros obligatorios', () => {
    crearComponente();
    component.generar();
    expect(snackBar.open).toHaveBeenCalledWith(
      'Periodo, fecha inicio, fecha fin y empresa son obligatorios', 'Cerrar', jasmine.any(Object)
    );
    expect(service.generar).not.toHaveBeenCalled();
  });

  it('generar debería llamar al servicio sin ubigeos cuando no hay departamentos seleccionados', () => {
    crearComponente();
    component.periodoSeleccionado = 'PER-2025-01';
    component.fechaInicio = new Date('2025-01-01T12:00:00');
    component.fechaFin = new Date('2025-01-31T12:00:00');
    component.empresaSeleccionada = '10';
    service.generar.and.returnValue(of(mockMuestra));

    component.generar();

    expect(service.generar).toHaveBeenCalledWith(jasmine.objectContaining({
      codigoPeriodo: 'PER-2025-01', fechaInicio: '2025-01-01', fechaFin: '2025-01-31',
      codigoEmpresa: '10', codigosUbigeo: undefined
    }));
    expect(component.muestra()).toEqual(mockMuestra);
  });

  it('generar debería expandir departamentos a distritos antes de llamar al servicio', () => {
    crearComponente();
    component.periodoSeleccionado = 'PER-2025-01';
    component.fechaInicio = new Date('2025-01-01T12:00:00');
    component.fechaFin = new Date('2025-01-31T12:00:00');
    component.empresaSeleccionada = '10';
    component.departamentosSeleccionados = ['15'];
    provinciaService.listarTodos.and.returnValue(of([{ codigoProvincia: '01', descripcionProvincia: 'Lima' } as any]));
    distritoService.listarTodos.and.returnValue(of([{ codigoDistrito: '01', descripcionDistrito: 'Cercado' } as any]));
    service.generar.and.returnValue(of(mockMuestra));

    component.generar();

    expect(distritoService.listarTodos).toHaveBeenCalledWith('15', '01');
    expect(service.generar).toHaveBeenCalledWith(jasmine.objectContaining({ codigosUbigeo: ['150101'] }));
  });

  it('generar debería mostrar el error del backend si falla', () => {
    crearComponente();
    component.periodoSeleccionado = 'PER-2025-01';
    component.fechaInicio = new Date('2025-01-01T12:00:00');
    component.fechaFin = new Date('2025-01-31T12:00:00');
    component.empresaSeleccionada = '10';
    service.generar.and.returnValue(throwError(() => ({ error: { message: 'Sin registros disponibles' } })));

    component.generar();

    expect(snackBar.open).toHaveBeenCalledWith('Sin registros disponibles', 'Cerrar', jasmine.any(Object));
    expect(component.cargando()).toBe(false);
  });

  it('generar debería cargar la muestra existente si el backend responde MUESTRA_DUPLICADA (409)', () => {
    crearComponente();
    component.periodoSeleccionado = 'PER-2025-01';
    component.fechaInicio = new Date('2025-01-01T12:00:00');
    component.fechaFin = new Date('2025-01-31T12:00:00');
    component.empresaSeleccionada = '10';
    service.generar.and.returnValue(throwError(() => ({
      error: { code: 'MUESTRA_DUPLICADA', message: 'Ya existe una muestra activa para el periodo y empresa indicados' }
    })));
    service.vigente.and.returnValue(of(mockMuestra));

    component.generar();

    expect(service.vigente).toHaveBeenCalledWith('PER-2025-01', 1);
    expect(component.muestra()).toEqual(mockMuestra);
    expect(component.cargando()).toBe(false);
  });

  it('generar, ante MUESTRA_DUPLICADA, debería avisar si no puede resolver el id interno de la empresa', () => {
    crearComponente();
    component.periodoSeleccionado = 'PER-2025-01';
    component.fechaInicio = new Date('2025-01-01T12:00:00');
    component.fechaFin = new Date('2025-01-31T12:00:00');
    component.empresaSeleccionada = '99';
    service.generar.and.returnValue(throwError(() => ({ error: { code: 'MUESTRA_DUPLICADA' } })));

    component.generar();

    expect(service.vigente).not.toHaveBeenCalled();
    expect(snackBar.open).toHaveBeenCalledWith(
      'Ya existe una muestra activa, pero no se pudo cargar automáticamente', 'Cerrar', jasmine.any(Object)
    );
    expect(component.cargando()).toBe(false);
  });

  it('generar, ante MUESTRA_DUPLICADA, debería avisar si la carga de la muestra existente también falla', () => {
    crearComponente();
    component.periodoSeleccionado = 'PER-2025-01';
    component.fechaInicio = new Date('2025-01-01T12:00:00');
    component.fechaFin = new Date('2025-01-31T12:00:00');
    component.empresaSeleccionada = '10';
    service.generar.and.returnValue(throwError(() => ({ error: { code: 'MUESTRA_DUPLICADA' } })));
    service.vigente.and.returnValue(throwError(() => ({ error: { message: 'No autorizado' } })));

    component.generar();

    expect(snackBar.open).toHaveBeenCalledWith('No autorizado', 'Cerrar', jasmine.any(Object));
    expect(component.cargando()).toBe(false);
  });

  it('reemplazar debería fijar el id en edición y limpiar el motivo', () => {
    crearComponente();
    component.reemplazar(5);
    expect(component.reemplazandoId()).toBe(5);
    expect(component.motivoReemplazo).toBe('');
  });

  it('cancelarReemplazo debería limpiar la selección', () => {
    crearComponente();
    component.reemplazar(5);
    component.cancelarReemplazo();
    expect(component.reemplazandoId()).toBeNull();
  });

  it('confirmarReemplazo debería rechazar si falta el motivo', () => {
    crearComponente();
    component.reemplazar(5);
    component.motivoReemplazo = '   ';
    component.confirmarReemplazo();
    expect(snackBar.open).toHaveBeenCalledWith('El motivo del reemplazo es obligatorio', 'Cerrar', jasmine.any(Object));
    expect(service.reemplazar).not.toHaveBeenCalled();
  });

  it('confirmarReemplazo debería reemplazar y refrescar la muestra', () => {
    crearComponente();
    component.reemplazar(5);
    component.motivoReemplazo = 'Registro no disponible';
    service.reemplazar.and.returnValue(of(mockMuestra));

    component.confirmarReemplazo();

    expect(service.reemplazar).toHaveBeenCalledWith({ idMuestraDetalle: 5, motivo: 'Registro no disponible', usuario: 'admin' });
    expect(component.muestra()).toEqual(mockMuestra);
    expect(component.reemplazandoId()).toBeNull();
  });

  it('onDetallePage debería actualizar la página y el tamaño de página del detalle', () => {
    crearComponente();
    expect(component.detallePage).toBe(0);
    expect(component.detallePageSize).toBe(20);

    component.onDetallePage({ pageIndex: 3, pageSize: 100, length: 385 });

    expect(component.detallePage).toBe(3);
    expect(component.detallePageSize).toBe(100);
  });

  it('generar debería reiniciar la página del detalle al generar una muestra nueva', () => {
    crearComponente();
    component.periodoSeleccionado = 'PER-2025-01';
    component.fechaInicio = new Date('2025-01-01T12:00:00');
    component.fechaFin = new Date('2025-01-31T12:00:00');
    component.empresaSeleccionada = '10';
    component.detallePage = 5;
    service.generar.and.returnValue(of(mockMuestra));

    component.generar();

    expect(component.detallePage).toBe(0);
  });

  it('iniciarEvaluacion no debería navegar si no hay muestra generada', () => {
    crearComponente();
    component.iniciarEvaluacion();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('iniciarEvaluacion debería navegar a evaluacion-aiv con los parámetros de la muestra', () => {
    crearComponente();
    component.periodoSeleccionado = 'PER-2025-01';
    component.muestra.set(mockMuestra);
    component.iniciarEvaluacion();
    expect(router.navigate).toHaveBeenCalledWith(['/evaluacion-aiv'], {
      queryParams: { periodo: 'PER-2025-01', empresa: 10, idMuestraAiv: 1 }
    });
  });
});
