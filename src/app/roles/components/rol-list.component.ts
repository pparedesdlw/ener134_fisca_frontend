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
import { RolService } from '../services/rol.service';
import { Rol } from '../models/rol.model';
import { RolFormComponent } from './rol-form.component';

@Component({
  selector: 'app-rol-list',
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
  templateUrl: './rol-list.component.html',
  styleUrl: './rol-list.component.scss'
})
export class RolListComponent implements OnInit {
  roles: Rol[] = [];
  displayedColumns: string[] = [
    'codigoRol',
    'responsableRol',
    'descripcionRol',
    'deEstado',
    'acciones'
  ];
  filtroEstado: 'todos' | 'activos' | 'inactivos' = 'todos';

  constructor(
    private rolService: RolService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargarRoles();
  }

  cargarRoles(): void {
    const observable = this.filtroEstado === 'todos'
      ? this.rolService.listarTodos()
      : this.rolService.listarPorEstado(this.filtroEstado === 'activos' ? '1' : '0');

    observable.subscribe({
      next: (data) => {
        this.roles = data;
      },
      error: (error) => {
        this.mostrarError('Error al cargar roles', error);
      }
    });
  }

  filtrarPorEstado(estado: 'todos' | 'activos' | 'inactivos'): void {
    this.filtroEstado = estado;
    this.cargarRoles();
  }

  crear(): void {
    const dialogRef = this.dialog.open(RolFormComponent, {
      width: '600px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarRoles();
      }
    });
  }

  editar(rol: Rol): void {
    const dialogRef = this.dialog.open(RolFormComponent, {
      width: '600px',
      data: { mode: 'edit', rol }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarRoles();
      }
    });
  }

  eliminar(rol: Rol): void {
    if (confirm(`¿Está seguro de dar de baja el rol ${rol.descripcionRol}?`)) {
      this.rolService.eliminar(rol.id!).subscribe({
        next: () => {
          this.snackBar.open('Rol dado de baja correctamente', 'Cerrar', { duration: 3000 });
          this.cargarRoles();
        },
        error: (error) => {
          this.mostrarError('Error al dar de baja el rol', error);
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
