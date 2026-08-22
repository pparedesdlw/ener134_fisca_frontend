import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { RegistroCerradoService } from '../../services/registroCerrado.service';
import { RegistroCerradoFilterRequest, RegistroCerradoResponse } from '../../models/registroCerrado.model';
import { PeriodoService } from '../../../periodos/services/periodo.service';
import { Periodo } from '../../../periodos/models/periodo.model';
import { EmpresaConcesionariaService } from '../../../empresas/services/empresa-concesionaria.service';
import { EmpresaConcesionaria } from '../../../empresas/models/empresa-concesionaria.model';
import { AsuntoService } from '../../../asuntos/services/asunto.service';
import { Asunto } from '../../../asuntos/models/asunto.model';
import { VerEnProcesoDialogComponent } from '../../../evaluacionAiv/components/ver-en-proceso-dialog/ver-en-proceso-dialog.component';
import { HistoricoPreliminarDialogComponent } from '../../../evaluacionAiv/components/historico-preliminar-dialog/historico-preliminar-dialog.component';
import { ReabrirEvaluacionDialogComponent } from '../../../evaluacionAiv/components/reabrir-evaluacion-dialog/reabrir-evaluacion-dialog.component';
import { calcularRangoFechasPeriodo } from '../../../shared/utils/periodo-fechas.util';

