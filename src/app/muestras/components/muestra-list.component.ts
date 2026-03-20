import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MuestraService } from '../services/muestra.service';
import { Muestra } from '../models/muestra.model';
import { MuestraFormComponent } from './muestra-form.component';

@Component({
  selector: 'app-muestra-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatSlideToggleModule
  ],
  templateUrl: './muestra-list.component.html',
  styleUrl: './muestra-list.component.scss'
})
export class MuestraListComponent implements OnInit {
  muestras: Muestra[] = [];
  displayedColumns: string[] = [
    'codigoMuestra',
    'muestra',
    'confianza',
    'error',
    'deEstado',
    'acciones'
  ];
  filtroEstado: 'todos' | 'activos' | 'inactivos' = 'todos';

  constructor(
    private muestraService: MuestraService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargarMuestras();
  }

  cargarMuestras(): void {
    const observable = this.filtroEstado === 'todos'
      ? this.muestraService.listarTodos()
      : this.muestraService.listarPorEstado(this.filtroEstado === 'activos' ? '1' : '0');

    observable.subscribe({
      next: (data) => {
        this.muestras = data;
      },
      error: (error) => {
        this.mostrarError('Error al cargar muestras', error);
      }
    });
  }

  filtrarPorEstado(estado: 'todos' | 'activos' | 'inactivos'): void {
    this.filtroEstado = estado;
    this.cargarMuestras();
  }

  crear(): void {
    const dialogRef = this.dialog.open(MuestraFormComponent, {
      width: '600px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarMuestras();
      }
    });
  }

  editar(muestra: Muestra): void {
    const dialogRef = this.dialog.open(MuestraFormComponent, {
      width: '600px',
      data: { mode: 'edit', muestra }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarMuestras();
      }
    });
  }

  cambiarEstado(muestra: Muestra): void {
    this.muestraService.cambiarEstado(muestra.id!).subscribe({
      next: () => {
        const msg = muestra.estado ? 'desactivada' : 'activada';
        this.snackBar.open(`Muestra ${msg} correctamente`, 'Cerrar', { duration: 3000 });
        this.cargarMuestras();
      },
      error: (error) => {
        this.mostrarError('Error al cambiar estado de la muestra', error);
        this.cargarMuestras();
      }
    });
  }

  private mostrarError(mensaje: string, error: any): void {
    const errorMsg = error.error?.message || error.message || mensaje;
    this.snackBar.open(errorMsg, 'Cerrar', { duration: 5000 });
    console.error(error);
  }

  private mostrarInfo(mensaje: string): void {
    const errorMsg = mensaje;
    this.snackBar.open(errorMsg, 'Cerrar', { duration: 4000 });
  }

  getEstadoColor(estado?: string): string {
    switch (estado) {
      case 'Activo': return 'primary';
      case 'Inactivo': return 'warn';
      case '': return 'accent';
      default: return '';
    }
  }

}
