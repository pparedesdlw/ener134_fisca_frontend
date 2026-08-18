import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ResultadoConsolidadoDialogComponent, ResultadoConsolidadoDialogData } from './resultado-consolidado-dialog.component';
import { EvaluacionAivResponse } from '../../models/evaluacionAiv.model';

describe('ResultadoConsolidadoDialogComponent', () => {
  let component: ResultadoConsolidadoDialogComponent;
  let fixture: ComponentFixture<ResultadoConsolidadoDialogComponent>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<ResultadoConsolidadoDialogComponent>>;

  async function crear(evaluacion: Partial<EvaluacionAivResponse>): Promise<void> {
    const mockData: ResultadoConsolidadoDialogData = { evaluacion: evaluacion as EvaluacionAivResponse };
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [ResultadoConsolidadoDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: mockData }
      ]
    }).compileComponents();

    dialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<ResultadoConsolidadoDialogComponent>>;

    fixture = TestBed.createComponent(ResultadoConsolidadoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('debería crear el componente', async () => {
    await crear({ estadoEvaluacion: 'CONSOLIDADO_TOTAL', itemsResumen: [] });
    expect(component).toBeTruthy();
  });

  it('esTotal debería ser verdadero cuando el estado es CONSOLIDADO_TOTAL', async () => {
    await crear({ estadoEvaluacion: 'CONSOLIDADO_TOTAL', itemsResumen: [] });
    expect(component.esTotal).toBe(true);
  });

  it('esTotal debería ser falso cuando el estado es CONSOLIDADO_PARCIAL', async () => {
    await crear({ estadoEvaluacion: 'CONSOLIDADO_PARCIAL', itemsResumen: [] });
    expect(component.esTotal).toBe(false);
  });

  it('salir debería cerrar el diálogo', async () => {
    await crear({ estadoEvaluacion: 'CONSOLIDADO_TOTAL', itemsResumen: [] });
    component.salir();
    expect(dialogRef.close).toHaveBeenCalled();
  });
});
