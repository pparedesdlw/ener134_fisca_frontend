import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PeriodoService } from '../services/periodo.service';
import { Periodo, PeriodoCreateRequest, PeriodoUpdateRequest } from '../models/periodo.model';

@Component({
  selector: 'app-periodo-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule
  ],
  templateUrl: './periodo-form.component.html',
  styleUrl: './periodo-form.component.scss'
})
export class PeriodoFormComponent implements OnInit {
  form: FormGroup;
  isEditMode: boolean;

  constructor(
    private fb: FormBuilder,
    private periodoService: PeriodoService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<PeriodoFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: string; periodo?: Periodo }
  ) {
    this.isEditMode = data.mode === 'edit';
    this.form = this.fb.group({
      codigoPeriodo: ['', [Validators.required, Validators.pattern(/^\d{4}-T[1-4]$/)]],
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
      estadoActivo: [true]
    }, { validators: this.fechasValidValidator });
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.periodo) {
      this.form.patchValue({
        codigoPeriodo: this.data.periodo.codigoPeriodo,
        fechaInicio: this.data.periodo.fechaInicio,
        fechaFin: this.data.periodo.fechaFin,
        estadoActivo: this.data.periodo.estadoActivo
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
    const fechaInicio = new Date(this.form.value.fechaInicio);
    const fechaFin = new Date(this.form.value.fechaFin);
    
    const request: PeriodoCreateRequest = {
      codigoPeriodo: this.form.value.codigoPeriodo,
      fechaInicio: this.formatearFecha(fechaInicio),
      fechaFin: this.formatearFecha(fechaFin),
      estadoActivo: this.form.value.estadoActivo,
      usuarioCreacion: 'admin'
    };

    this.periodoService.crear(request).subscribe({
      next: () => {
        this.snackBar.open('Periodo creado correctamente', 'Cerrar', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (error) => {
        const mensaje = error.error?.message || 'Error al crear periodo';
        this.snackBar.open(mensaje, 'Cerrar', { duration: 5000 });
      }
    });
  }

  actualizar(): void {
    const fechaInicio = new Date(this.form.value.fechaInicio);
    const fechaFin = new Date(this.form.value.fechaFin);
    
    const request: PeriodoUpdateRequest = {
      id: this.data.periodo!.id!,
      codigoPeriodo: this.form.value.codigoPeriodo,
      fechaInicio: this.formatearFecha(fechaInicio),
      fechaFin: this.formatearFecha(fechaFin),
      estadoActivo: this.form.value.estadoActivo,
      usuarioModificacion: 'admin'
    };

    this.periodoService.editar(request).subscribe({
      next: () => {
        this.snackBar.open('Periodo actualizado correctamente', 'Cerrar', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (error) => {
        const mensaje = error.error?.message || 'Error al actualizar periodo';
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

  private fechasValidValidator(group: FormGroup): {[key: string]: any} | null {
    const fechaInicio = group.get('fechaInicio')?.value;
    const fechaFin = group.get('fechaFin')?.value;
    
    if (fechaInicio && fechaFin) {
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      
      if (fin < inicio) {
        return { 'fechasInvalidas': true };
      }
    }
    return null;
  }

  get codigoInvalido(): boolean {
    const control = this.form.get('codigoPeriodo');
    return !!(control && control.invalid && control.touched);
  }

  get fechasInvalidas(): boolean {
    return this.form.hasError('fechasInvalidas') && this.form.touched;
  }
}
