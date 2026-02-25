import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ParametroService } from '../services/parametro.service';
import { Parametro, ParametroCreateRequest, ParametroUpdateRequest } from '../models/parametro.model';

@Component({
  selector: 'app-rol-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule
  ],
  templateUrl: './parametro-form.component.html',
  styleUrl: './parametro-form.component.scss'
})
export class ParametroFormComponent implements OnInit {
    form: FormGroup;
    isEditMode: boolean;

      constructor(
        private fb: FormBuilder,
        private parametroService: ParametroService,
        private snackBar: MatSnackBar,
        public dialogRef: MatDialogRef<ParametroFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { mode: string; parametro?: Parametro }
      ) {
        this.isEditMode = data.mode === 'edit';
        this.form = this.fb.group({
          codigoParametro: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.maxLength(4)]],
          descripcionParametro: ['', [Validators.required, Validators.minLength(5)]],
          valor: ['', [Validators.required, Validators.minLength(1)]],
          tipoParametro: ['', [Validators.required]],
          estado: [true]
        });
      }

      ngOnInit(): void {
        if (this.isEditMode && this.data.parametro) {
          this.form.get('codigoParametro')?.disable();
          this.form.get('descripcionParametro')?.disable();
          this.form.patchValue({
            codigoParametro: this.data.parametro.codigoParametro,
            descripcionParametro: this.data.parametro.descripcionParametro,
            valor: this.data.parametro.valor,
            tipoParametro: this.data.parametro.tipoParametro,
            estado: this.data.parametro.estado === '1' ? true : false
          });
        }
      }

      guardar(): void {
        if (this.form.invalid) {
          this.snackBar.open('Por favor complete todos los campos', 'Cerrar', { duration: 3000 });
          return;
        }

        if (this.isEditMode) {
          this.actualizar();
        } else {
          this.crear();
        }
      }

      crear(): void {
        const request: ParametroCreateRequest = {
          codigoParametro: this.form.value.codigoParametro,
          descripcionParametro: this.form.value.descripcionParametro,
          valor: this.form.value.valor,
          tipoParametro: this.form.value.tipoParametro,
          estado: this.form.value.estado === true ? '1' : '0',
          usuarioCreacion: 'admin'
        };

        this.parametroService.crear(request).subscribe({
          next: () => {
            this.snackBar.open('Parámetro creado correctamente', 'Cerrar', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (error) => {
            const mensaje = error.error?.message || 'Error al crear parámetro';
            this.snackBar.open(mensaje, 'Cerrar', { duration: 5000 });
          }
        });
      }

      actualizar(): void {
        const fechaFeriado = new Date(this.form.value.fechaFeriado);

        const request: ParametroUpdateRequest = {
          id: this.data.parametro!.id!,
          codigoParametro: this.form.get('codigoParametro')?.value,
          descripcionParametro: this.form.get('descripcionParametro')?.value,
          valor: this.form.value.valor,
          tipoParametro: this.form.value.tipoParametro,
          estado: this.form.value.estado === true ? '1' : '0',
          usuarioModificacion: 'admin'
        };

        this.parametroService.editar(request).subscribe({
          next: () => {
            this.snackBar.open('Parámetro actualizado correctamente', 'Cerrar', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (error) => {
            const mensaje = error.error?.message || 'Error al actualizar parámetro';
            this.snackBar.open(mensaje, 'Cerrar', { duration: 5000 });
          }
        });
      }

      cancelar(): void {
        this.dialogRef.close();
      }

      get codigoInvalido(): boolean {
        const control = this.form.get('codigoParametro');
        return !!(control && control.invalid && control.touched);
      }
}
