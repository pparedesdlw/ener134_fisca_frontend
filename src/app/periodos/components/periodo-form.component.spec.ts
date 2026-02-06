import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { PeriodoFormComponent } from './periodo-form.component';
import { PeriodoService } from '../services/periodo.service';
import { Periodo, PeriodoCreateRequest, PeriodoUpdateRequest } from '../models/periodo.model';

describe('PeriodoFormComponent', () => {
  let component: PeriodoFormComponent;
  let fixture: ComponentFixture<PeriodoFormComponent>;
  let periodoService: jasmine.SpyObj<PeriodoService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<PeriodoFormComponent>>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  const mockPeriodo: Periodo = {
    id: 1,
    codigoPeriodo: '2024-T1',
    descripcion: 'Primer trimestre 2024',
    fechaInicio: '01/01/2024',
    fechaFin: '31/03/2024',
    estadoActivo: true
  };

  beforeEach(async () => {
    const periodoServiceSpy = jasmine.createSpyObj('PeriodoService', ['crear', 'editar']);
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        PeriodoFormComponent,
        ReactiveFormsModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: PeriodoService, useValue: periodoServiceSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: MAT_DIALOG_DATA, useValue: { mode: 'create' } }
      ]
    }).compileComponents();

    periodoService = TestBed.inject(PeriodoService) as jasmine.SpyObj<PeriodoService>;
    dialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<PeriodoFormComponent>>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

    fixture = TestBed.createComponent(PeriodoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('Modo creación', () => {
    it('debería inicializar el formulario vacío en modo creación', () => {
      expect(component.isEditMode).toBeFalse();
      expect(component.form.get('codigoPeriodo')?.value).toBe('');
      expect(component.form.get('descripcion')?.value).toBe('');
    });

    it('debería validar el formato del código de periodo', () => {
      const codigoControl = component.form.get('codigoPeriodo');
      
      codigoControl?.setValue('2024-T1');
      expect(codigoControl?.valid).toBeTrue();

      codigoControl?.setValue('2024-T5');
      expect(codigoControl?.valid).toBeFalse();

      codigoControl?.setValue('2024T1');
      expect(codigoControl?.valid).toBeFalse();

      codigoControl?.setValue('24-T1');
      expect(codigoControl?.valid).toBeFalse();
    });

    it('debería validar que la descripción tenga al menos 10 caracteres', () => {
      const descripcionControl = component.form.get('descripcion');
      
      descripcionControl?.setValue('Corto');
      expect(descripcionControl?.hasError('minlength')).toBeTrue();

      descripcionControl?.setValue('Descripción válida con más de 10 caracteres');
      expect(descripcionControl?.valid).toBeTrue();
    });

    it('debería validar que fechaFin sea posterior a fechaInicio', () => {
      const fechaInicio = new Date('2024-01-01');
      const fechaFin = new Date('2023-12-31');

      component.form.patchValue({
        fechaInicio: fechaInicio,
        fechaFin: fechaFin
      });

      expect(component.form.hasError('fechasInvalidas')).toBeTrue();
    });

    it('debería crear un periodo exitosamente', () => {
      const mockResponse: Periodo = { ...mockPeriodo };
      periodoService.crear.and.returnValue(of(mockResponse));

      component.form.patchValue({
        codigoPeriodo: '2024-T1',
        descripcion: 'Primer trimestre 2024',
        fechaInicio: new Date('2024-01-01'),
        fechaFin: new Date('2024-03-31'),
        estadoActivo: true
      });

      component.guardar();

      expect(periodoService.crear).toHaveBeenCalled();
      const request = periodoService.crear.calls.mostRecent().args[0] as PeriodoCreateRequest;
      expect(request.codigoPeriodo).toBe('2024-T1');
      expect(request.fechaInicio).toMatch(/2024-01-01/);
      expect(snackBar.open).toHaveBeenCalledWith('Periodo creado correctamente', 'Cerrar', { duration: 3000 });
      expect(dialogRef.close).toHaveBeenCalledWith(true);
    });

    it('debería manejar errores al crear un periodo', () => {
      const errorResponse = { error: { message: 'Código de periodo ya existe' } };
      periodoService.crear.and.returnValue(throwError(() => errorResponse));

      component.form.patchValue({
        codigoPeriodo: '2024-T1',
        descripcion: 'Primer trimestre 2024',
        fechaInicio: new Date('2024-01-01'),
        fechaFin: new Date('2024-03-31'),
        estadoActivo: true
      });

      component.guardar();

      expect(snackBar.open).toHaveBeenCalledWith('Código de periodo ya existe', 'Cerrar', { duration: 5000 });
      expect(dialogRef.close).not.toHaveBeenCalled();
    });

    it('no debería crear periodo si el formulario es inválido', () => {
      component.form.patchValue({
        codigoPeriodo: '',
        descripcion: 'Corto',
        fechaInicio: null,
        fechaFin: null
      });

      component.guardar();

      expect(periodoService.crear).not.toHaveBeenCalled();
      expect(snackBar.open).toHaveBeenCalledWith('Por favor complete todos los campos', 'Cerrar', { duration: 3000 });
    });
  });

  describe('Modo edición', () => {
    beforeEach(() => {
      TestBed.resetTestingModule();
      
      const periodoServiceSpy = jasmine.createSpyObj('PeriodoService', ['crear', 'editar']);
      const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
      const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

      TestBed.configureTestingModule({
        imports: [
          PeriodoFormComponent,
          ReactiveFormsModule,
          BrowserAnimationsModule
        ],
        providers: [
          { provide: PeriodoService, useValue: periodoServiceSpy },
          { provide: MatDialogRef, useValue: dialogRefSpy },
          { provide: MatSnackBar, useValue: snackBarSpy },
          { provide: MAT_DIALOG_DATA, useValue: { mode: 'edit', periodo: mockPeriodo } }
        ]
      });

      periodoService = TestBed.inject(PeriodoService) as jasmine.SpyObj<PeriodoService>;
      dialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<PeriodoFormComponent>>;
      snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

      fixture = TestBed.createComponent(PeriodoFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('debería inicializar el formulario con datos del periodo en modo edición', () => {
      expect(component.isEditMode).toBeTrue();
      expect(component.form.get('codigoPeriodo')?.value).toBe('2024-T1');
      expect(component.form.get('descripcion')?.value).toBe('Primer trimestre 2024');
      expect(component.form.get('estadoActivo')?.value).toBe(true);
    });

    it('debería parsear correctamente las fechas en formato DD/MM/YYYY', () => {
      const fechaInicio = component.form.get('fechaInicio')?.value;
      const fechaFin = component.form.get('fechaFin')?.value;

      expect(fechaInicio).toBeInstanceOf(Date);
      expect(fechaFin).toBeInstanceOf(Date);
      expect(fechaInicio.getFullYear()).toBe(2024);
      expect(fechaInicio.getMonth()).toBe(0); // Enero
      expect(fechaInicio.getDate()).toBe(1);
    });

    it('debería actualizar un periodo exitosamente', () => {
      const mockResponse: Periodo = { 
        ...mockPeriodo, 
        descripcion: 'Descripción actualizada' 
      };
      periodoService.editar.and.returnValue(of(mockResponse));

      component.form.patchValue({
        descripcion: 'Descripción actualizada'
      });

      component.guardar();

      expect(periodoService.editar).toHaveBeenCalled();
      const request = periodoService.editar.calls.mostRecent().args[0] as PeriodoUpdateRequest;
      expect(request.id).toBe(1);
      expect(request.descripcion).toBe('Descripción actualizada');
      expect(snackBar.open).toHaveBeenCalledWith('Periodo actualizado correctamente', 'Cerrar', { duration: 3000 });
      expect(dialogRef.close).toHaveBeenCalledWith(true);
    });

    it('debería manejar errores al actualizar un periodo', () => {
      const errorResponse = { error: { message: 'Error de validación' } };
      periodoService.editar.and.returnValue(throwError(() => errorResponse));

      component.guardar();

      expect(snackBar.open).toHaveBeenCalledWith('Error de validación', 'Cerrar', { duration: 5000 });
      expect(dialogRef.close).not.toHaveBeenCalled();
    });
  });

  describe('Funcionalidades comunes', () => {
    it('debería cerrar el diálogo al cancelar', () => {
      component.cancelar();
      expect(dialogRef.close).toHaveBeenCalled();
    });

    it('debería formatear correctamente las fechas a YYYY-MM-DD', () => {
      component.form.patchValue({
        codigoPeriodo: '2024-T1',
        descripcion: 'Descripción de prueba',
        fechaInicio: new Date('2024-01-15T12:00:00'),
        fechaFin: new Date('2024-03-20T12:00:00'),
        estadoActivo: true
      });

      periodoService.crear.and.returnValue(of(mockPeriodo));
      component.guardar();

      const request = periodoService.crear.calls.mostRecent().args[0] as PeriodoCreateRequest;
      expect(request.fechaInicio).toBe('2024-01-15');
      expect(request.fechaFin).toBe('2024-03-20');
    });

    it('debería retornar true en codigoInvalido cuando el código es inválido y tocado', () => {
      const codigoControl = component.form.get('codigoPeriodo');
      codigoControl?.setValue('invalido');
      codigoControl?.markAsTouched();

      expect(component.codigoInvalido).toBeTrue();
    });

    it('debería retornar true en fechasInvalidas cuando las fechas son inválidas', () => {
      component.form.patchValue({
        fechaInicio: new Date('2024-03-31'),
        fechaFin: new Date('2024-01-01')
      });
      component.form.markAsTouched();

      expect(component.fechasInvalidas).toBeTrue();
    });

    it('debería validar campos requeridos', () => {
      expect(component.form.get('codigoPeriodo')?.hasError('required')).toBeTrue();
      expect(component.form.get('descripcion')?.hasError('required')).toBeTrue();
      expect(component.form.get('fechaInicio')?.hasError('required')).toBeTrue();
      expect(component.form.get('fechaFin')?.hasError('required')).toBeTrue();
    });

    it('debería establecer estadoActivo a true por defecto', () => {
      expect(component.form.get('estadoActivo')?.value).toBeTrue();
    });
  });
});
