import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { EvaluarItemsDialogComponent, EvaluarItemsDialogData } from './evaluar-items-dialog.component';
import { EvaluacionAivService } from '../../services/evaluacionAiv.service';
import { CatalogoItemAivService } from '../../../catalogoItemAiv/services/catalogoItemAiv.service';
import { CatalogoItemAivResponse } from '../../../catalogoItemAiv/models/catalogoItemAiv.model';
import { EvaluacionAivResponse, EvaluacionRegistroResponse } from '../../models/evaluacionAiv.model';

describe('EvaluarItemsDialogComponent', () => {
  let component: EvaluarItemsDialogComponent;
  let fixture: ComponentFixture<EvaluarItemsDialogComponent>;
  let service: jasmine.SpyObj<EvaluacionAivService>;
  let catalogoService: jasmine.SpyObj<CatalogoItemAivService>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<EvaluarItemsDialogComponent>>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  const mockCatalogo: CatalogoItemAivResponse[] = [
    { codigoItem: 'ITEM_01', descripcion: 'Item 1', orden: 1, bloqueante: false },
    { codigoItem: 'ITEM_02', descripcion: 'Item 2', orden: 2, bloqueante: true }
  ];

  const registro: EvaluacionRegistroResponse = {
    id: 1, idMuestraDetalle: 1, codigoUnico: 'CU-0001', codigoEmpresa: '10', codigoAtencion: 'AT-1',
    codigoUbigeo: '150101', codigoAsunto: '174', descripcionAsunto: 'Consumo excesivo',
    grupoAsunto: 'Reclamos', usuario: 'jperez', adicional: false,
    reemplazado: false, estadoRegistro: 'PENDIENTE', cumple: null, itemsCumplidos: 0, itemsTotal: 0,
    fechaEvaluacion: null, observacion: 'Observación previa', items: []
  };

  const mockData: EvaluarItemsDialogData = { registro, usuario: 'admin' };

  beforeEach(async () => {
    const serviceSpy = jasmine.createSpyObj('EvaluacionAivService', ['evaluarRegistro']);
    const catalogoServiceSpy = jasmine.createSpyObj('CatalogoItemAivService', ['listarVigentes']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    catalogoServiceSpy.listarVigentes.and.returnValue(of(mockCatalogo));

    await TestBed.configureTestingModule({
      imports: [EvaluarItemsDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: EvaluacionAivService, useValue: serviceSpy },
        { provide: CatalogoItemAivService, useValue: catalogoServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: MAT_DIALOG_DATA, useValue: mockData }
      ]
    }).compileComponents();

    // MatDialogModule (necesario para el propio template del diálogo) re-provee MatDialog a nivel de
    // componente, lo que hace que el override de `providers` sea ignorado; overrideProvider sí lo respeta.
    TestBed.overrideProvider(MatDialog, { useValue: dialogSpy });

    service = TestBed.inject(EvaluacionAivService) as jasmine.SpyObj<EvaluacionAivService>;
    catalogoService = TestBed.inject(CatalogoItemAivService) as jasmine.SpyObj<CatalogoItemAivService>;
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    dialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<EvaluarItemsDialogComponent>>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

    fixture = TestBed.createComponent(EvaluarItemsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crear el componente y cargar el catálogo', () => {
    expect(component).toBeTruthy();
    expect(component.catalogo).toEqual(mockCatalogo);
    expect(component.justificacion).toBe('Observación previa');
  });

  it('RF03: el campo "Ap. Usuario" debería mostrar el usuario real del registro, no un guion fijo', () => {
    const inputs: HTMLInputElement[] = Array.from(fixture.nativeElement.querySelectorAll('input'));
    const campo = inputs.find((el) => el.closest('mat-form-field')?.querySelector('mat-label')?.textContent?.includes('Ap. Usuario'));
    expect(campo?.value).toBe('jperez');
  });

  it('seleccionarCumple debería fijar el valor del ítem', () => {
    component.seleccionarCumple('ITEM_01', true);
    expect(component.cumplePorItem['ITEM_01']).toBe(true);
  });

  it('seleccionarCumple debería forzar el incumplimiento de ITEM_01 si ITEM_02 se marca incumplido', () => {
    component.seleccionarCumple('ITEM_02', false);
    expect(component.cumplePorItem['ITEM_02']).toBe(false);
    expect(component.cumplePorItem['ITEM_01']).toBe(false);
  });

  it('itemBloqueadoPorAutoIncumple debería ser verdadero solo para ITEM_01 cuando ITEM_02 incumple', () => {
    component.cumplePorItem['ITEM_02'] = false;
    expect(component.itemBloqueadoPorAutoIncumple('ITEM_01')).toBe(true);
    expect(component.itemBloqueadoPorAutoIncumple('ITEM_02')).toBe(false);
  });

  it('abrirSustento debería abrir el diálogo de sustento con los datos del registro', () => {
    component.abrirSustento();
    expect(dialog.open).toHaveBeenCalled();
  });

  it('guardar debería rechazar si faltan ítems por evaluar', () => {
    component.cumplePorItem = { ITEM_01: true, ITEM_02: null };
    component.guardar();
    expect(snackBar.open).toHaveBeenCalledWith('Debe evaluar todos los ítems', 'Cerrar', jasmine.any(Object));
    expect(service.evaluarRegistro).not.toHaveBeenCalled();
  });

  it('guardar debería rechazar si falta la justificación', () => {
    component.cumplePorItem = { ITEM_01: true, ITEM_02: true };
    component.justificacion = '   ';
    component.guardar();
    expect(snackBar.open).toHaveBeenCalledWith('La justificación es obligatoria', 'Cerrar', jasmine.any(Object));
    expect(service.evaluarRegistro).not.toHaveBeenCalled();
  });

  it('guardar debería enviar la evaluación y cerrar el diálogo con el resultado', () => {
    component.cumplePorItem = { ITEM_01: true, ITEM_02: true };
    component.justificacion = 'Todo conforme';
    const mockRespuesta = {} as EvaluacionAivResponse;
    service.evaluarRegistro.and.returnValue(of(mockRespuesta));

    component.guardar();

    expect(service.evaluarRegistro).toHaveBeenCalledWith({
      idEvaluacionRegistro: 1, usuario: 'admin', observacion: 'Todo conforme',
      items: [{ codigoItem: 'ITEM_01', cumple: true }, { codigoItem: 'ITEM_02', cumple: true }]
    });
    expect(dialogRef.close).toHaveBeenCalledWith(mockRespuesta);
    expect(component.guardando).toBe(false);
  });

  it('guardar debería mostrar el error si falla el guardado', () => {
    component.cumplePorItem = { ITEM_01: true, ITEM_02: true };
    component.justificacion = 'Todo conforme';
    service.evaluarRegistro.and.returnValue(throwError(() => ({ error: { message: 'Evaluación bloqueada' } })));

    component.guardar();

    expect(snackBar.open).toHaveBeenCalledWith('Evaluación bloqueada', 'Cerrar', jasmine.any(Object));
    expect(component.guardando).toBe(false);
  });

  it('cancelar debería cerrar el diálogo sin datos', () => {
    component.cancelar();
    expect(dialogRef.close).toHaveBeenCalledWith();
  });
});

describe('EvaluarItemsDialogComponent con evaluación consolidada (soloLectura)', () => {
  let component: EvaluarItemsDialogComponent;
  let fixture: ComponentFixture<EvaluarItemsDialogComponent>;

  const mockCatalogo: CatalogoItemAivResponse[] = [
    { codigoItem: 'ITEM_01', descripcion: 'Item 1', orden: 1, bloqueante: false },
    { codigoItem: 'ITEM_02', descripcion: 'Item 2', orden: 2, bloqueante: true }
  ];

  const registro: EvaluacionRegistroResponse = {
    id: 1, idMuestraDetalle: 1, codigoUnico: 'CU-0001', codigoEmpresa: '10', codigoAtencion: 'AT-1',
    codigoUbigeo: '150101', codigoAsunto: '174', descripcionAsunto: 'Consumo excesivo',
    grupoAsunto: 'Reclamos', usuario: 'jperez', adicional: false,
    reemplazado: false, estadoRegistro: 'EVALUADO', cumple: 'S', itemsCumplidos: 4, itemsTotal: 4,
    fechaEvaluacion: '2026-01-01', observacion: 'Conforme', items: []
  };

  const mockDataSoloLectura: EvaluarItemsDialogData = { registro, usuario: 'admin', soloLectura: true };

  beforeEach(async () => {
    const catalogoServiceSpy = jasmine.createSpyObj('CatalogoItemAivService', ['listarVigentes']);
    catalogoServiceSpy.listarVigentes.and.returnValue(of(mockCatalogo));

    await TestBed.configureTestingModule({
      imports: [EvaluarItemsDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: EvaluacionAivService, useValue: jasmine.createSpyObj('EvaluacionAivService', ['evaluarRegistro']) },
        { provide: CatalogoItemAivService, useValue: catalogoServiceSpy },
        { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) },
        { provide: MatDialogRef, useValue: jasmine.createSpyObj('MatDialogRef', ['close']) },
        { provide: MatSnackBar, useValue: jasmine.createSpyObj('MatSnackBar', ['open']) },
        { provide: MAT_DIALOG_DATA, useValue: mockDataSoloLectura }
      ]
    }).compileComponents();
    TestBed.overrideProvider(MatDialog, { useValue: jasmine.createSpyObj('MatDialog', ['open']) });

    fixture = TestBed.createComponent(EvaluarItemsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería mostrar el mensaje de evaluación consolidada', () => {
    const mensaje: HTMLElement = fixture.nativeElement.querySelector('.mensaje-consolidada');
    expect(mensaje?.textContent).toContain('consolidada');
  });

  it('no debería renderizar el botón Guardar', () => {
    const botones: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('button'));
    const guardar = botones.find((b) => b.textContent?.trim() === 'Guardar');
    expect(guardar).toBeUndefined();
  });

  it('el botón de cierre debería decir "Cerrar" en vez de "Cancelar"', () => {
    const botones: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('button'));
    expect(botones.some((b) => b.textContent?.trim() === 'Cerrar')).toBe(true);
    expect(botones.some((b) => b.textContent?.trim() === 'Cancelar')).toBe(false);
  });

  it('el binding [disabled] del mat-radio-group debería recibir true para cada ítem', () => {
    const grupos: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('mat-radio-group'));
    expect(grupos.length).toBeGreaterThan(0);
    for (const grupo of grupos) {
      expect(grupo.getAttribute('ng-reflect-disabled')).toBe('true');
    }
  });
});

