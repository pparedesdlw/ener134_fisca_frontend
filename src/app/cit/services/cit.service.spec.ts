import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CitService } from './cit.service';
import {
  CalculoCitRequest,
  CitResultadoResponse,
  TmAsunto,
  ResumenCit,
  ResumenCitEmpresa,
  IndicadorCit,
  IndisponibilidadSistema,
  InfoTecnicaCierreResponse,
  AtencionResponse,
  AccionResponse
} from '../models/cit.model';
import { environment } from '../../../environments/environment';

describe('CitService', () => {
  let service: CitService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/cit`;

  const mockResultado: CitResultadoResponse = {
    nmd: 5,
    nta: 100,
    incumplimientosItem1: 2,
    incumplimientosItem2: 1,
    incumplimientosItem3: 3,
    incumplimientosItem4: 0,
    detalleItem4: {
      sinDetalleTh3: 0,
      sinDetalleTh4: 0,
      sinDetalleTh5: 0,
      sinDetalleTh6: 0,
      sinDetalleTh7: 0,
      sinDetalleTh8: 0
    },
    nrn: 6,
    cit: 85.5,
    tolerancia: 90,
    superaTolerancia: false
  };

  const mockAsuntos: TmAsunto[] = [
    { codigoAsunto: 1, descripcionAsunto: 'Interrupción' },
    { codigoAsunto: 2, descripcionAsunto: 'Tensión' }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CitService]
    });
    service = TestBed.inject(CitService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  describe('calcularCit', () => {
    it('debería calcular el CIT con los parámetros proporcionados', () => {
      const request: CalculoCitRequest = {
        fechaInicio: '2024-01-01',
        fechaFin: '2024-03-31',
        codigoEmpresa: 'EMP001'
      };

      service.calcularCit(request).subscribe(resultado => {
        expect(resultado).toEqual(mockResultado);
        expect(resultado.cit).toBe(85.5);
      });

      const req = httpMock.expectOne(`${apiUrl}/calculo/calcular`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockResultado);
    });

    it('debería calcular con codigoAsunto opcional', () => {
      const request: CalculoCitRequest = {
        fechaInicio: '2024-01-01',
        fechaFin: '2024-03-31',
        codigoEmpresa: 'EMP001',
        codigoAsunto: 'ASU001'
      };

      service.calcularCit(request).subscribe(resultado => {
        expect(resultado).toBeTruthy();
      });

      const req = httpMock.expectOne(`${apiUrl}/calculo/calcular`);
      expect(req.request.body.codigoAsunto).toBe('ASU001');
      req.flush(mockResultado);
    });

    it('debería manejar error al calcular CIT', () => {
      const request: CalculoCitRequest = {
        fechaInicio: '2024-01-01',
        fechaFin: '2024-03-31',
        codigoEmpresa: 'EMP001'
      };

      service.calcularCit(request).subscribe({
        next: () => fail('debería fallar'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/calculo/calcular`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('listarAsuntos', () => {
    it('debería obtener la lista de asuntos', () => {
      service.listarAsuntos().subscribe(asuntos => {
        expect(asuntos).toEqual(mockAsuntos);
        expect(asuntos.length).toBe(2);
      });

      const req = httpMock.expectOne(`${apiUrl}/resumen/asuntos`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAsuntos);
    });
  });

  describe('obtenerResumenPorPeriodo', () => {
    it('debería obtener el resumen por período', () => {
      const mockResumen: ResumenCit = {
        codigoPeriodo: '2024-T1',
        totalAtenciones: 100,
        atencionesCumplen: 85,
        atencionesNoCumplen: 15,
        porcentajeCumplimiento: 85,
        distribucionNrn: { 0: 85, 1: 10, 2: 5 }
      };

      service.obtenerResumenPorPeriodo('2024-T1').subscribe(resumen => {
        expect(resumen).toEqual(mockResumen);
        expect(resumen.totalAtenciones).toBe(100);
      });

      const req = httpMock.expectOne(`${apiUrl}/resumen/periodo/2024-T1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResumen);
    });
  });

  describe('obtenerResumenPorEmpresa', () => {
    it('debería obtener el resumen por empresa y período', () => {
      const mockResumen: ResumenCitEmpresa = {
        codigoPeriodo: '2024-T1',
        codigoEmpresa: 'EMP001',
        totalAtenciones: 50,
        atencionesCumplen: 45,
        cumpleItem1: 48,
        cumpleItem3: 46,
        cumpleItem4: 50,
        porcentajeCumplimientoItem1: 96,
        porcentajeCumplimientoItem3: 92,
        porcentajeCumplimientoItem4: 100
      };

      service.obtenerResumenPorEmpresa('2024-T1', 'EMP001').subscribe(resumen => {
        expect(resumen).toEqual(mockResumen);
        expect(resumen.codigoEmpresa).toBe('EMP001');
      });

      const req = httpMock.expectOne(`${apiUrl}/resumen/periodo/2024-T1/empresa/EMP001`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResumen);
    });
  });

  describe('listarIndicadoresPorPeriodo', () => {
    it('debería listar indicadores por período', () => {
      const mockIndicadores: IndicadorCit[] = [{
        codigoPeriodo: '2024-T1',
        codigoEmpresa: 'EMP001',
        codigoAtencion: 'ATN001',
        cumpleItem1: 'S',
        cumpleItem3: 'S',
        cumpleItem4: 'N',
        numeroNrn: 1
      }];

      service.listarIndicadoresPorPeriodo('2024-T1').subscribe(indicadores => {
        expect(indicadores).toEqual(mockIndicadores);
        expect(indicadores.length).toBe(1);
      });

      const req = httpMock.expectOne(`${apiUrl}/resumen/indicadores/2024-T1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockIndicadores);
    });
  });

  describe('indisponibilidades', () => {
    const mockIndisponibilidad: IndisponibilidadSistema = {
      codigoIndisponibilidad: 'IND001',
      fechaInicioIndisponibilidad: '2024-01-15',
      fechaFinIndisponibilidad: '2024-01-16',
      motivo: 'Mantenimiento programado',
      estado: 'ACTIVO',
      fechaRegistro: '2024-01-10'
    };

    it('debería listar todas las indisponibilidades', () => {
      service.listarIndisponibilidades().subscribe(indisps => {
        expect(indisps.length).toBe(1);
      });

      const req = httpMock.expectOne(`${apiUrl}/indisponibilidad/listar`);
      expect(req.request.method).toBe('GET');
      req.flush([mockIndisponibilidad]);
    });

    it('debería listar indisponibilidades activas', () => {
      service.listarIndisponibilidadesActivas().subscribe(indisps => {
        expect(indisps[0].estado).toBe('ACTIVO');
      });

      const req = httpMock.expectOne(`${apiUrl}/indisponibilidad/activas`);
      expect(req.request.method).toBe('GET');
      req.flush([mockIndisponibilidad]);
    });

    it('debería registrar una nueva indisponibilidad', () => {
      const nueva: Partial<IndisponibilidadSistema> = {
        fechaInicioIndisponibilidad: '2024-02-01',
        fechaFinIndisponibilidad: '2024-02-02',
        motivo: 'Actualización',
        estado: 'ACTIVO'
      };

      service.registrarIndisponibilidad(nueva).subscribe(indisp => {
        expect(indisp).toEqual(mockIndisponibilidad);
      });

      const req = httpMock.expectOne(`${apiUrl}/indisponibilidad/registrar`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(nueva);
      req.flush(mockIndisponibilidad);
    });

    it('debería desactivar una indisponibilidad', () => {
      const desactivada = { ...mockIndisponibilidad, estado: 'INACTIVO' };

      service.desactivarIndisponibilidad('IND001').subscribe(indisp => {
        expect(indisp.estado).toBe('INACTIVO');
      });

      const req = httpMock.expectOne(`${apiUrl}/indisponibilidad/IND001/desactivar`);
      expect(req.request.method).toBe('PUT');
      req.flush(desactivada);
    });
  });

  describe('obtenerInfoTecnica', () => {
    it('debería obtener información técnica por empresa y atención', () => {
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
      });

      const req = httpMock.expectOne(`${apiUrl}/info-tecnica/EMP001/ATN001`);
      expect(req.request.method).toBe('GET');
      req.flush(mockInfo);
    });
  });

  describe('listarAtenciones', () => {
    const mockAtenciones: AtencionResponse[] = [{
      codigoEmpresa: 'EMP001',
      codigoAtencion: 'ATN001',
      codigoAsunto: 'ASU001',
      descripcionAsunto: 'Interrupción',
      fechaCreacion: '2024-01-15',
      fechaRecepcion: '2024-01-14',
      estadoAtencion: 'PENDIENTE',
      tieneCierre: false
    }];

    it('debería listar atenciones sin código de asunto', () => {
      service.listarAtenciones('EMP001', '2024-01-01', '2024-03-31').subscribe(atenciones => {
        expect(atenciones).toEqual(mockAtenciones);
      });

      const req = httpMock.expectOne(
        `${apiUrl}/info-tecnica/atenciones?codigoEmpresa=EMP001&fechaInicio=2024-01-01&fechaFin=2024-03-31`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockAtenciones);
    });

    it('debería listar atenciones con código de asunto', () => {
      service.listarAtenciones('EMP001', '2024-01-01', '2024-03-31', 'ASU001').subscribe(atenciones => {
        expect(atenciones).toEqual(mockAtenciones);
      });

      const req = httpMock.expectOne(
        `${apiUrl}/info-tecnica/atenciones?codigoEmpresa=EMP001&fechaInicio=2024-01-01&fechaFin=2024-03-31&codigoAsunto=ASU001`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockAtenciones);
    });
  });

  describe('listarAcciones', () => {
    it('debería listar acciones por empresa y atención', () => {
      const mockAcciones: AccionResponse[] = [{
        codigoAccion: 'ACC001',
        codigoPeriodo: '2024-T1',
        fechaRegistroAccion: '2024-01-15',
        descripcionAccionRealizada: 'Acción correctiva',
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

      const req = httpMock.expectOne(`${apiUrl}/info-tecnica/EMP001/ATN001/acciones`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAcciones);
    });
  });
});
