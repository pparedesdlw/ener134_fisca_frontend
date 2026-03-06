import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AtencionComercialService } from './atencionComercial.service';
import { AtencionComercial, AccionResponse, InfoTecnicaCierreResponse } from '../models/atencionComercial.model';
import { environment } from '../../../environments/environment';

describe('AtencionComercialService', () => {
  let service: AtencionComercialService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/atencion-comercial`;
  const apiUrlCit = `${environment.apiUrl}/cit`;

  const mockAtencion: AtencionComercial = {
    codigoAtencion: 'ATN001',
    codigoEmpresa: 'EMP001',
    codigoAsunto: 'ASU001',
    fechaRecepcion: new Date('2024-01-15'),
    fechaCreacion: new Date('2024-01-15'),
    canalRecepcion: 'PRESENCIAL',
    tipoDocumentoCliente: 'DNI',
    descripcionTipoDocumento: 'Documento Nacional de Identidad',
    numeroDocumentoCliente: '12345678',
    nombreCliente: 'Juan',
    apellidoCliente: 'Pérez',
    numeroSuministro: 'SUM001',
    correoElectronico: 'juan@email.com',
    telefonoContacto: '999999999',
    direccion: 'Av. Principal 123',
    ubigeo: '150101',
    fechaMaxima: new Date('2024-02-15'),
    observacion: 'Sin observaciones',
    descripcionAsunto: 'Interrupción',
    descripcionCanal: 'Presencial',
    razonSocial: 'Luz del Sur',
    estadoAtencion: 'PENDIENTE'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AtencionComercialService]
    });
    service = TestBed.inject(AtencionComercialService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  describe('listarTodos', () => {
    it('debería obtener atenciones con paginación', () => {
      const mockAtenciones: AtencionComercial[] = [mockAtencion];

      service.listarTodos(0, 10).subscribe(atenciones => {
        expect(atenciones).toEqual(mockAtenciones);
        expect(atenciones.length).toBe(1);
      });

      const req = httpMock.expectOne(r => r.url.includes(`${apiUrl}/listar`));
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('page')).toBe('0');
      expect(req.request.params.get('size')).toBe('10');
      req.flush(mockAtenciones);
    });

    it('debería solicitar la segunda página', () => {
      service.listarTodos(1, 20).subscribe(atenciones => {
        expect(atenciones).toBeTruthy();
      });

      const req = httpMock.expectOne(r => r.url.includes(`${apiUrl}/listar`));
      expect(req.request.params.get('page')).toBe('1');
      expect(req.request.params.get('size')).toBe('20');
      req.flush([]);
    });

    it('debería manejar error al listar atenciones', () => {
      service.listarTodos(0, 10).subscribe({
        next: () => fail('debería fallar'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(r => r.url.includes(`${apiUrl}/listar`));
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('listarPorEstado', () => {
    it('debería obtener atenciones por estado', () => {
      const mockAtenciones: AtencionComercial[] = [mockAtencion];

      service.listarPorEstado('PENDIENTE').subscribe(atenciones => {
        expect(atenciones).toEqual(mockAtenciones);
      });

      const req = httpMock.expectOne(`${apiUrl}/listar-por-estado?estado=PENDIENTE`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('estado')).toBe('PENDIENTE');
      req.flush(mockAtenciones);
    });
  });

  describe('listarPage', () => {
    it('debería listar atenciones con filtros', () => {
      const mockAtenciones: AtencionComercial[] = [mockAtencion];

      service.listarPage('2024-01-01', '2024-03-31', 'ASU001', 'Juan', 'EMP001').subscribe(atenciones => {
        expect(atenciones).toEqual(mockAtenciones);
      });

      const req = httpMock.expectOne(r => r.url.includes(`${apiUrl}/listar-page`));
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('fechaIni')).toBe('2024-01-01');
      expect(req.request.params.get('fechaFin')).toBe('2024-03-31');
      expect(req.request.params.get('codigoAsunto')).toBe('ASU001');
      expect(req.request.params.get('nombreCliente')).toBe('Juan');
      expect(req.request.params.get('groupsEmpresa')).toBe('EMP001');
      req.flush(mockAtenciones);
    });

    it('debería listar con parámetros vacíos', () => {
      service.listarPage('', '', '', '', '').subscribe(atenciones => {
        expect(atenciones).toBeTruthy();
      });

      const req = httpMock.expectOne(r => r.url.includes(`${apiUrl}/listar-page`));
      req.flush([]);
    });

    it('debería manejar error al listar con filtros', () => {
      service.listarPage('2024-01-01', '2024-03-31', '', '', '').subscribe({
        next: () => fail('debería fallar'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(r => r.url.includes(`${apiUrl}/listar-page`));
      req.flush('Bad request', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('listarAcciones', () => {
    it('debería listar acciones por empresa y atención', () => {
      const mockAcciones: AccionResponse[] = [{
        codigoAccion: 'ACC001',
        codigoPeriodo: '2024T1',
        fechaRegistroAccion: '2024-01-15',
        descripcionAccionRealizada: 'Revisión técnica',
        codigoEstadoAtencion: 1,
        descripcionEstadoAtencion: 'En proceso',
        fechaNotificacionRespuesta: '2024-01-20',
        codigoDocReclamo: 'DOC001',
        esCerrado: false
      }];

      service.listarAcciones('EMP001', 'ATN001').subscribe(acciones => {
        expect(acciones).toEqual(mockAcciones);
        expect(acciones.length).toBe(1);
      });

      const req = httpMock.expectOne(`${apiUrlCit}/info-tecnica/EMP001/ATN001/acciones`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAcciones);
    });
  });

  describe('obtenerInfoTecnica', () => {
    it('debería obtener info técnica por empresa y atención', () => {
      const mockInfo: InfoTecnicaCierreResponse = {
        tipoTh: 3,
        nombreTabla: 'TH3',
        existeRegistro: true,
        estadoCerrado: false,
        codigoAsunto: 'ASU001',
        descripcionAsunto: 'Interrupción',
        codigoEmpresa: 'EMP001',
        codigoAtencion: 'ATN001',
        datosTh3: [],
        datosTh4: null,
        datosTh5: null,
        datosTh6: null,
        datosTh7: null,
        datosTh8: null
      };

      service.obtenerInfoTecnica('EMP001', 'ATN001').subscribe(info => {
        expect(info).toEqual(mockInfo);
        expect(info.tipoTh).toBe(3);
        expect(info.existeRegistro).toBeTrue();
      });

      const req = httpMock.expectOne(`${apiUrlCit}/info-tecnica/EMP001/ATN001`);
      expect(req.request.method).toBe('GET');
      req.flush(mockInfo);
    });
  });
});
