import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { HistoricoAivComponent } from './historicoAiv.component';
import { HistoricoAivService } from '../../services/historicoAiv.service';
import { HistoricoAccionResponse, HistoricoPreliminarResponse } from '../../models/historicoAiv.model';

describe('HistoricoAivComponent', () => {
  let component: HistoricoAivComponent;
  let fixture: ComponentFixture<HistoricoAivComponent>;
  let service: jasmine.SpyObj<HistoricoAivService>;

  const mockPreliminares: HistoricoPreliminarResponse[] = [
    { id: 1, version: 1, estadoSnapshot: 'EN_PROCESO', indicadorAiv: 2.5, numeroRegistrosNoConformes: 3, muestraDefinitiva: 40, motivo: 'Evaluación', fechaSnapshot: '2025-01-01T10:00:00', usuario: 'admin' }
  ];
  const mockAcciones: HistoricoAccionResponse[] = [
    { id: 1, version: 1, accion: 'CONSOLIDAR', detalle: 'Consolidación total', usuario: 'admin', fechaAccion: '2025-01-02T10:00:00' }
  ];

  beforeEach(async () => {
    const serviceSpy = jasmine.createSpyObj('HistoricoAivService', ['preliminares', 'acciones']);

    await TestBed.configureTestingModule({
      imports: [HistoricoAivComponent, NoopAnimationsModule],
      providers: [{ provide: HistoricoAivService, useValue: serviceSpy }]
    }).compileComponents();

    service = TestBed.inject(HistoricoAivService) as jasmine.SpyObj<HistoricoAivService>;

    fixture = TestBed.createComponent(HistoricoAivComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('consultar no debería hacer nada si no hay idEvaluacion', () => {
    component.idEvaluacion = null;
    component.consultar();
    expect(service.preliminares).not.toHaveBeenCalled();
    expect(service.acciones).not.toHaveBeenCalled();
  });

  it('consultar debería cargar preliminares y acciones para el id indicado', () => {
    component.idEvaluacion = 5;
    service.preliminares.and.returnValue(of(mockPreliminares));
    service.acciones.and.returnValue(of(mockAcciones));

    component.consultar();

    expect(service.preliminares).toHaveBeenCalledWith(5);
    expect(service.acciones).toHaveBeenCalledWith(5);
    expect(component.preliminares()).toEqual(mockPreliminares);
    expect(component.acciones()).toEqual(mockAcciones);
  });
});
