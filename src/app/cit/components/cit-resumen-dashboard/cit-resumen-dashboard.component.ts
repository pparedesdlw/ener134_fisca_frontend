import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { CitService } from '../../services/cit.service';
import { PeriodoService } from '../../../periodos/services/periodo.service';
import { Periodo } from '../../../periodos/models/periodo.model';
import { ResumenCit } from '../../models/cit.model';

@Component({
  selector: 'app-cit-resumen-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCardModule
  ],
  templateUrl: './cit-resumen-dashboard.component.html',
  styleUrls: ['./cit-resumen-dashboard.component.scss']
})
export class CitResumenDashboardComponent implements OnInit {
  periodos: Periodo[] = [];
  periodoSeleccionado = '';
  resumen: ResumenCit | null = null;
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

  cargarResumen():void {
    if (!this.periodoSeleccionado) {
      return;
    }

    this.cargando = true;
    this.citService.obtenerResumenPorPeriodo(this.periodoSeleccionado).subscribe({
      next: (resumen) => {
        this.resumen = resumen;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error cargando resumen', error);
        this.cargando = false;
      }
    });
  }

  obtenerNrnKeys(): number[] {
    return this.resumen?.distribucionNrn ? Object.keys(this.resumen.distribucionNrn).map(Number) : [];
  }

  obtenerNrnValor(nrn: number): number {
    return this.resumen?.distribucionNrn[nrn] || 0;
  }
}
