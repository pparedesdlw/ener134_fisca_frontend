import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { PeriodoListComponent } from './periodo-list.component';
import { PeriodoService } from '../services/periodo.service';
import { Periodo } from '../models/periodo.model';
import { PeriodoFormComponent } from './periodo-form.component';
import { AmpliarVigenciaDialogComponent } from './ampliar-vigencia-dialog.component';

describe('PeriodoListComponent', () => {
  let component: PeriodoListComponent;
  let fixture: ComponentFixture<PeriodoListComponent>;
  let periodoService: jasmine.SpyObj<PeriodoService>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  const mockPeriodos: Periodo[] = [
    {
      id: 1,
      codigoPeriodo: '2024T1',
      descripcion: 'Primer trimestre 2024',
      fechaInicio: '01/01/2024',
      fechaFin: '31/03/2024',
      estadoActivo: true,
      deEstado: 'Activo',
      diasRestantes: 30
    },
    {
      id: 2,
      codigoPeriodo: '2024T2',
      descripcion: 'Segundo trimestre 2024',
      fechaInicio: '01/04/2024',
      fechaFin: '30/06/2024',
      estadoActivo: false,
      deEstado: 'Cerrado',
      diasRestantes: 0
    },
    {
      id: 3,
      codigoPeriodo: '2024T3',
      descripcion: 'Tercer trimestre 2024',
      fechaInicio: '01/07/2024',
      fechaFin: '30/09/2024',
      estadoActivo: true,
      deEstado: 'Futuro',
      diasRestantes: 180
    }
  ];

  beforeEach(async () => {
    const periodoServiceSpy = jasmine.createSpyObj('PeriodoService', [
      'listarTodos',
      'listarPorEstado',
      'cambiarEstado',
      'ampliarVigencia'
    ]);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    Object.defineProperty(dialogSpy, '_openDialogs', { value: [], writable: true });
    Object.defineProperty(dialogSpy, '_getAfterAllClosed', { value: () => of(undefined) });
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        PeriodoListComponent,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: PeriodoService, useValue: periodoServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    }).compileComponents();

    periodoService = TestBed.inject(PeriodoService) as jasmine.SpyObj<PeriodoService>;
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

    fixture = TestBed.createComponent(PeriodoListComponent);
    component = fixture.componentInstance;
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('Carga de datos', () => {
    it('debería cargar todos los periodos al inicializar', () => {
      periodoService.listarTodos.and.returnValue(of(mockPeriodos));

      fixture.detectChanges();

      expect(periodoService.listarTodos).toHaveBeenCalled();
      expect(component.periodos).toEqual(mockPeriodos);
      expect(component.periodos.length).toBe(3);
    });

    it('debería manejar error al cargar periodos', (done) => {
      const errorResponse = { error: { message: 'Error de conexión' }, message: 'Network error' };
      periodoService.listarTodos.and.returnValue(throwError(() => errorResponse));

      spyOn(console, 'error');
      fixture.detectChanges();

      setTimeout(() => {
        expect(snackBar.open).toHaveBeenCalledWith('Error de conexión', 'Cerrar', { duration: 5000 });
        expect(console.error).toHaveBeenCalled();
        done();
      }, 100);
    });
  });

  describe('Filtros', () => {
    beforeEach(() => {
      periodoService.listarTodos.and.returnValue(of(mockPeriodos));
      fixture.detectChanges();
    });

    it('debería filtrar periodos activos', () => {
      const periodosActivos = mockPeriodos.filter(p => p.estadoActivo);
      periodoService.listarPorEstado.and.returnValue(of(periodosActivos));

      component.filtrarPorEstado('activos');

      expect(component.filtroEstado).toBe('activos');
      expect(periodoService.listarPorEstado).toHaveBeenCalledWith(true);
    });

    it('debería filtrar periodos inactivos', () => {
      const periodosInactivos = mockPeriodos.filter(p => !p.estadoActivo);
      periodoService.listarPorEstado.and.returnValue(of(periodosInactivos));

      component.filtrarPorEstado('inactivos');

      expect(component.filtroEstado).toBe('inactivos');
      expect(periodoService.listarPorEstado).toHaveBeenCalledWith(false);
    });

    it('debería mostrar todos los periodos', () => {
      periodoService.listarTodos.and.returnValue(of(mockPeriodos));

      component.filtrarPorEstado('todos');

      expect(component.filtroEstado).toBe('todos');
      expect(periodoService.listarTodos).toHaveBeenCalled();
    });
  });

  describe('Crear periodo', () => {
    beforeEach(() => {
      periodoService.listarTodos.and.returnValue(of(mockPeriodos));
      fixture.detectChanges();
    });

    it('debería abrir el diálogo de creación', () => {
      const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
      dialogRefSpy.afterClosed.and.returnValue(of(false));
      dialog.open.and.returnValue(dialogRefSpy);

      component.crear();

      expect(dialog.open).toHaveBeenCalledWith(PeriodoFormComponent, {
        width: '600px',
        data: { mode: 'create' }
      });
    });

    it('debería recargar periodos después de crear uno nuevo', () => {
      const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
      dialogRefSpy.afterClosed.and.returnValue(of(true));
      dialog.open.and.returnValue(dialogRefSpy);

      component.crear();

      expect(periodoService.listarTodos).toHaveBeenCalledTimes(2);
    });
  });

  describe('Editar periodo', () => {
    beforeEach(() => {
      periodoService.listarTodos.and.returnValue(of(mockPeriodos));
      fixture.detectChanges();
    });

    it('debería abrir el diálogo de edición con los datos del periodo', () => {
      const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
      dialogRefSpy.afterClosed.and.returnValue(of(false));
      dialog.open.and.returnValue(dialogRefSpy);

      component.editar(mockPeriodos[0]);

      expect(dialog.open).toHaveBeenCalledWith(PeriodoFormComponent, {
        width: '600px',
        data: { mode: 'edit', periodo: mockPeriodos[0] }
      });
    });

    it('debería recargar periodos después de editar', () => {
      const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
      dialogRefSpy.afterClosed.and.returnValue(of(true));
      dialog.open.and.returnValue(dialogRefSpy);

      component.editar(mockPeriodos[0]);

      expect(periodoService.listarTodos).toHaveBeenCalledTimes(2);
    });
  });

  describe('Cambiar estado', () => {
    beforeEach(() => {
      periodoService.listarTodos.and.returnValue(of(mockPeriodos));
      fixture.detectChanges();
    });

    it('debería activar un periodo inactivo', (done) => {
      const periodoInactivo = mockPeriodos[1];
      const periodoActualizado = { ...periodoInactivo, estadoActivo: true };
      periodoService.cambiarEstado.and.returnValue(of(periodoActualizado));

      component.cambiarEstado(periodoInactivo);

      setTimeout(() => {
        expect(periodoService.cambiarEstado).toHaveBeenCalledWith(2, true, 'admin');
        expect(snackBar.open).toHaveBeenCalledWith('Periodo activado correctamente', 'Cerrar', { duration: 3000 });
        done();
      }, 100);
    });

    it('debería desactivar un periodo activo', (done) => {
      const periodoActivo = mockPeriodos[0];
      const periodoActualizado = { ...periodoActivo, estadoActivo: false };
      periodoService.cambiarEstado.and.returnValue(of(periodoActualizado));

      component.cambiarEstado(periodoActivo);

      setTimeout(() => {
        expect(periodoService.cambiarEstado).toHaveBeenCalledWith(1, false, 'admin');
        expect(snackBar.open).toHaveBeenCalledWith('Periodo desactivado correctamente', 'Cerrar', { duration: 3000 });
        done();
      }, 100);
    });

    it('debería manejar error al cambiar estado', (done) => {
      const errorResponse = { error: { message: 'No se puede cambiar el estado' } };
      periodoService.cambiarEstado.and.returnValue(throwError(() => errorResponse));
      spyOn(console, 'error');

      component.cambiarEstado(mockPeriodos[0]);

      setTimeout(() => {
        expect(snackBar.open).toHaveBeenCalledWith('No se puede cambiar el estado', 'Cerrar', { duration: 5000 });
        expect(console.error).toHaveBeenCalled();
        done();
      }, 100);
    });
  });

  describe('Ampliar vigencia', () => {
    beforeEach(() => {
      periodoService.listarTodos.and.returnValue(of(mockPeriodos));
      fixture.detectChanges();
    });

    it('debería abrir el diálogo de ampliar vigencia', () => {
      const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
      dialogRefSpy.afterClosed.and.returnValue(of(false));
      dialog.open.and.returnValue(dialogRefSpy);

      component.ampliarVigencia(mockPeriodos[0]);

      expect(dialog.open).toHaveBeenCalledWith(AmpliarVigenciaDialogComponent, {
        width: '500px',
        data: { periodo: mockPeriodos[0] }
      });
    });

    it('debería recargar periodos después de ampliar vigencia', () => {
      const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
      dialogRefSpy.afterClosed.and.returnValue(of(true));
      dialog.open.and.returnValue(dialogRefSpy);

      component.ampliarVigencia(mockPeriodos[0]);

      expect(periodoService.listarTodos).toHaveBeenCalledTimes(2);
    });
  });

  describe('Eliminar periodo', () => {
    beforeEach(() => {
      periodoService.listarTodos.and.returnValue(of(mockPeriodos));
      fixture.detectChanges();
    });

    it('debería dar de baja un periodo al confirmar', (done) => {
      spyOn(window, 'confirm').and.returnValue(true);
      const periodoActualizado = { ...mockPeriodos[0], estadoActivo: false };
      periodoService.cambiarEstado.and.returnValue(of(periodoActualizado));

      component.eliminar(mockPeriodos[0]);

      setTimeout(() => {
        expect(window.confirm).toHaveBeenCalledWith('¿Está seguro de dar de baja el periodo 2024T1?');
        expect(periodoService.cambiarEstado).toHaveBeenCalledWith(1, false, 'admin');
        expect(snackBar.open).toHaveBeenCalledWith('Periodo dado de baja correctamente', 'Cerrar', { duration: 3000 });
        done();
      }, 100);
    });

    it('no debería dar de baja un periodo al cancelar', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      component.eliminar(mockPeriodos[0]);

      expect(periodoService.cambiarEstado).not.toHaveBeenCalled();
      expect(snackBar.open).not.toHaveBeenCalled();
    });

    it('debería manejar error al eliminar periodo', (done) => {
      spyOn(window, 'confirm').and.returnValue(true);
      const errorResponse = { error: { message: 'No se puede eliminar' } };
      periodoService.cambiarEstado.and.returnValue(throwError(() => errorResponse));
      spyOn(console, 'error');

      component.eliminar(mockPeriodos[0]);

      setTimeout(() => {
        expect(snackBar.open).toHaveBeenCalledWith('No se puede eliminar', 'Cerrar', { duration: 5000 });
        expect(console.error).toHaveBeenCalled();
        done();
      }, 100);
    });
  });

  describe('Utilidades', () => {
    beforeEach(() => {
      periodoService.listarTodos.and.returnValue(of(mockPeriodos));
      fixture.detectChanges();
    });

    it('debería retornar el color correcto para cada estado', () => {
      expect(component.getEstadoColor('Activo')).toBe('primary');
      expect(component.getEstadoColor('Futuro')).toBe('accent');
      expect(component.getEstadoColor('Cerrado')).toBe('warn');
      expect(component.getEstadoColor(undefined)).toBe('');
      expect(component.getEstadoColor('Otro')).toBe('');
    });

    it('debería permitir ampliar solo periodos activos con estado "Activo"', () => {
      expect(component.puedeAmpliar(mockPeriodos[0])).toBeTrue();
      expect(component.puedeAmpliar(mockPeriodos[1])).toBeFalse();
      expect(component.puedeAmpliar(mockPeriodos[2])).toBeFalse();
    });

    it('debería mostrar columnas correctas en la tabla', () => {
      expect(component.displayedColumns).toEqual([
        'codigoPeriodo',
        'descripcion',
        'fechaInicio',
        'fechaFin',
        'deEstado',
        'diasRestantes',
        'acciones'
      ]);
    });

    it('debería mostrar mensaje de error genérico cuando no hay mensaje específico', (done) => {
      const errorResponse = {};
      periodoService.listarTodos.and.returnValue(throwError(() => errorResponse));
      spyOn(console, 'error');

      fixture.detectChanges();

      setTimeout(() => {
        expect(snackBar.open).toHaveBeenCalledWith('Error al cargar periodos', 'Cerrar', { duration: 5000 });
        done();
      }, 100);
    });
  });
});
