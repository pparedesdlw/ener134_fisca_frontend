import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { CitResultadosListComponent } from './cit-resultados-list.component';
import { CitService } from '../../services/cit.service';
import { PeriodoService } from '../../../periodos/services/periodo.service';
import { IndicadorCit } from '../../models/cit.model';

describe('CitResultadosListComponent', () => {
  let component: CitResultadosListComponent;
  let fixture: ComponentFixture<CitResultadosListComponent>;
  let citService: jasmine.SpyObj<CitService>;
  let periodoService: jasmine.SpyObj<PeriodoService>;

  const mockIndicadores: IndicadorCit[] = [
    {
      codigoIndicadorCit: '1',
      codigoPeriodo: '202401',
      codigoEmpresa: '0001',
      codigoAtencion: '101',
      cumpleItem1: 'S',
      cumpleItem3: 'S',
      cumpleItem4: 'S',
      numeroNrn: 0
    },
    {
      codigoIndicadorCit: '2',
      codigoPeriodo: '202401',
      codigoEmpresa: '0001',
      codigoAtencion: '102',
      cumpleItem1: 'N',
      cumpleItem3: 'S',
      cumpleItem4: 'S',
      numeroNrn: 1
    },
    {
      codigoIndicadorCit: '3',
      codigoPeriodo: '202401',
      codigoEmpresa: '0002',
      codigoAtencion: '201',
      cumpleItem1: 'N',
      cumpleItem3: 'N',
      cumpleItem4: 'S',
      numeroNrn: 2
    }
  ];

  beforeEach(async () => {
    const citServiceSpy = jasmine.createSpyObj('CitService', ['listarIndicadoresPorPeriodo']);
    const periodoServiceSpy = jasmine.createSpyObj('PeriodoService', ['listarTodos']);

    periodoServiceSpy.listarTodos.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [
        CitResultadosListComponent,
        HttpClientTestingModule,
        MatTableModule,
        MatFormFieldModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: CitService, useValue: citServiceSpy },
        { provide: PeriodoService, useValue: periodoServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CitResultadosListComponent);
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
    expect(component.indicadores).toEqual([]);
  });

  it('should load periodos on init', () => {
    expect(periodoService.listarTodos).toHaveBeenCalled();
  });

  it('should load indicadores on cargarIndicadores', () => {
    component.periodoSeleccionado = '202401';
    citService.listarIndicadoresPorPeriodo.and.returnValue(of(mockIndicadores));

    component.cargarIndicadores();

    expect(citService.listarIndicadoresPorPeriodo).toHaveBeenCalledWith('202401');
    expect(component.indicadores).toEqual(mockIndicadores);
    expect(component.cargando).toBe(false);
  });

  it('should not load indicadores if periodoSeleccionado is empty', () => {
    component.periodoSeleccionado = '';

    component.cargarIndicadores();

    expect(citService.listarIndicadoresPorPeriodo).not.toHaveBeenCalled();
  });

  it('should handle error when loading indicadores', () => {
    component.periodoSeleccionado = '202401';
    citService.listarIndicadoresPorPeriodo.and.returnValue(
      throwError(() => new Error('Error al cargar indicadores'))
    );

    component.cargarIndicadores();

    expect(component.cargando).toBe(false);
  });

  it('should display correct columns', () => {
    expect(component.displayedColumns).toContain('codigoEmpresa');
    expect(component.displayedColumns).toContain('codigoAtencion');
    expect(component.displayedColumns).toContain('cumpleItem1');
    expect(component.displayedColumns).toContain('cumpleItem3');
    expect(component.displayedColumns).toContain('cumpleItem4');
    expect(component.displayedColumns).toContain('numeroNrn');
  });

  it('should calculate NRN correctly based on flags', () => {
    const indicador = mockIndicadores[0];
    const countN = [indicador.cumpleItem1, indicador.cumpleItem3, indicador.cumpleItem4]
      .filter(flag => flag === 'N').length;

    expect(countN).toBe(0);
    expect(indicador.numeroNrn).toBe(0);
  });

  it('should handle empty indicadores correctly', () => {
    component.periodoSeleccionado = '202401';
    citService.listarIndicadoresPorPeriodo.and.returnValue(of([]));

    component.cargarIndicadores();

    expect(component.indicadores).toEqual([]);
    expect(component.cargando).toBe(false);
  });
});
