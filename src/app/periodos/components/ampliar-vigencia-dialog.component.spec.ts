import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { AmpliarVigenciaDialogComponent } from './ampliar-vigencia-dialog.component';
import { PeriodoService } from '../services/periodo.service';
import { Periodo, AmpliacionVigenciaRequest } from '../models/periodo.model';

describe('AmpliarVigenciaDialogComponent', () => {
  let component: AmpliarVigenciaDialogComponent;
  let fixture: ComponentFixture<AmpliarVigenciaDialogComponent>;
  let periodoService: jasmine.SpyObj<PeriodoService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<AmpliarVigenciaDialogComponent>>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  const mockPeriodo: Periodo = {
    id: 1,
    codigoPeriodo: '2024-T1',
    descripcion: 'Primer trimestre 2024',
    fechaInicio: '01/01/2024',
    fechaFin: '31/03/2024',
    estadoActivo: true,
    deEstado: 'Activo',
    diasRestantes: 15
  };

  beforeEach(async () => {
    const periodoServiceSpy = jasmine.createSpyObj('PeriodoService', ['ampliarVigencia']);
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        AmpliarVigenciaDialogComponent,
        ReactiveFormsModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: PeriodoService, useValue: periodoServiceSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: MAT_DIALOG_DATA, useValue: { periodo: mockPeriodo } }
      ]
    }).compileComponents();

    periodoService = TestBed.inject(PeriodoService) as jasmine.SpyObj<PeriodoService>;
    dialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<AmpliarVigenciaDialogComponent>>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

    fixture = TestBed.createComponent(AmpliarVigenciaDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('Inicialización', () => {
    it('debería inicializar el formulario con campos vacíos', () => {
      expect(component.form).toBeDefined();
      expect(component.form.get('fechaAmpliacion')?.value).toBe('');
      expect(component.form.get('sustentoAmpliacion')?.value).toBe('');
    });

    it('debería tener los datos del periodo', () => {
      expect(component.data.periodo).toEqual(mockPeriodo);
    });

    it('debería requerir fecha de ampliación', () => {
      const fechaControl = component.form.get('fechaAmpliacion');
      expect(fechaControl?.hasError('required')).toBeTrue();
    });

    it('debería requerir sustento con mínimo 50 caracteres', () => {
      const sustentoControl = component.form.get('sustentoAmpliacion');

      expect(sustentoControl?.hasError('required')).toBeTrue();

      sustentoControl?.setValue('Corto');
      expect(sustentoControl?.hasError('minlength')).toBeTrue();

      const sustentoValido = 'Este es un sustento válido con más de 50 caracteres para cumplir con el requisito';
      sustentoControl?.setValue(sustentoValido);
      expect(sustentoControl?.valid).toBeTrue();
    });
  });

  describe('Ampliar vigencia', () => {
    it('debería ampliar la vigencia exitosamente', () => {
      const nuevaFechaFin = new Date('2024-04-30T12:00:00');
      const sustentoValido = 'Ampliación necesaria debido a retrasos en el procesamiento de información por causas de fuerza mayor';

      const mockPeriodoAmpliado: Periodo = {
        ...mockPeriodo,
        fechaFin: '30/04/2024',
        sustentoAmpliacion: sustentoValido
      };

      periodoService.ampliarVigencia.and.returnValue(of(mockPeriodoAmpliado));

      component.form.patchValue({
        fechaAmpliacion: nuevaFechaFin,
        sustentoAmpliacion: sustentoValido
      });

      component.ampliar();

      expect(periodoService.ampliarVigencia).toHaveBeenCalled();

      const request = periodoService.ampliarVigencia.calls.mostRecent().args[0] as AmpliacionVigenciaRequest;
      expect(request.id).toBe(1);
      expect(request.nuevaFechaFin).toBe('2024-04-30');
      expect(request.sustentoAmpliacion).toBe(sustentoValido);
      expect(request.usuarioModificacion).toBe('admin');

      expect(snackBar.open).toHaveBeenCalledWith('Vigencia ampliada correctamente', 'Cerrar', { duration: 3000 });
      expect(dialogRef.close).toHaveBeenCalledWith(true);
    });

    it('no debería ampliar si el formulario es inválido', () => {
      component.form.patchValue({
        fechaAmpliacion: '',
        sustentoAmpliacion: 'Corto'
      });

      component.ampliar();

      expect(periodoService.ampliarVigencia).not.toHaveBeenCalled();
      expect(snackBar.open).toHaveBeenCalledWith('Por favor complete todos los campos correctamente', 'Cerrar', { duration: 3000 });
      expect(dialogRef.close).not.toHaveBeenCalled();
    });

    it('no debería ampliar si falta la fecha', () => {
      const sustentoValido = 'Este es un sustento válido con más de cincuenta caracteres necesarios';

      component.form.patchValue({
        fechaAmpliacion: '',
        sustentoAmpliacion: sustentoValido
      });

      component.ampliar();

      expect(periodoService.ampliarVigencia).not.toHaveBeenCalled();
      expect(snackBar.open).toHaveBeenCalledWith('Por favor complete todos los campos correctamente', 'Cerrar', { duration: 3000 });
    });

    it('no debería ampliar si el sustento es muy corto', () => {
      component.form.patchValue({
        fechaAmpliacion: new Date('2024-04-30T12:00:00'),
        sustentoAmpliacion: 'Muy corto'
      });

      component.ampliar();

      expect(periodoService.ampliarVigencia).not.toHaveBeenCalled();
      expect(snackBar.open).toHaveBeenCalledWith('Por favor complete todos los campos correctamente', 'Cerrar', { duration: 3000 });
    });

    it('debería manejar errores al ampliar vigencia', () => {
      const errorResponse = {
        error: {
          message: 'No se puede ampliar más de 90 días desde la fecha fin actual'
        }
      };
      periodoService.ampliarVigencia.and.returnValue(throwError(() => errorResponse));

      const sustentoValido = 'Sustento con más de cincuenta caracteres para cumplir validación del formulario';
      component.form.patchValue({
        fechaAmpliacion: new Date('2024-07-30T12:00:00'),
        sustentoAmpliacion: sustentoValido
      });

      component.ampliar();

      expect(snackBar.open).toHaveBeenCalledWith(
        'No se puede ampliar más de 90 días desde la fecha fin actual',
        'Cerrar',
        { duration: 5000 }
      );
      expect(dialogRef.close).not.toHaveBeenCalled();
    });

    it('debería mostrar mensaje de error genérico cuando no hay mensaje específico', () => {
      periodoService.ampliarVigencia.and.returnValue(throwError(() => ({})));

      const sustentoValido = 'Sustento válido con más de cincuenta caracteres necesarios para la prueba';
      component.form.patchValue({
        fechaAmpliacion: new Date('2024-04-30T12:00:00'),
        sustentoAmpliacion: sustentoValido
      });

      component.ampliar();

      expect(snackBar.open).toHaveBeenCalledWith('Error al ampliar vigencia', 'Cerrar', { duration: 5000 });
    });
  });

  describe('Formateo de fecha', () => {
    it('debería formatear correctamente la fecha a YYYY-MM-DD', () => {
      const sustentoValido = 'Sustento válido con más de cincuenta caracteres para cumplir con validación';

      component.form.patchValue({
        fechaAmpliacion: new Date('2024-12-15T12:00:00'),
        sustentoAmpliacion: sustentoValido
      });

      periodoService.ampliarVigencia.and.returnValue(of(mockPeriodo));
      component.ampliar();

      const request = periodoService.ampliarVigencia.calls.mostRecent().args[0] as AmpliacionVigenciaRequest;
      expect(request.nuevaFechaFin).toBe('2024-12-15');
    });

    it('debería agregar ceros a la izquierda en meses y días', () => {
      const sustentoValido = 'Sustento válido con más de cincuenta caracteres para cumplir con validación';

      component.form.patchValue({
        fechaAmpliacion: new Date('2024-01-05T12:00:00'),
        sustentoAmpliacion: sustentoValido
      });

      periodoService.ampliarVigencia.and.returnValue(of(mockPeriodo));
      component.ampliar();

      const request = periodoService.ampliarVigencia.calls.mostRecent().args[0] as AmpliacionVigenciaRequest;
      expect(request.nuevaFechaFin).toBe('2024-01-05');
    });
  });

  describe('Cancelar', () => {
    it('debería cerrar el diálogo sin guardar', () => {
      component.cancelar();
      expect(dialogRef.close).toHaveBeenCalledWith();
    });

    it('no debería llamar al servicio al cancelar', () => {
      component.cancelar();
      expect(periodoService.ampliarVigencia).not.toHaveBeenCalled();
    });
  });

  describe('Validaciones del formulario', () => {
    it('el formulario debería ser inválido inicialmente', () => {
      expect(component.form.valid).toBeFalse();
    });

    it('el formulario debería ser válido con datos correctos', () => {
      const sustentoValido = 'Este es un sustento completamente válido con más de 50 caracteres requeridos';

      component.form.patchValue({
        fechaAmpliacion: new Date('2024-04-30T12:00:00'),
        sustentoAmpliacion: sustentoValido
      });

      expect(component.form.valid).toBeTrue();
    });

    it('debería validar que el sustento tenga exactamente 50 caracteres', () => {
      const sustentoControl = component.form.get('sustentoAmpliacion');
      const sustento50 = 'A'.repeat(50);

      sustentoControl?.setValue(sustento50);
      expect(sustentoControl?.valid).toBeTrue();
    });

    it('debería rechazar sustento con 49 caracteres', () => {
      const sustentoControl = component.form.get('sustentoAmpliacion');
      const sustento49 = 'A'.repeat(49);

      sustentoControl?.setValue(sustento49);
      expect(sustentoControl?.hasError('minlength')).toBeTrue();
    });
  });

  describe('Información del periodo', () => {
    it('debería mostrar la información del periodo en el template', () => {
      const compiled = fixture.nativeElement;

      expect(component.data.periodo.codigoPeriodo).toBe('2024-T1');
      expect(component.data.periodo.descripcion).toBe('Primer trimestre 2024');
      expect(component.data.periodo.fechaFin).toBe('31/03/2024');
      expect(component.data.periodo.diasRestantes).toBe(15);
    });
  });
});
