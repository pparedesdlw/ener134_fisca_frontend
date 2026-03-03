import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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
import { FeriadoService } from '../services/feriado.service';
import { Observable } from 'rxjs';
import { MatSelectChange } from '@angular/material/select';
import { Feriado, FeriadoCreateRequest, FeriadoUpdateRequest } from '../models/feriado.model';
import { Departamento } from '../../ubigeos/models/departamento.model';
import { DepartamentoService } from '../../ubigeos/services/departamento.service';
import { Provincia } from '../../ubigeos/models/provincia.model';
import { ProvinciaService } from '../../ubigeos/services/provincia.service';
import { Distrito } from '../../ubigeos/models/distrito.model';
import { DistritoService } from '../../ubigeos/services/distrito.service';
import { AnyCatcher } from 'rxjs/internal/AnyCatcher';

@Component({
  selector: 'app-feriado-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
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
  templateUrl: './feriado-form.component.html',
  styleUrl: './feriado-form.component.scss'
})
export class FeriadoFormComponent implements OnInit {
    form: FormGroup;
    isEditMode: boolean;

      optionsDepartamento$!: Observable<Departamento[]>;
      selectedDepartamentoOption: string = '';

      optionsProvincia$!: Observable<Provincia[]>;
      selectedProvinciaOption: string = '';

      optionsDistrito$!: Observable<Distrito[]>;
      selectedDistritoOption: string = '';

      rango = new FormGroup({
        fechaFeriadoIni: new FormControl<Date | null>(null), 
        fechaFeriadoFin: new FormControl<Date | null>(null)
      });

      constructor(
        private departamentoService: DepartamentoService,
        private provinciaService: ProvinciaService,
        private distritoService: DistritoService,
        private fb: FormBuilder,
        private feriadoService: FeriadoService,
        private snackBar: MatSnackBar,
        public dialogRef: MatDialogRef<FeriadoFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { mode: string; feriado?: Feriado }
      ) {
        this.isEditMode = data.mode === 'edit';

        this.form = this.fb.group({
          rango: this.fb.group({
            fechaFeriadoIni: [null], 
            fechaFeriadoFin: [null]
          }),
          departamento: [''],
          provincia: [''],
          distrito: [''],
          descripcionFeriado: ['', [Validators.required, Validators.minLength(5)]],
          tipoFeriado: ['', [Validators.required]],
          estado: [true]
        });
      }

