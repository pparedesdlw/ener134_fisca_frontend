import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { SustentoAivComponent } from './sustentoAiv.component';
import { SustentoAivService } from '../../services/sustentoAiv.service';
import { SustentoAivResponse, SustentoMasivoResultado } from '../../models/sustentoAiv.model';

describe('SustentoAivComponent', () => {
  let component: SustentoAivComponent;
  let fixture: ComponentFixture<SustentoAivComponent>;
  let service: jasmine.SpyObj<SustentoAivService>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  const mockSustentos: SustentoAivResponse[] = [
    { id: 1, idEvaluacionRegistro: 1, codigoUnicoAtencion: 'CU-0001', nombreArchivo: 'sustento1.pdf', tipoMime: 'application/pdf', tamanioBytes: 1024, hashSha256: 'abc', origen: 'INDIVIDUAL', fechaCarga: '2025-01-01T10:00:00', usuarioCarga: 'admin' }
  ];

  beforeEach(async () => {
    const serviceSpy = jasmine.createSpyObj('SustentoAivService', ['listarPorRegistro', 'cargarIndividual', 'cargarMasivo', 'descargar', 'eliminar']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [SustentoAivComponent, NoopAnimationsModule],
      providers: [
        { provide: SustentoAivService, useValue: serviceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    }).compileComponents();

    service = TestBed.inject(SustentoAivService) as jasmine.SpyObj<SustentoAivService>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

    fixture = TestBed.createComponent(SustentoAivComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('onFileIndividual debería fijar el archivo elegido', () => {
    const archivo = new File(['contenido'], 'evidencia.pdf', { type: 'application/pdf' });
    const event = { target: { files: [archivo] } } as unknown as Event;
    component.onFileIndividual(event);
    expect(component.archivoIndividual).toBe(archivo);
  });

  it('onFileIndividual debería rechazar un archivo que excede el tamaño máximo', () => {
    const archivoGrande = new File(['contenido'], 'evidencia.pdf', { type: 'application/pdf' });
    Object.defineProperty(archivoGrande, 'size', { value: 50 * 1024 * 1024 + 1 });
    const event = { target: { files: [archivoGrande], value: 'x' } } as unknown as Event;

    component.onFileIndividual(event);

    expect(component.archivoIndividual).toBeNull();
    expect(snackBar.open).toHaveBeenCalledWith(
      'El archivo excede el tamaño máximo permitido (50 MB)', 'OK', jasmine.any(Object)
    );
  });

  it('onFileZip debería rechazar un archivo que excede el tamaño máximo', () => {
    const zipGrande = new File(['contenido'], 'sustentos.zip', { type: 'application/zip' });
    Object.defineProperty(zipGrande, 'size', { value: 50 * 1024 * 1024 + 1 });
    const event = { target: { files: [zipGrande], value: 'x' } } as unknown as Event;

    component.onFileZip(event);

    expect(component.archivoZip).toBeNull();
    expect(snackBar.open).toHaveBeenCalledWith(
      'El archivo excede el tamaño máximo permitido (50 MB)', 'OK', jasmine.any(Object)
    );
  });

  it('onFileZip debería fijar el archivo elegido', () => {
    const archivo = new File(['contenido'], 'sustentos.zip', { type: 'application/zip' });
    const event = { target: { files: [archivo] } } as unknown as Event;
    component.onFileZip(event);
    expect(component.archivoZip).toBe(archivo);
  });

  it('listar no debería hacer nada si no hay idEvaluacionRegistro', () => {
    component.idEvaluacionRegistro = null;
    component.listar();
    expect(service.listarPorRegistro).not.toHaveBeenCalled();
  });

  it('listar debería asignar la lista de sustentos', () => {
    component.idEvaluacionRegistro = 1;
    service.listarPorRegistro.and.returnValue(of(mockSustentos));
    component.listar();
    expect(service.listarPorRegistro).toHaveBeenCalledWith(1);
    expect(component.sustentos()).toEqual(mockSustentos);
  });

  it('listar debería vaciar la lista si falla la consulta', () => {
    component.idEvaluacionRegistro = 1;
    service.listarPorRegistro.and.returnValue(throwError(() => ({ status: 500 })));
    component.listar();
    expect(component.sustentos()).toEqual([]);
  });

  it('cargarIndividual no debería hacer nada sin archivo o sin idEvaluacionRegistro', () => {
    component.archivoIndividual = null;
    component.idEvaluacionRegistro = 1;
    component.cargarIndividual();
    expect(service.cargarIndividual).not.toHaveBeenCalled();
  });

  it('cargarIndividual debería subir el archivo y refrescar la lista', (done) => {
    component.idEvaluacionRegistro = 1;
    component.codigoUnicoAtencion = 'CU-0001';
    component.archivoIndividual = new File(['contenido'], 'evidencia.pdf', { type: 'application/pdf' });
    service.cargarIndividual.and.returnValue(of({} as SustentoAivResponse));
    service.listarPorRegistro.and.returnValue(of(mockSustentos));

    component.cargarIndividual();

    setTimeout(() => {
      expect(service.cargarIndividual).toHaveBeenCalled();
      expect(snackBar.open).toHaveBeenCalledWith('Sustento cargado', 'OK', jasmine.any(Object));
      expect(service.listarPorRegistro).toHaveBeenCalled();
      done();
    }, 50);
  });

  it('cargarIndividual debería mostrar el error del backend si falla', (done) => {
    component.idEvaluacionRegistro = 1;
    component.archivoIndividual = new File(['contenido'], 'evidencia.pdf', { type: 'application/pdf' });
    service.cargarIndividual.and.returnValue(throwError(() => ({ error: { message: 'Archivo no permitido' } })));

    component.cargarIndividual();

    setTimeout(() => {
      expect(snackBar.open).toHaveBeenCalledWith('Archivo no permitido', 'OK', jasmine.any(Object));
      done();
    }, 50);
  });

  it('cargarMasivo no debería hacer nada sin archivo o sin idEvaluacionAiv', () => {
    component.archivoZip = null;
    component.idEvaluacionAiv = 1;
    component.cargarMasivo();
    expect(service.cargarMasivo).not.toHaveBeenCalled();
  });

  it('cargarMasivo debería subir el zip y mostrar el resultado', (done) => {
    component.idEvaluacionAiv = 1;
    component.archivoZip = new File(['contenido'], 'sustentos.zip', { type: 'application/zip' });
    const resultado: SustentoMasivoResultado = { cargados: mockSustentos, rechazados: [] };
    service.cargarMasivo.and.returnValue(of(resultado));

    component.cargarMasivo();

    setTimeout(() => {
      expect(service.cargarMasivo).toHaveBeenCalled();
      expect(snackBar.open).toHaveBeenCalledWith('Cargados 1 sustentos', 'OK', jasmine.any(Object));
      done();
    }, 50);
  });

  it('cargarMasivo debería mostrar el error del backend si falla', (done) => {
    component.idEvaluacionAiv = 1;
    component.archivoZip = new File(['contenido'], 'sustentos.zip', { type: 'application/zip' });
    service.cargarMasivo.and.returnValue(throwError(() => ({ error: { message: 'ZIP inválido' } })));

    component.cargarMasivo();

    setTimeout(() => {
      expect(snackBar.open).toHaveBeenCalledWith('ZIP inválido', 'OK', jasmine.any(Object));
      done();
    }, 50);
  });

  it('onFileMapeo debería fijar el archivo de plantilla elegido', () => {
    const archivo = new File(['Nombre de archivo,Código único'], 'plantilla.csv');
    const event = { target: { files: [archivo] } } as unknown as Event;
    component.onFileMapeo(event);
    expect(component.archivoMapeo).toBe(archivo);
  });

  it('cargarMasivo debería incluir el mapeo parseado de la plantilla CSV', (done) => {
    component.idEvaluacionAiv = 1;
    component.archivoZip = new File(['contenido'], 'sustentos.zip', { type: 'application/zip' });
    component.archivoMapeo = new File(
      ['Nombre de archivo,Código único\nfactura1.pdf,21-260010024801'], 'plantilla.csv'
    );
    const resultado: SustentoMasivoResultado = { cargados: mockSustentos, rechazados: [] };
    service.cargarMasivo.and.returnValue(of(resultado));

    component.cargarMasivo();

    setTimeout(() => {
      expect(service.cargarMasivo).toHaveBeenCalledWith(jasmine.objectContaining({
        mapeo: [{ nombreArchivo: 'factura1.pdf', codigoUnicoAtencion: '21-260010024801' }]
      }));
      expect(component.archivoMapeo).toBeNull();
      done();
    }, 50);
  });

  it('cargarMasivo debería avisar y no llamar al servicio si la plantilla CSV tiene encabezados inválidos', (done) => {
    component.idEvaluacionAiv = 1;
    component.archivoZip = new File(['contenido'], 'sustentos.zip', { type: 'application/zip' });
    component.archivoMapeo = new File(['Columna A,Columna B\nvalor1,valor2'], 'plantilla.csv');

    component.cargarMasivo();

    setTimeout(() => {
      expect(service.cargarMasivo).not.toHaveBeenCalled();
      expect(snackBar.open).toHaveBeenCalledWith(
        'La plantilla debe tener las columnas "Nombre de archivo" y "Código único"', 'OK', jasmine.any(Object)
      );
      done();
    }, 50);
  });

  it('eliminar debería refrescar la lista al eliminar correctamente', () => {
    component.idEvaluacionRegistro = 1;
    service.eliminar.and.returnValue(of(void 0));
    service.listarPorRegistro.and.returnValue(of(mockSustentos));

    component.eliminar(mockSustentos[0]);

    expect(service.eliminar).toHaveBeenCalledWith(1, 'admin');
    expect(service.listarPorRegistro).toHaveBeenCalled();
  });

  it('eliminar debería mostrar el error del backend si falla', () => {
    service.eliminar.and.returnValue(throwError(() => ({ error: { message: 'No se pudo eliminar' } })));
    component.eliminar(mockSustentos[0]);
    expect(snackBar.open).toHaveBeenCalledWith('No se pudo eliminar', 'OK', jasmine.any(Object));
  });
});
