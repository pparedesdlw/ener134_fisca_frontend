import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { CitResumenDashboardComponent } from './cit-resumen-dashboard.component';
import { CitService } from '../../services/cit.service';
import { PeriodoService } from '../../../periodos/services/periodo.service';
import { ResumenCit } from '../../models/cit.model';

describe('CitResumenDashboardComponent', () => {
  let component: CitResumenDashboardComponent;
  let fixture: ComponentFixture<CitResumenDashboardComponent>;
  let citService: jasmine.SpyObj<CitService>;
  let periodoService: jasmine.SpyObj<PeriodoService>;

  const mockResumen: ResumenCit = {
    codigoPeriodo: '202401',
    totalAtenciones: 150,
    atencionesCumplen: 120,
    atencionesNoCumplen: 30,
    porcentajeCumplimiento: 80.0,
    distribucionNrn: { 0: 50, 1: 30, 2: 40, 3: 30 }
  };

  beforeEach(async () => {
    const citServiceSpy = jasmine.createSpyObj('CitService', ['obtenerResumenPorPeriodo']);
    const periodoServiceSpy = jasmine.createSpyObj('PeriodoService', ['listarTodos']);

    periodoServiceSpy.listarTodos.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [
        CitResumenDashboardComponent,
        HttpClientTestingModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: CitService, useValue: citServiceSpy },
        { provide: PeriodoService, useValue: periodoServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CitResumenDashboardComponent);
    component = fixture.componentInstance;
    citService = TestBed.inject(CitService) as jasmine.SpyObj<CitService>;
    periodoService = TestBed.inject(PeriodoService) as jasmine.SpyObj<PeriodoService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.periodoSeleccionado).toBe('');
    expect(component.cargando).toBe(false);
    expect(component.resumen).toBeNull();
  });

  it('should load periodos on init', () => {
    expect(periodoService.listarTodos).toHaveBeenCalled();
  });

  it('should load resumen when cargarResumen is called', () => {
    component.periodoSeleccionado = '202401';
    citService.obtenerResumenPorPeriodo.and.returnValue(of(mockResumen));

    component.cargarResumen();

    expect(citService.obtenerResumenPorPeriodo).toHaveBeenCalledWith('202401');
    expect(component.resumen).toEqual(mockResumen);
    expect(component.cargando).toBe(false);
  });

  it('should not load resumen if periodoSeleccionado is empty', () => {
    component.periodoSeleccionado = '';

    component.cargarResumen();

    expect(citService.obtenerResumenPorPeriodo).not.toHaveBeenCalled();
  });

  it('should handle error when loading resumen', () => {
    component.periodoSeleccionado = '202401';
    citService.obtenerResumenPorPeriodo.and.returnValue(
      throwError(() => new Error('Error al cargar resumen'))
    );

    component.cargarResumen();

    expect(component.cargando).toBe(false);
    expect(component.resumen).toBeNull();
  });

  it('should return NRN keys', () => {
    component.resumen = mockResumen;

    const keys = component.obtenerNrnKeys();

    expect(keys.length).toBe(4);
  });

  it('should return NRN value', () => {
    component.resumen = mockResumen;

    expect(component.obtenerNrnValor(0)).toBe(50);
    expect(component.obtenerNrnValor(1)).toBe(30);
  });
});
