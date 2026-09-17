import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { HistoricoAivService } from '../../services/historicoAiv.service';
import { HistoricoAccionResponse, HistoricoPreliminarResponse } from '../../models/historicoAiv.model';

@Component({
  selector: 'app-historico-aiv',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatButtonModule, MatInputModule,
    MatFormFieldModule, MatTableModule, MatPaginatorModule
  ],
  templateUrl: './historicoAiv.component.html',
  styleUrl: './historicoAiv.component.scss'
})
export class HistoricoAivComponent {
  private service = inject(HistoricoAivService);

  idEvaluacion: number | null = null;
  preliminares = signal<HistoricoPreliminarResponse[]>([]);
  acciones = signal<HistoricoAccionResponse[]>([]);

  colsPrelim = ['version', 'estadoSnapshot', 'indicadorAiv', 'numeroRegistrosNoConformes', 'motivo', 'fechaSnapshot', 'usuario'];
  colsAcc = ['version', 'accion', 'detalle', 'usuario', 'fechaAccion'];

  /** Paginación en memoria (regla institucional: toda grilla que pueda superar 10 filas debe paginar). */
  paginaPrelim = signal(0);
  tamanioPaginaPrelim = signal(20);
  paginaAcc = signal(0);
  tamanioPaginaAcc = signal(20);

  onPaginaPrelim(event: PageEvent): void {
    this.paginaPrelim.set(event.pageIndex);
    this.tamanioPaginaPrelim.set(event.pageSize);
  }

  onPaginaAcc(event: PageEvent): void {
    this.paginaAcc.set(event.pageIndex);
    this.tamanioPaginaAcc.set(event.pageSize);
  }

  consultar(): void {
    if (this.idEvaluacion == null) return;
    this.paginaPrelim.set(0);
    this.paginaAcc.set(0);
    this.service.preliminares(this.idEvaluacion).subscribe({
      next: (l) => this.preliminares.set(l)
    });
    this.service.acciones(this.idEvaluacion).subscribe({
      next: (l) => this.acciones.set(l)
    });
  }
}