describe('EvaluarItemsDialogComponent con registro sin observación previa, sin código único y con ítems ya evaluados', () => {
  let component: EvaluarItemsDialogComponent;
  let fixture: ComponentFixture<EvaluarItemsDialogComponent>;
  let service: jasmine.SpyObj<EvaluacionAivService>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  const mockCatalogo: CatalogoItemAivResponse[] = [
    { codigoItem: 'ITEM_01', descripcion: 'Item 1', orden: 1, bloqueante: false },
    { codigoItem: 'ITEM_02', descripcion: 'Item 2', orden: 2, bloqueante: true }
  ];

  const registro: EvaluacionRegistroResponse = {
    id: 1, idMuestraDetalle: 1, codigoUnico: null, codigoEmpresa: '10', codigoAtencion: 'AT-1',
    codigoUbigeo: '150101', codigoAsunto: '174', descripcionAsunto: 'Consumo excesivo',
    grupoAsunto: 'Reclamos', usuario: 'jperez', adicional: false,
    reemplazado: false, estadoRegistro: 'PENDIENTE', cumple: null, itemsCumplidos: 1, itemsTotal: 4,
    fechaEvaluacion: null, observacion: null,
    items: [{ codigoItem: 'ITEM_01', cumple: true, autoIncumple: false, observacion: null }]
  };

  const mockData: EvaluarItemsDialogData = { registro, usuario: 'admin' };

  beforeEach(async () => {
    const serviceSpy = jasmine.createSpyObj('EvaluacionAivService', ['evaluarRegistro']);
    const catalogoServiceSpy = jasmine.createSpyObj('CatalogoItemAivService', ['listarVigentes']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    catalogoServiceSpy.listarVigentes.and.returnValue(of(mockCatalogo));

    await TestBed.configureTestingModule({
      imports: [EvaluarItemsDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: EvaluacionAivService, useValue: serviceSpy },
        { provide: CatalogoItemAivService, useValue: catalogoServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: MatDialogRef, useValue: jasmine.createSpyObj('MatDialogRef', ['close']) },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: MAT_DIALOG_DATA, useValue: mockData }
      ]
    }).compileComponents();
    TestBed.overrideProvider(MatDialog, { useValue: dialogSpy });

    service = TestBed.inject(EvaluacionAivService) as jasmine.SpyObj<EvaluacionAivService>;
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

    fixture = TestBed.createComponent(EvaluarItemsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería inicializar la justificación vacía si el registro no tiene observación previa', () => {
    expect(component.justificacion).toBe('');
  });

  it('debería precargar el valor previo de cumple cuando el registro ya trae ítems evaluados', () => {
    expect(component.cumplePorItem['ITEM_01']).toBe(true);
    expect(component.cumplePorItem['ITEM_02']).toBeNull();
  });

  it('abrirSustento debería usar cadena vacía como código único si el registro no tiene uno', () => {
    component.abrirSustento();
    const [, config] = dialog.open.calls.mostRecent().args;
    expect((config as any).data.codigoUnicoAtencion).toBe('');
  });

  it('guardar debería mostrar el mensaje genérico si el error no trae mensaje del backend', () => {
    component.cumplePorItem = { ITEM_01: true, ITEM_02: true };
    component.justificacion = 'Todo conforme';
    service.evaluarRegistro.and.returnValue(throwError(() => ({})));

    component.guardar();

    expect(snackBar.open).toHaveBeenCalledWith('Error al guardar la evaluación', 'Cerrar', jasmine.any(Object));
  });
});
