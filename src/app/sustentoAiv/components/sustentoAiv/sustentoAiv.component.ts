import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SustentoAivService } from '../../services/sustentoAiv.service';
import { SustentoAivResponse, MapeoArchivoSustento } from '../../models/sustentoAiv.model';
import { excedeTamanioMaximo } from '../../../shared/utils/archivo.util';
import { parsearMapeoCsv } from '../../../shared/utils/mapeoSustentoCsv.util';

@Component({
  selector: 'app-sustento-aiv',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatButtonModule, MatInputModule,
    MatFormFieldModule, MatTableModule
  ],
  templateUrl: './sustentoAiv.component.html',
  styleUrl: './sustentoAiv.component.scss'
})
export class SustentoAivComponent {
  private service = inject(SustentoAivService);
  private snack = inject(MatSnackBar);

  idEvaluacionRegistro: number | null = null;
  idEvaluacionAiv: number | null = null;
  codigoUnicoAtencion = '';
  usuario = 'admin';
  archivoIndividual: File | null = null;
  archivoZip: File | null = null;
  archivoMapeo: File | null = null;
  sustentos = signal<SustentoAivResponse[]>([]);
  displayedColumns = ['nombreArchivo', 'tamanioBytes', 'origen', 'fechaCarga', 'acciones'];

  onFileIndividual(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const f = input.files;
    const archivo = f && f.length > 0 ? f[0] : null;
    if (archivo && excedeTamanioMaximo(archivo)) {
      this.snack.open('El archivo excede el tamaño máximo permitido (50 MB)', 'OK', { duration: 4000 });
      input.value = '';
      this.archivoIndividual = null;
      return;
    }
    this.archivoIndividual = archivo;
  }

  onFileZip(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const f = input.files;
    const archivo = f && f.length > 0 ? f[0] : null;
    if (archivo && excedeTamanioMaximo(archivo)) {
      this.snack.open('El archivo excede el tamaño máximo permitido (50 MB)', 'OK', { duration: 4000 });
      input.value = '';
      this.archivoZip = null;
      return;
    }
    this.archivoZip = archivo;
  }

  onFileMapeo(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const f = input.files;
    this.archivoMapeo = f && f.length > 0 ? f[0] : null;
  }

  listar(): void {
    if (this.idEvaluacionRegistro == null) return;
    this.service.listarPorRegistro(this.idEvaluacionRegistro).subscribe({
      next: (l) => this.sustentos.set(l),
      error: () => this.sustentos.set([])
    });
  }

  cargarIndividual(): void {
    if (!this.archivoIndividual || this.idEvaluacionRegistro == null) return;
    const file = this.archivoIndividual;
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = (reader.result as string).split(',')[1];
      this.service.cargarIndividual({
        idEvaluacionRegistro: this.idEvaluacionRegistro!,
        codigoUnicoAtencion: this.codigoUnicoAtencion,
        nombreArchivo: file.name,
        tipoMime: file.type,
        contenidoBase64: b64,
        usuario: this.usuario
      }).subscribe({
        next: () => { this.snack.open('Sustento cargado', 'OK', { duration: 3000 }); this.listar(); },
        error: (err) => this.snack.open(err?.error?.message ?? 'Error al cargar', 'OK', { duration: 4000 })
      });
    };
    reader.readAsDataURL(file);
  }

  async cargarMasivo(): Promise<void> {
    if (!this.archivoZip || this.idEvaluacionAiv == null) return;
    const idEvaluacionAiv = this.idEvaluacionAiv;

    let mapeo: MapeoArchivoSustento[] | undefined;
    if (this.archivoMapeo) {
      try {
        const contenidoCsv = await this.leerComoTexto(this.archivoMapeo);
        const resultado = parsearMapeoCsv(contenidoCsv);
        if (resultado.filasInvalidas.length) {
          this.snack.open(
            `La plantilla de mapeo tiene filas inválidas: ${resultado.filasInvalidas.map((f) => `fila ${f.numeroFila}`).join(', ')}`,
            'OK', { duration: 6000 }
          );
          return;
        }
        mapeo = resultado.mapeo;
      } catch (error) {
        this.snack.open((error as Error).message, 'OK', { duration: 6000 });
        return;
      }
    }

    const file = this.archivoZip;
    const contenidoZipBase64 = await this.leerComoBase64(file);
    this.service.cargarMasivo({
      idEvaluacionAiv, nombreArchivoZip: file.name, contenidoZipBase64, usuario: this.usuario, mapeo
    }).subscribe({
      next: (resultado) => {
        this.archivoZip = null;
        this.archivoMapeo = null;
        const mensaje = resultado.rechazados.length
          ? `Cargados ${resultado.cargados.length}, rechazados ${resultado.rechazados.length}`
          : `Cargados ${resultado.cargados.length} sustentos`;
        this.snack.open(mensaje, 'OK', { duration: 4000 });
      },
      error: (err) => this.snack.open(err?.error?.message ?? 'Error masivo', 'OK', { duration: 4000 })
    });
  }

  private leerComoBase64(archivo: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const lector = new FileReader();
      lector.onload = () => resolve((lector.result as string).split(',')[1]);
      lector.onerror = () => reject(lector.error);
      lector.readAsDataURL(archivo);
    });
  }

  private leerComoTexto(archivo: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const lector = new FileReader();
      lector.onload = () => resolve(lector.result as string);
      lector.onerror = () => reject(lector.error);
      lector.readAsText(archivo);
    });
  }

  descargar(s: SustentoAivResponse): void {
    this.service.descargar(s.id).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = s.nombreArchivo; a.click();
      URL.revokeObjectURL(url);
    });
  }

  eliminar(s: SustentoAivResponse): void {
    this.service.eliminar(s.id, this.usuario).subscribe({
      next: () => this.listar(),
      error: (err) => this.snack.open(err?.error?.message ?? 'Error', 'OK', { duration: 4000 })
    });
  }
}
