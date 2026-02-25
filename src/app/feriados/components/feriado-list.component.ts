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
import { FeriadoService } from '../services/feriado.service';
import { Feriado } from '../models/feriado.model';
import { FeriadoFormComponent } from './feriado-form.component';

@Component({
  selector: 'app-feriado-list',
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
    MatTooltipModule
  ],
  templateUrl: './feriado-list.component.html',
  styleUrl: './feriado-list.component.scss'
})
export class FeriadoListComponent implements OnInit {
  feriados: Feriado[] = [];
  displayedColumns: string[] = [
    'fechaFeriadoIni',
    'fechaFeriadoFin',
    'codigoRegion',
    'descripcionFeriado',
    'tipoFeriado',
    'deEstado',
    'acciones'
  ];
  filtroEstado: 'todos' | 'activos' | 'inactivos' = 'todos';

  constructor(
    private feriadoService: FeriadoService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargarFeriados();
  }

  cargarFeriados(): void {
    const observable = this.filtroEstado === 'todos'
      ? this.feriadoService.listarTodos()
      : this.feriadoService.listarPorEstado(this.filtroEstado === 'activos' ? '1' : '0');

    observable.subscribe({
      next: (data) => {
        this.feriados = data;
      },
      error: (error) => {
        this.mostrarError('Error al cargar feriados', error);
      }
    });
  }

  filtrarPorEstado(estado: 'todos' | 'activos' | 'inactivos'): void {
    this.filtroEstado = estado;
    this.cargarFeriados();
  }

  crear(): void {
    const dialogRef = this.dialog.open(FeriadoFormComponent, {
      width: '600px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarFeriados();
      }
    });
  }

  editar(feriado: Feriado): void {
    const dialogRef = this.dialog.open(FeriadoFormComponent, {
      width: '600px',
      data: { mode: 'edit', feriado }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarFeriados();
      }
    });
  }

  eliminar(feriado: Feriado): void {
    if (confirm(`¿Está seguro de dar de baja el feriado ${feriado.descripcionFeriado}?`)) {
      this.feriadoService.eliminar(feriado.id!).subscribe({
        next: () => {
          this.snackBar.open('Feriado dado de baja correctamente', 'Cerrar', { duration: 3000 });
          this.cargarFeriados();
        },
        error: (error) => {
          this.mostrarError('Error al dar de baja la empresa', error);
        }
      });
    }
  }

  private mostrarError(mensaje: string, error: any): void {
    const errorMsg = error.error?.message || error.message || mensaje;
    this.snackBar.open(errorMsg, 'Cerrar', { duration: 5000 });
    console.error(error);
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
