import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { HistoricoCitDialogComponent, HistoricoCitDialogData } from './historico-cit-dialog.component';
import { EvaluacionCitService } from '../../services/evaluacionCit.service';
import { EvaluacionCitResponse } from '../../models/evaluacionCit.model';

describe('HistoricoCitDialogComponent', () => {
  let component: HistoricoCitDialogComponent;
  let fixture: ComponentFixture<HistoricoCitDialogComponent>;
  let service: jasmine.SpyObj<EvaluacionCitService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<HistoricoCitDialogComponent>>;

  const mockData: HistoricoCitDialogData = { codigoPeriodo: '2025T1', codigoEmpresa: '10' };
  const mockEvaluacion: EvaluacionCitResponse = {
    id: 1, codigoPeriodo: '2025T1', codigoEmpresa: '10', fechaInicio: '2025-01-01', fechaFin: '2025-03-31',
    motivo: null, nta: 100, nmd: 40, nrn: 3, indicadorCit: 1.5,
    incumplimientosItem1: 1, incumplimientosItem3: 1, incumplimientosItem4: 1,
    detalleItem4: { sinDetalleTh3: 0, sinDetalleTh4: 0, sinDetalleTh5: 0, sinDetalleTh6: 0, sinDetalleTh7: 0, sinDetalleTh8: 1 },
    tipoConsolidacion: 'CONSOLIDADO_TOTAL', fechaConsolidado: '2025-04-01', usuario: 'admin'
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

  it('debería cargar la evaluación histórica al iniciar', () => {
    service.historico.and.returnValue(of(mockEvaluacion));
    crear();
    expect(service.historico).toHaveBeenCalledWith('2025T1', '10');
    expect(component.evaluacion()).toEqual(mockEvaluacion);
    expect(component.cargando()).toBe(false);
  });

  it('debería marcar sinInformacion si el backend no encuentra evaluación', () => {
    service.historico.and.returnValue(throwError(() => ({ status: 404 })));
    crear();
    expect(component.sinInformacion()).toBe(true);
    expect(component.cargando()).toBe(false);
  });

  it('salir debería cerrar el diálogo', () => {
    service.historico.and.returnValue(of(mockEvaluacion));
    crear();
    component.salir();
    expect(dialogRef.close).toHaveBeenCalled();
  });
});
