import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { CitService } from '../../services/cit.service';
import { PeriodoService } from '../../../periodos/services/periodo.service';
import { Periodo } from '../../../periodos/models/periodo.model';
import { IndicadorCit } from '../../models/cit.model';
import { AccionesAtencionComponent } from '../acciones-atencion/acciones-atencion.component';

@Component({
  selector: 'app-cit-resultados-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    AccionesAtencionComponent
  ],
  templateUrl: './cit-resultados-list.component.html',
  styleUrls: ['./cit-resultados-list.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class CitResultadosListComponent implements OnInit {
  periodos: Periodo[] = [];
  periodoSeleccionado = '';
  indicadores: IndicadorCit[] = [];
  displayedColumns: string[] = ['codigoEmpresa', 'codigoAtencion', 'cumpleItem1', 'cumpleItem3', 'cumpleItem4', 'numeroNrn', 'expandir'];
  cargando = false;

  expandedIndicador: IndicadorCit | null = null;

  constructor(
    private citService: CitService,
    private periodoService: PeriodoService
  ) {}

  ngOnInit(): void {
    this.cargarPeriodos();
  }

  cargarPeriodos(): void {
    this.periodoService.listarTodos().subscribe({
      next: (periodos) => {
        this.periodos = periodos;
      },
      error: (error) => {
        console.error('Error cargando periodos', error);
      }
    });
  }

  cargarIndicadores(): void {
    if (!this.periodoSeleccionado) {
      return;
    }

    this.cargando = true;
    this.citService.listarIndicadoresPorPeriodo(this.periodoSeleccionado).subscribe({
      next: (indicadores) => {
        this.indicadores = indicadores;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error cargando indicadores', error);
        this.cargando = false;
      }
    });
  }

  toggleIndicador(indicador: IndicadorCit): void {
    this.expandedIndicador = this.expandedIndicador === indicador ? null : indicador;
  }
}
