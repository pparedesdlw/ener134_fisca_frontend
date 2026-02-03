import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PeriodoService } from '../services/periodo.service';
import { Periodo } from '../models/periodo.model';

@Component({
  selector: 'app-ampliar-vigencia-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <h2 mat-dialog-title>Ampliar Vigencia (CUS007) - {{data.periodo.codigoPeriodo}}</h2>

    <mat-dialog-content>
      <div class="info-box">
        <p><strong>Periodo:</strong> {{data.periodo.descripcion}}</p>
        <p><strong>Fecha Fin Actual:</strong> {{data.periodo.fechaFin}}</p>
        <p><strong>Días Restantes:</strong> {{data.periodo.diasRestantes}}</p>
      </div>
      
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nueva Fecha Fin</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="fechaAmpliacion">
          <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
          <mat-hint>Máximo 90 días desde la fecha fin actual</mat-hint>
          <mat-error *ngIf="form.get('fechaAmpliacion')?.hasError('required')">
            La fecha de ampliación es requerida
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Sustento de Ampliación</mat-label>
          <textarea matInput 
                    formControlName="sustentoAmpliacion" 
                    rows="5"
                    placeholder="Ingrese el motivo detallado de la ampliación (mínimo 50 caracteres)"></textarea>
          <mat-hint align="end">
            {{form.get('sustentoAmpliacion')?.value?.length || 0}} / 50 caracteres mínimo
          </mat-hint>
          <mat-error *ngIf="form.get('sustentoAmpliacion')?.hasError('required')">
            El sustento es requerido
          </mat-error>
          <mat-error *ngIf="form.get('sustentoAmpliacion')?.hasError('minlength')">
            El sustento debe tener al menos 50 caracteres (CUS007)
          </mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="cancelar()">Cancelar</button>
      <button mat-raised-button color="primary" (click)="ampliar()" [disabled]="form.invalid">
        Ampliar Vigencia
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 15px;
    }
    mat-dialog-content {
      min-width: 500px;
    }
    .info-box {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 4px;
      margin-bottom: 20px;
    }
    .info-box p {
      margin: 5px 0;
    }
  `]
})
export class AmpliarVigenciaDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private periodoService: PeriodoService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<AmpliarVigenciaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { periodo: Periodo }
  ) {
    this.form = this.fb.group({
      fechaAmpliacion: ['', Validators.required],
      sustentoAmpliacion: ['', [Validators.required, Validators.minLength(50)]]
    });
  }

  ampliar(): void {
    if (this.form.invalid) {
      this.snackBar.open('Por favor complete todos los campos correctamente', 'Cerrar', { duration: 3000 });
      return;
    }

    const fechaAmpliacion = new Date(this.form.value.fechaAmpliacion);
    const fechaFormateada = this.formatearFecha(fechaAmpliacion);

    const request = {
      id: this.data.periodo.id!,
      nuevaFechaFin: fechaFormateada,
      sustentoAmpliacion: this.form.value.sustentoAmpliacion,
      usuarioModificacion: 'admin'
    };

    this.periodoService.ampliarVigencia(request).subscribe({
      next: () => {
        this.snackBar.open('Vigencia ampliada correctamente (CUS007)', 'Cerrar', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (error) => {
        const mensaje = error.error?.message || 'Error al ampliar vigencia';
        this.snackBar.open(mensaje, 'Cerrar', { duration: 5000 });
      }
    });
  }

  private formatearFecha(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
