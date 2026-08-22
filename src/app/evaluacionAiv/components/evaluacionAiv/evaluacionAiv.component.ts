import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EvaluacionAivService } from '../../services/evaluacionAiv.service';
import { EvaluacionAivResponse, EvaluacionRegistroResponse } from '../../models/evaluacionAiv.model';
import { MuestraAivService } from '../../../muestraAiv/services/muestraAiv.service';
import { SustentoAivService } from '../../../sustentoAiv/services/sustentoAiv.service';
import { MapeoArchivoSustento } from '../../../sustentoAiv/models/sustentoAiv.model';
import { excedeTamanioMaximo } from '../../../shared/utils/archivo.util';
import { parsearMapeoCsv } from '../../../shared/utils/mapeoSustentoCsv.util';
import { VerDetalleDialogComponent } from '../ver-detalle-dialog/ver-detalle-dialog.component';
import { VerSustentoDialogComponent } from '../ver-sustento-dialog/ver-sustento-dialog.component';
import { EvaluarItemsDialogComponent } from '../evaluar-items-dialog/evaluar-items-dialog.component';
import { ResultadoConsolidadoDialogComponent } from '../resultado-consolidado-dialog/resultado-consolidado-dialog.component';

@Component({
  selector: 'app-evaluacion-aiv',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatButtonModule, MatInputModule,
    MatFormFieldModule, MatTableModule, MatTabsModule, MatIconModule,
    MatProgressSpinnerModule, MatTooltipModule
  ],
  templateUrl: './evaluacionAiv.component.html',
  styleUrl: './evaluacionAiv.component.scss'
})
export class EvaluacionAivComponent implements OnInit {
  private service = inject(EvaluacionAivService);
  private muestraService = inject(MuestraAivService);
  private sustentoService = inject(SustentoAivService);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);

  usuario = 'admin';
  /** Signal (no campo plano): registrosFiltrados() es un computed() y solo se recalcula ante cambios de signals. */
  textoBusqueda = signal('');
  cargando = signal<boolean>(false);
  archivoZip: File | null = null;
  archivoMapeo: File | null = null;
  tabSeleccionado = 0;

  /** RF10: registro de la muestra principal seleccionado para reemplazar; null si no hay selección activa. */
  registroAReemplazar = signal<EvaluacionRegistroResponse | null>(null);

  evaluacion = signal<EvaluacionAivResponse | null>(null);
  displayedColumnsPrincipal = [
    'orden', 'codigoUnico', 'suministro', 'usuario', 'codigoUbigeo', 'grupoAsunto', 'codigoAsunto', 'descripcionAsunto',
    'evaluar', 'total', 'verSustento', 'reemplazar'
  ];
  displayedColumnsAdicional = [
    'orden', 'codigoUnico', 'suministro', 'usuario', 'codigoUbigeo', 'grupoAsunto', 'codigoAsunto', 'descripcionAsunto', 'reemplazar'
  ];

  registrosFiltrados = computed(() => {
    const e = this.evaluacion();
    if (!e) return { principal: [], adicional: [], reemplazados: [] };
    const texto = this.textoBusqueda().trim().toLowerCase();
    const coincide = (r: EvaluacionRegistroResponse) =>
      !texto ||
      (r.codigoUnico ?? '').toLowerCase().includes(texto) ||
      (r.descripcionAsunto ?? '').toLowerCase().includes(texto) ||
      (r.codigoUbigeo ?? '').toLowerCase().includes(texto);
    const filtrados = e.registros.filter(coincide);
    return {
      principal: filtrados.filter((r) => !r.adicional && !r.reemplazado),
      adicional: filtrados.filter((r) => r.adicional),
      reemplazados: filtrados.filter((r) => !r.adicional && r.reemplazado)
    };
  });

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    const codigoPeriodo = params.get('periodo');
    const codigoEmpresa = params.get('empresa');
    const idMuestraAiv = params.get('idMuestraAiv');
    if (!codigoPeriodo || !codigoEmpresa) {
      return;
    }
    /* RF01 "Obtener total": el parámetro "empresa" llega como código PRIE-TISEC
       (no el id interno que usan obtenerVigente/iniciar), porque aún no existe
       una MuestraAiv de la cual tomar ese id. Se resuelve generando la muestra
       (universo completo, sin muestreo) antes de reutilizar el flujo normal. */
    if (!idMuestraAiv && params.get('tipo') === 'TOTAL') {
      this.iniciarPorTotal(codigoPeriodo, codigoEmpresa, params.get('fechaInicio'), params.get('fechaFin'), params.get('asunto'));
      return;
    }
    this.cargarVigenteOIniciar(codigoPeriodo, Number(codigoEmpresa), idMuestraAiv);
  }

  private cargarVigenteOIniciar(codigoPeriodo: string, codigoEmpresa: number, idMuestraAiv: string | null): void {
    this.cargando.set(true);
    this.service.obtenerVigente(codigoPeriodo, codigoEmpresa).subscribe({
      next: (e) => { this.evaluacion.set(e); this.cargando.set(false); },
      error: () => {
        if (!idMuestraAiv) {
          this.cargando.set(false);
          return;
        }
        this.service.iniciar({
          codigoPeriodo, codigoEmpresa, idMuestraAiv: Number(idMuestraAiv), usuario: this.usuario
        }).subscribe({
          next: (e) => { this.evaluacion.set(e); this.cargando.set(false); this.snack.open('Evaluación iniciada', 'Cerrar', { duration: 3000 }); },
          error: (err) => { this.cargando.set(false); this.snack.open(err?.error?.message ?? 'Error al iniciar la evaluación', 'Cerrar', { duration: 4000 }); }
        });
      }
    });
  }

  /** RF01/RF03: genera la muestra sobre el universo completo (margenError y porcentajeAdicional en 0) y luego inicia la evaluación. */
  private iniciarPorTotal(
    codigoPeriodo: string, codigoEmpresaPrie: string, fechaInicio: string | null, fechaFin: string | null, codigoAsunto: string | null
  ): void {
    if (!fechaInicio || !fechaFin) {
      this.snack.open('No se pudo determinar el rango de fechas para evaluar por total', 'Cerrar', { duration: 4000 });
      return;
    }
    this.cargando.set(true);
    this.muestraService.generar({
      codigoPeriodo,
      fechaInicio,
      fechaFin,
      codigoEmpresa: codigoEmpresaPrie,
      codigosAsunto: codigoAsunto ? [codigoAsunto] : undefined,
      margenError: 0,
      porcentajeAdicional: 0,
      usuario: this.usuario
    }).subscribe({
      next: (muestra) => this.cargarVigenteOIniciar(codigoPeriodo, muestra.codigoEmpresa, String(muestra.id)),
      error: (err) => {
        this.cargando.set(false);
        this.snack.open(err?.error?.message ?? 'Error al generar la evaluación por total', 'Cerrar', { duration: 4000 });
      }
    });
  }

  private refrescar(): void {
    const e = this.evaluacion();
    if (!e) return;
    this.service.obtenerPorId(e.id).subscribe({ next: (actualizada) => this.evaluacion.set(actualizada) });
  }

  guardarAvances(): void {
    this.refrescar();
    this.snack.open('Avances guardados', 'Cerrar', { duration: 2000 });
  }

  consolidar(): void {
    const e = this.evaluacion();
    if (!e) return;
    this.service.consolidar({ idEvaluacionAiv: e.id, usuario: this.usuario }).subscribe({
      next: (r) => {
        this.evaluacion.set(r);
        this.dialog.open(ResultadoConsolidadoDialogComponent, {
          width: '900px',
          data: { evaluacion: r }
        });
      },
      error: (err) => this.snack.open(err?.error?.message ?? 'Error al consolidar', 'Cerrar', { duration: 4000 })
    });
  }

  evaluar(registro: EvaluacionRegistroResponse): void {
    this.dialog.open(EvaluarItemsDialogComponent, {
      width: '800px',
      data: { registro, usuario: this.usuario }
    }).afterClosed().subscribe((evaluacion: EvaluacionAivResponse | undefined) => {
      if (evaluacion) {
        this.evaluacion.set(evaluacion);
      }
    });
  }

  verDetalle(registro: EvaluacionRegistroResponse): void {
    if (!registro.codigoEmpresa || !registro.codigoAtencion) return;
    this.dialog.open(VerDetalleDialogComponent, {
      width: '900px',
      data: { codigoEmpresa: registro.codigoEmpresa, codigoAtencion: registro.codigoAtencion }
    });
  }

  verSustento(registro: EvaluacionRegistroResponse): void {
    this.dialog.open(VerSustentoDialogComponent, {
      width: '700px',
      data: { idEvaluacionRegistro: registro.id, codigoUnicoAtencion: registro.codigoUnico ?? '', usuario: this.usuario }
    });
  }

  /** RF10: clic en "Reemplazar" de un registro principal — selecciona el objetivo y redirige a la pestaña adicional. */
  seleccionarParaReemplazar(registro: EvaluacionRegistroResponse): void {
    this.registroAReemplazar.set(registro);
    this.tabSeleccionado = 1;
  }

  cancelarSeleccionReemplazo(): void {
    this.registroAReemplazar.set(null);
  }

  /** RF10: clic en "Reemplazar" de un registro de la muestra adicional — ejecuta el reemplazo. */
  confirmarReemplazoCon(registroAdicional: EvaluacionRegistroResponse): void {
    const principal = this.registroAReemplazar();
    if (!principal) {
      this.snack.open('Primero seleccione el registro a reemplazar en la muestra principal', 'Cerrar', { duration: 4000 });
      return;
    }
    this.service.reemplazarRegistro({
      idEvaluacionRegistroPrincipal: principal.id,
      idEvaluacionRegistroAdicional: registroAdicional.id,
      usuario: this.usuario
    }).subscribe({
      next: (evaluacion) => {
        this.evaluacion.set(evaluacion);
        this.registroAReemplazar.set(null);
        this.tabSeleccionado = 0;
        this.snack.open('Registro reemplazado', 'Cerrar', { duration: 3000 });
      },
      error: (err) => this.snack.open(err?.error?.message ?? 'Error en el reemplazo', 'Cerrar', { duration: 4000 })
    });
  }

  onArchivoZip(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const archivos = input.files;
    const archivo = archivos && archivos.length > 0 ? archivos[0] : null;
    if (archivo && excedeTamanioMaximo(archivo)) {
      this.snack.open('El archivo excede el tamaño máximo permitido (50 MB)', 'Cerrar', { duration: 4000 });
      input.value = '';
      this.archivoZip = null;
      return;
    }
    this.archivoZip = archivo;
  }

  onArchivoMapeo(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const archivos = input.files;
    this.archivoMapeo = archivos && archivos.length > 0 ? archivos[0] : null;
  }

  async cargarSustentoMasivo(): Promise<void> {
    const e = this.evaluacion();
    if (!e || !this.archivoZip) return;

    let mapeo: MapeoArchivoSustento[] | undefined;
    if (this.archivoMapeo) {
      try {
        const contenidoCsv = await this.leerArchivoComoTexto(this.archivoMapeo);
        const resultado = parsearMapeoCsv(contenidoCsv);
        if (resultado.filasInvalidas.length) {
          this.snack.open(
            `La plantilla de mapeo tiene filas inválidas: ${resultado.filasInvalidas.map((f) => `fila ${f.numeroFila}`).join(', ')}`,
            'Cerrar', { duration: 6000 }
          );
          return;
        }
        mapeo = resultado.mapeo;
      } catch (error) {
        this.snack.open((error as Error).message, 'Cerrar', { duration: 6000 });
        return;
      }
    }

    const archivo = this.archivoZip;
    const contenidoZipBase64 = await this.leerArchivoComoBase64(archivo);
    this.sustentoService.cargarMasivo({
      idEvaluacionAiv: e.id, nombreArchivoZip: archivo.name, contenidoZipBase64, usuario: this.usuario, mapeo
    }).subscribe({
      next: (resultado) => {
        this.archivoZip = null;
        this.archivoMapeo = null;
        const mensaje = resultado.rechazados.length
          ? `Cargados ${resultado.cargados.length}, rechazados ${resultado.rechazados.length}: ${resultado.rechazados.map((r) => r.nombreArchivo + ' (' + r.motivo + ')').join('; ')}`
          : `Cargados ${resultado.cargados.length} sustentos`;
        this.snack.open(mensaje, 'Cerrar', { duration: 8000 });
      },
      error: (err) => this.snack.open(err?.error?.message ?? 'Error en la carga masiva', 'Cerrar', { duration: 4000 })
    });
  }

  private leerArchivoComoBase64(archivo: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const lector = new FileReader();
      lector.onload = () => resolve((lector.result as string).split(',')[1]);
      lector.onerror = () => reject(lector.error);
      lector.readAsDataURL(archivo);
    });
  }

  private leerArchivoComoTexto(archivo: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const lector = new FileReader();
      lector.onload = () => resolve(lector.result as string);
      lector.onerror = () => reject(lector.error);
      lector.readAsText(archivo);
    });
  }

  exportar(): void {
    const e = this.evaluacion();
    if (!e) return;
    this.service.exportar(e.id).subscribe((blob) => {
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.download = `evaluacion-aiv-${e.codigoPeriodo}-${e.codigoEmpresa}.xlsx`;
      enlace.click();
      URL.revokeObjectURL(url);
    });
  }

  colorEstado(registro: EvaluacionRegistroResponse): string {
    return registro.estadoRegistro === 'EVALUADO' ? 'fila-evaluada' : 'fila-pendiente';
  }
}
