import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { CalculoCitFormComponent } from './calculo-cit-form.component';
import { CitService } from '../../services/cit.service';
import { EmpresaService } from '../../../empresas/services/empresa.service';
import { CitResultadoResponse } from '../../models/cit.model';

describe('CalculoCitFormComponent', () => {
  let component: CalculoCitFormComponent;
  let fixture: ComponentFixture<CalculoCitFormComponent>;
  let citService: jasmine.SpyObj<CitService>;
  let empresaService: jasmine.SpyObj<EmpresaService>;

  const mockResultado: CitResultadoResponse = {
    nmd: 100,
    nta: 3,
    incumplimientosItem1: 5,
    incumplimientosItem2: 0,
    incumplimientosItem3: 3,
    incumplimientosItem4: 2,
    detalleItem4: {
      sinDetalleTh3: 1,
      sinDetalleTh4: 0,
      sinDetalleTh5: 1,
      sinDetalleTh6: 0,
      sinDetalleTh7: 0,
      sinDetalleTh8: 0
    },
    nrn: 10,
    cit: 3.4,
    tolerancia: 5.0,
    superaTolerancia: false
  };

  beforeEach(async () => {
    const citServiceSpy = jasmine.createSpyObj('CitService', ['calcularCit', 'listarAsuntos']);
    const empresaServiceSpy = jasmine.createSpyObj('EmpresaService', ['listarTodos']);

    citServiceSpy.listarAsuntos.and.returnValue(of([]));
    empresaServiceSpy.listarTodos.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [
        CalculoCitFormComponent,
        HttpClientTestingModule,
        NoopAnimationsModule,
        FormsModule
      ],
      providers: [
        { provide: CitService, useValue: citServiceSpy },
        { provide: EmpresaService, useValue: empresaServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CalculoCitFormComponent);
    component = fixture.componentInstance;
    citService = TestBed.inject(CitService) as jasmine.SpyObj<CitService>;
    empresaService = TestBed.inject(EmpresaService) as jasmine.SpyObj<EmpresaService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.fechaInicio).toBeNull();
    expect(component.fechaFin).toBeNull();
    expect(component.empresaSeleccionada).toBeNull();
    expect(component.calculando).toBe(false);
    expect(component.mensaje).toBe('');
    expect(component.error).toBe('');
    expect(component.resultado).toBeNull();
  });

  it('should load empresas and asuntos on init', () => {
    expect(empresaService.listarTodos).toHaveBeenCalled();
    expect(citService.listarAsuntos).toHaveBeenCalled();
  });

  it('should call calcularCit with correct request', () => {
    component.fechaInicio = new Date(2024, 0, 1);
    component.fechaFin = new Date(2024, 2, 31);
    component.empresaSeleccionada = '0010';
    component.asuntoSeleccionado = '20';
    citService.calcularCit.and.returnValue(of(mockResultado));

    component.calcularCit();

    expect(citService.calcularCit).toHaveBeenCalledWith({
      fechaInicio: '2024-01-01',
      fechaFin: '2024-03-31',
      codigoEmpresa: '0010',
      codigoAsunto: '20'
    });
  });

  it('should show error if dates are not selected', () => {
    component.fechaInicio = null;
    component.fechaFin = null;
    component.empresaSeleccionada = '0010';

    component.calcularCit();

    expect(component.error).toContain('fecha');
    expect(citService.calcularCit).not.toHaveBeenCalled();
  });

  it('should show error if empresa is not selected', () => {
    component.fechaInicio = new Date(2024, 0, 1);
    component.fechaFin = new Date(2024, 2, 31);
    component.empresaSeleccionada = null;

    component.calcularCit();

    expect(component.error).toContain('empresa');
    expect(citService.calcularCit).not.toHaveBeenCalled();
  });

  it('should set resultado on successful calculation', () => {
    component.fechaInicio = new Date(2024, 0, 1);
    component.fechaFin = new Date(2024, 2, 31);
    component.empresaSeleccionada = '0010';
    citService.calcularCit.and.returnValue(of(mockResultado));

    component.calcularCit();

    expect(component.resultado).toEqual(mockResultado);
    expect(component.calculando).toBe(false);
    expect(component.mensaje).toContain('exitosamente');
  });

  it('should show error on calculation failure', () => {
    component.fechaInicio = new Date(2024, 0, 1);
    component.fechaFin = new Date(2024, 2, 31);
    component.empresaSeleccionada = '0010';
    citService.calcularCit.and.returnValue(throwError(() => ({ error: { message: 'Error en cálculo' } })));

    component.calcularCit();

    expect(component.calculando).toBe(false);
    expect(component.error).toContain('Error');
  });

  it('should build tablaResultados from resultado', () => {
    component.resultado = mockResultado;

    const tabla = component.tablaResultados;

    expect(tabla.length).toBe(10);
    expect(tabla[0].cantidad).toBe('5');
    expect(tabla[1].cantidad).toBe('0');
    expect(tabla[2].cantidad).toBe('3');
    expect(tabla[3].cantidad).toBe('2');
  });

  it('should return empty tablaResultados when no resultado', () => {
    component.resultado = null;
    expect(component.tablaResultados).toEqual([]);
  });
});
