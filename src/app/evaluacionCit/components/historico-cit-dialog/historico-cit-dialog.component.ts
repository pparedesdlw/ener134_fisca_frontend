import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EvaluacionCitService } from '../../services/evaluacionCit.service';
import { EvaluacionCitResponse } from '../../models/evaluacionCit.model';

export interface HistoricoCitDialogData {
  codigoPeriodo: string;
  codigoEmpresa: string;
}

/** RF14: ventana "Ver histórico" de evaluaciones CIT del trimestre (estructura alineada a RF08). */
@Component({
  selector: 'app-historico-cit-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './historico-cit-dialog.component.html',
  styleUrl: './historico-cit-dialog.component.scss'
})
export class HistoricoCitDialogComponent implements OnInit {
  private service = inject(EvaluacionCitService);

  cargando = signal<boolean>(true);
  evaluacion = signal<EvaluacionCitResponse | null>(null);
  sinInformacion = signal<boolean>(false);

  constructor(
    public dialogRef: MatDialogRef<HistoricoCitDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: HistoricoCitDialogData
  ) {}

  ngOnInit(): void {
    this.service.historico(this.data.codigoPeriodo, this.data.codigoEmpresa).subscribe({
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
