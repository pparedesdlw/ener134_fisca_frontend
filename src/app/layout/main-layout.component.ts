import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';

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
    MatTooltipModule,
    MatExpansionModule
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  menuSections = [
    {
      label: 'Atención Comercial',
      icon: 'storefront',
      expanded: true,
      subsections: [
        {
          label: 'Fiscalización',
          items: [
            { label: 'Acceso a la información', path: '', disabled: true },
            { label: 'Comprobación de la información a transferir', path: '/cit/calculo', disabled: false }
          ]
        },
        {
          label: 'Consultas',
          items: [
            { label: 'Atenciones Comerciales', path: '/atencionesComerciales', disabled: false }
          ]
        },
        {
          label: 'Maestros',
          items: [
            { label: 'Definir tamaño de muestra', path: '/muestras', disabled: false },
            { label: 'Definir parámetros', path: '/parametros', disabled: false }
          ]
        }
      ]
    },
    {
      label: 'Fiscalización',
      icon: 'gavel',
      expanded: false,
      subsections: [
        {
          label: 'Distribución',
          items: [
            { label: 'Alumbrado público', path: '', disabled: true },
            { label: 'Seguridad pública', path: '', disabled: true }
          ]
        },
        {
          label: 'Comercialización',
          items: [
            { label: 'Reclamos', path: '', disabled: true },
            { label: 'Atención telefónica', path: '', disabled: true },
            { label: 'Factura', path: '', disabled: true }
          ]
        },
        {
          label: 'Calidad de Servicio',
          items: [
            { label: 'Calidad procedimiento', path: '', disabled: true }
          ]
        },
        {
          label: 'Fuerza Mayor',
          items: []
        }
      ]
    },
    {
      label: 'Configuración',
      icon: 'settings',
      expanded: false,
      subsections: [
        {
          label: 'Maestros',
          items: [
            { label: 'Feriados', path: '/feriados', disabled: false },
            { label: 'Periodo de fiscalización', path: '/periodos', disabled: false },
            { label: 'Empresas concesionarias', path: '/empresas', disabled: false },
            { label: 'Empresas supervisoras', path: '', disabled: true },
            { label: 'Responsables instrucción', path: '/responsables', disabled: false },
            { label: 'Roles', path: '/roles', disabled: false }
          ]
        }
      ]
    }
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
