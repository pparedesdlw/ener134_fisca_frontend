import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { CitService } from '../../services/cit.service';
import { PeriodoService } from '../../../periodos/services/periodo.service';
import { Periodo } from '../../../periodos/models/periodo.model';
import { IndicadorCit } from '../../models/cit.model';

@Component({
  selector: 'app-cit-resultados-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatCardModule
  ],
  templateUrl: './cit-resultados-list.component.html',
  styleUrls: ['./cit-resultados-list.component.scss']
})
export class CitResultadosListComponent implements OnInit {
  periodos: Periodo[] = [];
  periodoSeleccionado = '';
  indicadores: IndicadorCit[] = [];
  displayedColumns: string[] = ['codigoEmpresa', 'codigoAtencion', 'cumpleItem1', 'cumpleItem3', 'cumpleItem4', 'numeroNrn'];
  cargando = false;

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
}
