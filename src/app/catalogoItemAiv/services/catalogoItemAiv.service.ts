import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CatalogoItemAivResponse } from '../models/catalogoItemAiv.model';

@Injectable({ providedIn: 'root' })
export class CatalogoItemAivService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/catalogo-item-aiv`;

  listarVigentes(): Observable<CatalogoItemAivResponse[]> {
    return this.http.get<CatalogoItemAivResponse[]>(`${this.apiUrl}/vigentes`);
  }
}
