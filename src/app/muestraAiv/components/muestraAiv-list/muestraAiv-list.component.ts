import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MuestraAivService } from '../../services/muestraAiv.service';
import { MuestraAivResponse } from '../../models/muestraAiv.model';
import { PeriodoService } from '../../../periodos/services/periodo.service';
import { Periodo } from '../../../periodos/models/periodo.model';
import { EmpresaConcesionariaService } from '../../../empresas/services/empresa-concesionaria.service';
import { EmpresaConcesionaria } from '../../../empresas/models/empresa-concesionaria.model';
import { AsuntoService } from '../../../asuntos/services/asunto.service';
import { Asunto } from '../../../asuntos/models/asunto.model';
import { DepartamentoService } from '../../../ubigeos/services/departamento.service';
import { Departamento } from '../../../ubigeos/models/departamento.model';
import { ProvinciaService } from '../../../ubigeos/services/provincia.service';
import { DistritoService } from '../../../ubigeos/services/distrito.service';
import { calcularRangoFechasPeriodo } from '../../../shared/utils/periodo-fechas.util';

@Component({
  selector: 'app-muestra-aiv',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatButtonModule, MatInputModule,
    MatFormFieldModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule,
    MatTableModule, MatPaginatorModule, MatIconModule, MatProgressSpinnerModule
  ],
  templateUrl: './muestraAiv-list.component.html',
  styleUrl: './muestraAiv-list.component.scss'
})
export class MuestraAivListComponent implements OnInit {
  private service = inject(MuestraAivService);
  private periodoService = inject(PeriodoService);
  private empresaService = inject(EmpresaConcesionariaService);
  private asuntoService = inject(AsuntoService);
  private departamentoService = inject(DepartamentoService);
  private provinciaService = inject(ProvinciaService);
  private distritoService = inject(DistritoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  periodos = signal<Periodo[]>([]);
  empresas = signal<EmpresaConcesionaria[]>([]);
  asuntos = signal<Asunto[]>([]);
  departamentos = signal<Departamento[]>([]);

  periodoSeleccionado: string | null = null;
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;
  empresaSeleccionada: string | null = null;
  /** Vacío = todos los asuntos (comportamiento por defecto del RF02). */
  asuntosSeleccionados: string[] = [];
  /** Vacío = todos los departamentos/ubigeos (comportamiento por defecto del RF02). */
  departamentosSeleccionados: string[] = [];
  usuario = 'admin';
  maxDate: Date = new Date();

  muestra = signal<MuestraAivResponse | null>(null);
  cargando = signal<boolean>(false);
  reemplazandoId = signal<number | null>(null);
  motivoReemplazo = '';

  displayedColumns = ['orden', 'idRegistroCerrado', 'codigoTipoAtencion', 'titular', 'adicional', 'reemplazado', 'acciones'];

  /** Paginado en memoria de "Detalle de la muestra": el arreglo completo ya llega en la
   * respuesta (puede tener cientos de filas), no hay backend paginado que consultar. */
  detallePage = 0;
  detallePageSize = 20;

  onDetallePage(event: PageEvent): void {
    this.detallePage = event.pageIndex;
    this.detallePageSize = event.pageSize;
  }

  ngOnInit(): void {
    this.periodoService.listarPorEstado(true).subscribe({ next: (p) => this.periodos.set(p) });
    this.empresaService.listarTodos().subscribe({ next: (e) => this.empresas.set(e) });
    this.asuntoService.listarPorEstado('1').subscribe({ next: (a) => this.asuntos.set(a) });
    this.departamentoService.listarTodos().subscribe({ next: (d) => this.departamentos.set(d) });

    const params = this.route.snapshot.queryParamMap;
    this.periodoSeleccionado = params.get('periodo');
    this.empresaSeleccionada = params.get('empresa');
    const fechaInicio = params.get('fechaInicio');
    const fechaFin = params.get('fechaFin');
    this.fechaInicio = fechaInicio ? new Date(fechaInicio) : null;
    this.fechaFin = fechaFin ? new Date(fechaFin) : null;
  }

  get periodoMinDate(): Date | null {
    return calcularRangoFechasPeriodo(this.periodoSeleccionado, this.periodos(), this.maxDate).min;
  }

  get periodoMaxDate(): Date {
    return calcularRangoFechasPeriodo(this.periodoSeleccionado, this.periodos(), this.maxDate).max;
  }

  /** Al cambiar de periodo, autocompleta fecha inicio/fin con el rango completo del periodo. */
  onPeriodoChange(): void {
    const rango = calcularRangoFechasPeriodo(this.periodoSeleccionado, this.periodos(), this.maxDate);
    this.fechaInicio = rango.min;
    this.fechaFin = rango.max;
  }

  generar(): void {
    if (!this.periodoSeleccionado || !this.fechaInicio || !this.fechaFin || !this.empresaSeleccionada) {
      this.snack.open('Periodo, fecha inicio, fecha fin y empresa son obligatorios', 'Cerrar', { duration: 4000 });
      return;
    }
    this.cargando.set(true);
    this.expandirDepartamentosADistritos().subscribe({
      next: (codigosUbigeo) => {
        this.service.generar({
          codigoPeriodo: this.periodoSeleccionado!,
          fechaInicio: this.formatDate(this.fechaInicio!),
          fechaFin: this.formatDate(this.fechaFin!),
          codigoEmpresa: this.empresaSeleccionada!,
          codigosAsunto: this.asuntosSeleccionados.length ? this.asuntosSeleccionados : undefined,
          codigosUbigeo: codigosUbigeo.length ? codigosUbigeo : undefined,
          usuario: this.usuario
        }).subscribe({
          next: (m) => {
            this.muestra.set(m);
            this.detallePage = 0;
            this.cargando.set(false);
            this.snack.open('Muestra generada', 'Cerrar', { duration: 3000 });
          },
          error: (e) => {
            if (e?.error?.code === 'MUESTRA_DUPLICADA') {
              this.cargarMuestraExistente();
              return;
            }
            this.cargando.set(false);
            this.snack.open(e?.error?.message ?? 'Error generando muestra', 'Cerrar', { duration: 4000 });
          }
        });
      },
      error: () => {
        this.cargando.set(false);
        this.snack.open('Error obteniendo los ubigeos seleccionados', 'Cerrar', { duration: 4000 });
      }
    });
  }

  /**
   * Si ya existe una muestra activa (409 MUESTRA_DUPLICADA), la carga en vez de
   * dejar al usuario sin forma de verla ni de continuar a "Iniciar evaluación".
   */
  private cargarMuestraExistente(): void {
    const idEmpresa = this.empresas().find((e) => e.codigoEmpresa === this.empresaSeleccionada)?.id;
    if (!this.periodoSeleccionado || !idEmpresa) {
      this.cargando.set(false);
      this.snack.open('Ya existe una muestra activa, pero no se pudo cargar automáticamente', 'Cerrar', { duration: 4000 });
      return;
    }
    this.service.vigente(this.periodoSeleccionado, idEmpresa).subscribe({
      next: (m) => {
        this.muestra.set(m);
        this.detallePage = 0;
        this.cargando.set(false);
        this.snack.open('Ya existía una muestra activa para este periodo y empresa; se cargó a continuación', 'Cerrar', { duration: 4000 });
      },
      error: (e) => {
        this.cargando.set(false);
        this.snack.open(e?.error?.message ?? 'Ya existe una muestra activa, pero no se pudo cargar', 'Cerrar', { duration: 4000 });
      }
    });
  }

  /**
   * Convierte los departamentos elegidos en la lista completa de códigos de
   * ubigeo (6 dígitos: departamento+provincia+distrito) que contienen, para
   * filtrar por el ubigeo real que trae cada atención comercial.
   */
  private expandirDepartamentosADistritos(): Observable<string[]> {
    if (!this.departamentosSeleccionados.length) {
      return of([]);
    }
    const porDepartamento = this.departamentosSeleccionados.map((codigoDepartamento) =>
      this.provinciaService.listarTodos(codigoDepartamento).pipe(
        switchMap((provincias) => this.expandirProvinciasADistritos(codigoDepartamento, provincias.map((p) => p.codigoProvincia)))
      )
    );
    return forkJoin(porDepartamento).pipe(map((listas) => listas.flat()));
  }

  private expandirProvinciasADistritos(codigoDepartamento: string, codigosProvincia: string[]): Observable<string[]> {
    if (!codigosProvincia.length) {
      return of([]);
    }
    const porProvincia = codigosProvincia.map((codigoProvincia) =>
      this.distritoService.listarTodos(codigoDepartamento, codigoProvincia).pipe(
        map((distritos) => distritos.map((d) => `${codigoDepartamento}${codigoProvincia}${d.codigoDistrito}`))
      )
    );
    return forkJoin(porProvincia).pipe(map((listas) => listas.flat()));
  }

  reemplazar(idDetalle: number): void {
    this.reemplazandoId.set(idDetalle);
    this.motivoReemplazo = '';
  }

  cancelarReemplazo(): void {
    this.reemplazandoId.set(null);
    this.motivoReemplazo = '';
  }

  confirmarReemplazo(): void {
    const idDetalle = this.reemplazandoId();
    if (!idDetalle) {
      return;
    }
    if (!this.motivoReemplazo.trim()) {
      this.snack.open('El motivo del reemplazo es obligatorio', 'Cerrar', { duration: 3000 });
      return;
    }
    this.service.reemplazar({
      idMuestraDetalle: idDetalle,
      motivo: this.motivoReemplazo.trim(),
      usuario: this.usuario
    }).subscribe({
      next: (m) => {
        this.muestra.set(m);
        this.reemplazandoId.set(null);
        this.motivoReemplazo = '';
        this.snack.open('Registro reemplazado', 'Cerrar', { duration: 3000 });
      },
      error: (e) => this.snack.open(e?.error?.message ?? 'Error en reemplazo', 'Cerrar', { duration: 4000 })
    });
  }

  iniciarEvaluacion(): void {
    const m = this.muestra();
    if (!m || !this.periodoSeleccionado) return;
    /* EvaluacionAiv identifica la empresa por el id numérico interno (MuestraAiv.codigoEmpresa),
       no por el código de empresa de PRIE-TISEC usado como filtro para generar la muestra. */
    this.router.navigate(['/evaluacion-aiv'], {
      queryParams: { periodo: this.periodoSeleccionado, empresa: m.codigoEmpresa, idMuestraAiv: m.id }
    });
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
