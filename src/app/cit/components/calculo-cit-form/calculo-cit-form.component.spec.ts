import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { CalculoCitFormComponent } from './calculo-cit-form.component';
import { CitService } from '../../services/cit.service';
import { EmpresaConcesionariaService } from '../../../empresas/services/empresa-concesionaria.service';
import { PeriodoService } from '../../../periodos/services/periodo.service';
import { EvaluacionCitService } from '../../../evaluacionCit/services/evaluacionCit.service';
import { CitResultadoResponse } from '../../models/cit.model';
import { EvaluacionCitResponse } from '../../../evaluacionCit/models/evaluacionCit.model';

describe('CalculoCitFormComponent', () => {
  let component: CalculoCitFormComponent;
  let fixture: ComponentFixture<CalculoCitFormComponent>;
  let citService: jasmine.SpyObj<CitService>;
  let empresaConcesionariaService: jasmine.SpyObj<EmpresaConcesionariaService>;
  let periodoService: jasmine.SpyObj<PeriodoService>;
  let evaluacionCitService: jasmine.SpyObj<EvaluacionCitService>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  const mockResultado: CitResultadoResponse = {
    nmd: 100,
    nta: 3,
    incumplimientosItem1: 5,
    incumplimientosItem2: 0,
    incumplimientosItem3: 3,
    incumplimientosItem4: 2,
    detalleItem4: {
      sinDetalleTh3: 1,
      sinDetalleTh4: 0,
      sinDetalleTh5: 1,
      sinDetalleTh6: 0,
      sinDetalleTh7: 0,
      sinDetalleTh8: 0
    },
    nrn: 10,
    cit: 3.4,
    tolerancia: 5.0,
    superaTolerancia: false
  };

  beforeEach(async () => {
    const citServiceSpy = jasmine.createSpyObj('CitService', ['calcularCit', 'listarMotivos', 'listarAtenciones']);
    const empresaConcesionariaServiceSpy = jasmine.createSpyObj('EmpresaConcesionariaService', ['listarTodos']);
    const periodoServiceSpy = jasmine.createSpyObj('PeriodoService', ['listarPorEstado']);
    const evaluacionCitServiceSpy = jasmine.createSpyObj('EvaluacionCitService', ['finalizar']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    citServiceSpy.listarMotivos.and.returnValue(of([]));
    citServiceSpy.listarAtenciones.and.returnValue(of([]));
    empresaConcesionariaServiceSpy.listarTodos.and.returnValue(of([]));
    periodoServiceSpy.listarPorEstado.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [
        CalculoCitFormComponent,
        HttpClientTestingModule,
        NoopAnimationsModule,
        FormsModule
      ],
      providers: [
        { provide: CitService, useValue: citServiceSpy },
        { provide: EmpresaConcesionariaService, useValue: empresaConcesionariaServiceSpy },
        { provide: PeriodoService, useValue: periodoServiceSpy },
        { provide: EvaluacionCitService, useValue: evaluacionCitServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CalculoCitFormComponent);
    component = fixture.componentInstance;
    citService = TestBed.inject(CitService) as jasmine.SpyObj<CitService>;
    empresaConcesionariaService = TestBed.inject(EmpresaConcesionariaService) as jasmine.SpyObj<EmpresaConcesionariaService>;
    periodoService = TestBed.inject(PeriodoService) as jasmine.SpyObj<PeriodoService>;
    evaluacionCitService = TestBed.inject(EvaluacionCitService) as jasmine.SpyObj<EvaluacionCitService>;
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.fechaInicio).toBeNull();
    expect(component.fechaFin).toBeNull();
    expect(component.empresaSeleccionada).toBeNull();
    expect(component.periodoSeleccionado).toBeNull();
    expect(component.calculando).toBe(false);
    expect(component.mensaje).toBe('');
    expect(component.error).toBe('');
    expect(component.resultado).toBeNull();
  });

  it('should load empresas, motivos and periodos on init', () => {
    expect(empresaConcesionariaService.listarTodos).toHaveBeenCalled();
    expect(citService.listarMotivos).toHaveBeenCalled();
    expect(periodoService.listarPorEstado).toHaveBeenCalledWith(true);
  });

  it('should call calcularCit with correct request', () => {
    component.periodoSeleccionado = 'PER-2024-01';
    component.fechaInicio = new Date(2024, 0, 1);
    component.fechaFin = new Date(2024, 2, 31);
    component.empresaSeleccionada = '0010';
    component.motivoSeleccionado = 'Denuncias';
    citService.calcularCit.and.returnValue(of(mockResultado));

    component.calcularCit();

    expect(citService.calcularCit).toHaveBeenCalledWith({
      fechaInicio: '2024-01-01',
      fechaFin: '2024-03-31',
      codigoEmpresa: '0010',
      codigoPeriodo: 'PER-2024-01',
      descripcionMotivo: 'Denuncias'
    });
  });

  it('should show error if periodo is not selected', () => {
    component.periodoSeleccionado = null;
    component.fechaInicio = new Date(2024, 0, 1);
    component.fechaFin = new Date(2024, 2, 31);
    component.empresaSeleccionada = '0010';

    component.calcularCit();

    expect(component.error).toContain('periodo');
    expect(citService.calcularCit).not.toHaveBeenCalled();
  });

  it('should show error if dates are not selected', () => {
    component.periodoSeleccionado = 'PER-2024-01';
    component.fechaInicio = null;
    component.fechaFin = null;
    component.empresaSeleccionada = '0010';

    component.calcularCit();

    expect(component.error).toContain('fecha');
    expect(citService.calcularCit).not.toHaveBeenCalled();
  });

  it('should show error if empresa is not selected', () => {
    component.periodoSeleccionado = 'PER-2024-01';
    component.fechaInicio = new Date(2024, 0, 1);
    component.fechaFin = new Date(2024, 2, 31);
    component.empresaSeleccionada = null;

    component.calcularCit();

    expect(component.error).toContain('empresa');
    expect(citService.calcularCit).not.toHaveBeenCalled();
  });

  it('should set resultado on successful calculation', () => {
    component.periodoSeleccionado = 'PER-2024-01';
    component.fechaInicio = new Date(2024, 0, 1);
    component.fechaFin = new Date(2024, 2, 31);
    component.empresaSeleccionada = '0010';
    citService.calcularCit.and.returnValue(of(mockResultado));

    component.calcularCit();

    expect(component.resultado).toEqual(mockResultado);
    expect(component.calculando).toBe(false);
    expect(component.mensaje).toContain('exitosamente');
  });

  it('should show error on calculation failure', () => {
    component.periodoSeleccionado = 'PER-2024-01';
    component.fechaInicio = new Date(2024, 0, 1);
    component.fechaFin = new Date(2024, 2, 31);
    component.empresaSeleccionada = '0010';
    citService.calcularCit.and.returnValue(throwError(() => ({ error: { message: 'Error en cálculo' } })));

    component.calcularCit();

    expect(component.calculando).toBe(false);
    expect(component.error).toContain('Error');
  });

  describe('finalizarEvaluacion (RF13)', () => {
    const mockEvaluacion: EvaluacionCitResponse = {
      id: 1,
      codigoPeriodo: 'PER-2024-01',
      codigoEmpresa: '0010',
      fechaInicio: '2024-01-01',
      fechaFin: '2024-03-31',
      motivo: null,
      nta: 4,
      nmd: 100,
      nrn: 6,
      indicadorCit: 1.5,
      incumplimientosItem1: 2,
      incumplimientosItem3: 1,
      incumplimientosItem4: 3,
      detalleItem4: { sinDetalleTh3: 1, sinDetalleTh4: 0, sinDetalleTh5: 1, sinDetalleTh6: 0, sinDetalleTh7: 1, sinDetalleTh8: 0 },
      tipoConsolidacion: 'CONSOLIDADO_TOTAL',
      fechaConsolidado: '31/07/2026 10:00:00',
      usuario: 'admin'
    };

    beforeEach(() => {
      component.periodoSeleccionado = 'PER-2024-01';
      component.fechaInicio = new Date(2024, 0, 1);
      component.fechaFin = new Date(2024, 2, 31);
      component.empresaSeleccionada = '0010';
      component.resultado = mockResultado;
    });

    it('no debería hacer nada si no hay resultado calculado', () => {
      component.resultado = null;
      component.finalizarEvaluacion();
      expect(evaluacionCitService.finalizar).not.toHaveBeenCalled();
    });

    it('debería finalizar la evaluación y mostrar el tipo de consolidación', () => {
      evaluacionCitService.finalizar.and.returnValue(of(mockEvaluacion));

      component.finalizarEvaluacion();

      expect(evaluacionCitService.finalizar).toHaveBeenCalledWith({
        codigoPeriodo: 'PER-2024-01',
        codigoEmpresa: '0010',
        fechaInicio: '2024-01-01',
        fechaFin: '2024-03-31',
        descripcionMotivo: null,
        usuario: 'admin'
      });
      expect(component.finalizando).toBe(false);
      expect(snackBar.open).toHaveBeenCalledWith(
        jasmine.stringMatching(/consolidación total/), 'Cerrar', jasmine.any(Object)
      );
    });

    it('debería mostrar el mensaje de error si ya existe una evaluación consolidada vigente', () => {
      evaluacionCitService.finalizar.and.returnValue(
        throwError(() => ({ error: { message: 'Ya existe una evaluación consolidada vigente para el periodo y empresa seleccionados.' } }))
      );

      component.finalizarEvaluacion();

      expect(component.finalizando).toBe(false);
      expect(snackBar.open).toHaveBeenCalledWith(
        'Ya existe una evaluación consolidada vigente para el periodo y empresa seleccionados.', 'Cerrar', jasmine.any(Object)
      );
    });
  });

  describe('rango de fechas según periodo seleccionado', () => {
    beforeEach(() => {
      component.periodos = [
        { codigoPeriodo: 'PER-2024-01', descripcion: 'Trimestre 1', fechaInicio: '2024-01-01', fechaFin: '2024-03-31', estadoActivo: true }
      ];
    });

    it('sin periodo seleccionado, no debería restringir el mínimo', () => {
      component.periodoSeleccionado = null;
      expect(component.periodoMinDate).toBeNull();
      expect(component.periodoMaxDate).toEqual(component.maxDate);
    });

    it('con un periodo seleccionado, debería acotar el rango a sus fechas', () => {
      component.periodoSeleccionado = 'PER-2024-01';
      expect(component.periodoMinDate).toEqual(new Date(2024, 0, 1));
      expect(component.periodoMaxDate).toEqual(new Date(2024, 2, 31));
    });

    it('al cambiar de periodo, debería limpiar fechas que quedaron fuera del nuevo rango', () => {
      component.periodoSeleccionado = 'PER-2024-01';
      component.fechaInicio = new Date(2025, 0, 1);
      component.fechaFin = new Date(2024, 1, 1);

      component.onPeriodoChange();

      expect(component.fechaInicio).toBeNull();
      expect(component.fechaFin).toEqual(new Date(2024, 1, 1));
    });
  });

  describe('verHistorico (RF14)', () => {
    it('debería mostrar un mensaje si falta periodo o empresa', () => {
      component.periodoSeleccionado = null;
      component.empresaSeleccionada = null;

      component.verHistorico();

      expect(dialog.open).not.toHaveBeenCalled();
      expect(snackBar.open).toHaveBeenCalled();
    });

    it('debería abrir el diálogo de histórico con el periodo y empresa seleccionados', () => {
      component.periodoSeleccionado = 'PER-2024-01';
      component.empresaSeleccionada = '0010';

      component.verHistorico();

      expect(dialog.open).toHaveBeenCalledWith(jasmine.any(Function), jasmine.objectContaining({
        data: { codigoPeriodo: 'PER-2024-01', codigoEmpresa: '0010' }
      }));
    });
  });
});
