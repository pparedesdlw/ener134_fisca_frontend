import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SustentoAivService } from '../../../sustentoAiv/services/sustentoAiv.service';
import { SustentoAivResponse } from '../../../sustentoAiv/models/sustentoAiv.model';
import { excedeTamanioMaximo } from '../../../shared/utils/archivo.util';

export interface VerSustentoDialogData {
  idEvaluacionRegistro: number;
  codigoUnicoAtencion: string;
  usuario: string;
}

/** RF03/RF04: carga y consulta de sustentos asociados a un registro evaluado. */
@Component({
  selector: 'app-ver-sustento-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatTableModule, MatIconModule],
  templateUrl: './ver-sustento-dialog.component.html'
})
export class VerSustentoDialogComponent implements OnInit {
  private service = inject(SustentoAivService);
  private snack = inject(MatSnackBar);

  sustentos = signal<SustentoAivResponse[]>([]);
  displayedColumns = ['nombreArchivo', 'tamanioBytes', 'origen', 'fechaCarga', 'acciones'];
  archivoSeleccionado: File | null = null;

  constructor(
    public dialogRef: MatDialogRef<VerSustentoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: VerSustentoDialogData
  ) {}

  ngOnInit(): void {
    this.listar();
  }

  listar(): void {
    this.service.listarPorRegistro(this.data.idEvaluacionRegistro).subscribe({
      next: (l) => this.sustentos.set(l),
      error: () => this.sustentos.set([])
    });
  }

  onArchivoSeleccionado(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const archivos = input.files;
    const archivo = archivos && archivos.length > 0 ? archivos[0] : null;
    if (archivo && excedeTamanioMaximo(archivo)) {
      this.snack.open('El archivo excede el tamaño máximo permitido (50 MB)', 'Cerrar', { duration: 4000 });
      input.value = '';
      this.archivoSeleccionado = null;
      return;
    }
    this.archivoSeleccionado = archivo;
  }

  cargar(): void {
    if (!this.archivoSeleccionado) {
      return;
    }
    const archivo = this.archivoSeleccionado;
    const lector = new FileReader();
    lector.onload = () => {
      const base64 = (lector.result as string).split(',')[1];
      this.service.cargarIndividual({
        idEvaluacionRegistro: this.data.idEvaluacionRegistro,
        codigoUnicoAtencion: this.data.codigoUnicoAtencion,
        nombreArchivo: archivo.name,
        tipoMime: archivo.type,
        contenidoBase64: base64,
        usuario: this.data.usuario
      }).subscribe({
        next: () => {
          this.snack.open('Sustento cargado', 'Cerrar', { duration: 3000 });
          this.archivoSeleccionado = null;
          this.listar();
        },
        error: (err) => this.snack.open(err?.error?.message ?? 'Error al cargar el sustento', 'Cerrar', { duration: 4000 })
      });
    };
    lector.readAsDataURL(archivo);
  }

  descargar(sustento: SustentoAivResponse): void {
    this.service.descargar(sustento.id).subscribe((blob) => {
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.download = sustento.nombreArchivo;
      enlace.click();
      URL.revokeObjectURL(url);
    });
  }

  eliminar(sustento: SustentoAivResponse): void {
    this.service.eliminar(sustento.id, this.data.usuario).subscribe({
      next: () => this.listar(),
      error: (err) => this.snack.open(err?.error?.message ?? 'Error al eliminar', 'Cerrar', { duration: 4000 })
    });
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}
