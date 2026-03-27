import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoaderService } from './loader.service';

describe('LoaderService', () => {
  let service: LoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoaderService]
    });
    service = TestBed.inject(LoaderService);
  });

  it('debería crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  it('debería iniciar con isLoading$ en false', (done) => {
    service.isLoading$.subscribe(loading => {
      expect(loading).toBeFalse();
      done();
    });
  });

  describe('showLoader', () => {
    it('debería emitir true cuando se muestra el loader', fakeAsync(() => {
      let loadingState = false;
      service.isLoading$.subscribe(loading => loadingState = loading);

      service.showLoader();
      tick();

      expect(loadingState).toBeTrue();
    }));

    it('debería incrementar el apiCount internamente', fakeAsync(() => {
      service.showLoader();
      service.showLoader();
      tick();

      let loadingState = false;
      service.isLoading$.subscribe(loading => loadingState = loading);
      expect(loadingState).toBeTrue();
    }));
  });

  describe('hideLoader', () => {
    it('debería emitir false cuando se oculta el loader', fakeAsync(() => {
      let loadingState = false;
      service.isLoading$.subscribe(loading => loadingState = loading);

      service.showLoader();
      tick();
      expect(loadingState).toBeTrue();

      service.hideLoader();
      tick();
      expect(loadingState).toBeFalse();
    }));

    it('no debería ocultar el loader si hay más de una petición activa', fakeAsync(() => {
      let loadingState = false;
      service.isLoading$.subscribe(loading => loadingState = loading);

      service.showLoader();
      service.showLoader();
      tick();

      service.hideLoader();
      tick();
      expect(loadingState).toBeTrue();

      service.hideLoader();
      tick();
      expect(loadingState).toBeFalse();
    }));
  });

  describe('múltiples llamadas', () => {
    it('debería manejar múltiples show/hide correctamente', fakeAsync(() => {
      let loadingState = false;
      service.isLoading$.subscribe(loading => loadingState = loading);

      service.showLoader();
      service.showLoader();
      service.showLoader();
      tick();

      expect(loadingState).toBeTrue();

      service.hideLoader();
      tick();
      expect(loadingState).toBeTrue();

      service.hideLoader();
      tick();
      expect(loadingState).toBeTrue();

      service.hideLoader();
      tick();
      expect(loadingState).toBeFalse();
    }));
  });
});
