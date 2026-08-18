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
});
