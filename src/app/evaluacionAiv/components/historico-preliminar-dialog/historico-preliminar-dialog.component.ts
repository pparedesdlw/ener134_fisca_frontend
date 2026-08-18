import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EvaluacionAivService } from '../../services/evaluacionAiv.service';
import { EvaluacionAivResponse } from '../../models/evaluacionAiv.model';

export interface HistoricoPreliminarDialogData {
  codigoPeriodo: string;
  codigoEmpresa: number;
}

/** RF08: ventana "Ver histórico – Periodo en evaluación" — cálculo preliminar acumulado vigente. */
@Component({
  selector: 'app-historico-preliminar-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatTableModule, MatProgressSpinnerModule],
  templateUrl: './historico-preliminar-dialog.component.html',
  styleUrl: './historico-preliminar-dialog.component.scss'
})
export class HistoricoPreliminarDialogComponent implements OnInit {
  private service = inject(EvaluacionAivService);

  displayedColumns = ['item', 'descripcion', 'existentes', 'fiscalizados', 'incumplimientos'];
  cargando = signal<boolean>(true);
  evaluacion = signal<EvaluacionAivResponse | null>(null);
  sinInformacion = signal<boolean>(false);

  constructor(
    public dialogRef: MatDialogRef<HistoricoPreliminarDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: HistoricoPreliminarDialogData
  ) {}

  ngOnInit(): void {
    this.service.obtenerHistoricoPreliminar(this.data.codigoPeriodo, this.data.codigoEmpresa).subscribe({
      next: (e) => {
        this.evaluacion.set(e);
        this.cargando.set(false);
      },
      error: () => {
        this.sinInformacion.set(true);
        this.cargando.set(false);
      }
    });
  }

  salir(): void {
    this.dialogRef.close();
  }
}
