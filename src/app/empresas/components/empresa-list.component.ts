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
import { EmpresaService } from '../services/empresa.service';
import { Empresa } from '../models/empresa.model';
import { EmpresaFormComponent } from './empresa-form.component';


@Component({
  selector: 'app-empresa-list',
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
  templateUrl: './empresa-list.component.html',
  styleUrl: './empresa-list.component.scss'
})
export class EmpresaListComponent implements OnInit {
  empresas: Empresa[] = [];
  displayedColumns: string[] = [
    'codigoEmpresa',
    'ruc',
    'deTipo',
    'razonSocial',
    'descripcion',
    'region',
    'deEstado',
    'acciones'
  ];
  filtroEstado: 'todos' | 'activos' | 'inactivos' = 'todos';

  constructor(
    private empresaService: EmpresaService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargarEmpresas();
  }

  cargarEmpresas(): void {
    const observable = this.filtroEstado === 'todos' 
      ? this.empresaService.listarTodos()
      : this.empresaService.listarPorEstado(this.filtroEstado === 'activos' ? '1' : '0');

    observable.subscribe({
      next: (data) => {
        this.empresas = data;
      },
      error: (error) => {
        this.mostrarError('Error al cargar empresas', error);
      }
    });
  }

  filtrarPorEstado(estado: 'todos' | 'activos' | 'inactivos'): void {
    this.filtroEstado = estado;
    this.cargarEmpresas();
  }

  crear(): void {
    const dialogRef = this.dialog.open(EmpresaFormComponent, {
      width: '600px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarEmpresas();
      }
    });
  }

  editar(empresa: Empresa): void {
    const dialogRef = this.dialog.open(EmpresaFormComponent, {
      width: '600px',
      data: { mode: 'edit', empresa }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarEmpresas();
      }
    });
  }

  eliminar(empresa: Empresa): void {
    if (confirm(`¿Está seguro de dar de baja la empresa ${empresa.codigoEmpresa}?`)) {
      this.empresaService.eliminar(empresa.id!).subscribe({
        next: () => {
          this.snackBar.open('Empresa dada de baja correctamente', 'Cerrar', { duration: 3000 });
          this.cargarEmpresas();
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