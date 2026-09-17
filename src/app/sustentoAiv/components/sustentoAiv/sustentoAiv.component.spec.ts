import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { SustentoAivComponent } from './sustentoAiv.component';
import { AuthService } from '../../../auth/services/auth.service';
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
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: AuthService, useValue: { currentUsername: 'fdiaz' } }
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

  it('usuario debería tomarse del usuario autenticado real, no un valor fijo', () => {
    expect(component.usuario).toBe('fdiaz');
  });

  it('onPaginaSustentos debería actualizar la página y el tamaño de página', () => {
    component.onPaginaSustentos({ pageIndex: 2, pageSize: 50, length: 120 });
    expect(component.paginaSustentos()).toBe(2);
    expect(component.tamanioPaginaSustentos()).toBe(50);
  });

  it('onFileIndividual debería dejar el archivo en null si no se seleccionó ninguno', () => {
    const event = { target: { files: null } } as unknown as Event;
    component.onFileIndividual(event);
    expect(component.archivoIndividual).toBeNull();
  });

  it('onFileZip debería dejar el archivo en null si no se seleccionó ninguno', () => {
    const event = { target: { files: null } } as unknown as Event;
    component.onFileZip(event);
    expect(component.archivoZip).toBeNull();
  });

  it('onFileMapeo debería dejar el archivo en null si no se seleccionó ninguno', () => {
    const event = { target: { files: null } } as unknown as Event;
    component.onFileMapeo(event);
    expect(component.archivoMapeo).toBeNull();
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

  it('cargarIndividual debería mostrar el mensaje genérico si el error no trae mensaje del backend', (done) => {
    component.idEvaluacionRegistro = 1;
    component.archivoIndividual = new File(['contenido'], 'evidencia.pdf', { type: 'application/pdf' });
    service.cargarIndividual.and.returnValue(throwError(() => ({})));

    component.cargarIndividual();

    setTimeout(() => {
      expect(snackBar.open).toHaveBeenCalledWith('Error al cargar', 'OK', jasmine.any(Object));
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

  it('cargarMasivo debería mostrar el mensaje genérico si el error no trae mensaje del backend', (done) => {
    component.idEvaluacionAiv = 1;
    component.archivoZip = new File(['contenido'], 'sustentos.zip', { type: 'application/zip' });
    service.cargarMasivo.and.returnValue(throwError(() => ({})));

    component.cargarMasivo();

    setTimeout(() => {
      expect(snackBar.open).toHaveBeenCalledWith('Error masivo', 'OK', jasmine.any(Object));
      done();
    }, 50);
  });

  it('cargarMasivo debería mostrar el detalle de rechazados cuando existan', (done) => {
    component.idEvaluacionAiv = 1;
    component.archivoZip = new File(['contenido'], 'sustentos.zip', { type: 'application/zip' });
    const resultado: SustentoMasivoResultado = { cargados: mockSustentos, rechazados: [{ nombreArchivo: 'x.pdf', motivo: 'no encontrado' } as any] };
    service.cargarMasivo.and.returnValue(of(resultado));

    component.cargarMasivo();

    setTimeout(() => {
      expect(snackBar.open).toHaveBeenCalledWith('Cargados 1, rechazados 1', 'OK', jasmine.any(Object));
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

  it('cargarMasivo debería avisar y no llamar al servicio si la plantilla CSV tiene filas inválidas', (done) => {
    component.idEvaluacionAiv = 1;
    component.archivoZip = new File(['contenido'], 'sustentos.zip', { type: 'application/zip' });
    component.archivoMapeo = new File(
      ['Nombre de archivo,Código único\nfactura1.pdf,'], 'plantilla.csv'
    );

    component.cargarMasivo();

    setTimeout(() => {
      expect(service.cargarMasivo).not.toHaveBeenCalled();
      expect(snackBar.open).toHaveBeenCalledWith(
        jasmine.stringMatching(/plantilla de mapeo tiene filas inválidas/), 'OK', jasmine.any(Object)
      );
      done();
    }, 50);
  });

  it('eliminar debería refrescar la lista al eliminar correctamente', () => {
    component.idEvaluacionRegistro = 1;
    service.eliminar.and.returnValue(of(void 0));
    service.listarPorRegistro.and.returnValue(of(mockSustentos));

    component.eliminar(mockSustentos[0]);

    expect(service.eliminar).toHaveBeenCalledWith(1, 'fdiaz');
    expect(service.listarPorRegistro).toHaveBeenCalled();
  });

  it('eliminar debería mostrar el error del backend si falla', () => {
    service.eliminar.and.returnValue(throwError(() => ({ error: { message: 'No se pudo eliminar' } })));
    component.eliminar(mockSustentos[0]);
    expect(snackBar.open).toHaveBeenCalledWith('No se pudo eliminar', 'OK', jasmine.any(Object));
  });

  it('eliminar debería mostrar el mensaje genérico si el error no trae mensaje del backend', () => {
    service.eliminar.and.returnValue(throwError(() => ({})));
    component.eliminar(mockSustentos[0]);
    expect(snackBar.open).toHaveBeenCalledWith('Error', 'OK', jasmine.any(Object));
  });

  it('descargar debería disparar la descarga del sustento con su nombre de archivo', () => {
    const enlace = jasmine.createSpyObj('a', ['click']);
    spyOn(document, 'createElement').and.returnValue(enlace);
    spyOn(URL, 'createObjectURL').and.returnValue('blob:mock');
    spyOn(URL, 'revokeObjectURL');
    service.descargar.and.returnValue(of(new Blob(['contenido'])));

    component.descargar(mockSustentos[0]);

    expect(service.descargar).toHaveBeenCalledWith(1);
    expect(enlace.download).toBe('sustento1.pdf');
    expect(enlace.click).toHaveBeenCalled();
  });

  it('descargarPlantillaCsvMapeo debería disparar la descarga de un CSV con el nombre esperado', () => {
    const enlace = jasmine.createSpyObj('a', ['click']);
    spyOn(document, 'createElement').and.returnValue(enlace);
    spyOn(URL, 'createObjectURL').and.returnValue('blob:mock');
    spyOn(URL, 'revokeObjectURL');

    component.descargarPlantillaCsvMapeo();

    expect(enlace.download).toBe('plantilla_mapeo_sustentos.csv');
    expect(enlace.click).toHaveBeenCalled();
  });

  it('descargarZipEjemplo debería disparar la descarga de un ZIP con el nombre esperado', () => {
    const enlace = jasmine.createSpyObj('a', ['click']);
    spyOn(document, 'createElement').and.returnValue(enlace);
    spyOn(URL, 'createObjectURL').and.returnValue('blob:mock');
    spyOn(URL, 'revokeObjectURL');

    component.descargarZipEjemplo();

    expect(enlace.download).toBe('ejemplo_carga_masiva_sustentos.zip');
    expect(enlace.click).toHaveBeenCalled();
  });
});
