import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Usuario {
  username: string;
  rol: 'ADMIN' | 'ERE-OR';
  nombre?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<Usuario | null>;
  public currentUser: Observable<Usuario | null>;

  constructor() {
    const storedUser = localStorage.getItem('currentUser');
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

  login(username: string, password: string): Observable<any> {

    const mockUser: Usuario = {
      username: username,
      rol: 'ADMIN',
      nombre: 'Administrador'
    };

    localStorage.setItem('currentUser', JSON.stringify(mockUser));
    this.currentUserSubject.next(mockUser);

    return new Observable(observer => {
      observer.next(mockUser);
      observer.complete();
    });
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  setUser(user: Usuario): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }
}
