import { Component, Inject, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EvaluacionAivService } from '../../services/evaluacionAiv.service';
import { EvaluacionAivConsolidadaResponse } from '../../models/evaluacionAiv.model';

export interface ConfirmarReaperturaDialogData {
  evaluacion: EvaluacionAivConsolidadaResponse;
  usuario: string;
}

/** RF09, tipos de reapertura previstos por el ERS (ej. "Corrección de evaluación"); no hay catálogo aprobado, se centralizan aquí. */
const TIPOS_REAPERTURA = [
  'Corrección de evaluación',
  'Error en registro de datos',
  'Solicitud de reevaluación',
  'Otro'
];

/** RF09: ventana emergente de reapertura — motivo, tipo de reapertura y sustento, todos obligatorios. */
@Component({
  selector: 'app-confirmar-reapertura-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatSelectModule
  ],
  templateUrl: './confirmar-reapertura-dialog.component.html',
  styleUrl: './confirmar-reapertura-dialog.component.scss'
})
export class ConfirmarReaperturaDialogComponent {
  private service = inject(EvaluacionAivService);
  private snack = inject(MatSnackBar);

  tiposReapertura = TIPOS_REAPERTURA;
  motivo = '';
  tipoReapertura: string | null = null;
  archivoSustento: File | null = null;
  guardando = signal<boolean>(false);

  constructor(
    public dialogRef: MatDialogRef<ConfirmarReaperturaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmarReaperturaDialogData
  ) {}

  onArchivoSeleccionado(ev: Event): void {
    const archivos = (ev.target as HTMLInputElement).files;
    this.archivoSustento = archivos && archivos.length > 0 ? archivos[0] : null;
  }

  reabrir(): void {
    if (!this.motivo.trim()) {
      this.snack.open('El motivo de reapertura es obligatorio', 'Cerrar', { duration: 4000 });
      return;
    }
    if (!this.tipoReapertura) {
      this.snack.open('El tipo de reapertura es obligatorio', 'Cerrar', { duration: 4000 });
      return;
    }
    if (!this.archivoSustento) {
      this.snack.open('El sustento es obligatorio para reabrir la evaluación', 'Cerrar', { duration: 4000 });
      return;
    }

    const archivo = this.archivoSustento;
    const motivo = this.motivo.trim();
    const tipoReapertura = this.tipoReapertura;
    this.guardando.set(true);
    const lector = new FileReader();
    lector.onload = () => {
      const base64 = (lector.result as string).split(',')[1];
      this.service.reabrir({
        idEvaluacionAiv: this.data.evaluacion.id,
        motivo,
        tipoReapertura,
        nombreArchivoSustento: archivo.name,
        tipoMimeSustento: archivo.type,
        contenidoSustentoBase64: base64,
        usuario: this.data.usuario
      }).subscribe({
        next: () => {
          this.guardando.set(false);
          this.snack.open('Evaluación reabierta', 'Cerrar', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.guardando.set(false);
          this.snack.open(err?.error?.message ?? 'Error al reabrir la evaluación', 'Cerrar', { duration: 4000 });
        }
      });
    };
    lector.readAsDataURL(archivo);
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
