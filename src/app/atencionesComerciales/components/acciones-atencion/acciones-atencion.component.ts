import { Component, Input, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AtencionComercialService } from '../../services/atencionComercial.service';
import { AccionResponse, InfoTecnicaCierreResponse } from '../../models/atencionComercial.model';
import { InfoTecnicaPanelComponent } from '../info-tecnica-panel/info-tecnica-panel.component';

@Component({
  selector: 'app-acciones-atencion',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatDividerModule,
    MatTooltipModule,
    InfoTecnicaPanelComponent
  ],
  templateUrl: './acciones-atencion.component.html',
  styleUrl: './acciones-atencion.component.scss'
})
export class AccionesAtencionComponent implements OnInit, AfterViewInit {
  @Input() codigoEmpresa!: string;
  @Input() codigoAtencion!: string;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns = [
    'codigoAccion',
    'codigoPeriodo',
    'fechaRegistroAccion',
    'descripcionAccionRealizada',
    'descripcionEstadoAtencion',
    'fechaNotificacionRespuesta',
    'codigoDocReclamo'
  ];

  dataSource = new MatTableDataSource<AccionResponse>([]);
  cargando = false;
  totalRegistros = 0;

  infoTecnica: InfoTecnicaCierreResponse | null = null;
  cargandoInfoTecnica = false;
  tieneAccionCerrada = false;

  constructor(private atencionComercialService: AtencionComercialService) {}

  ngOnInit(): void {
    this.cargarAcciones();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  cargarAcciones(): void {
    this.cargando = true;
    this.atencionComercialService.listarAcciones(this.codigoEmpresa, this.codigoAtencion).subscribe({
      next: (acciones) => {
        this.dataSource.data = acciones;
        this.totalRegistros = acciones.length;
        this.cargando = false;

        this.tieneAccionCerrada = acciones.some(a => a.esCerrado);
        if (this.tieneAccionCerrada) {
          this.cargarInfoTecnica();
        }
      },
      error: (error) => {
        console.error('Error cargando acciones', error);
        this.cargando = false;
      }
    });
  }

  private cargarInfoTecnica(): void {
    this.cargandoInfoTecnica = true;
    this.atencionComercialService.obtenerInfoTecnica(this.codigoEmpresa, this.codigoAtencion).subscribe({
      next: (info) => {
        this.infoTecnica = info;
        this.cargandoInfoTecnica = false;
      },
      error: (error) => {
        console.error('Error cargando info técnica', error);
        this.cargandoInfoTecnica = false;
      }
    });
  }
}
