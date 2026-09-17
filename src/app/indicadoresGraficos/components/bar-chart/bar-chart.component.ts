import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * RF11: gráfico de barras verticales con línea de tolerancia horizontal, dibujado en Canvas
 * (sin dependencias externas). Usado para los 4 gráficos de evolución/comparativo de AIV y CIT.
 */
@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bar-chart.component.html',
  styleUrl: './bar-chart.component.scss'
})
export class BarChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() titulo = '';
  @Input() labels: string[] = [];
  @Input() valores: (number | null)[] = [];
  @Input() tolerancia: number | null = null;
  @Input() colorBarra = '#1565c0';
  @Input() ejeYLabel = '%';

  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  /** Ancho de barra máximo: el real se calcula según el ancho disponible y la cantidad de
   * periodos/empresas (con este tope solo para que pocas categorías no generen barras enormes),
   * para que el gráfico completo quepa siempre en el contenedor sin scroll horizontal — el ERS de
   * RF11 pide que se vean al menos 8 categorías sin necesidad de desplazarse. */
  private readonly ANCHO_BARRA_MINIMO = 6;
  private readonly ANCHO_BARRA_MAXIMO = 80;
  private readonly MARGEN_IZQUIERDO = 56;
  private readonly MARGEN_DERECHO = 24;
  private readonly MARGEN_SUPERIOR = 32;
  private readonly MARGEN_INFERIOR = 48;
  /** Con muchas categorías en poco espacio (RF11 no permite scroll), el texto horizontal se
   * superpone entre barras — bajo este ancho, las etiquetas se rotan para seguir siendo legibles. */
  private readonly ANCHO_BARRA_UMBRAL_ROTACION = 44;
  private readonly MARGEN_INFERIOR_ROTADO = 78;
  private readonly ALTO_GRAFICO = 260;

  anchoCanvas = 400;
  private anchoBarra = this.ANCHO_BARRA_MAXIMO;
  private vistaLista = false;
  private resizeObserver?: ResizeObserver;

  ngAfterViewInit(): void {
    this.vistaLista = true;
    this.dibujar();
    // Sin labels, el <canvas> ni siquiera se renderiza (*ngIf="labels.length" en la plantilla).
    const contenedor = this.canvasRef?.nativeElement.parentElement;
    if (!contenedor) return;
    this.resizeObserver = new ResizeObserver(() => this.dibujar());
    this.resizeObserver.observe(contenedor);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  ngOnChanges(): void {
    if (this.vistaLista) {
      this.dibujar();
    }
  }

  /**
   * RF11: ancho de barra según el espacio disponible (entre un mínimo y un máximo legibles),
   * para que el gráfico completo quepa siempre sin scroll horizontal, en vez de un ancho fijo
   * por barra que desbordaba el contenedor a partir de ~15 categorías. Sin contenedor medible
   * (ej. fixture de prueba sin adjuntar al DOM), usa el máximo como valor por defecto.
   */
  private calcularAnchoBarra(anchoContenedor: number, numCategorias: number): number {
    const anchoDisponibleParaBarras = Math.max(0, anchoContenedor - this.MARGEN_IZQUIERDO - this.MARGEN_DERECHO);
    if (anchoDisponibleParaBarras <= 0) return this.ANCHO_BARRA_MAXIMO;
    return Math.min(this.ANCHO_BARRA_MAXIMO, Math.max(this.ANCHO_BARRA_MINIMO, anchoDisponibleParaBarras / numCategorias));
  }

  /**
   * Dibuja un texto centrado y horizontal (modo normal) o rotado -45° (modo compacto, cuando hay
   * demasiadas categorías para que el texto horizontal quepa sin superponerse entre barras).
   * @param anclaje 'derecha' ancla el extremo del texto en (x, y) — usado para las etiquetas del
   * eje X, que quedan por debajo del punto. 'izquierda' ancla el inicio — usado para el valor
   * sobre cada barra, que debe extenderse hacia arriba sin invadir la barra.
   */
  private dibujarEtiqueta(
    ctx: CanvasRenderingContext2D, texto: string, x: number, y: number,
    rotada: boolean, anclaje: 'derecha' | 'izquierda'
  ): void {
    if (!rotada) {
      ctx.textAlign = 'center';
      ctx.fillText(texto, x, y);
      return;
    }
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-Math.PI / 4);
    ctx.textAlign = anclaje === 'derecha' ? 'right' : 'left';
    ctx.fillText(texto, 0, 0);
    ctx.restore();
  }

  private dibujar(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    const numCategorias = Math.max(1, this.labels.length);
    const anchoContenedor = canvas.parentElement?.clientWidth || 0;
    this.anchoBarra = this.calcularAnchoBarra(anchoContenedor, numCategorias);
    this.anchoCanvas = anchoContenedor > 0
      ? anchoContenedor
      : this.MARGEN_IZQUIERDO + this.MARGEN_DERECHO + numCategorias * this.anchoBarra;
    const etiquetasRotadas = this.anchoBarra < this.ANCHO_BARRA_UMBRAL_ROTACION;
    const margenInferior = etiquetasRotadas ? this.MARGEN_INFERIOR_ROTADO : this.MARGEN_INFERIOR;
    const alto = this.MARGEN_SUPERIOR + this.ALTO_GRAFICO + margenInferior;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = this.anchoCanvas * dpr;
    canvas.height = alto * dpr;
    canvas.style.width = `${this.anchoCanvas}px`;
    canvas.style.height = `${alto}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, this.anchoCanvas, alto);

    const valoresValidos = this.valores.filter((v): v is number => v != null);
    const maxValor = Math.max(1, ...valoresValidos, this.tolerancia ?? 0) * 1.2;
    const yBase = this.MARGEN_SUPERIOR + this.ALTO_GRAFICO;

    // Eje Y: gridlines y etiquetas
    ctx.strokeStyle = '#e0e0e0';
    ctx.fillStyle = '#757575';
    ctx.font = '11px Roboto, sans-serif';
    ctx.textAlign = 'right';
    const pasos = 4;
    for (let i = 0; i <= pasos; i++) {
      const valor = (maxValor / pasos) * i;
      const y = yBase - (valor / maxValor) * this.ALTO_GRAFICO;
      ctx.beginPath();
      ctx.moveTo(this.MARGEN_IZQUIERDO, y);
      ctx.lineTo(this.anchoCanvas - this.MARGEN_DERECHO, y);
      ctx.stroke();
      ctx.fillText(valor.toFixed(1), this.MARGEN_IZQUIERDO - 8, y + 4);
    }

    // Barras
    const fuenteEtiqueta = etiquetasRotadas ? '9px Roboto, sans-serif' : '11px Roboto, sans-serif';
    const fuenteValor = etiquetasRotadas ? 'bold 9px Roboto, sans-serif' : 'bold 11px Roboto, sans-serif';
    this.labels.forEach((label, i) => {
      const valor = this.valores[i];
      const xCentro = this.MARGEN_IZQUIERDO + i * this.anchoBarra + this.anchoBarra / 2;

      ctx.fillStyle = '#757575';
      ctx.font = fuenteEtiqueta;
      this.dibujarEtiqueta(ctx, label, xCentro, yBase + (etiquetasRotadas ? 10 : 18), etiquetasRotadas, 'derecha');

      if (valor == null) {
        ctx.fillStyle = '#bdbdbd';
        ctx.textAlign = 'center';
        ctx.fillText('s/d', xCentro, yBase - 6);
        return;
      }

      const alturaBarra = (valor / maxValor) * this.ALTO_GRAFICO;
      const anchoRelleno = this.anchoBarra * 0.55;
      ctx.fillStyle = this.colorBarra;
      ctx.fillRect(xCentro - anchoRelleno / 2, yBase - alturaBarra, anchoRelleno, alturaBarra);

      ctx.fillStyle = '#212121';
      ctx.font = fuenteValor;
      const textoValor = `${valor.toFixed(1)}${this.ejeYLabel}`;
      this.dibujarEtiqueta(ctx, textoValor, xCentro, yBase - alturaBarra - 6, etiquetasRotadas, 'izquierda');
    });

    // Línea de tolerancia
    if (this.tolerancia != null) {
      const yTolerancia = yBase - (this.tolerancia / maxValor) * this.ALTO_GRAFICO;
      ctx.strokeStyle = '#2e7d32';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(this.MARGEN_IZQUIERDO, yTolerancia);
      ctx.lineTo(this.anchoCanvas - this.MARGEN_DERECHO, yTolerancia);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#2e7d32';
      ctx.textAlign = 'left';
      ctx.font = 'bold 11px Roboto, sans-serif';
      ctx.fillText(`Tolerancia ${this.tolerancia}${this.ejeYLabel}`, this.MARGEN_IZQUIERDO + 4, yTolerancia - 6);
    }

    // Eje X
    ctx.strokeStyle = '#9e9e9e';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.MARGEN_IZQUIERDO, yBase);
    ctx.lineTo(this.anchoCanvas - this.MARGEN_DERECHO, yBase);
    ctx.stroke();
  }
}
