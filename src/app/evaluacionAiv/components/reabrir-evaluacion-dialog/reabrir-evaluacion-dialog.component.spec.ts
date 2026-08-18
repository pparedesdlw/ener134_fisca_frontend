import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { ReabrirEvaluacionDialogComponent } from './reabrir-evaluacion-dialog.component';
import { EvaluacionAivService } from '../../services/evaluacionAiv.service';
import { EvaluacionAivConsolidadaResponse, EvaluacionRegistroResponse } from '../../models/evaluacionAiv.model';
import { PeriodoService } from '../../../periodos/services/periodo.service';
import { EmpresaConcesionariaService } from '../../../empresas/services/empresa-concesionaria.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Periodo } from '../../../periodos/models/periodo.model';
import { EmpresaConcesionaria } from '../../../empresas/models/empresa-concesionaria.model';

describe('ReabrirEvaluacionDialogComponent', () => {
  let component: ReabrirEvaluacionDialogComponent;
  let fixture: ComponentFixture<ReabrirEvaluacionDialogComponent>;
  let service: jasmine.SpyObj<EvaluacionAivService>;
  let periodoService: jasmine.SpyObj<PeriodoService>;
  let empresaService: jasmine.SpyObj<EmpresaConcesionariaService>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<ReabrirEvaluacionDialogComponent>>;

  const mockPeriodos: Periodo[] = [{ codigoPeriodo: 'PER-2025-01', fechaInicio: '2025-01-01', fechaFin: '2025-03-31', estadoActivo: true }];
  const mockEmpresas: EmpresaConcesionaria[] = [{ codigoEmpresa: '10', razonSocial: 'Empresa 1' }];
  const mockConsolidadas: EvaluacionAivConsolidadaResponse[] = [
    {
      id: 501, codigoPeriodo: 'PER-2025-01', codigoEmpresa: 10, fechaInicio: '2025-01-01', fechaFin: '2025-03-31',
      indicadorAiv: 3.5, tipoMuestra: 'Por muestra', tipoConsolidacion: 'CONSOLIDADO_TOTAL', fechaConsolidado: '2025-04-01',
      usuarioConsolido: 'admin', numeroRegistrosEvaluados: 10
    }
  ];
  const mockRegistros: EvaluacionRegistroResponse[] = [];

  beforeEach(async () => {
    const serviceSpy = jasmine.createSpyObj('EvaluacionAivService', ['listarConsolidadas', 'obtenerPorId']);
    const periodoServiceSpy = jasmine.createSpyObj('PeriodoService', ['listarPorEstado']);
    const empresaServiceSpy = jasmine.createSpyObj('EmpresaConcesionariaService', ['listarTodos']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    periodoServiceSpy.listarPorEstado.and.returnValue(of(mockPeriodos));
    empresaServiceSpy.listarTodos.and.returnValue(of(mockEmpresas));
    serviceSpy.listarConsolidadas.and.returnValue(of(mockConsolidadas));

    await TestBed.configureTestingModule({
      imports: [ReabrirEvaluacionDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: EvaluacionAivService, useValue: serviceSpy },
        { provide: PeriodoService, useValue: periodoServiceSpy },
        { provide: EmpresaConcesionariaService, useValue: empresaServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: AuthService, useValue: { isTisecAdmin: true } }
      ]
    }).compileComponents();

    // MatDialogModule es requerido por el propio template (mat-dialog-title/content/actions) y re-provee
    // MatDialog a nivel de componente, por lo que el override de `providers` es ignorado por TestBed;
    // overrideProvider sí lo respeta.
    TestBed.overrideProvider(MatDialog, { useValue: dialogSpy });

    service = TestBed.inject(EvaluacionAivService) as jasmine.SpyObj<EvaluacionAivService>;
    periodoService = TestBed.inject(PeriodoService) as jasmine.SpyObj<PeriodoService>;
    empresaService = TestBed.inject(EmpresaConcesionariaService) as jasmine.SpyObj<EmpresaConcesionariaService>;
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    dialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<ReabrirEvaluacionDialogComponent>>;

    fixture = TestBed.createComponent(ReabrirEvaluacionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

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

    it('al cambiar de periodo, debería limpiar la fecha evaluada si quedó fuera del nuevo rango', () => {
      component.periodoSeleccionado = 'PER-2025-01';
      component.fechaEvaluada = new Date(2025, 5, 1);

      component.onPeriodoChange();

      expect(component.fechaEvaluada).toBeNull();
    });
  });

  it('debería cargar periodos, empresas y evaluaciones consolidadas al iniciar', () => {
    expect(periodoService.listarPorEstado).toHaveBeenCalledWith(true);
    expect(empresaService.listarTodos).toHaveBeenCalled();
    expect(component.periodos()).toEqual(mockPeriodos);
    expect(component.empresas()).toEqual(mockEmpresas);
    expect(component.evaluaciones()).toEqual(mockConsolidadas);
    expect(component.buscoAlMenosUnaVez()).toBe(true);
  });

  it('RF09: la grilla debería incluir la columna "Tipo de muestra"', () => {
    expect(component.displayedColumns).toContain('tipoMuestra');
    const texto = fixture.nativeElement.textContent as string;
    expect(texto).toContain('Tipo de muestra');
    expect(texto).toContain('Por muestra');
  });

  it('puedeReabrir debería reflejar el rol del usuario autenticado', () => {
    expect(component.puedeReabrir).toBe(true);
  });

  it('buscar debería vaciar la lista si falla la consulta', () => {
    service.listarConsolidadas.and.returnValue(throwError(() => ({ status: 500 })));
    component.buscar();
    expect(component.evaluaciones()).toEqual([]);
    expect(component.cargando()).toBe(false);
  });

  it('verRegistros debería asignar los registros de la evaluación consultada', () => {
    service.obtenerPorId.and.returnValue(of({ registros: mockRegistros } as any));
    component.verRegistros(mockConsolidadas[0]);
    expect(service.obtenerPorId).toHaveBeenCalledWith(501);
    expect(component.registrosSeleccionados()).toEqual(mockRegistros);
  });

  it('verRegistros debería dejar la lista vacía si falla la consulta', () => {
    service.obtenerPorId.and.returnValue(throwError(() => ({ status: 500 })));
    component.verRegistros(mockConsolidadas[0]);
    expect(component.registrosSeleccionados()).toEqual([]);
  });

  it('cerrarRegistros debería limpiar la selección', () => {
    component.registrosSeleccionados.set(mockRegistros);
    component.cerrarRegistros();
    expect(component.registrosSeleccionados()).toBeNull();
  });

  it('reabrirEvaluacion debería cerrar esta ventana y abrir el diálogo de confirmación', () => {
    const dialogRefAbierto = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    dialogRefAbierto.afterClosed.and.returnValue(of(undefined));
    dialog.open.and.returnValue(dialogRefAbierto);

    component.reabrirEvaluacion(mockConsolidadas[0]);

    expect(dialogRef.close).toHaveBeenCalled();
    expect(dialog.open).toHaveBeenCalled();
    const dataEnviada = dialog.open.calls.first().args[1] as any;
    expect(dataEnviada.data.evaluacion).toEqual(mockConsolidadas[0]);
  });

  it('cerrar debería cerrar el diálogo', () => {
    component.cerrar();
    expect(dialogRef.close).toHaveBeenCalled();
  });
});
