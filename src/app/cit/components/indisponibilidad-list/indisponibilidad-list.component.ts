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
import { CitService } from '../../services/cit.service';
import { IndisponibilidadSistema } from '../../models/cit.model';
import { IndisponibilidadFormComponent } from '../indisponibilidad-form/indisponibilidad-form.component';

@Component({
  selector: 'app-indisponibilidad-list',
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
  templateUrl: './indisponibilidad-list.component.html',
  styleUrl: './indisponibilidad-list.component.scss'
})
export class IndisponibilidadListComponent implements OnInit {
  indisponibilidades: IndisponibilidadSistema[] = [];
  displayedColumns: string[] = [
    'fechaInicioIndisponibilidad',
    'fechaFinIndisponibilidad',
    'motivo',
    'estado',
    'acciones'
  ];
  filtroEstado: 'todos' | 'activos' | 'inactivos' = 'todos';

  constructor(
    private citService: CitService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargarIndisponibilidades();
  }

  cargarIndisponibilidades(): void {
    const observable = this.filtroEstado === 'activos'
      ? this.citService.listarIndisponibilidadesActivas()
      : this.citService.listarIndisponibilidades();

    observable.subscribe({
      next: (data) => {
        if (this.filtroEstado === 'inactivos') {
          this.indisponibilidades = data.filter(i => i.estado !== 'Activo');
        } else {
          this.indisponibilidades = data;
        }
      },
      error: (error) => {
        this.mostrarError('Error al cargar indisponibilidades', error);
      }
    });
  }

  filtrarPorEstado(estado: 'todos' | 'activos' | 'inactivos'): void {
    this.filtroEstado = estado;
    this.cargarIndisponibilidades();
  }

  crear(): void {
    const dialogRef = this.dialog.open(IndisponibilidadFormComponent, {
      width: '600px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarIndisponibilidades();
      }
    });
  }

  desactivar(indisponibilidad: IndisponibilidadSistema): void {
    if (confirm('¿Está seguro de desactivar esta indisponibilidad?')) {
      this.citService.desactivarIndisponibilidad(indisponibilidad.codigoIndisponibilidad!).subscribe({
        next: () => {
          this.snackBar.open('Indisponibilidad desactivada correctamente', 'Cerrar', { duration: 3000 });
          this.cargarIndisponibilidades();
        },
        error: (error) => {
          this.mostrarError('Error al desactivar la indisponibilidad', error);
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
      default: return '';
    }
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    // Formato: "2026-01-15T08:00:00" -> "15/01/2026 08:00"
    try {
      const date = new Date(fecha);
      const dia = date.getDate().toString().padStart(2, '0');
      const mes = (date.getMonth() + 1).toString().padStart(2, '0');
      const anio = date.getFullYear();
      const hora = date.getHours().toString().padStart(2, '0');
      const minuto = date.getMinutes().toString().padStart(2, '0');
      return `${dia}/${mes}/${anio} ${hora}:${minuto}`;
    } catch {
      return fecha;
    }
  }
}
