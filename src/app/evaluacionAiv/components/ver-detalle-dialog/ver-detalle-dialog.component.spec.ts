import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { of } from 'rxjs';
import { VerDetalleDialogComponent, VerDetalleDialogData } from './ver-detalle-dialog.component';
import { AtencionComercialService } from '../../../atencionesComerciales/services/atencionComercial.service';

describe('VerDetalleDialogComponent', () => {
  let component: VerDetalleDialogComponent;
  let fixture: ComponentFixture<VerDetalleDialogComponent>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<VerDetalleDialogComponent>>;

  const mockData: VerDetalleDialogData = { codigoEmpresa: '10', codigoAtencion: 'AT-1' };

  beforeEach(async () => {
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    const atencionServiceSpy = jasmine.createSpyObj('AtencionComercialService', ['listarAcciones', 'obtenerInfoTecnica']);
    atencionServiceSpy.listarAcciones.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [VerDetalleDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: mockData },
        { provide: AtencionComercialService, useValue: atencionServiceSpy }
      ]
    }).compileComponents();

    dialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<VerDetalleDialogComponent>>;

    fixture = TestBed.createComponent(VerDetalleDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crear el componente con los datos recibidos', () => {
    expect(component).toBeTruthy();
    expect(component.data).toEqual(mockData);
  });

  it('cerrar debería cerrar el diálogo', () => {
    component.cerrar();
    expect(dialogRef.close).toHaveBeenCalled();
  });
});
