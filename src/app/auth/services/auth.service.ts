import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap, switchMap, catchError, of, throwError, finalize } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, UserInfoResponse, RefreshRequest, LogoutRequest } from '../models/auth.model';

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
  private router = inject(Router);

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

  refreshToken(): Observable<LoginResponse> {
    const rfToken = sessionStorage.getItem('refresh_token');
    if (!rfToken) {
      return throwError(() => new Error('No hay refresh token'));
    }

    const payload: RefreshRequest = { refreshToken: rfToken };
    const url = `${environment.urlbase}public/auth/refresh`;

    return this.http.post<LoginResponse>(url, payload).pipe(
      tap(response => {
        sessionStorage.setItem('access_token', response.access_token);
        if (response.refresh_token) {
          sessionStorage.setItem('refresh_token', response.refresh_token);
        }
      })
    );
  }

  logout(): void {
    const rfToken = sessionStorage.getItem('refresh_token');

    if (rfToken) {
      const payload: LogoutRequest = { refreshToken: rfToken };
      const url = `${environment.urlbase}public/auth/logout`;

      this.http.post(url, payload).pipe(
        finalize(() => this.clearSession())
      ).subscribe({
        error: () => { }
      });
    } else {
      this.clearSession();
    }
  }

  clearSession(): void {
    sessionStorage.clear();
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  setUser(user: Usuario): void {
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }
}
