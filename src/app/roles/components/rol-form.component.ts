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
import { RolService } from '../services/rol.service';
import { Rol, RolCreateRequest, RolUpdateRequest } from '../models/rol.model';

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
  templateUrl: './rol-form.component.html',
  styleUrl: './rol-form.component.scss'
})
export class RolFormComponent implements OnInit {
    form: FormGroup;
    isEditMode: boolean;

      constructor(
        private fb: FormBuilder,
        private rolService: RolService,
        private snackBar: MatSnackBar,
        public dialogRef: MatDialogRef<RolFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { mode: string; rol?: Rol }
      ) {
        this.isEditMode = data.mode === 'edit';
        this.form = this.fb.group({
          codigoRol: ['', [Validators.required, Validators.minLength(4)]],
          responsableRol: ['', [Validators.required, Validators.minLength(3)]],
          descripcionRol: ['', [Validators.required, Validators.minLength(5)]],
          estado: [true]
        });
      }

      ngOnInit(): void {
        if (this.isEditMode && this.data.rol) {
          this.form.patchValue({
            codigoRol: this.data.rol.codigoRol,
            responsableRol: this.data.rol.responsableRol || '',
            descripcionRol: this.data.rol.descripcionRol || '',
            estado: this.data.rol.estado === '1' ? true : false
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
        const request: RolCreateRequest = {
          codigoRol: this.form.value.codigoRol,
          responsableRol: this.form.value.responsableRol,
          descripcionRol: this.form.value.descripcionRol,
          estado: this.form.value.estado === true ? '1' : '0',
          usuarioCreacion: 'admin'
        };

        this.rolService.crear(request).subscribe({
          next: () => {
            this.snackBar.open('Rol creado correctamente', 'Cerrar', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (error) => {
            const mensaje = error.error?.message || 'Error al crear rol';
            this.snackBar.open(mensaje, 'Cerrar', { duration: 5000 });
          }
        });
      }

      actualizar(): void {
        const fechaFeriado = new Date(this.form.value.fechaFeriado);

        const request: RolUpdateRequest = {
          id: this.data.rol!.id!,
          codigoRol: this.form.value.codigoRol,
          responsableRol: this.form.value.responsableRol,
          descripcionRol: this.form.value.descripcionRol,
          estado: this.form.value.estado === true ? '1' : '0',
          usuarioModificacion: 'admin'
        };

        this.rolService.editar(request).subscribe({
          next: () => {
            this.snackBar.open('Rol actualizado correctamente', 'Cerrar', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (error) => {
            const mensaje = error.error?.message || 'Error al actualizar rol';
            this.snackBar.open(mensaje, 'Cerrar', { duration: 5000 });
          }
        });
      }

      cancelar(): void {
        this.dialogRef.close();
      }

      get codigoInvalido(): boolean {
        const control = this.form.get('codigoFeriado');
        return !!(control && control.invalid && control.touched);
      }
}
