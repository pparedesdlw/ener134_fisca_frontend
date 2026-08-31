import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
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
    CommonModule, FormsModule, MatCardModule, MatButtonModule,
    MatFormFieldModule, MatSelectModule, MatIconModule, BarChartComponent
  ],
  templateUrl: './indicadoresGraficos.component.html',
  styleUrl: './indicadoresGraficos.component.scss'
})
export class IndicadoresGraficosComponent implements OnInit {
  private service = inject(IndicadoresGraficosService);
  private periodoService = inject(PeriodoService);
  private empresaService = inject(EmpresaConcesionariaService);

  periodos = signal<Periodo[]>([]);
  empresas = signal<EmpresaConcesionaria[]>([]);

  empresaSeleccionada: number | null = null;
  periodoSeleccionado: string | null = null;

  /** Mensaje institucional del flujo alterno "sin datos" de RF11. */
  readonly MENSAJE_SIN_DATOS = 'No existe información disponible para los filtros seleccionados';

  evolucion = signal<EvolucionIndicadoresResponse | null>(null);
  comparativo = signal<ComparativoIndicadoresResponse | null>(null);

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

  cargarEvolucion(): void {
    if (this.empresaSeleccionada == null) return;
    this.service.evolucion(this.empresaSeleccionada).subscribe({ next: (r) => this.evolucion.set(r) });
  }

  cargarComparativo(): void {
    if (!this.periodoSeleccionado) return;
    this.service.comparativo(this.periodoSeleccionado).subscribe({ next: (r) => this.comparativo.set(r) });
  }

  etiquetaEmpresa(codigoEmpresa: number): string {
    return this.empresas().find((e) => e.id === codigoEmpresa)?.codigoEmpresa ?? String(codigoEmpresa);
  }
}
