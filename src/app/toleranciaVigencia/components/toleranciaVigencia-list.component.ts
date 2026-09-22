import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe } from '@angular/common';
import { ToleranciaVigenciaService } from '../services/toleranciaVigencia.service';
import { ToleranciaVigencia } from '../models/toleranciaVigencia.model';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-tolerancia-vigencia-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule
  ],
  providers: [provideNativeDateAdapter(), DatePipe],
  templateUrl: './toleranciaVigencia-list.component.html',
  styleUrl: './toleranciaVigencia-list.component.scss'
})
export class ToleranciaVigenciaListComponent implements OnInit {
  indicadorSeleccionado: 'AIV' | 'CIT' = 'AIV';
  historico: ToleranciaVigencia[] = [];
  displayedColumns: string[] = ['tolerancia', 'fechaVigenciaDesde', 'fechaVigenciaHasta', 'usuarioCreacion'];

  nuevaTolerancia: number | null = null;
  nuevaFechaDesde: Date | null = null;

  cargando = false;
  guardando = false;

  get vigenciaActual(): ToleranciaVigencia | undefined {
    return this.historico.find(v => !v.fechaVigenciaHasta);
  }

  constructor(
    private service: ToleranciaVigenciaService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.cargarHistorico();
  }

  seleccionarIndicador(indicador: 'AIV' | 'CIT'): void {
    if (this.indicadorSeleccionado === indicador) {
      return;
    }
    this.indicadorSeleccionado = indicador;
    this.cargarHistorico();
  }

  cargarHistorico(): void {
    this.cargando = true;
    this.service.listarHistorico(this.indicadorSeleccionado).subscribe({
      next: (historico) => {
        this.historico = historico;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        this.snackBar.open('No se pudo cargar el histórico de tolerancia', 'Cerrar', { duration: 4000 });
      }
    });
  }

  registrarNuevaVigencia(): void {
    if (this.nuevaTolerancia === null || this.nuevaTolerancia < 0) {
      this.snackBar.open('Ingrese un valor de tolerancia válido', 'Cerrar', { duration: 4000 });
      return;
    }
    if (!this.nuevaFechaDesde) {
      this.snackBar.open('Seleccione la fecha desde la cual estará vigente', 'Cerrar', { duration: 4000 });
      return;
    }

    this.guardando = true;
    this.service.crear({
      codigoIndicador: this.indicadorSeleccionado,
      tolerancia: this.nuevaTolerancia,
      fechaVigenciaDesde: this.datePipe.transform(this.nuevaFechaDesde, 'yyyy-MM-dd')!,
      usuario: this.authService.currentUsername
    }).subscribe({
      next: () => {
        this.guardando = false;
        this.nuevaTolerancia = null;
        this.nuevaFechaDesde = null;
        this.snackBar.open('Nueva vigencia de tolerancia registrada', 'Cerrar', { duration: 3000 });
        this.cargarHistorico();
      },
      error: (error) => {
        this.guardando = false;
        this.snackBar.open(error.error?.message ?? 'Error al registrar la nueva vigencia', 'Cerrar', { duration: 5000 });
      }
    });
  }
}
