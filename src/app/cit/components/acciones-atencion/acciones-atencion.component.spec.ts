import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { AccionesAtencionComponent } from './acciones-atencion.component';
import { CitService } from '../../services/cit.service';
import { AccionResponse, InfoTecnicaCierreResponse } from '../../models/cit.model';

describe('AccionesAtencionComponent', () => {
  let component: AccionesAtencionComponent;
  let fixture: ComponentFixture<AccionesAtencionComponent>;
  let citService: jasmine.SpyObj<CitService>;

  const accionAbierta: AccionResponse = {
    codigoAccion: 'A1',
    codigoPeriodo: '202601',
    fechaRegistroAccion: '10/03/2026 08:00',
    descripcionAccionRealizada: 'Registro de reclamo',
    codigoEstadoAtencion: 1,
    descripcionEstadoAtencion: 'ABIERTO',
    fechaNotificacionRespuesta: '',
    codigoDocReclamo: 'DOC-1',
    esCerrado: false
  };

  const accionCerrada: AccionResponse = { ...accionAbierta, codigoAccion: 'A2', esCerrado: true, descripcionEstadoAtencion: 'CERRADO' };

  beforeEach(async () => {
    const citServiceSpy = jasmine.createSpyObj('CitService', ['listarAcciones', 'obtenerInfoTecnica']);

    await TestBed.configureTestingModule({
      imports: [AccionesAtencionComponent, HttpClientTestingModule, BrowserAnimationsModule],
      providers: [{ provide: CitService, useValue: citServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(AccionesAtencionComponent);
    component = fixture.componentInstance;
    component.codigoEmpresa = 'CGEMP0030';
    component.codigoAtencion = 'ATN001';
    citService = TestBed.inject(CitService) as jasmine.SpyObj<CitService>;
  });

  it('debería crearse', () => {
    citService.listarAcciones.and.returnValue(of([]));
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('debería cargar las acciones sin marcar cierre si ninguna esta cerrada', () => {
    citService.listarAcciones.and.returnValue(of([accionAbierta]));

    fixture.detectChanges();

    expect(component.dataSource.data.length).toBe(1);
    expect(component.totalRegistros).toBe(1);
    expect(component.cargando).toBeFalse();
    expect(component.tieneAccionCerrada).toBeFalse();
    expect(citService.obtenerInfoTecnica).not.toHaveBeenCalled();
  });

  it('debería cargar la info tecnica cuando alguna accion esta cerrada', () => {
    const infoTecnica: InfoTecnicaCierreResponse = {
      tipoTh: 3, nombreTabla: 'TISEC_TH_3', existeRegistro: true, estadoCerrado: true,
      codigoAsunto: '301', descripcionAsunto: 'Interrupción', codigoEmpresa: 'CGEMP0030', codigoAtencion: 'ATN001'
    } as InfoTecnicaCierreResponse;
    citService.listarAcciones.and.returnValue(of([accionAbierta, accionCerrada]));
    citService.obtenerInfoTecnica.and.returnValue(of(infoTecnica));

    fixture.detectChanges();

    expect(component.tieneAccionCerrada).toBeTrue();
    expect(component.infoTecnica).toEqual(infoTecnica);
    expect(component.cargandoInfoTecnica).toBeFalse();
  });

  it('debería manejar el error al cargar acciones', () => {
    citService.listarAcciones.and.returnValue(throwError(() => new Error('fallo de red')));

    fixture.detectChanges();

    expect(component.cargando).toBeFalse();
    expect(component.dataSource.data.length).toBe(0);
  });

  it('debería manejar el error al cargar la info tecnica', () => {
    citService.listarAcciones.and.returnValue(of([accionCerrada]));
    citService.obtenerInfoTecnica.and.returnValue(throwError(() => new Error('fallo de red')));

    fixture.detectChanges();

    expect(component.cargandoInfoTecnica).toBeFalse();
    expect(component.infoTecnica).toBeNull();
  });

  it('ngAfterViewInit debería asignar el paginador al dataSource', () => {
    citService.listarAcciones.and.returnValue(of([]));
    fixture.detectChanges();

    component.ngAfterViewInit();

    expect(component.dataSource.paginator).toBe(component.paginator);
  });
});
