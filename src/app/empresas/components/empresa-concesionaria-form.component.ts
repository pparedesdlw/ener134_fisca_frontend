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
import { EmpresaConcesionariaService } from '../services/empresa-concesionaria.service';
import { EmpresaConcesionaria, EmpresaConcesionariaCreateRequest, EmpresaConcesionariaUpdateRequest } from '../models/empresa-concesionaria.model';

@Component({
  selector: 'app-empresa-concesionaria-form',
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
  templateUrl: './empresa-concesionaria-form.component.html',
  styleUrl: './empresa-concesionaria-form.component.scss'
})
export class EmpresaConcesionariaFormComponent implements OnInit {
      form: FormGroup;
      isEditMode: boolean;

      constructor(
        private fb: FormBuilder,
        private empresaConcesionariaService: EmpresaConcesionariaService,
        private snackBar: MatSnackBar,
        public dialogRef: MatDialogRef<EmpresaConcesionariaFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { mode: string; empresaConcesionaria?: EmpresaConcesionaria }
      ) {
        this.isEditMode = data.mode === 'edit';
        this.form = this.fb.group({
          codigoEmpresa: ['', [Validators.required, Validators.pattern("^[a-zA-Z]*$"), Validators.maxLength(4)]],
          razonSocial: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9 .()/\&$]*$'), Validators.minLength(5)]],
          ruc: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.maxLength(11)]],
          tipo: ['', [Validators.required]],
          descripcion: ['', [Validators.pattern('^[a-zA-Z0-9 .()/\&$]*$')]],
          estado: [true]
        });
      }

      sRazonSocialAnt: string = '';

      ngOnInit(): void {
        if (this.isEditMode && this.data.empresaConcesionaria) {
          this.form.get('codigoEmpresa')?.disable();
          this.form.get('ruc')?.disable();
          this.sRazonSocialAnt = this.data.empresaConcesionaria.razonSocial!;
          this.form.patchValue({
            codigoEmpresa: this.data.empresaConcesionaria.codigoEmpresa,
            razonSocial: this.data.empresaConcesionaria.razonSocial || '',
            descripcion: this.data.empresaConcesionaria.descripcion || '',
            ruc: this.data.empresaConcesionaria.ruc || '',
            tipo: this.data.empresaConcesionaria.tipo || '',
            estado: this.data.empresaConcesionaria.estado === '1' ? true : false
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
        const request: EmpresaConcesionariaCreateRequest = {
          codigoEmpresa: this.form.value.codigoEmpresa,
          razonSocial: this.form.value.razonSocial,
          descripcion: this.form.value.descripcion,
          tipo: this.form.value.tipo,
          ruc: this.form.value.ruc,
          estado: this.form.value.estado === true ? '1' : '0',
          usuarioCreacion: 'admin'
        };

        this.empresaConcesionariaService.crear(request).subscribe({
          next: () => {
            this.snackBar.open('Empresa concesionaria creada correctamente', 'Cerrar', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (error) => {
            const mensaje = error.error?.message || 'Error al crear empresa concesionaria';
            this.snackBar.open(mensaje, 'Cerrar', { duration: 5000 });
          }
        });
      }

      actualizar(): void {
        
        const request: EmpresaConcesionariaUpdateRequest = {
          id: this.data.empresaConcesionaria!.id!,
          codigoEmpresa: this.form.get('codigoEmpresa')?.value,
          razonSocial: this.form.value.razonSocial,
          razonSocialAnt: this.sRazonSocialAnt,
          descripcion: this.form.value.descripcion,
          tipo: this.form.value.tipo,
          ruc: this.form.get('ruc')?.value,
          estado: this.form.value.estado === true ? '1' : '0',
          usuarioModificacion: 'admin'
        };
        
        this.empresaConcesionariaService.editar(request).subscribe({
          next: () => {
            this.snackBar.open('Empresa concesionaria actualizada correctamente', 'Cerrar', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (error) => {
            const mensaje = error.error?.message || 'Error al actualizar empresa concesionaria';
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
