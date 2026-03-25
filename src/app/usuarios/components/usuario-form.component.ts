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
import { UsuarioService } from '../services/usuario.service';
import { RolService } from '../../roles/services/rol.service';
import { Observable } from 'rxjs';
import { Usuario, UsuarioCreateRequest, UsuarioUpdateRequest } from '../models/usuario.model';
import { Rol } from '../../roles/models/rol.model';

@Component({
  selector: 'app-usuario-form',
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
  templateUrl: './usuario-form.component.html',
  styleUrl: './usuario-form.component.scss'
})
export class UsuarioFormComponent implements OnInit {
    form: FormGroup;
    isEditMode: boolean;

    optionsRol$!: Observable<Rol[]>;
    selectedRolOption: string = '';

      constructor(
        private rolService: RolService,
        private fb: FormBuilder,
        private usuarioService: UsuarioService,
        private snackBar: MatSnackBar,
        public dialogRef: MatDialogRef<UsuarioFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { mode: string; usuario?: Usuario }
      ) {
        this.isEditMode = data.mode === 'edit';
        this.form = this.fb.group({
          codigoUsuario: ['', [Validators.required, Validators.minLength(4)]],
          nombreUsuario: ['', [Validators.required, Validators.minLength(5)]],
          nombres: ['', [Validators.required, Validators.minLength(5)]],
          apellidos: ['', [Validators.required, Validators.minLength(5)]],
          email: ['', [Validators.required, Validators.pattern("^[a-zA-Z0-9-ZñÑ@.\\s]*$"), Validators.email]],
          telefono: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(9)]],
          perfil: [null]
        });

      }
    
      ngOnInit(): void {
        this.optionsRol$ = this.rolService.listarTodos();

        if (this.isEditMode && this.data.usuario) {
          this.form.patchValue({
            codigoUsuario: this.data.usuario.codigoUsuario,
            nombreUsuario: this.data.usuario.nombreUsuario || '',
            nombres: this.data.usuario.nombres || '',
            apellidos: this.data.usuario.apellidos || '',
            email: this.data.usuario.email || '',
            telefono: this.data.usuario.telefono || '',
            perfil: Number(this.data.usuario.perfil)
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
        const request: UsuarioCreateRequest = {
          codigoUsuario: this.form.value.codigoUsuario,
          nombreUsuario: this.form.value.nombreUsuario,
          nombres: this.form.value.nombres,
          apellidos: this.form.value.apellidos,
          email: this.form.value.email,
          telefono: this.form.value.telefono,
          perfil: this.form.value.perfil,
          usuarioCreacion: 'admin'
        };
    
        this.usuarioService.crear(request).subscribe({
          next: () => {
            this.snackBar.open('Usuario creado correctamente', 'Cerrar', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (error) => {
            const mensaje = error.error?.message || 'Error al crear usuario';
            this.snackBar.open(mensaje, 'Cerrar', { duration: 5000 });
          }
        });
      }
    
      actualizar(): void {        
        const fechaFeriado = new Date(this.form.value.fechaFeriado);

        const request: UsuarioUpdateRequest = {
          id: this.data.usuario!.id!,
          codigoUsuario: this.form.value.codigoUsuario,
          nombreUsuario: this.form.value.nombreUsuario,
          nombres: this.form.value.nombres,
          apellidos: this.form.value.apellidos,
          email: this.form.value.email,
          telefono: this.form.value.telefono,
          perfil: this.form.value.perfil,
          usuarioModificacion: 'admin'
        };
    
        this.usuarioService.editar(request).subscribe({
          next: () => {
            this.snackBar.open('Usuario actualizado correctamente', 'Cerrar', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (error) => {
            const mensaje = error.error?.message || 'Error al actualizar usuario';
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