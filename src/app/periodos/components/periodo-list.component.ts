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
import { PeriodoService } from '../services/periodo.service';
import { Periodo } from '../models/periodo.model';
import { PeriodoFormComponent } from './periodo-form.component';
import { AmpliarVigenciaDialogComponent } from './ampliar-vigencia-dialog.component';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-periodo-list',
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
  templateUrl: './periodo-list.component.html',
  styleUrl: './periodo-list.component.scss'
})
export class PeriodoListComponent implements OnInit {
  periodos: Periodo[] = [];
  displayedColumns: string[] = [
    'codigoPeriodo',
    'descripcion',
    'fechaInicio',
    'fechaFin',
    'deEstado',
    'diasRestantes',
    'acciones'
  ];
  filtroEstado: 'todos' | 'activos' | 'inactivos' = 'todos';

  constructor(
    private periodoService: PeriodoService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargarPeriodos();
  }

  cargarPeriodos(): void {
    const observable = this.filtroEstado === 'todos'
      ? this.periodoService.listarTodos()
      : this.periodoService.listarPorEstado(this.filtroEstado === 'activos');

    observable.subscribe({
      next: (data) => {
        this.periodos = data;
      },
      error: (error) => {
        this.mostrarError('Error al cargar periodos', error);
      }
    });
  }

  filtrarPorEstado(estado: 'todos' | 'activos' | 'inactivos'): void {
    this.filtroEstado = estado;
    this.cargarPeriodos();
  }

  crear(): void {
    const dialogRef = this.dialog.open(PeriodoFormComponent, {
      width: '600px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarPeriodos();
      }
    });
  }

  editar(periodo: Periodo): void {
    const dialogRef = this.dialog.open(PeriodoFormComponent, {
      width: '600px',
      data: { mode: 'edit', periodo }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarPeriodos();
      }
    });
  }

  cambiarEstado(periodo: Periodo): void {
    const nuevoEstado = !periodo.estadoActivo;
    this.periodoService.cambiarEstado(periodo.id!, nuevoEstado, this.authService.currentUsername).subscribe({
      next: () => {
        this.snackBar.open(
          `Periodo ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`,
          'Cerrar',
          { duration: 3000 }
        );
        this.cargarPeriodos();
      },
      error: (error) => {
        this.mostrarError('Error al cambiar estado', error);
      }
    });
  }

  ampliarVigencia(periodo: Periodo): void {
    const dialogRef = this.dialog.open(AmpliarVigenciaDialogComponent, {
      width: '500px',
      data: { periodo }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarPeriodos();
      }
    });
  }

  eliminar(periodo: Periodo): void {
    if (confirm(`¿Está seguro de dar de baja el periodo ${periodo.codigoPeriodo}?`)) {
      this.periodoService.cambiarEstado(periodo.id!, false, this.authService.currentUsername).subscribe({
        next: () => {
          this.snackBar.open('Periodo dado de baja correctamente', 'Cerrar', { duration: 3000 });
          this.cargarPeriodos();
        },
        error: (error) => {
          this.mostrarError('Error al dar de baja el periodo', error);
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
      case 'Futuro': return 'accent';
      case 'Cerrado': return 'warn';
      default: return '';
    }
  }

  puedeAmpliar(periodo: Periodo): boolean {
    return periodo.estadoActivo === true && periodo.deEstado === 'Activo';
  }

  puedeCambiarEstado(periodo: Periodo): boolean {

    return periodo.deEstado !== 'Cerrado';
  }

  getDiasRestantes(periodo: Periodo): number {

    if (periodo.diasRestantes !== undefined && periodo.diasRestantes < 0) {
      return 0;
    }
    return periodo.diasRestantes || 0;
  }
}
