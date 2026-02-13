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
import { UsuarioService } from '../services/usuario.service';
import { Usuario } from '../models/usuario.model';
import { UsuarioFormComponent } from './usuario-form.component';


@Component({
  selector: 'app-usuario-list',
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
  templateUrl: './usuario-list.component.html',
  styleUrl: './usuario-list.component.scss'
})
export class UsuarioListComponent implements OnInit {
  usuarios: Usuario[] = [];
  displayedColumns: string[] = [
    'codigoUsuario',
    'nombreUsuario',
    'nombres',
    'apellidos',
    'email',
    'telefono',
    'nombrePerfil',
    'deEstado',
    'acciones'
  ];
  filtroEstado: 'todos' | 'activos' | 'inactivos' = 'todos';

  constructor(
    private usuarioService: UsuarioService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    const observable = this.filtroEstado === 'todos' 
      ? this.usuarioService.listarTodos()
      : this.usuarioService.listarPorEstado(this.filtroEstado === 'activos' ? '1' : '0');

    observable.subscribe({
      next: (data) => {
        this.usuarios = data;
      },
      error: (error) => {
        this.mostrarError('Error al cargar usuarios', error);
      }
    });
  }

  filtrarPorEstado(estado: 'todos' | 'activos' | 'inactivos'): void {
    this.filtroEstado = estado;
    this.cargarUsuarios();
  }

  crear(): void {
    const dialogRef = this.dialog.open(UsuarioFormComponent, {
      width: '600px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarUsuarios();
      }
    });
  }

  editar(usuario: Usuario): void {
    const dialogRef = this.dialog.open(UsuarioFormComponent, {
      width: '600px',
      data: { mode: 'edit', usuario }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarUsuarios();
      }
    });
  }

  eliminar(usuario: Usuario): void {
    if (confirm(`¿Está seguro de dar de baja el usuario ${usuario.nombreUsuario}?`)) {
      this.usuarioService.eliminar(usuario.id!).subscribe({
        next: () => {
          this.snackBar.open('Usuario dado de baja correctamente', 'Cerrar', { duration: 3000 });
          this.cargarUsuarios();
        },
        error: (error) => {
          this.mostrarError('Error al dar de baja el usuario', error);
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