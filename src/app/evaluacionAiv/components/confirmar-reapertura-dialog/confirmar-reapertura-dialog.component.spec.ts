import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { ConfirmarReaperturaDialogComponent, ConfirmarReaperturaDialogData } from './confirmar-reapertura-dialog.component';
import { EvaluacionAivService } from '../../services/evaluacionAiv.service';
import { EvaluacionAivConsolidadaResponse, EvaluacionAivResponse } from '../../models/evaluacionAiv.model';

describe('ConfirmarReaperturaDialogComponent', () => {
  let component: ConfirmarReaperturaDialogComponent;
  let fixture: ComponentFixture<ConfirmarReaperturaDialogComponent>;
  let service: jasmine.SpyObj<EvaluacionAivService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<ConfirmarReaperturaDialogComponent>>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  const mockEvaluacion: EvaluacionAivConsolidadaResponse = {
    id: 501, codigoPeriodo: 'PER-2025-01', codigoEmpresa: 1,
    fechaInicio: '2025-01-01', fechaFin: '2025-03-31',
    indicadorAiv: 3.5, tipoMuestra: 'Por muestra', tipoConsolidacion: 'CONSOLIDADO_TOTAL',
    fechaConsolidado: '2025-04-01', usuarioConsolido: 'admin', numeroRegistrosEvaluados: 10
  };

  const mockData: ConfirmarReaperturaDialogData = { evaluacion: mockEvaluacion, usuario: 'admin' };
  const mockRespuesta = {} as EvaluacionAivResponse;

  beforeEach(async () => {
    const serviceSpy = jasmine.createSpyObj('EvaluacionAivService', ['reabrir']);
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [ConfirmarReaperturaDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: EvaluacionAivService, useValue: serviceSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: MAT_DIALOG_DATA, useValue: mockData }
      ]
    }).compileComponents();

    service = TestBed.inject(EvaluacionAivService) as jasmine.SpyObj<EvaluacionAivService>;
    dialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<ConfirmarReaperturaDialogComponent>>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

    fixture = TestBed.createComponent(ConfirmarReaperturaDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería rechazar reabrir sin motivo', () => {
    component.motivo = '';
    component.reabrir();
    expect(snackBar.open).toHaveBeenCalledWith('El motivo de reapertura es obligatorio', 'Cerrar', jasmine.any(Object));
    expect(service.reabrir).not.toHaveBeenCalled();
  });

  it('debería rechazar reabrir sin tipo de reapertura', () => {
    component.motivo = 'Corrección necesaria';
    component.tipoReapertura = null;
    component.reabrir();
    expect(snackBar.open).toHaveBeenCalledWith('El tipo de reapertura es obligatorio', 'Cerrar', jasmine.any(Object));
    expect(service.reabrir).not.toHaveBeenCalled();
  });

  it('debería rechazar reabrir sin sustento', () => {
    component.motivo = 'Corrección necesaria';
    component.tipoReapertura = 'Corrección de evaluación';
    component.archivoSustento = null;
    component.reabrir();
    expect(snackBar.open).toHaveBeenCalledWith('El sustento es obligatorio para reabrir la evaluación', 'Cerrar', jasmine.any(Object));
    expect(service.reabrir).not.toHaveBeenCalled();
  });

  it('debería reabrir la evaluación con los datos completos', (done) => {
    component.motivo = 'Corrección necesaria';
    component.tipoReapertura = 'Corrección de evaluación';
    component.archivoSustento = new File(['contenido'], 'sustento.pdf', { type: 'application/pdf' });
    service.reabrir.and.returnValue(of(mockRespuesta));

    component.reabrir();

    setTimeout(() => {
      expect(service.reabrir).toHaveBeenCalled();
      const req = service.reabrir.calls.mostRecent().args[0];
      expect(req.idEvaluacionAiv).toBe(501);
      expect(req.motivo).toBe('Corrección necesaria');
      expect(req.tipoReapertura).toBe('Corrección de evaluación');
      expect(req.nombreArchivoSustento).toBe('sustento.pdf');
      expect(dialogRef.close).toHaveBeenCalledWith(true);
      done();
    }, 50);
  });

  it('debería mostrar el error del backend si falla la reapertura', (done) => {
    component.motivo = 'Corrección necesaria';
    component.tipoReapertura = 'Corrección de evaluación';
    component.archivoSustento = new File(['contenido'], 'sustento.pdf', { type: 'application/pdf' });
    service.reabrir.and.returnValue(throwError(() => ({ error: { message: 'Sin permisos' } })));

    component.reabrir();

    setTimeout(() => {
      expect(snackBar.open).toHaveBeenCalledWith('Sin permisos', 'Cerrar', jasmine.any(Object));
      expect(dialogRef.close).not.toHaveBeenCalled();
      done();
    }, 50);
  });

  it('cancelar debería cerrar el diálogo sin datos', () => {
    component.cancelar();
    expect(dialogRef.close).toHaveBeenCalledWith();
  });
});
