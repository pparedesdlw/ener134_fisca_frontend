import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { EvaluacionAivResponse } from '../../models/evaluacionAiv.model';

export interface ResultadoConsolidadoDialogData {
  evaluacion: EvaluacionAivResponse;
}

/** RF06: pantalla de resultados consolidados y cálculo del indicador AIV. */
@Component({
  selector: 'app-resultado-consolidado-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatTableModule],
  templateUrl: './resultado-consolidado-dialog.component.html',
  styleUrl: './resultado-consolidado-dialog.component.scss'
})
export class ResultadoConsolidadoDialogComponent {
  displayedColumns = ['item', 'descripcion', 'existentes', 'fiscalizados', 'incumplimientos'];

  constructor(
    public dialogRef: MatDialogRef<ResultadoConsolidadoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ResultadoConsolidadoDialogData
  ) {}

  get esTotal(): boolean {
    return this.data.evaluacion.estadoEvaluacion === 'CONSOLIDADO_TOTAL';
  }

  salir(): void {
    this.dialogRef.close();
  }
}
