import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { VerEnProcesoDialogComponent } from './ver-en-proceso-dialog.component';
import { EvaluacionAivService } from '../../services/evaluacionAiv.service';
import { EvaluacionAivResumenResponse } from '../../models/evaluacionAiv.model';
import { PeriodoService } from '../../../periodos/services/periodo.service';
import { EmpresaConcesionariaService } from '../../../empresas/services/empresa-concesionaria.service';
import { Periodo } from '../../../periodos/models/periodo.model';
import { EmpresaConcesionaria } from '../../../empresas/models/empresa-concesionaria.model';

describe('VerEnProcesoDialogComponent', () => {
  let component: VerEnProcesoDialogComponent;
  let fixture: ComponentFixture<VerEnProcesoDialogComponent>;
  let service: jasmine.SpyObj<EvaluacionAivService>;
  let periodoService: jasmine.SpyObj<PeriodoService>;
  let empresaService: jasmine.SpyObj<EmpresaConcesionariaService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<VerEnProcesoDialogComponent>>;
  let router: jasmine.SpyObj<Router>;

  const mockPeriodos: Periodo[] = [{ codigoPeriodo: 'PER-2025-01', fechaInicio: '01/01/2025', fechaFin: '31/03/2025', estadoActivo: true }];
  const mockEmpresas: EmpresaConcesionaria[] = [{ codigoEmpresa: '10', razonSocial: 'Empresa 1' }];
  const mockEvaluaciones: EvaluacionAivResumenResponse[] = [
    { id: 1, codigoPeriodo: 'PER-2025-01', codigoEmpresa: 10, fechaInicio: '2025-01-01', fechaFin: '2025-03-31', estadoEvaluacion: 'EN_PROCESO', fechaModificacion: null, usuarioResponsable: 'admin', avancePorcentaje: 50 }
  ];

  beforeEach(async () => {
    const serviceSpy = jasmine.createSpyObj('EvaluacionAivService', ['listarEnProcesoOReabiertas']);
    const periodoServiceSpy = jasmine.createSpyObj('PeriodoService', ['listarPorEstado']);
    const empresaServiceSpy = jasmine.createSpyObj('EmpresaConcesionariaService', ['listarTodos']);
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    periodoServiceSpy.listarPorEstado.and.returnValue(of(mockPeriodos));
    empresaServiceSpy.listarTodos.and.returnValue(of(mockEmpresas));
    serviceSpy.listarEnProcesoOReabiertas.and.returnValue(of(mockEvaluaciones));

    await TestBed.configureTestingModule({
      imports: [VerEnProcesoDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: EvaluacionAivService, useValue: serviceSpy },
        { provide: PeriodoService, useValue: periodoServiceSpy },
        { provide: EmpresaConcesionariaService, useValue: empresaServiceSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    service = TestBed.inject(EvaluacionAivService) as jasmine.SpyObj<EvaluacionAivService>;
    periodoService = TestBed.inject(PeriodoService) as jasmine.SpyObj<PeriodoService>;
    empresaService = TestBed.inject(EmpresaConcesionariaService) as jasmine.SpyObj<EmpresaConcesionariaService>;
    dialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<VerEnProcesoDialogComponent>>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture = TestBed.createComponent(VerEnProcesoDialogComponent);
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

  it('debería cargar periodos, empresas y evaluaciones en proceso al iniciar', () => {
    expect(periodoService.listarPorEstado).toHaveBeenCalledWith(true);
    expect(empresaService.listarTodos).toHaveBeenCalled();
    expect(component.periodos()).toEqual(mockPeriodos);
    expect(component.empresas()).toEqual(mockEmpresas);
    expect(component.evaluaciones()).toEqual(mockEvaluaciones);
    expect(component.buscoAlMenosUnaVez()).toBe(true);
  });

  it('buscar debería vaciar la lista si falla la consulta', () => {
    service.listarEnProcesoOReabiertas.and.returnValue(throwError(() => ({ status: 500 })));
    component.buscar();
    expect(component.evaluaciones()).toEqual([]);
    expect(component.cargando()).toBe(false);
  });

  it('buscar debería enviar la fecha formateada cuando fechaEvaluada está definida', () => {
    component.fechaEvaluada = new Date('2025-02-15T12:00:00');
    component.buscar();
    expect(service.listarEnProcesoOReabiertas).toHaveBeenCalledWith(undefined, undefined, '2025-02-15');
  });

  it('continuar debería cerrar el diálogo y navegar con los query params de la evaluación', () => {
    component.continuar(mockEvaluaciones[0]);
    expect(dialogRef.close).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/evaluacion-aiv'], {
      queryParams: { periodo: 'PER-2025-01', empresa: 10 }
    });
  });

  it('cerrar debería cerrar el diálogo', () => {
    component.cerrar();
    expect(dialogRef.close).toHaveBeenCalled();
  });
});