      ngOnInit(): void {
        this.optionsDepartamento$ = this.departamentoService.listarTodos();

        if (this.isEditMode && this.data.feriado) {
          
          this.rango.disable();

          let sCodRegion = this.data.feriado.codigoRegion;

          let sCodDepart = "";
          let sCodProvin = "";
          let sCodDistri = "";
          if (sCodRegion!.length <= 6){
              sCodDepart = sCodRegion?.substring(0,2)!;
              sCodProvin = sCodRegion?.substring(2,4)!;
              sCodDistri = sCodRegion?.slice(-2)!;
              this.onItemChangeDepartamento({value: sCodDepart});
              this.onItemChangeProvincia({value: sCodProvin});
              this.onItemChangeDistrito({value: sCodDistri});
          }
          
          this.form.patchValue({
            departamento: sCodDepart!,
            provincia: sCodProvin!,
            distrito: sCodDistri!,
            descripcionFeriado: this.data.feriado.descripcionFeriado || '',
            tipoFeriado: this.data.feriado.tipoFeriado || '',
            estado: this.data.feriado.estado === '1' ? true : false
          });
              
          const fechaIni = this.parsearFecha(this.data.feriado.fechaFeriadoIni);
          const fechaFin = this.parsearFecha(this.data.feriado.fechaFeriadoFin);

          this.rango.patchValue({
            fechaFeriadoIni: fechaIni,
            fechaFeriadoFin: fechaFin
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

      onItemChangeDepartamento(event: any) {
        let sDepartamento = this.validateString(this.validateString(event.value));
        this.selectedDepartamentoOption = sDepartamento;
        console.log('Valor seleccionado:', sDepartamento);
        if (sDepartamento !== ''){
          this.optionsProvincia$ = this.provinciaService.listarTodos(sDepartamento);
          this.selectedProvinciaOption = "";
          this.selectedDistritoOption = "";
        }
      }

      onItemChangeProvincia(event: any) {
        let sDepartamento = this.validateString(this.selectedDepartamentoOption);
        let sProvincia = this.validateString(event.value);
        this.selectedProvinciaOption = sProvincia;
        console.log('Valor seleccionado sDepartamento:', sDepartamento);
        console.log('Valor seleccionado sProvincia:', sProvincia);
        if (sProvincia !== '' && sDepartamento !== ''){
          this.optionsDistrito$ = this.distritoService.listarTodos(sDepartamento, sProvincia);
          this.selectedDistritoOption = "";
        }
      }

      onItemChangeDistrito(event: any) {
        let sDistrito = this.validateString(event.value);
        this.selectedDistritoOption = sDistrito;
      }


      crear(): void {

        let fechaFeriadoIni;
        let fechaFeriadoFin;
        if (this.rango.valid) {
          fechaFeriadoIni = new Date(this.rango.value.fechaFeriadoIni!);
          fechaFeriadoFin = new Date(this.rango.value.fechaFeriadoFin!);
        }

        let sDept = this.validateString(this.selectedDepartamentoOption)
        let sProv = this.validateString(this.selectedProvinciaOption)
        let sDist = this.validateString(this.selectedDistritoOption)
        let sCodigoRegion = ((sDept != '') ? sDept : '00') + 
                            ((sProv != '') ? sProv : '00')  + 
                            ((sDist != '') ? sDist : '00');

        const request: FeriadoCreateRequest = {
          fechaFeriadoIni: this.formatearFecha(fechaFeriadoIni!),
          fechaFeriadoFin: this.formatearFecha(fechaFeriadoFin!),
          codigoRegion: sCodigoRegion,
          descripcionFeriado: this.form.value.descripcionFeriado,
          tipoFeriado: this.form.value.tipoFeriado,
          estado: this.form.value.estado === true ? '1' : '0',
          usuarioCreacion: 'admin'
        };

        this.feriadoService.crear(request).subscribe({
          next: () => {
            this.snackBar.open('Feriado creado correctamente', 'Cerrar', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (error) => {
            const mensaje = error.error?.message || 'Error al crear feriado';
            this.snackBar.open(mensaje, 'Cerrar', { duration: 5000 });
          }
        });
      }

      actualizar(): void {
        let fechaFeriadoIni;
        let fechaFeriadoFin;
        this.rango.enable();
        if (this.rango.valid) {
          fechaFeriadoIni = new Date(this.rango.value.fechaFeriadoIni!);
          fechaFeriadoFin = new Date(this.rango.value.fechaFeriadoFin!);
        }

        let sDept = this.validateString(this.selectedDepartamentoOption)
        let sProv = this.validateString(this.selectedProvinciaOption)
        let sDist = this.validateString(this.selectedDistritoOption)
        let sCodigoRegion = ((sDept != '') ? sDept : '00') + 
                            ((sProv != '') ? sProv : '00')  + 
                            ((sDist != '') ? sDist : '00');
        
        const request: FeriadoUpdateRequest = {
          id: this.data.feriado!.id!,
          fechaFeriadoIni: this.formatearFecha(fechaFeriadoIni!),
          fechaFeriadoFin: this.formatearFecha(fechaFeriadoFin!),
          codigoRegion: sCodigoRegion,
          descripcionFeriado: this.form.value.descripcionFeriado,
          tipoFeriado: this.form.value.tipoFeriado,
          estado: this.form.value.estado === true ? '1' : '0',
          usuarioModificacion: 'admin'
        };
        this.rango.disable();
        this.feriadoService.editar(request).subscribe({
          next: () => {
            this.snackBar.open('Feriado actualizado correctamente', 'Cerrar', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (error) => {
            const mensaje = error.error?.message || 'Error al actualizar feriado';
            this.snackBar.open(mensaje, 'Cerrar', { duration: 5000 });
          }
        });
      }

      private parsearFecha(fechaStr: string): Date {
        if (fechaStr.indexOf('-') !== -1) {
          const partes = fechaStr.split('-');
          return new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));
        } else {
          const partes = fechaStr.split('/');
          return new Date(parseInt(partes[2]), parseInt(partes[1]) - 1, parseInt(partes[0]));
        }
      }

      private formatearFecha(fecha: Date): string {
        const year = fecha.getFullYear();
        const month = String(fecha.getMonth() + 1).padStart(2, '0');
        const day = String(fecha.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }

      public validateString(sTextValue: string): string {
        let sText = "";
        if (sTextValue === undefined) {
        } else if (sTextValue === null) {
        } else if (sTextValue === "") {
        } else {
          sText = sTextValue;
        }
        return `${sText}`;
      }

      cancelar(): void {
        this.dialogRef.close();
      }

      get codigoInvalido(): boolean {
        const control = this.form.get('codigoFeriado');
        return !!(control && control.invalid && control.touched);
      }
}
