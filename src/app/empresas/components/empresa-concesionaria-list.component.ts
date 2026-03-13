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
import { EmpresaConcesionariaService } from '../services/empresa-concesionaria.service';
import { EmpresaConcesionaria } from '../models/empresa-concesionaria.model';
import { EmpresaConcesionariaFormComponent } from './empresa-concesionaria-form.component';

@Component({
  selector: 'app-empresa-concesionaria-list',
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
  templateUrl: './empresa-concesionaria-list.component.html',
  styleUrl: './empresa-concesionaria-list.component.scss'
})
export class EmpresaConcesionariaListComponent implements OnInit {
  empresas: EmpresaConcesionaria[] = [];
  displayedColumns: string[] = [
    'codigoEmpresa',
    'ruc',
    'deTipo',
    'razonSocial',
    'descripcion',
    'deEstado',
    'acciones'
  ];
  filtroEstado: 'todos' | 'activos' | 'inactivos' = 'todos';

  constructor(
    private empresaConcesionariaService: EmpresaConcesionariaService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargarEmpresas();
  }

  cargarEmpresas(): void {
    const observable = this.filtroEstado === 'todos'
      ? this.empresaConcesionariaService.listarTodos()
      : this.empresaConcesionariaService.listarPorEstado(this.filtroEstado === 'activos' ? '1' : '0');

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
    const dialogRef = this.dialog.open(EmpresaConcesionariaFormComponent, {
      width: '600px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarEmpresas();
      }
    });
  }

  editar(empresaConcesionaria: EmpresaConcesionaria): void {
    const dialogRef = this.dialog.open(EmpresaConcesionariaFormComponent, {
      width: '600px',
      data: { mode: 'edit', empresaConcesionaria }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarEmpresas();
      }
    });
  }

  eliminar(empresaConcesionaria: EmpresaConcesionaria): void {
    if (empresaConcesionaria.estado === "1"){
      if (confirm(`¿Está seguro de dar de baja la empresa concesionaria ${empresaConcesionaria.codigoEmpresa}?`)) {
      this.empresaConcesionariaService.eliminar(empresaConcesionaria.id!).subscribe({
          next: () => {
            this.snackBar.open('Empresa concesionaria dada de baja correctamente', 'Cerrar', { duration: 3000 });
            this.cargarEmpresas();
          },
          error: (error) => {
            this.mostrarError('Error al dar de baja la empresa concesionaria', error);
          }
        });
      }
    } else {
      this.mostrarInfo(`La empresa concesionaria: ${empresaConcesionaria.codigoEmpresa} - se encuentra Inactivo`);
    }
    
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
