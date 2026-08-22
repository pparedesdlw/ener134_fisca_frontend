import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EvaluacionAivService } from '../../services/evaluacionAiv.service';
import { EvaluacionAivResponse, EvaluacionRegistroResponse, ItemEvaluadoRequest } from '../../models/evaluacionAiv.model';
import { CatalogoItemAivService } from '../../../catalogoItemAiv/services/catalogoItemAiv.service';
import { CatalogoItemAivResponse } from '../../../catalogoItemAiv/models/catalogoItemAiv.model';
import { VerSustentoDialogComponent } from '../ver-sustento-dialog/ver-sustento-dialog.component';

export interface EvaluarItemsDialogData {
  registro: EvaluacionRegistroResponse;
  usuario: string;
}

const ITEM_BLOQUEANTE_ORIGEN = 'ITEM_02';
const ITEM_AUTO_INCUMPLE_DESTINO = 'ITEM_01';

/** RF03: modal "Evaluar ítems" — código único, datos de solo lectura, 4 ítems, justificación y sustento. */
@Component({
  selector: 'app-evaluar-items-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatRadioModule, MatIconModule
  ],
  templateUrl: './evaluar-items-dialog.component.html',
  styleUrl: './evaluar-items-dialog.component.scss'
})
export class EvaluarItemsDialogComponent implements OnInit {
  private service = inject(EvaluacionAivService);
  private catalogoService = inject(CatalogoItemAivService);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);

  catalogo: CatalogoItemAivResponse[] = [];
  cumplePorItem: Record<string, boolean | null> = {};
  justificacion = '';
  guardando = false;

  constructor(
    public dialogRef: MatDialogRef<EvaluarItemsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EvaluarItemsDialogData
  ) {}

  ngOnInit(): void {
    this.justificacion = this.data.registro.observacion ?? '';
    this.catalogoService.listarVigentes().subscribe({
      next: (catalogo) => {
        this.catalogo = catalogo;
        for (const item of catalogo) {
          const previo = this.data.registro.items.find((i) => i.codigoItem === item.codigoItem);
          this.cumplePorItem[item.codigoItem] = previo?.cumple ?? null;
        }
      }
    });
  }

  seleccionarCumple(codigoItem: string, cumple: boolean): void {
    this.cumplePorItem[codigoItem] = cumple;
    if (codigoItem === ITEM_BLOQUEANTE_ORIGEN && !cumple) {
      this.cumplePorItem[ITEM_AUTO_INCUMPLE_DESTINO] = false;
    }
  }

  /** ITEM_02 incumplido fuerza automáticamente el incumplimiento de ITEM_01 (regla literal del ERS). */
  itemBloqueadoPorAutoIncumple(codigoItem: string): boolean {
    return codigoItem === ITEM_AUTO_INCUMPLE_DESTINO && this.cumplePorItem[ITEM_BLOQUEANTE_ORIGEN] === false;
  }

  abrirSustento(): void {
    this.dialog.open(VerSustentoDialogComponent, {
      width: '700px',
      data: {
        idEvaluacionRegistro: this.data.registro.id,
        codigoUnicoAtencion: this.data.registro.codigoUnico ?? '',
        usuario: this.data.usuario
      }
    });
  }

  guardar(): void {
    if (this.catalogo.some((item) => this.cumplePorItem[item.codigoItem] == null)) {
      this.snack.open('Debe evaluar todos los ítems', 'Cerrar', { duration: 4000 });
      return;
    }
    if (!this.justificacion.trim()) {
      this.snack.open('La justificación es obligatoria', 'Cerrar', { duration: 4000 });
      return;
    }
    const items: ItemEvaluadoRequest[] = this.catalogo.map((item) => ({
      codigoItem: item.codigoItem,
      cumple: this.cumplePorItem[item.codigoItem] as boolean
    }));

    this.guardando = true;
    this.service.evaluarRegistro({
      idEvaluacionRegistro: this.data.registro.id,
      usuario: this.data.usuario,
      observacion: this.justificacion.trim(),
      items
    }).subscribe({
      next: (evaluacion: EvaluacionAivResponse) => {
        this.guardando = false;
        this.snack.open('Registro evaluado', 'Cerrar', { duration: 3000 });
        this.dialogRef.close(evaluacion);
      },
      error: (err) => {
        this.guardando = false;
        this.snack.open(err?.error?.message ?? 'Error al guardar la evaluación', 'Cerrar', { duration: 4000 });
      }
    });
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
