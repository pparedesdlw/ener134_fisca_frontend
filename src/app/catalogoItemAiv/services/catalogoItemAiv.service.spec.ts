import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CatalogoItemAivService } from './catalogoItemAiv.service';
import { CatalogoItemAivResponse } from '../models/catalogoItemAiv.model';
import { environment } from '../../../environments/environment';

describe('CatalogoItemAivService', () => {
  let service: CatalogoItemAivService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/catalogo-item-aiv`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CatalogoItemAivService]
    });
    service = TestBed.inject(CatalogoItemAivService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  it('listarVigentes debería hacer GET a /vigentes', () => {
    const mockCatalogo: CatalogoItemAivResponse[] = [
      { codigoItem: 'ITEM_01', descripcion: 'Item 1', orden: 1, bloqueante: false }
    ];
    service.listarVigentes().subscribe(l => expect(l).toEqual(mockCatalogo));
    const httpReq = httpMock.expectOne(`${apiUrl}/vigentes`);
    expect(httpReq.request.method).toBe('GET');
    httpReq.flush(mockCatalogo);
  });
});
