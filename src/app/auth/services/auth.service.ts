import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, UserInfoResponse } from '../models/auth.model';

export interface Usuario {
  username: string;
  rol: 'ADMIN' | 'ERE-OR';
  nombre?: string;
  email?: string;
  perfiles?: any[];
  roles?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);

  private currentUserSubject: BehaviorSubject<Usuario | null>;
  public currentUser: Observable<Usuario | null>;

  constructor() {
    const storedUser = sessionStorage.getItem('currentUser');
    const user = storedUser ? JSON.parse(storedUser) : null;
    this.currentUserSubject = new BehaviorSubject<Usuario | null>(user);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): Usuario | null {
    return this.currentUserSubject.value;
  }

  public get currentUsername(): string {
    return this.currentUserSubject.value?.username || 'admin';
  }

  public get currentUserRole(): string {
    return this.currentUserSubject.value?.rol || 'ADMIN';
  }

  login(request: LoginRequest): Observable<UserInfoResponse> {
    const url = `${environment.urlbase}public/auth/login`;
    return this.http.post<LoginResponse>(url, request).pipe(
      tap(response => {
        sessionStorage.setItem('access_token', response.access_token);
        sessionStorage.setItem('refresh_token', response.refresh_token);
      }),
      switchMap(() => this.getUserInfo())
    );
  }

  getUserInfo(): Observable<UserInfoResponse> {
    const url = `${environment.urlbase}api/v1/user/me`;
    return this.http.get<UserInfoResponse>(url).pipe(
      tap(response => {
        const user: Usuario = {
          username: response.user.preferred_username || 'admin',
          rol: 'ADMIN',
          nombre: response.user.name,
          email: response.user.email,
          perfiles: response.profile.perfiles || [],
          roles: response.profile.roles || []
        };

        sessionStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  logout(): void {
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    this.currentUserSubject.next(null);
  }

  setUser(user: Usuario): void {
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }
}
