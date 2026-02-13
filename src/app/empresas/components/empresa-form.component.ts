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
import { EmpresaService } from '../services/empresa.service';
import { Empresa, EmpresaCreateRequest, EmpresaUpdateRequest } from '../models/empresa.model';

@Component({
  selector: 'app-empresa-form',
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
  templateUrl: './empresa-form.component.html',
  styleUrl: './empresa-form.component.scss'
})
export class EmpresaFormComponent implements OnInit {
      form: FormGroup;
      isEditMode: boolean;
    
      constructor(
        private fb: FormBuilder,
        private empresaService: EmpresaService,
        private snackBar: MatSnackBar,
        public dialogRef: MatDialogRef<EmpresaFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { mode: string; empresa?: Empresa }
      ) {
        this.isEditMode = data.mode === 'edit';
        this.form = this.fb.group({
          codigoEmpresa: ['', [Validators.required, Validators.minLength(6)]],
          razonSocial: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9 .()/\&$]*$'), Validators.minLength(5)]],
          ruc: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.maxLength(11)]],
          region: ['', [Validators.required]],
          tipo: ['', [Validators.required]],
          descripcion: [''],
          estado: [true]
        });
      }
    
      ngOnInit(): void {
        if (this.isEditMode && this.data.empresa) {
          this.form.patchValue({
            codigoEmpresa: this.data.empresa.codigoEmpresa,
            razonSocial: this.data.empresa.razonSocial || '',
            descripcion: this.data.empresa.descripcion || '',
            ruc: this.data.empresa.ruc || '',
            region: this.data.empresa.region || '',
            tipo: this.data.empresa.tipo || '',
            estado: this.data.empresa.estado === '1' ? true : false
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
        
        const request: EmpresaCreateRequest = {
          codigoEmpresa: this.form.value.codigoEmpresa,
          razonSocial: this.form.value.razonSocial,
          descripcion: this.form.value.descripcion,
          tipo: this.form.value.tipo,
          ruc: this.form.value.ruc,
          region: this.form.value.region,
          estado: this.form.value.estado === true ? '1' : '0',
          usuarioCreacion: 'admin'
        };
    
        this.empresaService.crear(request).subscribe({
          next: () => {
            this.snackBar.open('Empresa creada correctamente', 'Cerrar', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (error) => {
            const mensaje = error.error?.message || 'Error al crear empresa';
            this.snackBar.open(mensaje, 'Cerrar', { duration: 5000 });
          }
        });
      }
    
      actualizar(): void {        
        const request: EmpresaUpdateRequest = {
          id: this.data.empresa!.id!,
          codigoEmpresa: this.form.value.codigoEmpresa,
          razonSocial: this.form.value.razonSocial,
          descripcion: this.form.value.descripcion,
          tipo: this.form.value.tipo,
          ruc: this.form.value.ruc,
          region: this.form.value.region,
          estado: this.form.value.estado === true ? '1' : '0',
          usuarioModificacion: 'admin'
        };
    
        this.empresaService.editar(request).subscribe({
          next: () => {
            this.snackBar.open('Empresa actualizada correctamente', 'Cerrar', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (error) => {
            const mensaje = error.error?.message || 'Error al actualizar empresa';
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
    
      get codigoInvalido(): boolean {
        const control = this.form.get('codigoEmpresa');
        return !!(control && control.invalid && control.touched);
      }
    
}