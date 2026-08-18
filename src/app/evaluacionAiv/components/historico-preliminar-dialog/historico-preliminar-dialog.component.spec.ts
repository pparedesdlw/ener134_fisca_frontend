import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { HistoricoPreliminarDialogComponent, HistoricoPreliminarDialogData } from './historico-preliminar-dialog.component';
import { EvaluacionAivService } from '../../services/evaluacionAiv.service';
import { EvaluacionAivResponse } from '../../models/evaluacionAiv.model';

describe('HistoricoPreliminarDialogComponent', () => {
  let component: HistoricoPreliminarDialogComponent;
  let fixture: ComponentFixture<HistoricoPreliminarDialogComponent>;
  let service: jasmine.SpyObj<EvaluacionAivService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<HistoricoPreliminarDialogComponent>>;

  const mockData: HistoricoPreliminarDialogData = { codigoPeriodo: 'PER-2025-01', codigoEmpresa: 1 };
  const mockEvaluacion = { id: 1, itemsResumen: [] } as unknown as EvaluacionAivResponse;

  function crear(): void {
    fixture = TestBed.createComponent(HistoricoPreliminarDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    const serviceSpy = jasmine.createSpyObj('EvaluacionAivService', ['obtenerHistoricoPreliminar']);
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [HistoricoPreliminarDialogComponent],
      providers: [
        { provide: EvaluacionAivService, useValue: serviceSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: mockData }
      ]
    }).compileComponents();

    service = TestBed.inject(EvaluacionAivService) as jasmine.SpyObj<EvaluacionAivService>;
    dialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<HistoricoPreliminarDialogComponent>>;
  });

  it('debería cargar la evaluación preliminar al iniciar', () => {
    service.obtenerHistoricoPreliminar.and.returnValue(of(mockEvaluacion));
    crear();
    expect(service.obtenerHistoricoPreliminar).toHaveBeenCalledWith('PER-2025-01', 1);
    expect(component.evaluacion()).toEqual(mockEvaluacion);
    expect(component.cargando()).toBe(false);
    expect(component.sinInformacion()).toBe(false);
  });

  it('debería marcar sinInformacion si el backend no encuentra evaluación vigente', () => {
    service.obtenerHistoricoPreliminar.and.returnValue(throwError(() => ({ status: 404 })));
    crear();
    expect(component.sinInformacion()).toBe(true);
    expect(component.cargando()).toBe(false);
    expect(component.evaluacion()).toBeNull();
  });

  it('salir debería cerrar el diálogo', () => {
    service.obtenerHistoricoPreliminar.and.returnValue(of(mockEvaluacion));
    crear();
    component.salir();
    expect(dialogRef.close).toHaveBeenCalled();
  });
});
