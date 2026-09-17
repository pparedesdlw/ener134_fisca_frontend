import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IndicadoresGraficosService } from '../../services/indicadoresGraficos.service';
import { EvolucionIndicadoresResponse, ComparativoIndicadoresResponse } from '../../models/indicadores.model';
import { PeriodoService } from '../../../periodos/services/periodo.service';
import { Periodo } from '../../../periodos/models/periodo.model';
import { EmpresaConcesionariaService } from '../../../empresas/services/empresa-concesionaria.service';
import { EmpresaConcesionaria } from '../../../empresas/models/empresa-concesionaria.model';
import { BarChartComponent } from '../bar-chart/bar-chart.component';

/** RF11: visualización gráfica de los indicadores AIV y CIT — evolución por empresa y comparativo por periodo. */
@Component({
  selector: 'app-indicadores-graficos',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatProgressSpinnerModule, MatTooltipModule, BarChartComponent
  ],
  templateUrl: './indicadoresGraficos.component.html',
  styleUrl: './indicadoresGraficos.component.scss'
})
export class IndicadoresGraficosComponent implements OnInit {
  private service = inject(IndicadoresGraficosService);
  private periodoService = inject(PeriodoService);
  private empresaService = inject(EmpresaConcesionariaService);
  private snack = inject(MatSnackBar);

  periodos = signal<Periodo[]>([]);
  empresas = signal<EmpresaConcesionaria[]>([]);

  empresaSeleccionada: number | null = null;
  periodoSeleccionado: string | null = null;

  /** Mensaje institucional del flujo alterno "sin datos" de RF11. */
  readonly MENSAJE_SIN_DATOS = 'No existe información disponible para los filtros seleccionados';

  evolucion = signal<EvolucionIndicadoresResponse | null>(null);
  comparativo = signal<ComparativoIndicadoresResponse | null>(null);
  cargandoEvolucion = signal(false);
  cargandoComparativo = signal(false);

  labelsEvolucion = computed(() => this.evolucion()?.puntos.map((p) => p.codigoPeriodo) ?? []);
  valoresAivEvolucion = computed(() => this.evolucion()?.puntos.map((p) => p.indicadorAiv) ?? []);
  valoresCitEvolucion = computed(() => this.evolucion()?.puntos.map((p) => p.indicadorCit) ?? []);

  labelsComparativo = computed(() => this.comparativo()?.puntos.map((p) => this.etiquetaEmpresa(p.codigoEmpresa)) ?? []);
  valoresAivComparativo = computed(() => this.comparativo()?.puntos.map((p) => p.indicadorAiv) ?? []);
  valoresCitComparativo = computed(() => this.comparativo()?.puntos.map((p) => p.indicadorCit) ?? []);

  /** true cuando hay una consulta cargada con al menos un punto → se renderizan los gráficos. */
  hayEvolucion = computed(() => (this.evolucion()?.puntos.length ?? 0) > 0);
  hayComparativo = computed(() => (this.comparativo()?.puntos.length ?? 0) > 0);

  /** true solo tras una búsqueda que no devolvió puntos → se muestra el mensaje institucional. */
  sinDatosEvolucion = computed(() => this.evolucion() != null && this.evolucion()!.puntos.length === 0);
  sinDatosComparativo = computed(() => this.comparativo() != null && this.comparativo()!.puntos.length === 0);

  ngOnInit(): void {
    this.periodoService.listarPorEstado(true).subscribe({ next: (p) => this.periodos.set(p) });
    this.empresaService.listarTodos().subscribe({ next: (e) => this.empresas.set(e) });
  }

  /** RF11: la empresa se elige con clic en una grilla de tiles (selección única), no con un combo. */
  seleccionarEmpresa(idEmpresa: number | undefined): void {
    if (idEmpresa == null) return;
    this.empresaSeleccionada = idEmpresa;
    this.cargarEvolucion();
  }

  /** RF11: el periodo se elige con clic en una grilla de tiles (selección única), no con un combo. */
  seleccionarPeriodo(codigoPeriodo: string): void {
    this.periodoSeleccionado = codigoPeriodo;
    this.cargarComparativo();
  }

  /** RF11: se ejecuta automáticamente al seleccionar la empresa (selectionChange del filtro). */
  cargarEvolucion(): void {
    if (this.empresaSeleccionada == null) return;
    this.cargandoEvolucion.set(true);
    this.service.evolucion(this.empresaSeleccionada).subscribe({
      next: (r) => {
        this.evolucion.set(r);
        this.cargandoEvolucion.set(false);
      },
      error: () => {
        this.evolucion.set(null);
        this.cargandoEvolucion.set(false);
        this.snack.open('No se pudo cargar la evolución de indicadores', 'Cerrar', { duration: 4000 });
      }
    });
  }

  /** RF11: se ejecuta automáticamente al seleccionar el periodo (selectionChange del filtro). */
  cargarComparativo(): void {
    if (!this.periodoSeleccionado) return;
    this.cargandoComparativo.set(true);
    this.service.comparativo(this.periodoSeleccionado).subscribe({
      next: (r) => {
        this.comparativo.set(r);
        this.cargandoComparativo.set(false);
      },
      error: () => {
        this.comparativo.set(null);
        this.cargandoComparativo.set(false);
        this.snack.open('No se pudo cargar el comparativo de indicadores', 'Cerrar', { duration: 4000 });
      }
    });
  }

  etiquetaEmpresa(codigoEmpresa: number): string {
    return this.empresas().find((e) => e.id === codigoEmpresa)?.codigoEmpresa ?? String(codigoEmpresa);
  }
}
