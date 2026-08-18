import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { HistoricoAivService } from '../../services/historicoAiv.service';
import { HistoricoAccionResponse, HistoricoPreliminarResponse } from '../../models/historicoAiv.model';

@Component({
  selector: 'app-historico-aiv',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatButtonModule, MatInputModule,
    MatFormFieldModule, MatTableModule
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

  consultar(): void {
    if (this.idEvaluacion == null) return;
    this.service.preliminares(this.idEvaluacion).subscribe({
      next: (l) => this.preliminares.set(l)
    });
    this.service.acciones(this.idEvaluacion).subscribe({
      next: (l) => this.acciones.set(l)
    });
  }
}
