import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
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
import { EstadoEvaluacionAiv, EvaluacionAivConsolidadaResponse, EvaluacionRegistroResponse } from '../../models/evaluacionAiv.model';
import { PeriodoService } from '../../../periodos/services/periodo.service';
import { Periodo } from '../../../periodos/models/periodo.model';
import { EmpresaConcesionariaService } from '../../../empresas/services/empresa-concesionaria.service';
import { EmpresaConcesionaria } from '../../../empresas/models/empresa-concesionaria.model';
import { AuthService } from '../../../auth/services/auth.service';
import { ConfirmarReaperturaDialogComponent } from '../confirmar-reapertura-dialog/confirmar-reapertura-dialog.component';
import { calcularRangoFechasPeriodo, fechaFueraDeRango } from '../../../shared/utils/periodo-fechas.util';

/** RF09: pantalla de reapertura de evaluaciones consolidadas (opción a parte, para usuario administrador/especialista). */
@Component({
  selector: 'app-reabrir-evaluacion-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule,
    MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatInputModule, MatTableModule,
    MatIconModule, MatProgressSpinnerModule
  ],
  templateUrl: './reabrir-evaluacion-dialog.component.html',
  styleUrl: './reabrir-evaluacion-dialog.component.scss'
})
export class ReabrirEvaluacionDialogComponent implements OnInit {
  private service = inject(EvaluacionAivService);
  private periodoService = inject(PeriodoService);
  private empresaService = inject(EmpresaConcesionariaService);
  private dialog = inject(MatDialog);
  private authService = inject(AuthService);

  usuario = 'admin';
  periodos = signal<Periodo[]>([]);
  empresas = signal<EmpresaConcesionaria[]>([]);
  evaluaciones = signal<EvaluacionAivConsolidadaResponse[]>([]);
  cargando = signal<boolean>(false);
  buscoAlMenosUnaVez = signal<boolean>(false);

  periodoSeleccionado: string | null = null;
  empresaSeleccionada: number | null = null;
  fechaEvaluada: Date | null = null;
  tipoConsolidacionSeleccionado: EstadoEvaluacionAiv | null = null;
  maxDate: Date = new Date();

  displayedColumns = [
    'id', 'codigoPeriodo', 'codigoEmpresa', 'rangoEvaluado', 'indicadorAiv', 'tipoMuestra',
    'tipoConsolidacion', 'fechaConsolidado', 'usuarioConsolido', 'numeroRegistrosEvaluados', 'accion'
  ];
  displayedColumnsRegistros = ['orden', 'codigoUnico', 'codigoUbigeo', 'codigoAsunto', 'descripcionAsunto', 'total'];

  /** RF09, alt flow "Ver Reg.": grilla secundaria con los registros de la evaluación seleccionada. */
  registrosSeleccionados = signal<EvaluacionRegistroResponse[] | null>(null);

  constructor(public dialogRef: MatDialogRef<ReabrirEvaluacionDialogComponent>) {}

  get puedeReabrir(): boolean {
    return this.authService.isTisecAdmin;
  }

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
    this.service.listarConsolidadas(
      this.periodoSeleccionado ?? undefined,
      this.empresaSeleccionada ?? undefined,
      fecha,
      this.tipoConsolidacionSeleccionado ?? undefined
    ).subscribe({
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

  /** RF09, alt flow "Ver Reg.": se muestra como grilla secundaria dentro de la misma pantalla, no como
   * ventana emergente aparte — evita anidar un segundo MatDialog sobre este mientras sus propios
   * filtros (mat-select) siguen montados, que en pruebas provocaba que el diálogo anidado nunca
   * completara su inicialización. */
  verRegistros(evaluacion: EvaluacionAivConsolidadaResponse): void {
    this.service.obtenerPorId(evaluacion.id).subscribe({
      next: (detalle) => this.registrosSeleccionados.set(detalle.registros),
      error: () => this.registrosSeleccionados.set([])
    });
  }

  cerrarRegistros(): void {
    this.registrosSeleccionados.set(null);
  }

  /** RF09: se cierra esta pantalla antes de abrir la ventana emergente de reapertura (por el mismo motivo
   * que verRegistros) y se vuelve a abrir al finalizar, para continuar gestionando otras evaluaciones. */
  reabrirEvaluacion(evaluacion: EvaluacionAivConsolidadaResponse): void {
    this.dialogRef.close();
    this.dialog.open(ConfirmarReaperturaDialogComponent, {
      width: '600px',
      data: { evaluacion, usuario: this.usuario }
    }).afterClosed().subscribe(() => {
      this.dialog.open(ReabrirEvaluacionDialogComponent, { width: '1200px' });
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
