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
import { ParametroService } from '../services/parametro.service';
import { Parametro } from '../models/parametro.model';
import { ParametroFormComponent } from './parametro-form.component';

@Component({
  selector: 'app-parametro-list',
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
  templateUrl: './parametro-list.component.html',
  styleUrl: './parametro-list.component.scss'
})
export class ParametroListComponent implements OnInit {
  parametros: Parametro[] = [];
  displayedColumns: string[] = [
    'codigoParametro',
    'descripcionParametro',
    'valor',
    'tipoParametro',
    'deEstado',
    'acciones'
  ];
  filtroEstado: 'todos' | 'activos' | 'inactivos' = 'todos';

  constructor(
    private parametroService: ParametroService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargarParametros();
  }

  cargarParametros(): void {
    const observable = this.filtroEstado === 'todos'
      ? this.parametroService.listarTodos()
      : this.parametroService.listarPorEstado(this.filtroEstado === 'activos' ? '1' : '0');

    observable.subscribe({
      next: (data) => {
        this.parametros = data;
      },
      error: (error) => {
        this.mostrarError('Error al cargar parámetros', error);
      }
    });
  }

  filtrarPorEstado(estado: 'todos' | 'activos' | 'inactivos'): void {
    this.filtroEstado = estado;
    this.cargarParametros();
  }

  crear(): void {
    const dialogRef = this.dialog.open(ParametroFormComponent, {
      width: '600px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarParametros();
      }
    });
  }

  editar(parametro: Parametro): void {
    const dialogRef = this.dialog.open(ParametroFormComponent, {
      width: '600px',
      data: { mode: 'edit', parametro }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarParametros();
      }
    });
  }

  eliminar(parametro: Parametro): void {
    if (confirm(`¿Está seguro de dar de baja el parámetro ${parametro.codigoParametro}?`)) {
      this.parametroService.eliminar(parametro.id!).subscribe({
        next: () => {
          this.snackBar.open('Parámetro dado de baja correctamente', 'Cerrar', { duration: 3000 });
          this.cargarParametros();
        },
        error: (error) => {
          this.mostrarError('Error al dar de baja el parámetro', error);
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
