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
import { ResponsableService } from '../services/responsable.service';
import { Responsable, ResponsableCreateRequest, ResponsableUpdateRequest } from '../models/responsable.model';

@Component({
  selector: 'app-responsable-form',
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
  templateUrl: './responsable-form.component.html',
  styleUrl: './responsable-form.component.scss'
})
export class ResponsableFormComponent implements OnInit {
    form: FormGroup;
    isEditMode: boolean;
    
      constructor(
        private fb: FormBuilder,
        private responsableService: ResponsableService,
        private snackBar: MatSnackBar,
        public dialogRef: MatDialogRef<ResponsableFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { mode: string; responsable?: Responsable }
      ) {
        this.isEditMode = data.mode === 'edit';
        this.form = this.fb.group({
          codigoResponsable: ['', [Validators.required, Validators.maxLength(4)]],
          nombreResponsable: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}'), Validators.minLength(1)]],
          codigoEmpresa: ['', [Validators.required, Validators.pattern("^[a-zA-Z0-9-ZáéíóúÁÉÍÓÚñÑ@.\\s]*$"), Validators.minLength(4)]],
          estado: [true]
        });
      }
    
      ngOnInit(): void {
        if (this.isEditMode && this.data.responsable) {
          this.form.get('codigoResponsable')?.disable();
          this.form.get('nombreResponsable')?.disable();
          this.form.patchValue({
            codigoResponsable: this.data.responsable.codigoResponsable,
            nombreResponsable: this.data.responsable.nombreResponsable,
            codigoEmpresa: this.data.responsable.codigoEmpresa,
            estado: this.data.responsable.estado === '1' ? true : false
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
        const request: ResponsableCreateRequest = {
          codigoResponsable: this.form.value.codigoResponsable,
          nombreResponsable: this.form.value.nombreResponsable,
          codigoEmpresa: this.form.value.codigoEmpresa,
          estado: this.form.value.estado === true ? '1' : '0',
          usuarioCreacion: 'admin'
        };
    
        this.responsableService.crear(request).subscribe({
          next: () => {
            this.snackBar.open('Responsable creado correctamente', 'Cerrar', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (error) => {
            const mensaje = error.error?.message || 'Error al crear responsable';
            this.snackBar.open(mensaje, 'Cerrar', { duration: 5000 });
          }
        });
      }
    
      actualizar(): void {        
        const fechaFeriado = new Date(this.form.value.fechaFeriado);

        const request: ResponsableUpdateRequest = {
          id: this.data.responsable!.id!,
          codigoResponsable: this.form.get('codigoResponsable')?.value,
          nombreResponsable: this.form.get('nombreResponsable')?.value,
          codigoEmpresa: this.form.value.codigoEmpresa,
          estado: this.form.value.estado === true ? '1' : '0',
          usuarioModificacion: 'admin'
        };
    
        this.responsableService.editar(request).subscribe({
          next: () => {
            this.snackBar.open('Responsable actualizado correctamente', 'Cerrar', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (error) => {
            const mensaje = error.error?.message || 'Error al actualizar responsable';
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