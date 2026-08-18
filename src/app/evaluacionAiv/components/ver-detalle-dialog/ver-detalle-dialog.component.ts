import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { AccionesAtencionComponent } from '../../../atencionesComerciales/components/acciones-atencion/acciones-atencion.component';

export interface VerDetalleDialogData {
  codigoEmpresa: string;
  codigoAtencion: string;
}

/** RF03: reutiliza el detalle de acciones de Fase 1 (Atención Comercial) para el botón "Ver detalle". */
@Component({
  selector: 'app-ver-detalle-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, AccionesAtencionComponent],
  templateUrl: './ver-detalle-dialog.component.html'
})
export class VerDetalleDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<VerDetalleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: VerDetalleDialogData
  ) {}

  cerrar(): void {
    this.dialogRef.close();
  }
}