@Component({
  selector: 'app-registro-cerrado-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatTableModule,
    MatButtonModule, MatInputModule, MatFormFieldModule, MatSelectModule,
    MatDatepickerModule, MatNativeDateModule, MatPaginatorModule,
    MatProgressSpinnerModule, MatIconModule
  ],
  templateUrl: './registroCerrado-list.component.html',
  styleUrl: './registroCerrado-list.component.scss'
})
export class RegistroCerradoListComponent implements OnInit {
  private service = inject(RegistroCerradoService);
  private periodoService = inject(PeriodoService);
  private empresaService = inject(EmpresaConcesionariaService);
  private asuntoService = inject(AsuntoService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  periodos = signal<Periodo[]>([]);
  empresas = signal<EmpresaConcesionaria[]>([]);
  asuntos = signal<Asunto[]>([]);

  periodoSeleccionado: string | null = null;
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;
  asuntoSeleccionado: string | null = null;
  empresaSeleccionada: string | null = null;
  maxDate: Date = new Date();

  registros = signal<RegistroCerradoResponse[]>([]);
  totalElements = signal<number>(0);
  cargando = signal<boolean>(false);
  buscoAlMenosUnaVez = signal<boolean>(false);

  /** Expuestos (no private) porque el template los usa para reconstruir el estado del
   * paginator: al ser recreado tras cada búsqueda (*ngIf de cargando()), Material lo
   * inicializa siempre en pageIndex 0 salvo que se le indique explícitamente en qué
   * página/tamaño quedó. */
  page = 0;
  size = 20;

  displayedColumns = ['codigoAtencion', 'codigoAsunto', 'fechaRecepcion', 'fechaCierre', 'codigoUbigeo'];

  ngOnInit(): void {
    this.periodoService.listarPorEstado(true).subscribe({ next: (p) => this.periodos.set(p) });
    this.empresaService.listarTodos().subscribe({ next: (e) => this.empresas.set(e) });
    this.asuntoService.listarPorEstado('1').subscribe({ next: (a) => this.asuntos.set(a) });
  }

  get periodoMinDate(): Date | null {
    return calcularRangoFechasPeriodo(this.periodoSeleccionado, this.periodos(), this.maxDate).min;
  }

  get periodoMaxDate(): Date {
    return calcularRangoFechasPeriodo(this.periodoSeleccionado, this.periodos(), this.maxDate).max;
  }

  /**
   * Resuelve el código de asunto a "código - descripción" usando el catálogo ya cargado;
   * si no lo encuentra, muestra el código crudo como respaldo. Compara como string porque
   * el catálogo puede llegar con codigoAsunto numérico en tiempo de ejecución pese al tipo
   * TS declarado (el JSON del backend no respeta el tipo de la interfaz).
   */
  descripcionAsunto(codigoAsunto: string): string {
    const asunto = this.asuntos().find((a) => String(a.codigoAsunto) === String(codigoAsunto));
    return asunto ? `${asunto.codigoAsunto} - ${asunto.descripcion}` : codigoAsunto;
  }

  /** Al cambiar de periodo, autocompleta fecha inicio/fin con el rango completo del periodo. */
  onPeriodoChange(): void {
    const rango = calcularRangoFechasPeriodo(this.periodoSeleccionado, this.periodos(), this.maxDate);
    this.fechaInicio = rango.min;
    this.fechaFin = rango.max;
  }

  private construirFiltro(): RegistroCerradoFilterRequest | null {
    if (!this.periodoSeleccionado || !this.fechaInicio || !this.fechaFin || !this.asuntoSeleccionado || !this.empresaSeleccionada) {
      this.snackBar.open('Periodo, fecha inicio, fecha fin, asunto y empresa son obligatorios', 'Cerrar', { duration: 4000 });
      return null;
    }
    return {
      codigoPeriodo: this.periodoSeleccionado,
      fechaInicio: this.formatDate(this.fechaInicio),
      fechaFin: this.formatDate(this.fechaFin),
      codigoAsunto: this.asuntoSeleccionado,
      codigoEmpresa: this.empresaSeleccionada,
      page: this.page,
      size: this.size
    };
  }

  buscar(): void {
    this.page = 0;
    this.ejecutarBusqueda();
  }

  private ejecutarBusqueda(): void {
    const filtro = this.construirFiltro();
    if (!filtro) {
      return;
    }
    this.cargando.set(true);
    this.service.buscar(filtro).subscribe({
      next: (resp) => {
        this.registros.set(resp.content);
        this.totalElements.set(resp.totalElements);
        this.cargando.set(false);
        this.buscoAlMenosUnaVez.set(true);
      },
      error: (err) => {
        this.cargando.set(false);
        this.buscoAlMenosUnaVez.set(true);
        this.registros.set([]);
        this.totalElements.set(0);
        this.snackBar.open(err.error?.message || 'Error al buscar registros cerrados', 'Cerrar', { duration: 5000 });
      }
    });
  }

  onPage(event: PageEvent): void {
    this.page = event.pageIndex;
    this.size = event.pageSize;
    this.ejecutarBusqueda();
  }

  exportar(): void {
    const filtro = this.construirFiltro();
    if (!filtro) {
      return;
    }
    this.service.exportar(filtro).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = 'registros-cerrados.xlsx';
        enlace.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => this.snackBar.open('Error al exportar registros cerrados', 'Cerrar', { duration: 5000 })
    });
  }

  obtenerTotal(): void {
    const filtro = this.construirFiltro();
    if (!filtro) {
      return;
    }
    this.router.navigate(['/evaluacion-aiv'], {
      queryParams: {
        periodo: filtro.codigoPeriodo,
        empresa: filtro.codigoEmpresa,
        asunto: filtro.codigoAsunto,
        fechaInicio: filtro.fechaInicio,
        fechaFin: filtro.fechaFin,
        tipo: 'TOTAL'
      }
    });
  }

  definirMuestra(): void {
    const filtro = this.construirFiltro();
    if (!filtro) {
      return;
    }
    // RF02 define su propio filtro de Asunto (multiselección, todos por
    // defecto) — no se restringe al asunto único usado para navegar el
    // universo en RF01, solo se pasa el contexto de periodo/fechas/empresa.
    this.router.navigate(['/muestra-aiv'], {
      queryParams: {
        periodo: filtro.codigoPeriodo,
        fechaInicio: filtro.fechaInicio,
        fechaFin: filtro.fechaFin,
        empresa: filtro.codigoEmpresa
      }
    });
  }

  verEnProceso(): void {
    this.dialog.open(VerEnProcesoDialogComponent, { width: '1100px' });
  }

  abrirReaperturaEvaluaciones(): void {
    this.dialog.open(ReabrirEvaluacionDialogComponent, { width: '1200px' });
  }

  verHistorico(): void {
    if (!this.periodoSeleccionado || !this.empresaSeleccionada) {
      this.snackBar.open('Seleccione periodo y empresa para ver el histórico', 'Cerrar', { duration: 4000 });
      return;
    }
    const empresa = this.empresas().find((e) => e.codigoEmpresa === this.empresaSeleccionada);
    if (!empresa?.id) {
      this.snackBar.open('No se pudo determinar la empresa seleccionada', 'Cerrar', { duration: 4000 });
      return;
    }
    this.dialog.open(HistoricoPreliminarDialogComponent, {
      width: '900px',
      data: { codigoPeriodo: this.periodoSeleccionado, codigoEmpresa: empresa.id }
    });
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
