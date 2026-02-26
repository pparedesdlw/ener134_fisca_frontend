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
import { CitResultadoResponse, TmAsunto, AtencionResponse } from '../../models/cit.model';
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
  asuntos: TmAsunto[] = [];
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;
  empresaSeleccionada: string | null = null;
  asuntoSeleccionado: string | null = null;
  calculando = false;
  resultado: CitResultadoResponse | null = null;
  mensaje = '';
  error = '';

  displayedColumns = ['concepto', 'cantidad'];

  atenciones: AtencionResponse[] = [];
  atencionesColumns = ['codigoAtencion', 'codigoAsunto', 'descripcionAsunto', 'estadoAtencion', 'tieneCierre', 'expandir'];
  expandedAtencion: AtencionResponse | null = null;

  constructor(
    private citService: CitService,
    private empresaService: EmpresaService
  ) {}

  ngOnInit(): void {
    this.cargarEmpresas();
    this.cargarAsuntos();
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

  cargarAsuntos(): void {
    this.citService.listarAsuntos().subscribe({
      next: (asuntos) => {
        this.asuntos = asuntos;
      },
      error: (error) => {
        console.error('Error cargando asuntos', error);
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
      codigoAsunto: this.asuntoSeleccionado
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

  get tablaResultados(): { concepto: string; cantidad: string }[] {
    if (!this.resultado) return [];
    const r = this.resultado;
    return [
      { concepto: 'a) Atención no enviada dentro de los m minutos', cantidad: r.incumplimientosItem1.toString() },
      { concepto: 'b) No definido', cantidad: r.incumplimientosItem2.toString() },
      { concepto: 'c) Acciones no enviadas dentro de 24h del día hábil siguiente', cantidad: r.incumplimientosItem3.toString() },
      { concepto: 'd) Registros cerrados sin información complementaria', cantidad: r.incumplimientosItem4.toString() },
      { concepto: '   d.1) Sin detalle en TH_3', cantidad: r.detalleItem4.sinDetalleTh3.toString() },
      { concepto: '   d.2) Sin detalle en TH_4', cantidad: r.detalleItem4.sinDetalleTh4.toString() },
      { concepto: '   d.3) Sin detalle en TH_5', cantidad: r.detalleItem4.sinDetalleTh5.toString() },
      { concepto: '   d.4) Sin detalle en TH_6', cantidad: r.detalleItem4.sinDetalleTh6.toString() },
      { concepto: '   d.5) Sin detalle en TH_7', cantidad: r.detalleItem4.sinDetalleTh7.toString() },
      { concepto: '   d.6) Sin detalle en TH_8', cantidad: r.detalleItem4.sinDetalleTh8.toString() },
    ];
  }

  cargarAtenciones(): void {
    if (!this.empresaSeleccionada || !this.fechaInicio || !this.fechaFin) return;
    this.atenciones = [];
    this.expandedAtencion = null;

    this.citService.listarAtenciones(
      this.empresaSeleccionada,
      this.formatDate(this.fechaInicio),
      this.formatDate(this.fechaFin),
      this.asuntoSeleccionado || undefined
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
