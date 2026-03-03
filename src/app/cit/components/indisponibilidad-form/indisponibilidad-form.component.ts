import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CitService } from '../../services/cit.service';

@Component({
  selector: 'app-indisponibilidad-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './indisponibilidad-form.component.html',
  styleUrl: './indisponibilidad-form.component.scss'
})
export class IndisponibilidadFormComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private citService: CitService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<IndisponibilidadFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: string }
  ) {
    this.form = this.fb.group({
      fechaInicio: ['', [Validators.required]],
      fechaFin: ['', [Validators.required]],
      motivo: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]]
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.snackBar.open('Por favor complete todos los campos', 'Cerrar', { duration: 3000 });
      return;
    }

    const fechaInicio = this.form.value.fechaInicio;
    const fechaFin = this.form.value.fechaFin;

    if (new Date(fechaFin) <= new Date(fechaInicio)) {
      this.snackBar.open('La fecha fin debe ser posterior a la fecha inicio', 'Cerrar', { duration: 3000 });
      return;
    }

    const request = {
      fechaInicioIndisponibilidad: this.formatearFechaParaBackend(fechaInicio),
      fechaFinIndisponibilidad: this.formatearFechaParaBackend(fechaFin),
      motivo: this.form.value.motivo,
      estado: 'Activo'
    };

    this.citService.registrarIndisponibilidad(request).subscribe({
      next: () => {
        this.snackBar.open('Indisponibilidad registrada correctamente', 'Cerrar', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (error) => {
        const errorMsg = error.error?.message || error.message || 'Error al registrar la indisponibilidad';
        this.snackBar.open(errorMsg, 'Cerrar', { duration: 5000 });
        console.error(error);
      }
    });
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }

  /**
   * Convierte "2026-01-15T08:30" (datetime-local) a "2026-01-15T08:30:00"
   */
  private formatearFechaParaBackend(fechaLocal: string): string {
    if (!fechaLocal) return '';
    return fechaLocal.length === 16 ? fechaLocal + ':00' : fechaLocal;
  }
}
