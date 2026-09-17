import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BarChartComponent } from './bar-chart.component';

describe('BarChartComponent', () => {
  let component: BarChartComponent;
  let fixture: ComponentFixture<BarChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarChartComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(BarChartComponent);
    component = fixture.componentInstance;
  });

  it('debería crear el componente', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('debería mostrar el mensaje vacío cuando no hay etiquetas', () => {
    fixture.detectChanges();
    const texto = fixture.nativeElement.querySelector('.mensaje-vacio')?.textContent;
    expect(texto).toContain('No existe información disponible para los filtros seleccionados');
    expect(fixture.nativeElement.querySelector('canvas')).toBeNull();
  });

  it('debería dibujar el canvas sin lanzar errores cuando hay datos', () => {
    component.titulo = 'Evolución AIV';
    component.labels = ['2025T1', '2025T2'];
    component.valores = [2.5, null];
    component.tolerancia = 3;

    expect(() => fixture.detectChanges()).not.toThrow();

    const canvas = fixture.nativeElement.querySelector('canvas');
    expect(canvas).toBeTruthy();
  });

  it('ngOnChanges no debería redibujar antes de que la vista esté lista', () => {
    const dibujarSpy = spyOn<any>(component, 'dibujar').and.callThrough();
    component.labels = ['2025T1'];
    component.valores = [1];
    component.ngOnChanges();
    expect(dibujarSpy).not.toHaveBeenCalled();
  });

  it('ngOnChanges debería redibujar después de ngAfterViewInit', () => {
    component.labels = ['2025T1'];
    component.valores = [1];
    fixture.detectChanges();

    const dibujarSpy = spyOn<any>(component, 'dibujar').and.callThrough();
    component.valores = [2];
    component.ngOnChanges();

    expect(dibujarSpy).toHaveBeenCalled();
  });

  it('debería redibujar sin lanzar errores cuando no hay etiquetas (canvas no se renderiza)', () => {
    component.labels = [];
    component.valores = [];

    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('RF11: el ancho de barra calculado nunca debería hacer que el gráfico exceda el contenedor', () => {
    // Con 20 categorías en un contenedor de 600px, el ancho total (margen + N*ancho de barra)
    // no debe superar los 600px disponibles — así el gráfico completo cabe sin scroll horizontal.
    const anchoBarra: number = (component as any).calcularAnchoBarra(600, 20);
    const MARGEN_IZQUIERDO = (component as any).MARGEN_IZQUIERDO;
    const MARGEN_DERECHO = (component as any).MARGEN_DERECHO;

    expect(MARGEN_IZQUIERDO + MARGEN_DERECHO + anchoBarra * 20).toBeLessThanOrEqual(600);
  });

  it('RF11: el ancho de barra no debería crecer sin límite cuando hay pocas categorías y sobra espacio', () => {
    const anchoBarra: number = (component as any).calcularAnchoBarra(1000, 2);
    expect(anchoBarra).toBeLessThanOrEqual(80);
  });

  it('calcularAnchoBarra debería usar el ancho máximo por defecto si el contenedor no es medible (0px)', () => {
    const anchoBarra: number = (component as any).calcularAnchoBarra(0, 10);
    expect(anchoBarra).toBe(80);
  });

  it('RF11: con muchas categorías en poco espacio, las etiquetas quedan por debajo del umbral de rotación', () => {
    // Con 20 categorías en 600px el ancho de barra queda muy por debajo de los 44px de umbral,
    // así que dibujarEtiqueta debe rotarlas -45° en vez de dejarlas horizontales (se superpondrían).
    const anchoBarra: number = (component as any).calcularAnchoBarra(600, 20);
    const umbral = (component as any).ANCHO_BARRA_UMBRAL_ROTACION;
    expect(anchoBarra).toBeLessThan(umbral);
  });

  it('dibujarEtiqueta debería centrar el texto sin rotar cuando hay espacio suficiente', () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const fillTextSpy = spyOn(ctx, 'fillText');

    (component as any).dibujarEtiqueta(ctx, 'CG0001', 100, 50, false, 'derecha');

    expect(ctx.textAlign).toBe('center');
    expect(fillTextSpy).toHaveBeenCalledWith('CG0001', 100, 50);
  });

  it('dibujarEtiqueta debería rotar el texto -45° cuando el espacio es insuficiente', () => {
    // textAlign se fija dentro de save()/restore(), así que no persiste después de la llamada
    // (por diseño: no debe contaminar el estado del contexto para el resto del dibujo) — se
    // verifica capturando su valor en el momento exacto de fillText.
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const rotateSpy = spyOn(ctx, 'rotate').and.callThrough();
    let alineacionAlDibujar: CanvasTextAlign | undefined;
    const fillTextSpy = spyOn(ctx, 'fillText').and.callFake(() => { alineacionAlDibujar = ctx.textAlign; });

    (component as any).dibujarEtiqueta(ctx, 'CG0001', 100, 50, true, 'derecha');

    expect(rotateSpy).toHaveBeenCalledWith(-Math.PI / 4);
    expect(alineacionAlDibujar).toBe('right');
    expect(fillTextSpy).toHaveBeenCalledWith('CG0001', 0, 0);
  });

  it('ngOnDestroy debería desconectar el ResizeObserver del contenedor', () => {
    component.labels = ['2025T1'];
    component.valores = [1];
    fixture.detectChanges();

    const observer = (component as any).resizeObserver as ResizeObserver;
    spyOn(observer, 'disconnect');

    component.ngOnDestroy();

    expect(observer.disconnect).toHaveBeenCalled();
  });

  it('ngOnDestroy no debería lanzar error si nunca se creó el ResizeObserver (sin etiquetas)', () => {
    component.labels = [];
    component.valores = [];
    fixture.detectChanges();

    expect(() => component.ngOnDestroy()).not.toThrow();
  });
});
