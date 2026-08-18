import { AfterViewInit, Component, ElementRef, Input, OnChanges, ViewChild } from '@angular/core';
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
export class BarChartComponent implements AfterViewInit, OnChanges {
  @Input() titulo = '';
  @Input() labels: string[] = [];
  @Input() valores: (number | null)[] = [];
  @Input() tolerancia: number | null = null;
  @Input() colorBarra = '#1565c0';
  @Input() ejeYLabel = '%';

  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private readonly ANCHO_BARRA = 64;
  private readonly MARGEN_IZQUIERDO = 56;
  private readonly MARGEN_DERECHO = 24;
  private readonly MARGEN_SUPERIOR = 32;
  private readonly MARGEN_INFERIOR = 48;
  private readonly ALTO_GRAFICO = 260;

  anchoCanvas = 400;
  private vistaLista = false;

  ngAfterViewInit(): void {
    this.vistaLista = true;
    this.dibujar();
  }

  ngOnChanges(): void {
    if (this.vistaLista) {
      this.dibujar();
    }
  }

  private dibujar(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    this.anchoCanvas = this.MARGEN_IZQUIERDO + this.MARGEN_DERECHO + Math.max(1, this.labels.length) * this.ANCHO_BARRA;
    const alto = this.MARGEN_SUPERIOR + this.ALTO_GRAFICO + this.MARGEN_INFERIOR;
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
    this.labels.forEach((label, i) => {
      const valor = this.valores[i];
      const xCentro = this.MARGEN_IZQUIERDO + i * this.ANCHO_BARRA + this.ANCHO_BARRA / 2;

      ctx.fillStyle = '#757575';
      ctx.textAlign = 'center';
      ctx.font = '11px Roboto, sans-serif';
      ctx.fillText(label, xCentro, yBase + 18);

      if (valor == null) {
        ctx.fillStyle = '#bdbdbd';
        ctx.fillText('s/d', xCentro, yBase - 6);
        return;
      }

      const alturaBarra = (valor / maxValor) * this.ALTO_GRAFICO;
      const anchoBarra = this.ANCHO_BARRA * 0.55;
      ctx.fillStyle = this.colorBarra;
      ctx.fillRect(xCentro - anchoBarra / 2, yBase - alturaBarra, anchoBarra, alturaBarra);

      ctx.fillStyle = '#212121';
      ctx.font = 'bold 11px Roboto, sans-serif';
      ctx.fillText(`${valor.toFixed(1)}${this.ejeYLabel}`, xCentro, yBase - alturaBarra - 6);
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
