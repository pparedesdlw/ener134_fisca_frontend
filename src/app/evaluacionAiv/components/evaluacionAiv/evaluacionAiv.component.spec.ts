import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { EvaluacionAivComponent } from './evaluacionAiv.component';
import { EvaluacionAivService } from '../../services/evaluacionAiv.service';
import { MuestraAivService } from '../../../muestraAiv/services/muestraAiv.service';
import { MuestraAivResponse } from '../../../muestraAiv/models/muestraAiv.model';
import { SustentoAivService } from '../../../sustentoAiv/services/sustentoAiv.service';
import { EvaluacionAivResponse, EvaluacionRegistroResponse } from '../../models/evaluacionAiv.model';

describe('EvaluacionAivComponent', () => {
  let component: EvaluacionAivComponent;
  let fixture: ComponentFixture<EvaluacionAivComponent>;
  let service: jasmine.SpyObj<EvaluacionAivService>;
  let muestraService: jasmine.SpyObj<MuestraAivService>;
  let sustentoService: jasmine.SpyObj<SustentoAivService>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let queryParams: Record<string, string>;

  const registroPrincipal: EvaluacionRegistroResponse = {
    id: 1, idMuestraDetalle: 1, codigoUnico: 'CU-0001', codigoEmpresa: '10', codigoAtencion: 'AT-1',
    codigoUbigeo: '150101', codigoAsunto: '174', descripcionAsunto: 'Consumo excesivo',
    grupoAsunto: 'Reclamos', usuario: 'jperez', adicional: false,
    reemplazado: false, estadoRegistro: 'EVALUADO', cumple: 'S', itemsCumplidos: 3, itemsTotal: 3,
    fechaEvaluacion: '2025-01-01', observacion: null, items: []
  };
  const registroAdicional: EvaluacionRegistroResponse = { ...registroPrincipal, id: 2, adicional: true };

  const mockEvaluacion: EvaluacionAivResponse = {
    id: 1, codigoPeriodo: 'PER-2025-01', codigoEmpresa: 10, idMuestraAiv: 1,
    fechaInicio: '2025-01-01', fechaFin: '2025-03-31', estadoEvaluacion: 'EN_PROCESO',
    totalAtenciones: 100, muestraDefinitiva: 10, numeroRegistrosNoConformes: 2, indicadorAiv: 2.0,
    fechaConsolidado: null, toleranciaAplicable: 5, superaTolerancia: false,
    itemsResumen: [], registros: [registroPrincipal, registroAdicional]
  };

  function configurar(): void {
    const serviceSpy = jasmine.createSpyObj('EvaluacionAivService', [
      'obtenerVigente', 'iniciar', 'obtenerPorId', 'consolidar', 'reemplazarRegistro', 'exportar'
    ]);
    const muestraServiceSpy = jasmine.createSpyObj('MuestraAivService', ['generar']);
    const sustentoServiceSpy = jasmine.createSpyObj('SustentoAivService', ['cargarMasivo']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    TestBed.configureTestingModule({
      imports: [EvaluacionAivComponent, NoopAnimationsModule],
      providers: [
        { provide: EvaluacionAivService, useValue: serviceSpy },
        { provide: MuestraAivService, useValue: muestraServiceSpy },
        { provide: SustentoAivService, useValue: sustentoServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap(queryParams) } }
        }
      ]
    });

    service = TestBed.inject(EvaluacionAivService) as jasmine.SpyObj<EvaluacionAivService>;
    muestraService = TestBed.inject(MuestraAivService) as jasmine.SpyObj<MuestraAivService>;
    sustentoService = TestBed.inject(SustentoAivService) as jasmine.SpyObj<SustentoAivService>;
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

    fixture = TestBed.createComponent(EvaluacionAivComponent);
    component = fixture.componentInstance;
  }

  describe('ngOnInit sin parámetros', () => {
    beforeEach(() => {
      queryParams = {};
      configurar();
      fixture.detectChanges();
    });

    it('no debería consultar el servicio si faltan periodo o empresa', () => {
      expect(service.obtenerVigente).not.toHaveBeenCalled();
      expect(component.evaluacion()).toBeNull();
    });
  });

  describe('ngOnInit con evaluación vigente', () => {
    beforeEach(() => {
      queryParams = { periodo: 'PER-2025-01', empresa: '10' };
      configurar();
      service.obtenerVigente.and.returnValue(of(mockEvaluacion));
      fixture.detectChanges();
    });

    it('debería cargar la evaluación vigente', () => {
      expect(service.obtenerVigente).toHaveBeenCalledWith('PER-2025-01', 10);
      expect(component.evaluacion()).toEqual(mockEvaluacion);
      expect(component.cargando()).toBe(false);
    });
  });

  describe('ngOnInit sin evaluación vigente pero con idMuestraAiv', () => {
    beforeEach(() => {
      queryParams = { periodo: 'PER-2025-01', empresa: '10', idMuestraAiv: '5' };
      configurar();
      service.obtenerVigente.and.returnValue(throwError(() => ({ status: 404 })));
    });

    it('debería iniciar una nueva evaluación', () => {
      service.iniciar.and.returnValue(of(mockEvaluacion));
      fixture.detectChanges();

      expect(service.iniciar).toHaveBeenCalledWith({
        codigoPeriodo: 'PER-2025-01', codigoEmpresa: 10, idMuestraAiv: 5, usuario: 'admin'
      });
      expect(component.evaluacion()).toEqual(mockEvaluacion);
      expect(snackBar.open).toHaveBeenCalledWith('Evaluación iniciada', 'Cerrar', jasmine.any(Object));
    });

    it('debería mostrar error si falla al iniciar', () => {
      service.iniciar.and.returnValue(throwError(() => ({ error: { message: 'Muestra no disponible' } })));
      fixture.detectChanges();

      expect(snackBar.open).toHaveBeenCalledWith('Muestra no disponible', 'Cerrar', jasmine.any(Object));
      expect(component.cargando()).toBe(false);
    });
  });

  describe('ngOnInit con tipo=TOTAL (RF01 "Obtener total")', () => {
    const mockMuestraTotal: MuestraAivResponse = {
      id: 7, codigoPeriodo: 'PER-2025-01', codigoEmpresa: 10, poblacion: 100,
      tamanioBase: 100, porcentajeAdicional: 0, tamanioFinal: 100, estadoMuestra: 'GENERADA',
      seedAleatorio: 1, fechaGeneracion: '2025-01-01', detalle: [], distribucion: []
    };

    it('debería generar la muestra sobre el universo completo y luego iniciar la evaluación', () => {
      queryParams = {
        periodo: 'PER-2025-01', empresa: '10', asunto: '174',
        fechaInicio: '2025-01-01', fechaFin: '2025-01-31', tipo: 'TOTAL'
      };
      configurar();
      muestraService.generar.and.returnValue(of(mockMuestraTotal));
      service.obtenerVigente.and.returnValue(throwError(() => ({ status: 404 })));
      service.iniciar.and.returnValue(of(mockEvaluacion));

      fixture.detectChanges();

      expect(muestraService.generar).toHaveBeenCalledWith({
        codigoPeriodo: 'PER-2025-01', fechaInicio: '2025-01-01', fechaFin: '2025-01-31',
        codigoEmpresa: '10', codigosAsunto: ['174'], margenError: 0, porcentajeAdicional: 0, usuario: 'admin'
      });
      expect(service.obtenerVigente).toHaveBeenCalledWith('PER-2025-01', 10);
      expect(service.iniciar).toHaveBeenCalledWith({
        codigoPeriodo: 'PER-2025-01', codigoEmpresa: 10, idMuestraAiv: 7, usuario: 'admin'
      });
      expect(component.evaluacion()).toEqual(mockEvaluacion);
    });

    it('debería avisar y no llamar a generar si faltan las fechas', () => {
      queryParams = { periodo: 'PER-2025-01', empresa: '10', tipo: 'TOTAL' };
      configurar();

      fixture.detectChanges();

      expect(muestraService.generar).not.toHaveBeenCalled();
      expect(snackBar.open).toHaveBeenCalledWith(
        'No se pudo determinar el rango de fechas para evaluar por total', 'Cerrar', jasmine.any(Object)
      );
    });

    it('debería mostrar error si falla la generación de la muestra', () => {
      queryParams = {
        periodo: 'PER-2025-01', empresa: '10', fechaInicio: '2025-01-01', fechaFin: '2025-01-31', tipo: 'TOTAL'
      };
      configurar();
      muestraService.generar.and.returnValue(throwError(() => ({ error: { message: 'Sin registros' } })));

      fixture.detectChanges();

      expect(snackBar.open).toHaveBeenCalledWith('Sin registros', 'Cerrar', jasmine.any(Object));
      expect(component.cargando()).toBe(false);
    });
  });

  describe('con evaluación cargada', () => {
    beforeEach(() => {
      queryParams = { periodo: 'PER-2025-01', empresa: '10' };
      configurar();
      service.obtenerVigente.and.returnValue(of(mockEvaluacion));
      fixture.detectChanges();
    });

    it('registrosFiltrados debería separar principal/adicional/reemplazados', () => {
      const filtrados = component.registrosFiltrados();
      expect(filtrados.principal.length).toBe(1);
      expect(filtrados.adicional.length).toBe(1);
      expect(filtrados.reemplazados.length).toBe(0);
    });

    it('registrosFiltrados debería filtrar por texto de búsqueda', () => {
      component.textoBusqueda.set('noexiste');
      const filtrados = component.registrosFiltrados();
      expect(filtrados.principal.length).toBe(0);
    });

    it('RF03/RF10: la grilla principal debería mostrar el grupo de asunto y el usuario reales', () => {
      const texto = fixture.nativeElement.textContent as string;
      expect(texto).toContain('Reclamos');
      expect(texto).toContain('jperez');
    });

    it('consolidar debería actualizar la evaluación y abrir el diálogo de resultado', () => {
      const consolidada = { ...mockEvaluacion, estadoEvaluacion: 'CONSOLIDADO_TOTAL' as const };
      service.consolidar.and.returnValue(of(consolidada));

      component.consolidar();

      expect(service.consolidar).toHaveBeenCalledWith({ idEvaluacionAiv: 1, usuario: 'admin' });
      expect(component.evaluacion()).toEqual(consolidada);
      expect(dialog.open).toHaveBeenCalled();
    });

    it('consolidar debería mostrar error si falla', () => {
      service.consolidar.and.returnValue(throwError(() => ({ error: { message: 'Ítems pendientes' } })));
      component.consolidar();
      expect(snackBar.open).toHaveBeenCalledWith('Ítems pendientes', 'Cerrar', jasmine.any(Object));
    });

    it('evaluar debería abrir el diálogo de evaluación y actualizar si retorna datos', () => {
      const actualizada = { ...mockEvaluacion, numeroRegistrosNoConformes: 3 };
      dialog.open.and.returnValue({ afterClosed: () => of(actualizada) } as any);

      component.evaluar(registroPrincipal);

      expect(dialog.open).toHaveBeenCalled();
      expect(component.evaluacion()).toEqual(actualizada);
    });

    it('verDetalle no debería abrir el diálogo si falta codigoAtencion', () => {
      component.verDetalle({ ...registroPrincipal, codigoAtencion: null });
      expect(dialog.open).not.toHaveBeenCalled();
    });

    it('verDetalle debería abrir el diálogo con los datos del registro', () => {
      component.verDetalle(registroPrincipal);
      expect(dialog.open).toHaveBeenCalled();
    });

    it('verSustento debería abrir el diálogo de sustento', () => {
      component.verSustento(registroPrincipal);
      expect(dialog.open).toHaveBeenCalled();
    });

    it('seleccionarParaReemplazar debería fijar el registro y cambiar de pestaña', () => {
      component.seleccionarParaReemplazar(registroPrincipal);
      expect(component.registroAReemplazar()).toEqual(registroPrincipal);
      expect(component.tabSeleccionado).toBe(1);
    });

    it('cancelarSeleccionReemplazo debería limpiar la selección', () => {
      component.registroAReemplazar.set(registroPrincipal);
      component.cancelarSeleccionReemplazo();
      expect(component.registroAReemplazar()).toBeNull();
    });

    it('confirmarReemplazoCon debería avisar si no hay registro principal seleccionado', () => {
      component.confirmarReemplazoCon(registroAdicional);
      expect(snackBar.open).toHaveBeenCalledWith(jasmine.stringMatching(/seleccione el registro/), 'Cerrar', jasmine.any(Object));
      expect(service.reemplazarRegistro).not.toHaveBeenCalled();
    });

    it('confirmarReemplazoCon debería reemplazar el registro cuando hay uno seleccionado', () => {
      component.registroAReemplazar.set(registroPrincipal);
      service.reemplazarRegistro.and.returnValue(of(mockEvaluacion));

      component.confirmarReemplazoCon(registroAdicional);

      expect(service.reemplazarRegistro).toHaveBeenCalledWith({
        idEvaluacionRegistroPrincipal: 1, idEvaluacionRegistroAdicional: 2, usuario: 'admin'
      });
      expect(component.registroAReemplazar()).toBeNull();
      expect(component.tabSeleccionado).toBe(0);
    });

    it('onArchivoZip debería fijar el archivo seleccionado', () => {
      const archivo = new File(['data'], 'sustentos.zip');
      const event = { target: { files: [archivo] } } as unknown as Event;
      component.onArchivoZip(event);
      expect(component.archivoZip).toBe(archivo);
    });

    it('onArchivoZip debería rechazar un archivo que excede el tamaño máximo', () => {
      const zipGrande = new File(['data'], 'sustentos.zip');
      Object.defineProperty(zipGrande, 'size', { value: 50 * 1024 * 1024 + 1 });
      const event = { target: { files: [zipGrande], value: 'x' } } as unknown as Event;

      component.onArchivoZip(event);

      expect(component.archivoZip).toBeNull();
      expect(snackBar.open).toHaveBeenCalledWith(
        'El archivo excede el tamaño máximo permitido (50 MB)', 'Cerrar', jasmine.any(Object)
      );
    });

    it('cargarSustentoMasivo no debería hacer nada sin archivo', () => {
      component.archivoZip = null;
      component.cargarSustentoMasivo();
      expect(sustentoService.cargarMasivo).not.toHaveBeenCalled();
    });

    it('cargarSustentoMasivo debería cargar el zip y mostrar el resultado', (done) => {
      component.archivoZip = new File(['contenido'], 'sustentos.zip', { type: 'application/zip' });
      sustentoService.cargarMasivo.and.returnValue(of({ cargados: [{} as any], rechazados: [] }));

      component.cargarSustentoMasivo();

      setTimeout(() => {
        expect(sustentoService.cargarMasivo).toHaveBeenCalled();
        expect(snackBar.open).toHaveBeenCalledWith('Cargados 1 sustentos', 'Cerrar', jasmine.any(Object));
        expect(component.archivoZip).toBeNull();
        done();
      }, 50);
    });

    it('onArchivoMapeo debería fijar el archivo de plantilla seleccionado', () => {
      const archivo = new File(['Nombre de archivo,Código único'], 'plantilla.csv');
      const event = { target: { files: [archivo] } } as unknown as Event;
      component.onArchivoMapeo(event);
      expect(component.archivoMapeo).toBe(archivo);
    });

    it('cargarSustentoMasivo debería incluir el mapeo parseado de la plantilla CSV', (done) => {
      component.archivoZip = new File(['contenido'], 'sustentos.zip', { type: 'application/zip' });
      component.archivoMapeo = new File(
        ['Nombre de archivo,Código único\nfactura1.pdf,21-260010024801'], 'plantilla.csv'
      );
      sustentoService.cargarMasivo.and.returnValue(of({ cargados: [{} as any], rechazados: [] }));

      component.cargarSustentoMasivo();

      setTimeout(() => {
        expect(sustentoService.cargarMasivo).toHaveBeenCalledWith(jasmine.objectContaining({
          mapeo: [{ nombreArchivo: 'factura1.pdf', codigoUnicoAtencion: '21-260010024801' }]
        }));
        expect(component.archivoMapeo).toBeNull();
        done();
      }, 50);
    });

    it('cargarSustentoMasivo debería avisar y no llamar al servicio si la plantilla CSV tiene encabezados inválidos', (done) => {
      component.archivoZip = new File(['contenido'], 'sustentos.zip', { type: 'application/zip' });
      component.archivoMapeo = new File(['Columna A,Columna B\nvalor1,valor2'], 'plantilla.csv');

      component.cargarSustentoMasivo();

      setTimeout(() => {
        expect(sustentoService.cargarMasivo).not.toHaveBeenCalled();
        expect(snackBar.open).toHaveBeenCalledWith(
          'La plantilla debe tener las columnas "Nombre de archivo" y "Código único"', 'Cerrar', jasmine.any(Object)
        );
        done();
      }, 50);
    });

    it('cargarSustentoMasivo debería avisar y no llamar al servicio si la plantilla CSV tiene filas inválidas', (done) => {
      component.archivoZip = new File(['contenido'], 'sustentos.zip', { type: 'application/zip' });
      component.archivoMapeo = new File(
        ['Nombre de archivo,Código único\nfactura1.pdf,'], 'plantilla.csv'
      );

      component.cargarSustentoMasivo();

      setTimeout(() => {
        expect(sustentoService.cargarMasivo).not.toHaveBeenCalled();
        expect(snackBar.open).toHaveBeenCalledWith(
          jasmine.stringMatching(/plantilla de mapeo tiene filas inválidas/), 'Cerrar', jasmine.any(Object)
        );
        done();
      }, 50);
    });

    it('colorEstado debería retornar la clase según el estado del registro', () => {
      expect(component.colorEstado(registroPrincipal)).toBe('fila-evaluada');
      expect(component.colorEstado({ ...registroPrincipal, estadoRegistro: 'PENDIENTE' })).toBe('fila-pendiente');
    });

    it('guardarAvances debería refrescar la evaluación y notificar', () => {
      service.obtenerPorId.and.returnValue(of(mockEvaluacion));
      component.guardarAvances();
      expect(service.obtenerPorId).toHaveBeenCalledWith(1);
      expect(snackBar.open).toHaveBeenCalledWith('Avances guardados', 'Cerrar', jasmine.any(Object));
    });
  });
});
