import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { VerSustentoDialogComponent, VerSustentoDialogData } from './ver-sustento-dialog.component';
import { SustentoAivService } from '../../../sustentoAiv/services/sustentoAiv.service';
import { SustentoAivResponse } from '../../../sustentoAiv/models/sustentoAiv.model';

describe('VerSustentoDialogComponent', () => {
  let component: VerSustentoDialogComponent;
  let fixture: ComponentFixture<VerSustentoDialogComponent>;
  let service: jasmine.SpyObj<SustentoAivService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<VerSustentoDialogComponent>>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  const mockData: VerSustentoDialogData = { idEvaluacionRegistro: 1, codigoUnicoAtencion: 'CU-0001', usuario: 'admin' };
  const mockSustentos: SustentoAivResponse[] = [
    { id: 1, idEvaluacionRegistro: 1, nombreArchivo: 'sustento1.pdf', tamanioBytes: 1024, origen: 'INDIVIDUAL', fechaCarga: '2025-01-01T10:00:00', usuarioCarga: 'admin' } as SustentoAivResponse
  ];

  beforeEach(async () => {
    const serviceSpy = jasmine.createSpyObj('SustentoAivService', ['listarPorRegistro', 'cargarIndividual', 'descargar', 'eliminar']);
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    serviceSpy.listarPorRegistro.and.returnValue(of(mockSustentos));

    await TestBed.configureTestingModule({
      imports: [VerSustentoDialogComponent],
      providers: [
        { provide: SustentoAivService, useValue: serviceSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: MAT_DIALOG_DATA, useValue: mockData }
      ]
    }).compileComponents();

    service = TestBed.inject(SustentoAivService) as jasmine.SpyObj<SustentoAivService>;
    dialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<VerSustentoDialogComponent>>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

    fixture = TestBed.createComponent(VerSustentoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería listar los sustentos del registro al iniciar', () => {
    expect(service.listarPorRegistro).toHaveBeenCalledWith(1);
    expect(component.sustentos()).toEqual(mockSustentos);
  });

  it('debería dejar la lista vacía si falla la carga', () => {
    service.listarPorRegistro.and.returnValue(throwError(() => ({ status: 500 })));
    component.listar();
    expect(component.sustentos()).toEqual([]);
  });

  it('onArchivoSeleccionado debería fijar el archivo elegido', () => {
    const archivo = new File(['contenido'], 'evidencia.pdf', { type: 'application/pdf' });
    const event = { target: { files: [archivo] } } as unknown as Event;
    component.onArchivoSeleccionado(event);
    expect(component.archivoSeleccionado).toBe(archivo);
  });

  it('onArchivoSeleccionado debería rechazar un archivo que excede el tamaño máximo', () => {
    const archivoGrande = new File(['contenido'], 'evidencia.pdf', { type: 'application/pdf' });
    Object.defineProperty(archivoGrande, 'size', { value: 50 * 1024 * 1024 + 1 });
    const event = { target: { files: [archivoGrande], value: 'C:\\fakepath\\evidencia.pdf' } } as unknown as Event;

    component.onArchivoSeleccionado(event);

    expect(component.archivoSeleccionado).toBeNull();
    expect(snackBar.open).toHaveBeenCalledWith(
      'El archivo excede el tamaño máximo permitido (50 MB)', 'Cerrar', jasmine.any(Object)
    );
  });

  it('cargar no debería hacer nada si no hay archivo seleccionado', () => {
    component.archivoSeleccionado = null;
    component.cargar();
    expect(service.cargarIndividual).not.toHaveBeenCalled();
  });

  it('cargar debería subir el archivo y refrescar la lista', (done) => {
    component.archivoSeleccionado = new File(['contenido'], 'evidencia.pdf', { type: 'application/pdf' });
    service.cargarIndividual.and.returnValue(of({} as SustentoAivResponse));

    component.cargar();

    setTimeout(() => {
      expect(service.cargarIndividual).toHaveBeenCalled();
      const req = service.cargarIndividual.calls.mostRecent().args[0];
      expect(req.idEvaluacionRegistro).toBe(1);
      expect(req.nombreArchivo).toBe('evidencia.pdf');
      expect(snackBar.open).toHaveBeenCalledWith('Sustento cargado', 'Cerrar', jasmine.any(Object));
      expect(component.archivoSeleccionado).toBeNull();
      done();
    }, 50);
  });

  it('cargar debería mostrar el error del backend si falla la carga', (done) => {
    component.archivoSeleccionado = new File(['contenido'], 'evidencia.pdf', { type: 'application/pdf' });
    service.cargarIndividual.and.returnValue(throwError(() => ({ error: { message: 'Archivo no permitido' } })));

    component.cargar();

    setTimeout(() => {
      expect(snackBar.open).toHaveBeenCalledWith('Archivo no permitido', 'Cerrar', jasmine.any(Object));
      done();
    }, 50);
  });

  it('eliminar debería refrescar la lista al eliminar correctamente', () => {
    service.eliminar.and.returnValue(of(void 0));
    component.eliminar(mockSustentos[0]);
    expect(service.eliminar).toHaveBeenCalledWith(1, 'admin');
    expect(service.listarPorRegistro).toHaveBeenCalledTimes(2);
  });

  it('eliminar debería mostrar el error del backend si falla', () => {
    service.eliminar.and.returnValue(throwError(() => ({ error: { message: 'No se pudo eliminar' } })));
    component.eliminar(mockSustentos[0]);
    expect(snackBar.open).toHaveBeenCalledWith('No se pudo eliminar', 'Cerrar', jasmine.any(Object));
  });

  it('cerrar debería cerrar el diálogo', () => {
    component.cerrar();
    expect(dialogRef.close).toHaveBeenCalled();
  });
});
