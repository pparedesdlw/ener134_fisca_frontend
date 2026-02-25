import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  menuItems = [
    { path: '/home', icon: 'home', label: 'Inicio' },
    { path: '/periodos', icon: 'calendar_today', label: 'Periodos de Fiscalización' },
    { path: '/empresas', icon: 'business', label: 'Empresas' },
    { path: '/feriados', icon: 'event', label: 'Feriados' },
    { path: '/parametros', icon: 'tab', label: 'Parámetros' },
    { path: '/muestras', icon: 'featured_play_list', label: 'Muestras' },
    { path: '/responsables', icon: 'contact_mail', label: 'Responsables' },
    { path: '/cit/calculo', icon: 'calculate', label: 'CIT - Cálculo' },
    { path: '/cit/resumen', icon: 'dashboard', label: 'CIT - Resumen' },
    { path: '/cit/resultados', icon: 'list_alt', label: 'CIT - Resultados' },
    { path: '/atencionesComerciales', icon: 'list', label: 'Atenciones Comercial' }
  ];

  constructor(private router: Router) {}

  logout(): void {
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('isAuthenticated');
    this.router.navigate(['/login']);
  }

  getCurrentUser(): string {
    return sessionStorage.getItem('currentUser') || 'Usuario';
  }
}
