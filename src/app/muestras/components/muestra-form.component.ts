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
import { MuestraService } from '../services/muestra.service';
import { Muestra, MuestraCreateRequest, MuestraUpdateRequest } from '../models/muestra.model';

@Component({
  selector: 'app-muestra-form',
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
  templateUrl: './muestra-form.component.html',
  styleUrl: './muestra-form.component.scss'
})
export class MuestraFormComponent implements OnInit {
    form: FormGroup;
    isEditMode: boolean;
    
      constructor(
        private fb: FormBuilder,
        private muestraService: MuestraService,
        private snackBar: MatSnackBar,
        public dialogRef: MatDialogRef<MuestraFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { mode: string; muestra?: Muestra }
      ) {
        this.isEditMode = data.mode === 'edit';
        this.form = this.fb.group({
          codigoMuestra: ['', [Validators.required, Validators.minLength(1)]],
          muestra: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(1)]],
          confianza: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(1)]],
          error: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(1)]],
          estado: [true]
        });
      }
    
      ngOnInit(): void {
        if (this.isEditMode && this.data.muestra) {
          this.form.patchValue({
            codigoMuestra: this.data.muestra.codigoMuestra,
            muestra: this.data.muestra.muestra,
            confianza: this.data.muestra.confianza,
            error: this.data.muestra.error,
            estado: this.data.muestra.estado === '1' ? true : false
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
        const request: MuestraCreateRequest = {
          codigoMuestra: this.form.value.codigoMuestra,
          muestra: this.form.value.muestra,
          confianza: this.form.value.confianza,
          error: this.form.value.error,
          estado: this.form.value.estado === true ? '1' : '0',
          usuarioCreacion: 'admin'
        };
    
        this.muestraService.crear(request).subscribe({
          next: () => {
            this.snackBar.open('Muestra creada correctamente', 'Cerrar', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (error) => {
            const mensaje = error.error?.message || 'Error al crear muestra';
            this.snackBar.open(mensaje, 'Cerrar', { duration: 5000 });
          }
        });
      }
    
      actualizar(): void {        
        const fechaFeriado = new Date(this.form.value.fechaFeriado);

        const request: MuestraUpdateRequest = {
          id: this.data.muestra!.id!,
          codigoMuestra: this.form.value.codigoMuestra,
          muestra: this.form.value.muestra,
          confianza: this.form.value.confianza,
          error: this.form.value.error,
          estado: this.form.value.estado === true ? '1' : '0',
          usuarioModificacion: 'admin'
        };
    
        this.muestraService.editar(request).subscribe({
          next: () => {
            this.snackBar.open('Muestra actualizada correctamente', 'Cerrar', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (error) => {
            const mensaje = error.error?.message || 'Error al actualizar muestra';
            this.snackBar.open(mensaje, 'Cerrar', { duration: 5000 });
          }
        });
      }

      cancelar(): void {
        this.dialogRef.close();
      }
    
      get codigoInvalido(): boolean {
        const control = this.form.get('codigoMuestra');
        return !!(control && control.invalid && control.touched);
      }
}