import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { HistoricoCitDialogComponent, HistoricoCitDialogData } from './historico-cit-dialog.component';
import { EvaluacionCitService } from '../../services/evaluacionCit.service';
import { EvaluacionCitResponse, HistoricoPreliminarCitResponse } from '../../models/evaluacionCit.model';
import { CitResultadoResponse } from '../../../cit/models/cit.model';

describe('HistoricoCitDialogComponent', () => {
  let component: HistoricoCitDialogComponent;
  let fixture: ComponentFixture<HistoricoCitDialogComponent>;
  let service: jasmine.SpyObj<EvaluacionCitService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<HistoricoCitDialogComponent>>;

  const mockData: HistoricoCitDialogData = { codigoPeriodo: '2025T1', codigoEmpresa: '10' };
  const mockConsolidado: EvaluacionCitResponse = {
    id: 1, codigoPeriodo: '2025T1', codigoEmpresa: '10', fechaInicio: '2025-01-01', fechaFin: '2025-01-31',
    motivo: null, nta: 100, nmd: 40, nrn: 3, indicadorCit: 1.5,
    incumplimientosItem1: 1, incumplimientosItem3: 1, incumplimientosItem4: 1,
    detalleItem4: { sinDetalleTh3: 0, sinDetalleTh4: 0, sinDetalleTh5: 0, sinDetalleTh6: 0, sinDetalleTh7: 0, sinDetalleTh8: 1 },
    tipoConsolidacion: 'CONSOLIDADO_PARCIAL', fechaConsolidado: '2025-02-01', usuario: 'admin'
  };
  const mockCalculoActual: CitResultadoResponse = {
    nmd: 90, nta: 100, incumplimientosItem1: 2, incumplimientosItem2: 0, incumplimientosItem3: 1, incumplimientosItem4: 2,
    detalleItem4: { sinDetalleTh3: 0, sinDetalleTh4: 0, sinDetalleTh5: 0, sinDetalleTh6: 0, sinDetalleTh7: 0, sinDetalleTh8: 2 },
    nrn: 4, cit: 2.0, tolerancia: 1.5, superaTolerancia: true
  };
  const mockHistorico: HistoricoPreliminarCitResponse = {
    consolidadoVigente: mockConsolidado,
    calculoActual: mockCalculoActual
  };

  function crear(): void {
    fixture = TestBed.createComponent(HistoricoCitDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    const serviceSpy = jasmine.createSpyObj('EvaluacionCitService', ['historico']);
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [HistoricoCitDialogComponent],
      providers: [
        { provide: EvaluacionCitService, useValue: serviceSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: mockData }
      ]
    }).compileComponents();

    service = TestBed.inject(EvaluacionCitService) as jasmine.SpyObj<EvaluacionCitService>;
    dialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<HistoricoCitDialogComponent>>;
  });

  it('debería cargar el histórico preliminar al iniciar', () => {
    service.historico.and.returnValue(of(mockHistorico));
    crear();
    expect(service.historico).toHaveBeenCalledWith('2025T1', '10');
    expect(component.historico()).toEqual(mockHistorico);
    expect(component.cargando()).toBe(false);
  });

  it('debería aceptar un histórico sin consolidación vigente (solo cálculo actual)', () => {
    service.historico.and.returnValue(of({ consolidadoVigente: null, calculoActual: mockCalculoActual }));
    crear();
    expect(component.historico()?.consolidadoVigente).toBeNull();
    expect(component.historico()?.calculoActual).toEqual(mockCalculoActual);
  });

  it('debería marcar sinInformacion con mensaje "sin datos" si el backend responde 404', () => {
    service.historico.and.returnValue(throwError(() => ({ status: 404 })));
    crear();
    expect(component.sinInformacion()).toBe(true);
    expect(component.cargando()).toBe(false);
    expect(component.mensajeVacio()).toBe(component.MENSAJE_SIN_DATOS);
  });

  it('debería mostrar mensaje de error técnico ante un error distinto de 404', () => {
    service.historico.and.returnValue(throwError(() => ({ status: 500 })));
    crear();
    expect(component.sinInformacion()).toBe(true);
    expect(component.cargando()).toBe(false);
    expect(component.mensajeVacio()).toBe(component.MENSAJE_ERROR);
  });

  it('salir debería cerrar el diálogo', () => {
    service.historico.and.returnValue(of(mockHistorico));
    crear();
    component.salir();
    expect(dialogRef.close).toHaveBeenCalled();
  });
});
