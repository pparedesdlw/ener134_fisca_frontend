import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { ToleranciaVigenciaListComponent } from './toleranciaVigencia-list.component';
import { ToleranciaVigenciaService } from '../services/toleranciaVigencia.service';
import { AuthService } from '../../auth/services/auth.service';
import { ToleranciaVigencia } from '../models/toleranciaVigencia.model';

describe('ToleranciaVigenciaListComponent', () => {
  let component: ToleranciaVigenciaListComponent;
  let fixture: ComponentFixture<ToleranciaVigenciaListComponent>;
  let service: jasmine.SpyObj<ToleranciaVigenciaService>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  const historicoAiv: ToleranciaVigencia[] = [
    { id: 2, codigoIndicador: 'AIV', tolerancia: 7, fechaVigenciaDesde: '2026-04-01', fechaVigenciaHasta: null, usuarioCreacion: 'fdiaz' },
    { id: 1, codigoIndicador: 'AIV', tolerancia: 5, fechaVigenciaDesde: '2020-01-01', fechaVigenciaHasta: '2026-03-31', usuarioCreacion: 'MIGRACION_V2_13' }
  ];

  beforeEach(async () => {
    const serviceSpy = jasmine.createSpyObj('ToleranciaVigenciaService', ['listarHistorico', 'crear']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    serviceSpy.listarHistorico.and.returnValue(of(historicoAiv));

    await TestBed.configureTestingModule({
      imports: [ToleranciaVigenciaListComponent, NoopAnimationsModule],
      providers: [
        { provide: ToleranciaVigenciaService, useValue: serviceSpy },
        { provide: AuthService, useValue: { currentUsername: 'fdiaz' } },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ToleranciaVigenciaListComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(ToleranciaVigenciaService) as jasmine.SpyObj<ToleranciaVigenciaService>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    fixture.detectChanges();
  });

  it('debería crearse y cargar el histórico de AIV por defecto', () => {
    expect(component).toBeTruthy();
    expect(service.listarHistorico).toHaveBeenCalledWith('AIV');
    expect(component.historico.length).toBe(2);
  });

  it('debería identificar la vigencia actual como la que no tiene fecha hasta', () => {
    expect(component.vigenciaActual?.tolerancia).toBe(7);
  });

  it('debería recargar el histórico de CIT al cambiar de indicador', () => {
    service.listarHistorico.and.returnValue(of([]));
    component.seleccionarIndicador('CIT');
    expect(component.indicadorSeleccionado).toBe('CIT');
    expect(service.listarHistorico).toHaveBeenCalledWith('CIT');
  });

  it('no debería recargar si se selecciona el mismo indicador ya activo', () => {
    service.listarHistorico.calls.reset();
    component.seleccionarIndicador('AIV');
    expect(service.listarHistorico).not.toHaveBeenCalled();
  });

  it('debería mostrar un mensaje si falla la carga del histórico', () => {
    service.listarHistorico.and.returnValue(throwError(() => new Error('fallo')));
    component.cargarHistorico();
    expect(component.cargando).toBe(false);
    expect(snackBar.open).toHaveBeenCalledWith('No se pudo cargar el histórico de tolerancia', 'Cerrar', jasmine.any(Object));
  });

  it('debería rechazar registrar sin una tolerancia válida', () => {
    component.nuevaTolerancia = null;
    component.nuevaFechaDesde = new Date(2026, 3, 1);
    component.registrarNuevaVigencia();
    expect(service.crear).not.toHaveBeenCalled();
    expect(snackBar.open).toHaveBeenCalledWith('Ingrese un valor de tolerancia válido', 'Cerrar', jasmine.any(Object));
  });

  it('debería rechazar registrar sin fecha de vigencia', () => {
    component.nuevaTolerancia = 7;
    component.nuevaFechaDesde = null;
    component.registrarNuevaVigencia();
    expect(service.crear).not.toHaveBeenCalled();
    expect(snackBar.open).toHaveBeenCalledWith('Seleccione la fecha desde la cual estará vigente', 'Cerrar', jasmine.any(Object));
  });

  it('debería registrar la nueva vigencia con el usuario autenticado real y recargar el histórico', () => {
    service.crear.and.returnValue(of(historicoAiv[0]));
    component.nuevaTolerancia = 7;
    component.nuevaFechaDesde = new Date(2026, 3, 1);

    component.registrarNuevaVigencia();

    expect(service.crear).toHaveBeenCalledWith({
      codigoIndicador: 'AIV',
      tolerancia: 7,
      fechaVigenciaDesde: '2026-04-01',
      usuario: 'fdiaz'
    });
    expect(component.guardando).toBe(false);
    expect(component.nuevaTolerancia).toBeNull();
    expect(snackBar.open).toHaveBeenCalledWith('Nueva vigencia de tolerancia registrada', 'Cerrar', jasmine.any(Object));
  });

  it('debería mostrar el mensaje de error del servidor si falla el registro', () => {
    service.crear.and.returnValue(throwError(() => ({ error: { message: 'La nueva vigencia debe iniciar despues de la vigencia actual' } })));
    component.nuevaTolerancia = 1;
    component.nuevaFechaDesde = new Date(2020, 0, 1);

    component.registrarNuevaVigencia();

    expect(component.guardando).toBe(false);
    expect(snackBar.open).toHaveBeenCalledWith('La nueva vigencia debe iniciar despues de la vigencia actual', 'Cerrar', jasmine.any(Object));
  });
});
