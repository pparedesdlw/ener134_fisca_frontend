import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { CitService } from '../../services/cit.service';
import { EmpresaService } from '../../../empresas/services/empresa.service';
import { Empresa } from '../../../empresas/models/empresa.model';
import { CitResultadoResponse, Motivo, AtencionResponse } from '../../models/cit.model';
import { AccionesAtencionComponent } from '../../../atencionesComerciales/components/acciones-atencion/acciones-atencion.component';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-calculo-cit-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatIconModule,
    AccionesAtencionComponent
  ],
  templateUrl: './calculo-cit-form.component.html',
  styleUrls: ['./calculo-cit-form.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class CalculoCitFormComponent implements OnInit {
  empresas: Empresa[] = [];
  motivos: Motivo[] = [];
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;
  maxDate: Date = new Date();
  empresaSeleccionada: string | null = null;
  motivoSeleccionado: string | null = null;
  calculando = false;
  resultado: CitResultadoResponse | null = null;
  mensaje = '';
  error = '';

  atenciones: AtencionResponse[] = [];
  atencionesColumns = ['codigoAtencion', 'codigoAsunto', 'descripcionAsunto', 'estadoAtencion', 'tieneCierre', 'expandir'];
  expandedAtencion: AtencionResponse | null = null;

  constructor(
    private citService: CitService,
    private empresaService: EmpresaService
  ) {}

  ngOnInit(): void {
    this.cargarEmpresas();
    this.cargarMotivos();
  }

  cargarEmpresas(): void {
    this.empresaService.listarTodos().subscribe({
      next: (empresas) => {
        this.empresas = empresas;
      },
      error: (error) => {
        console.error('Error cargando empresas', error);
      }
    });
  }

  cargarMotivos(): void {
    this.citService.listarMotivos().subscribe({
      next: (motivos) => {
        this.motivos = motivos;
      },
      error: (error) => {
        console.error('Error cargando motivos', error);
      }
    });
  }

  calcularCit(): void {
    this.error = '';
    this.mensaje = '';

    if (!this.fechaInicio || !this.fechaFin) {
      this.error = 'Debe seleccionar fecha de inicio y fecha de fin';
      return;
    }
    if (!this.empresaSeleccionada) {
      this.error = 'Debe seleccionar una empresa';
      return;
    }

    this.calculando = true;
    this.resultado = null;

    const request = {
      fechaInicio: this.formatDate(this.fechaInicio),
      fechaFin: this.formatDate(this.fechaFin),
      codigoEmpresa: this.empresaSeleccionada,
      descripcionMotivo: this.motivoSeleccionado
    };

    this.citService.calcularCit(request).subscribe({
      next: (resultado) => {
        this.resultado = resultado;
        this.calculando = false;
        this.mensaje = 'Cálculo CIT realizado exitosamente';
        this.cargarAtenciones();
      },
      error: (error) => {
        console.error('Error calculando CIT', error);
        this.calculando = false;
        this.error = 'Error al calcular el CIT: ' + (error.error?.message || error.message);
      }
    });
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  cargarAtenciones(): void {
    if (!this.empresaSeleccionada || !this.fechaInicio || !this.fechaFin) return;
    this.atenciones = [];
    this.expandedAtencion = null;

    this.citService.listarAtenciones(
      this.empresaSeleccionada,
      this.formatDate(this.fechaInicio),
      this.formatDate(this.fechaFin),
      this.motivoSeleccionado || undefined
    ).subscribe({
      next: (atenciones) => {
        this.atenciones = atenciones;
      },
      error: (error) => {
        console.error('Error cargando atenciones', error);
      }
    });
  }

  toggleAtencion(atencion: AtencionResponse): void {
    this.expandedAtencion = this.expandedAtencion === atencion ? null : atencion;
  }
}
