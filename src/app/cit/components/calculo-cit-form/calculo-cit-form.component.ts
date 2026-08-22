import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CitService } from '../../services/cit.service';
import { EmpresaConcesionariaService } from '../../../empresas/services/empresa-concesionaria.service';
import { EmpresaConcesionaria } from '../../../empresas/models/empresa-concesionaria.model';
import { PeriodoService } from '../../../periodos/services/periodo.service';
import { Periodo } from '../../../periodos/models/periodo.model';
import { CitResultadoResponse, Motivo, AtencionResponse } from '../../models/cit.model';
import { AccionesAtencionComponent } from '../../../atencionesComerciales/components/acciones-atencion/acciones-atencion.component';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { EvaluacionCitService } from '../../../evaluacionCit/services/evaluacionCit.service';
import { HistoricoCitDialogComponent } from '../../../evaluacionCit/components/historico-cit-dialog/historico-cit-dialog.component';
import { calcularRangoFechasPeriodo } from '../../../shared/utils/periodo-fechas.util';

@Component({
  selector: 'app-calculo-cit-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatIconModule,
    AccionesAtencionComponent
  ],
  templateUrl: './calculo-cit-form.component.html',
  styleUrls: ['./calculo-cit-form.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class CalculoCitFormComponent implements OnInit {
  empresas: EmpresaConcesionaria[] = [];
  motivos: Motivo[] = [];
  periodos: Periodo[] = [];
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;
  maxDate: Date = new Date();
  empresaSeleccionada: string | null = null;
  motivoSeleccionado: string | null = null;
  periodoSeleccionado: string | null = null;
  calculando = false;
  resultado: CitResultadoResponse | null = null;
  mensaje = '';
  error = '';

  atenciones: AtencionResponse[] = [];
  atencionesColumns = ['codigoAtencion', 'codigoAsunto', 'descripcionAsunto', 'estadoAtencion', 'tieneCierre', 'expandir'];
  expandedAtencion: AtencionResponse | null = null;

  finalizando = false;
  usuario = 'admin';

  constructor(
    private citService: CitService,
    private empresaConcesionariaService: EmpresaConcesionariaService,
    private periodoService: PeriodoService,
    private evaluacionCitService: EvaluacionCitService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargarEmpresas();
    this.cargarMotivos();
    this.cargarPeriodos();
  }

  cargarEmpresas(): void {
    this.empresaConcesionariaService.listarTodos().subscribe({
      next: (empresas) => {
        this.empresas = empresas;
      },
      error: (error) => {
        console.error('Error cargando empresas', error);
      }
    });
  }

  cargarPeriodos(): void {
    this.periodoService.listarPorEstado(true).subscribe({
      next: (periodos) => {
        this.periodos = periodos;
      },
      error: (error) => {
        console.error('Error cargando periodos', error);
      }
    });
  }

  cargarMotivos(): void {
    this.citService.listarMotivos().subscribe({
      next: (motivos) => {
        this.motivos = motivos;
      },
      error: (error) => {
        console.error('Error cargando motivos', error);
      }
    });
  }

  get periodoMinDate(): Date | null {
    return calcularRangoFechasPeriodo(this.periodoSeleccionado, this.periodos, this.maxDate).min;
  }

  get periodoMaxDate(): Date {
    return calcularRangoFechasPeriodo(this.periodoSeleccionado, this.periodos, this.maxDate).max;
  }

  /** Al cambiar de periodo, autocompleta fecha inicio/fin con el rango completo del periodo. */
  onPeriodoChange(): void {
    const rango = calcularRangoFechasPeriodo(this.periodoSeleccionado, this.periodos, this.maxDate);
    this.fechaInicio = rango.min;
    this.fechaFin = rango.max;
  }

  calcularCit(): void {
    this.error = '';
    this.mensaje = '';

    if (!this.periodoSeleccionado) {
      this.error = 'Debe seleccionar un periodo';
      return;
    }
    if (!this.fechaInicio || !this.fechaFin) {
      this.error = 'Debe seleccionar fecha de inicio y fecha de fin';
      return;
    }
    if (!this.empresaSeleccionada) {
      this.error = 'Debe seleccionar una empresa';
      return;
    }

    this.calculando = true;
    this.resultado = null;

    const request = {
      fechaInicio: this.formatDate(this.fechaInicio),
      fechaFin: this.formatDate(this.fechaFin),
      codigoEmpresa: this.empresaSeleccionada,
      codigoPeriodo: this.periodoSeleccionado,
      descripcionMotivo: this.motivoSeleccionado
    };

    this.citService.calcularCit(request).subscribe({
      next: (resultado) => {
        this.resultado = resultado;
        this.calculando = false;
        this.mensaje = 'Cálculo CIT realizado exitosamente';
        this.cargarAtenciones();
      },
      error: (error) => {
        console.error('Error calculando CIT', error);
        this.calculando = false;
        this.error = 'Error al calcular el CIT: ' + (error.error?.message || error.message);
      }
    });
  }

  /** RF13: botón "Eval. Finalizada" — recalcula en backend y persiste la evaluación consolidada. */
  finalizarEvaluacion(): void {
    if (!this.resultado || !this.periodoSeleccionado || !this.empresaSeleccionada || !this.fechaInicio || !this.fechaFin) {
      return;
    }
    this.finalizando = true;
    this.evaluacionCitService.finalizar({
      codigoPeriodo: this.periodoSeleccionado,
      codigoEmpresa: this.empresaSeleccionada,
      fechaInicio: this.formatDate(this.fechaInicio),
      fechaFin: this.formatDate(this.fechaFin),
      descripcionMotivo: this.motivoSeleccionado,
      usuario: this.usuario
    }).subscribe({
      next: (evaluacion) => {
        this.finalizando = false;
        const tipo = evaluacion.tipoConsolidacion === 'CONSOLIDADO_TOTAL' ? 'total' : 'parcial';
        this.snackBar.open(`Evaluación finalizada (consolidación ${tipo})`, 'Cerrar', { duration: 4000 });
      },
      error: (error) => {
        this.finalizando = false;
        this.snackBar.open(error.error?.message ?? 'Error al finalizar la evaluación', 'Cerrar', { duration: 5000 });
      }
    });
  }

  /** RF14: ventana emergente "Ver histórico" — estructura alineada a RF08. */
  verHistorico(): void {
    if (!this.periodoSeleccionado || !this.empresaSeleccionada) {
      this.snackBar.open('Seleccione periodo y empresa para ver el histórico', 'Cerrar', { duration: 4000 });
      return;
    }
    this.dialog.open(HistoricoCitDialogComponent, {
      width: '800px',
      data: { codigoPeriodo: this.periodoSeleccionado, codigoEmpresa: this.empresaSeleccionada }
    });
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  cargarAtenciones(): void {
    if (!this.empresaSeleccionada || !this.fechaInicio || !this.fechaFin) return;
    this.atenciones = [];
    this.expandedAtencion = null;

    this.citService.listarAtenciones(
      this.empresaSeleccionada,
      this.formatDate(this.fechaInicio),
      this.formatDate(this.fechaFin),
      this.motivoSeleccionado || undefined
    ).subscribe({
      next: (atenciones) => {
        this.atenciones = atenciones;
      },
      error: (error) => {
        console.error('Error cargando atenciones', error);
      }
    });
  }

  toggleAtencion(atencion: AtencionResponse): void {
    this.expandedAtencion = this.expandedAtencion === atencion ? null : atencion;
  }
}
