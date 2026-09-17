import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ResponsableService } from '../services/responsable.service';
import { Responsable } from '../models/responsable.model';
import { ResponsableFormComponent } from './responsable-form.component';


@Component({
  selector: 'app-responsable-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatSlideToggleModule
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

  /** Paginación en memoria (regla institucional: toda grilla que pueda superar 10 filas debe paginar). */
  paginaResponsables = 0;
  tamanioPaginaResponsables = 20;

  onPaginaResponsables(event: PageEvent): void {
    this.paginaResponsables = event.pageIndex;
    this.tamanioPaginaResponsables = event.pageSize;
  }

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
        this.paginaResponsables = 0;
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

  cambiarEstado(responsable: Responsable): void {
    this.responsableService.cambiarEstado(responsable.id!).subscribe({
      next: () => {
        const msg = responsable.estado ? 'desactivado' : 'activado';
        this.snackBar.open(`Responsable ${msg} correctamente`, 'Cerrar', { duration: 3000 });
        this.cargarResponsables();
      },
      error: (error) => {
        this.mostrarError('Error al cambiar estado del responsable', error);
        this.cargarResponsables();
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