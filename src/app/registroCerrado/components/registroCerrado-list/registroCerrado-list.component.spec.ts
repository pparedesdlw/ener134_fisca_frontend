import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { RegistroCerradoListComponent } from './registroCerrado-list.component';
import { RegistroCerradoService } from '../../services/registroCerrado.service';
import { RegistroCerradoPageResponse, RegistroCerradoResponse } from '../../models/registroCerrado.model';
import { PeriodoService } from '../../../periodos/services/periodo.service';
import { EmpresaConcesionariaService } from '../../../empresas/services/empresa-concesionaria.service';
import { AsuntoService } from '../../../asuntos/services/asunto.service';
import { Periodo } from '../../../periodos/models/periodo.model';
import { EmpresaConcesionaria } from '../../../empresas/models/empresa-concesionaria.model';
import { Asunto } from '../../../asuntos/models/asunto.model';

describe('RegistroCerradoListComponent', () => {
  let component: RegistroCerradoListComponent;
  let fixture: ComponentFixture<RegistroCerradoListComponent>;
  let service: jasmine.SpyObj<RegistroCerradoService>;
  let router: jasmine.SpyObj<Router>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let dialog: jasmine.SpyObj<MatDialog>;

  const mockPeriodos: Periodo[] = [{ codigoPeriodo: 'PER-2025-01', fechaInicio: '01/01/2025', fechaFin: '31/03/2025', estadoActivo: true }];
  const mockEmpresas: EmpresaConcesionaria[] = [{ id: 1, codigoEmpresa: '10', razonSocial: 'Empresa 1' }];
  const mockAsuntos: Asunto[] = [{ codigoAsunto: '174', descripcion: 'Consumo excesivo', estado: '1' }];
  const mockRegistro: RegistroCerradoResponse = {
    codigoEmpresa: '10', codigoAtencion: 'AT-1', codigoAsunto: '174',
    fechaRecepcion: '2025-01-05', fechaCierre: '2025-01-10', codigoUbigeo: '150101', usuarioCreacion: 'admin'
  };
  const mockPagina: RegistroCerradoPageResponse = { content: [mockRegistro], page: 0, size: 20, totalElements: 1, totalPages: 1 };

  beforeEach(async () => {
    const serviceSpy = jasmine.createSpyObj('RegistroCerradoService', ['buscar', 'exportar']);
    const periodoServiceSpy = jasmine.createSpyObj('PeriodoService', ['listarPorEstado']);
    const empresaServiceSpy = jasmine.createSpyObj('EmpresaConcesionariaService', ['listarTodos']);
    const asuntoServiceSpy = jasmine.createSpyObj('AsuntoService', ['listarPorEstado']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    periodoServiceSpy.listarPorEstado.and.returnValue(of(mockPeriodos));
    empresaServiceSpy.listarTodos.and.returnValue(of(mockEmpresas));
    asuntoServiceSpy.listarPorEstado.and.returnValue(of(mockAsuntos));

    await TestBed.configureTestingModule({
      imports: [RegistroCerradoListComponent, NoopAnimationsModule],
      providers: [
        { provide: RegistroCerradoService, useValue: serviceSpy },
        { provide: PeriodoService, useValue: periodoServiceSpy },
        { provide: EmpresaConcesionariaService, useValue: empresaServiceSpy },
        { provide: AsuntoService, useValue: asuntoServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: MatDialog, useValue: dialogSpy }
      ]
    }).compileComponents();

    service = TestBed.inject(RegistroCerradoService) as jasmine.SpyObj<RegistroCerradoService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;

    fixture = TestBed.createComponent(RegistroCerradoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function llenarFiltro(): void {
    component.periodoSeleccionado = 'PER-2025-01';
    component.fechaInicio = new Date('2025-01-01T12:00:00');
    component.fechaFin = new Date('2025-01-31T12:00:00');
    component.asuntoSeleccionado = '174';
    component.empresaSeleccionada = '10';
  }

  describe('rango de fechas según periodo seleccionado', () => {
    it('sin periodo seleccionado, no debería restringir el mínimo', () => {
      component.periodoSeleccionado = null;
      expect(component.periodoMinDate).toBeNull();
      expect(component.periodoMaxDate).toEqual(component.maxDate);
    });

    it('con un periodo seleccionado, debería acotar el rango a sus fechas', () => {
      component.periodoSeleccionado = 'PER-2025-01';
      expect(component.periodoMinDate).toEqual(new Date(2025, 0, 1));
      expect(component.periodoMaxDate).toEqual(new Date(2025, 2, 31));
    });

    it('al cambiar de periodo, debería autocompletar fecha inicio y fecha fin con el rango del periodo', () => {
      component.periodoSeleccionado = 'PER-2025-01';
      component.fechaInicio = new Date(2025, 5, 1);
      component.fechaFin = new Date(2025, 6, 1);

      component.onPeriodoChange();

      expect(component.fechaInicio).toEqual(new Date(2025, 0, 1));
      expect(component.fechaFin).toEqual(new Date(2025, 2, 31));
    });
  });

  it('debería cargar periodos, empresas y asuntos al iniciar', () => {
    expect(component.periodos()).toEqual(mockPeriodos);
    expect(component.empresas()).toEqual(mockEmpresas);
    expect(component.asuntos()).toEqual(mockAsuntos);
  });

  describe('descripcionAsunto', () => {
    it('debería resolver el código a "código - descripción" cuando existe en el catálogo', () => {
      expect(component.descripcionAsunto('174')).toBe('174 - Consumo excesivo');
    });

    it('debería devolver el código crudo como respaldo cuando no está en el catálogo', () => {
      expect(component.descripcionAsunto('999')).toBe('999');
    });

    it('debería resolver igual aunque el catálogo traiga codigoAsunto numérico (JSON no respeta el tipo TS)', () => {
      component.asuntos.set([{ codigoAsunto: 174 as unknown as string, descripcion: 'Consumo excesivo', estado: '1' }]);
      expect(component.descripcionAsunto('174')).toBe('174 - Consumo excesivo');
    });
  });

  it('buscar debería avisar si faltan filtros obligatorios', () => {
    component.buscar();
    expect(snackBar.open).toHaveBeenCalledWith(
      'Periodo, fecha inicio, fecha fin, asunto y empresa son obligatorios', 'Cerrar', jasmine.any(Object)
    );
    expect(service.buscar).not.toHaveBeenCalled();
  });

  it('buscar debería consultar y asignar los registros con filtros completos', () => {
    llenarFiltro();
    service.buscar.and.returnValue(of(mockPagina));

    component.buscar();

    expect(service.buscar).toHaveBeenCalledWith(jasmine.objectContaining({
      codigoPeriodo: 'PER-2025-01', fechaInicio: '2025-01-01', fechaFin: '2025-01-31',
      codigoAsunto: '174', codigoEmpresa: '10', page: 0, size: 20
    }));
    expect(component.registros()).toEqual([mockRegistro]);
    expect(component.totalElements()).toBe(1);
  });

  describe('columnas de la tabla: descripciones en vez de códigos crudos', () => {
    it('debería mostrar la descripción del asunto y del ubigeo cuando el backend las trae', () => {
      llenarFiltro();
      const registroConDescripciones: RegistroCerradoResponse = { ...mockRegistro, descripcionUbigeo: 'Lima - Lima - Lima' };
      service.buscar.and.returnValue(of({ ...mockPagina, content: [registroConDescripciones] }));

      component.buscar();
      fixture.detectChanges();

      const texto = fixture.nativeElement.textContent as string;
      expect(texto).toContain('174 - Consumo excesivo');
      expect(texto).toContain('Lima - Lima - Lima');
      expect(texto).not.toContain('150101');
    });

    it('debería mostrar el código crudo de ubigeo como respaldo cuando no hay descripción', () => {
      llenarFiltro();
      service.buscar.and.returnValue(of(mockPagina)); // mockRegistro no trae descripcionUbigeo

      component.buscar();
      fixture.detectChanges();

      expect((fixture.nativeElement.textContent as string)).toContain('150101');
    });
  });

  it('buscar debería vaciar los registros si falla la consulta', () => {
    llenarFiltro();
    service.buscar.and.returnValue(throwError(() => ({ error: { message: 'Error del servidor' } })));

    component.buscar();

    expect(component.registros()).toEqual([]);
    expect(component.totalElements()).toBe(0);
    expect(snackBar.open).toHaveBeenCalledWith('Error del servidor', 'Cerrar', jasmine.any(Object));
  });

  it('onPage debería recargar con la página seleccionada', () => {
    llenarFiltro();
    service.buscar.and.returnValue(of(mockPagina));

    component.onPage({ pageIndex: 2, pageSize: 20, length: 100 });

    expect(service.buscar).toHaveBeenCalledWith(jasmine.objectContaining({ page: 2, size: 20 }));
  });

  it('onPage debería recargar con el tamaño de página seleccionado (ej. 100)', () => {
    llenarFiltro();
    service.buscar.and.returnValue(of(mockPagina));

    component.onPage({ pageIndex: 0, pageSize: 100, length: 200 });

    expect(service.buscar).toHaveBeenCalledWith(jasmine.objectContaining({ page: 0, size: 100 }));
  });

  it('un cambio de tamaño de página debería mantenerse en búsquedas posteriores', () => {
    llenarFiltro();
    service.buscar.and.returnValue(of(mockPagina));

    component.onPage({ pageIndex: 1, pageSize: 100, length: 200 });
    component.buscar();

    expect(service.buscar).toHaveBeenCalledWith(jasmine.objectContaining({ page: 0, size: 100 }));
  });

  it('exportar no debería llamar al servicio si faltan filtros', () => {
    component.exportar();
    expect(service.exportar).not.toHaveBeenCalled();
  });

  it('exportar debería descargar el archivo cuando los filtros están completos', () => {
    llenarFiltro();
    const blob = new Blob(['contenido']);
    service.exportar.and.returnValue(of(blob));
    spyOn(window.URL, 'createObjectURL').and.returnValue('blob:mock');
    spyOn(window.URL, 'revokeObjectURL');

    component.exportar();

    expect(service.exportar).toHaveBeenCalled();
  });

  it('obtenerTotal no debería navegar si faltan filtros', () => {
    component.obtenerTotal();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('obtenerTotal debería navegar a evaluacion-aiv con los filtros, fechas y tipo TOTAL', () => {
    llenarFiltro();
    component.obtenerTotal();
    expect(router.navigate).toHaveBeenCalledWith(['/evaluacion-aiv'], {
      queryParams: {
        periodo: 'PER-2025-01', empresa: '10', asunto: '174',
        fechaInicio: '2025-01-01', fechaFin: '2025-01-31', tipo: 'TOTAL'
      }
    });
  });

  it('definirMuestra debería navegar a muestra-aiv con periodo, fechas y empresa', () => {
    llenarFiltro();
    component.definirMuestra();
    expect(router.navigate).toHaveBeenCalledWith(['/muestra-aiv'], {
      queryParams: { periodo: 'PER-2025-01', fechaInicio: '2025-01-01', fechaFin: '2025-01-31', empresa: '10' }
    });
  });

  it('verEnProceso debería abrir el diálogo correspondiente', () => {
    component.verEnProceso();
    expect(dialog.open).toHaveBeenCalled();
  });

  it('abrirReaperturaEvaluaciones debería abrir el diálogo correspondiente', () => {
    component.abrirReaperturaEvaluaciones();
    expect(dialog.open).toHaveBeenCalled();
  });

  it('verHistorico debería avisar si faltan periodo o empresa', () => {
    component.periodoSeleccionado = null;
    component.verHistorico();
    expect(snackBar.open).toHaveBeenCalledWith(
      'Seleccione periodo y empresa para ver el histórico', 'Cerrar', jasmine.any(Object)
    );
    expect(dialog.open).not.toHaveBeenCalled();
  });

  it('verHistorico debería abrir el diálogo con el id interno de la empresa', () => {
    component.periodoSeleccionado = 'PER-2025-01';
    component.empresaSeleccionada = '10';
    component.verHistorico();
    expect(dialog.open).toHaveBeenCalled();
    const args = dialog.open.calls.mostRecent().args[1] as any;
    expect(args.data).toEqual({ codigoPeriodo: 'PER-2025-01', codigoEmpresa: 1 });
  });
});
