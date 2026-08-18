import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EvaluacionAivService } from '../../services/evaluacionAiv.service';
import { EvaluacionAivResumenResponse } from '../../models/evaluacionAiv.model';
import { PeriodoService } from '../../../periodos/services/periodo.service';
import { Periodo } from '../../../periodos/models/periodo.model';
import { EmpresaConcesionariaService } from '../../../empresas/services/empresa-concesionaria.service';
import { EmpresaConcesionaria } from '../../../empresas/models/empresa-concesionaria.model';
import { calcularRangoFechasPeriodo, fechaFueraDeRango } from '../../../shared/utils/periodo-fechas.util';

/** RF07: ventana "Ver en proceso" — evaluaciones EN_PROCESO/REABIERTO, para continuar su gestión. */
@Component({
  selector: 'app-ver-en-proceso-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule,
    MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatInputModule, MatTableModule,
    MatIconModule, MatProgressSpinnerModule
  ],
  templateUrl: './ver-en-proceso-dialog.component.html',
  styleUrl: './ver-en-proceso-dialog.component.scss'
})
export class VerEnProcesoDialogComponent implements OnInit {
  private service = inject(EvaluacionAivService);
  private periodoService = inject(PeriodoService);
  private empresaService = inject(EmpresaConcesionariaService);
  private router = inject(Router);

  periodos = signal<Periodo[]>([]);
  empresas = signal<EmpresaConcesionaria[]>([]);
  evaluaciones = signal<EvaluacionAivResumenResponse[]>([]);
  cargando = signal<boolean>(false);
  buscoAlMenosUnaVez = signal<boolean>(false);

  periodoSeleccionado: string | null = null;
  empresaSeleccionada: number | null = null;
  fechaEvaluada: Date | null = null;
  maxDate: Date = new Date();

  displayedColumns = ['id', 'codigoPeriodo', 'codigoEmpresa', 'rangoEvaluado', 'estado', 'fechaModificacion', 'usuarioResponsable', 'avance', 'accion'];

  constructor(public dialogRef: MatDialogRef<VerEnProcesoDialogComponent>) {}

  ngOnInit(): void {
    this.periodoService.listarPorEstado(true).subscribe({ next: (p) => this.periodos.set(p) });
    this.empresaService.listarTodos().subscribe({ next: (e) => this.empresas.set(e) });
    this.buscar();
  }

  get periodoMinDate(): Date | null {
    return calcularRangoFechasPeriodo(this.periodoSeleccionado, this.periodos(), this.maxDate).min;
  }

  get periodoMaxDate(): Date {
    return calcularRangoFechasPeriodo(this.periodoSeleccionado, this.periodos(), this.maxDate).max;
  }

  /** Al cambiar de periodo, limpia la fecha evaluada ya elegida si quedó fuera del nuevo rango habilitado. */
  onPeriodoChange(): void {
    const rango = calcularRangoFechasPeriodo(this.periodoSeleccionado, this.periodos(), this.maxDate);
    if (fechaFueraDeRango(this.fechaEvaluada, rango)) {
      this.fechaEvaluada = null;
    }
  }

  buscar(): void {
    this.cargando.set(true);
    const fecha = this.fechaEvaluada ? this.formatDate(this.fechaEvaluada) : undefined;
    this.service.listarEnProcesoOReabiertas(this.periodoSeleccionado ?? undefined, this.empresaSeleccionada ?? undefined, fecha)
      .subscribe({
        next: (lista) => {
          this.evaluaciones.set(lista);
          this.cargando.set(false);
          this.buscoAlMenosUnaVez.set(true);
        },
        error: () => {
          this.evaluaciones.set([]);
          this.cargando.set(false);
          this.buscoAlMenosUnaVez.set(true);
        }
      });
  }

  continuar(evaluacion: EvaluacionAivResumenResponse): void {
    this.dialogRef.close();
    this.router.navigate(['/evaluacion-aiv'], {
      queryParams: { periodo: evaluacion.codigoPeriodo, empresa: evaluacion.codigoEmpresa }
    });
  }

  cerrar(): void {
    this.dialogRef.close();
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
