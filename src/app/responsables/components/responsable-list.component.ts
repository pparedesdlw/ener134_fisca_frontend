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
import { ResponsableService } from '../services/responsable.service';
import { Responsable } from '../models/responsable.model';
import { ResponsableFormComponent } from './responsable-form.component';


@Component({
  selector: 'app-responsable-list',
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
  templateUrl: './responsable-list.component.html',
  styleUrl: './responsable-list.component.scss'
})
export class ResponsableListComponent implements OnInit {
  responsables: Responsable[] = [];
  displayedColumns: string[] = [
    'codigoResponsable',
    'nombreResponsable',
    'codigoEmpresa',
    'deEstado',
    'acciones'
  ];
  filtroEstado: 'todos' | 'activos' | 'inactivos' = 'todos';

  constructor(
    private responsableService: ResponsableService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargarResponsables();
  }

  cargarResponsables(): void {
    const observable = this.filtroEstado === 'todos' 
      ? this.responsableService.listarTodos()
      : this.responsableService.listarPorEstado(this.filtroEstado === 'activos' ? '1' : '0');

    observable.subscribe({
      next: (data) => {
        this.responsables = data;
      },
      error: (error) => {
        this.mostrarError('Error al cargar responsables', error);
      }
    });
  }

  filtrarPorEstado(estado: 'todos' | 'activos' | 'inactivos'): void {
    this.filtroEstado = estado;
    this.cargarResponsables();
  }

  crear(): void {
    const dialogRef = this.dialog.open(ResponsableFormComponent, {
      width: '600px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarResponsables();
      }
    });
  }

  editar(responsable: Responsable): void {
    const dialogRef = this.dialog.open(ResponsableFormComponent, {
      width: '600px',
      data: { mode: 'edit', responsable }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarResponsables();
      }
    });
  }

  eliminar(responsable: Responsable): void {
    if (confirm(`¿Está seguro de dar de baja el responsable ${responsable.nombreResponsable}?`)) {
      this.responsableService.eliminar(responsable.id!).subscribe({
        next: () => {
          this.snackBar.open('Responsable dado de baja correctamente', 'Cerrar', { duration: 3000 });
          this.cargarResponsables();
        },
        error: (error) => {
          this.mostrarError('Error al dar de baja el responsable', error);
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